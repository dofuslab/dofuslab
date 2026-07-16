from functools import lru_cache

import graphene
from ddtrace import tracer
from graphql import GraphQLError

from app import limiter
from app.build_discovery_promotion import sign_build_discovery_candidate
from app.feature_gates import require_build_discovery_beta
from app.build_discovery_service import (
    BuildDiscoverySolveLockTimeout,
    build_discovery_app_cache_key,
    build_discovery_cached_response,
)
from oneoff.build_discovery_core import (
    BuildDiscoveryQuery,
    DEFAULT_MAX_SHARED_ITEMS,
    MAX_AP,
    MAX_MP,
    MAX_RANGE,
    dataset_version,
    load_build_discovery_index,
    query_summary,
)
from oneoff.generate_build_discovery_index import (
    BuildDiscoveryIndexValidationError,
    validate_build_discovery_index,
)


MAX_RESULT_LIMIT = 5
MAX_ITEM_CONTROLS = 50
MAX_SHARED_ITEMS = 16


def bounded_int_arg(name, value, minimum, maximum):
    if value < minimum or value > maximum:
        raise GraphQLError(f"{name} must be between {minimum} and {maximum}.")
    return value


def build_discovery_query_from_input(input_value):
    locked_item_ids = tuple(input_value.locked_item_ids)
    avoided_item_ids = tuple(input_value.avoided_item_ids)
    if len(locked_item_ids) > MAX_ITEM_CONTROLS:
        raise GraphQLError(
            f"lockedItemIds cannot contain more than {MAX_ITEM_CONTROLS} items."
        )
    if len(avoided_item_ids) > MAX_ITEM_CONTROLS:
        raise GraphQLError(
            f"avoidedItemIds cannot contain more than {MAX_ITEM_CONTROLS} items."
        )
    return BuildDiscoveryQuery(
        class_name=input_value.class_name,
        level=input_value.level,
        elements=(input_value.element,),
        mode="pvm",
        ap_target=input_value.ap_target,
        mp_target=input_value.mp_target,
        range_target=input_value.range_target,
        damage_survivability_preset=input_value.damage_survivability_preset,
        budget_tier=input_value.budget_tier,
        exo_policy=input_value.exo_policy,
        weapon_policy=input_value.weapon_policy,
        locked_item_ids=locked_item_ids,
        avoided_item_ids=avoided_item_ids,
        limit=bounded_int_arg(
            "resultLimit",
            input_value.result_limit,
            1,
            MAX_RESULT_LIMIT,
        ),
        max_shared_items=bounded_int_arg(
            "maxSharedItems",
            input_value.max_shared_items,
            0,
            MAX_SHARED_ITEMS,
        ),
    )


@lru_cache(maxsize=4)
def validate_build_discovery_index_version(dataset_version):
    index = load_build_discovery_index()
    if index is None:
        raise BuildDiscoveryIndexValidationError("index file is absent")
    validate_build_discovery_index(index)


def require_build_discovery_index():
    try:
        validate_build_discovery_index_version(dataset_version())
    except (BuildDiscoveryIndexValidationError, OSError, ValueError) as exc:
        raise GraphQLError(f"Build Discovery index is not production-ready: {exc}")


def product_build_discovery_response(query, response):
    builds = []
    build_field_names = (
        "weightedStatScore",
        "utilityStatScore",
        "genericDamageScore",
        "rawRotationDamageScore",
        "spellDamageScore",
        "profileBaselineDamageScore",
        "profileRelativeDamage",
        "weaponDamageScore",
        "survivabilityScore",
        "negativeResistancePenalty",
        "weakestElementEhp",
        "apStrategy",
    )
    for rank, build in enumerate(response.get("builds") or (), start=1):
        normalized = dict(build)
        for camel_name in build_field_names:
            snake_name = "".join(
                f"_{character.lower()}" if character.isupper() else character
                for character in camel_name
            )
            normalized[snake_name] = build.get(camel_name)
        normalized["promotion_token"] = sign_build_discovery_candidate(
            query, response, build, rank=rank
        )
        builds.append(normalized)

    query_payload = query_summary(query)
    diagnostics_payload = response.get("diagnostics") or {}
    diagnostic_field_names = (
        "elapsedMs",
        "cacheHit",
        "appCacheHit",
        "cacheStatus",
        "solveLockAcquired",
        "lockWaitMs",
        "solverStatus",
        "workers",
        "itemCount",
        "candidateCount",
        "maxSharedItems",
        "maxSharedItemsEnforced",
    )
    diagnostics = {
        "result_count": diagnostics_payload.get("resultCount", len(builds)),
        "solver": diagnostics_payload.get("solver"),
        "timings": diagnostics_payload.get("timings") or {},
    }
    for camel_name in diagnostic_field_names:
        snake_name = "".join(
            f"_{character.lower()}" if character.isupper() else character
            for character in camel_name
        )
        diagnostics[snake_name] = diagnostics_payload.get(camel_name)

    target_semantics = response.get("targetSemantics") or {}
    no_build_reason = response.get("noBuildReason")
    return {
        "status": response.get("status", "complete"),
        "dataset_version": response.get("datasetVersion") or dataset_version(),
        "solver_version": response.get("solverVersion"),
        "cache_key": response.get("cacheKey") or build_discovery_app_cache_key(query),
        "query": {
            "class_name": query_payload["className"],
            "level": query_payload["level"],
            "elements": query_payload["elements"],
            "mode": query_payload["mode"],
            "ap_target": query_payload["apTarget"],
            "mp_target": query_payload["mpTarget"],
            "range_target": query_payload["rangeTarget"],
            "damage_survivability_preset": query_payload["damageSurvivabilityPreset"],
            "budget_tier": query_payload["budgetTier"],
            "exo_policy": query_payload["exoPolicy"],
            "weapon_policy": query_payload["weaponPolicy"],
            "locked_item_ids": query_payload["lockedItemIds"],
            "avoided_item_ids": query_payload["avoidedItemIds"],
            "result_limit": query.limit,
            "max_shared_items": query.max_shared_items,
        },
        "target_semantics": {
            "type": target_semantics.get("type", "minimum_with_hard_caps"),
            "targets": target_semantics.get("targets")
            or {
                "AP": "minimum",
                "MP": "minimum",
                "Range": "minimum_when_requested",
            },
            "caps": target_semantics.get("caps")
            or {"AP": MAX_AP, "MP": MAX_MP, "Range": MAX_RANGE},
            "surplus_scoring": target_semantics.get(
                "surplusScoring", "light_reward_with_cap"
            ),
        },
        "warnings": response.get("warnings") or [],
        "no_build_reason": (
            {
                "code": no_build_reason.get("code"),
                "unavailable_item_ids": no_build_reason.get("unavailableItemIds") or [],
                "wrong_slot_item_ids": no_build_reason.get("wrongSlotItemIds") or [],
            }
            if no_build_reason
            else None
        ),
        "diagnostics": diagnostics,
        "cache": response.get("cache")
        or {
            "status": "miss",
            "storage": "app_cache",
        },
        "builds": builds,
    }


class BuildDiscoveryInput(graphene.InputObjectType):
    class_name = graphene.String(required=True)
    level = graphene.Int(required=True)
    element = graphene.String(required=True)
    ap_target = graphene.Int(required=True)
    mp_target = graphene.Int(required=True)
    range_target = graphene.Int()
    damage_survivability_preset = graphene.Int(required=True)
    budget_tier = graphene.Int(required=True)
    exo_policy = graphene.String(required=True)
    weapon_policy = graphene.String(required=True)
    locked_item_ids = graphene.NonNull(graphene.List(graphene.NonNull(graphene.String)))
    avoided_item_ids = graphene.NonNull(
        graphene.List(graphene.NonNull(graphene.String))
    )
    result_limit = graphene.Int(required=True)
    max_shared_items = graphene.Int(default_value=DEFAULT_MAX_SHARED_ITEMS)


class BuildDiscoveryStatus(graphene.Enum):
    COMPLETE = "complete"
    NO_VALID_BUILD = "no_valid_build"


class BuildDiscoveryQueryResult(graphene.ObjectType):
    class_name = graphene.String(required=True)
    level = graphene.Int(required=True)
    elements = graphene.NonNull(graphene.List(graphene.NonNull(graphene.String)))
    mode = graphene.String(required=True)
    ap_target = graphene.Int(required=True)
    mp_target = graphene.Int(required=True)
    range_target = graphene.Int()
    damage_survivability_preset = graphene.Int(required=True)
    budget_tier = graphene.Int(required=True)
    exo_policy = graphene.String(required=True)
    weapon_policy = graphene.String(required=True)
    locked_item_ids = graphene.NonNull(graphene.List(graphene.NonNull(graphene.String)))
    avoided_item_ids = graphene.NonNull(
        graphene.List(graphene.NonNull(graphene.String))
    )
    result_limit = graphene.Int(required=True)
    max_shared_items = graphene.Int()


class BuildDiscoveryNamedNumber(graphene.ObjectType):
    name = graphene.String(required=True)
    value = graphene.Float(required=True)


class BuildDiscoverySet(graphene.ObjectType):
    name = graphene.String(required=True)
    item_count = graphene.Int(required=True)


class BuildDiscoveryItem(graphene.ObjectType):
    slot = graphene.String(required=True)
    id = graphene.String(required=True)
    internal_id = graphene.String()
    name = graphene.String(required=True)
    type = graphene.String(required=True)
    level = graphene.Int()
    set = graphene.String()


class BuildDiscoveryExo(graphene.ObjectType):
    stat = graphene.String(required=True)
    item_id = graphene.String(required=True)
    slot = graphene.String()


class BuildDiscoveryBuild(graphene.ObjectType):
    promotion_token = graphene.String(required=True)
    score = graphene.Float(required=True)
    weighted_stat_score = graphene.Float()
    utility_stat_score = graphene.Float()
    generic_damage_score = graphene.Float()
    raw_rotation_damage_score = graphene.Float()
    spell_damage_score = graphene.Float()
    profile_baseline_damage_score = graphene.Float()
    profile_relative_damage = graphene.Float()
    weapon_damage_score = graphene.Float()
    survivability_score = graphene.Float()
    negative_resistance_penalty = graphene.Float()
    weakest_element_ehp = graphene.Float()
    ap_strategy = graphene.String()
    condition_failures = graphene.List(graphene.NonNull(graphene.String), required=True)
    base_allocation = graphene.List(
        graphene.NonNull(BuildDiscoveryNamedNumber), required=True
    )
    totals = graphene.List(graphene.NonNull(BuildDiscoveryNamedNumber), required=True)
    sets = graphene.List(graphene.NonNull(BuildDiscoverySet), required=True)
    exos = graphene.List(graphene.NonNull(BuildDiscoveryExo), required=True)
    items = graphene.List(graphene.NonNull(BuildDiscoveryItem), required=True)

    def resolve_condition_failures(self, info):
        return self.get("conditionFailures") or []

    def resolve_base_allocation(self, info):
        return [
            {"name": name, "value": value}
            for name, value in (self.get("baseAllocation") or {}).items()
        ]

    def resolve_totals(self, info):
        return [
            {"name": name, "value": value}
            for name, value in (self.get("totals") or {}).items()
        ]

    def resolve_sets(self, info):
        return [
            {"name": name, "item_count": item_count}
            for name, item_count in (self.get("sets") or {}).items()
        ]

    def resolve_exos(self, info):
        return [
            {
                "stat": stat,
                "item_id": exo.get("itemId"),
                "slot": exo.get("slot"),
            }
            for stat, exo in (self.get("exos") or {}).items()
        ]

    def resolve_items(self, info):
        return [
            {
                "slot": slot,
                "id": item.get("id"),
                "internal_id": item.get("internalId"),
                "name": item.get("name"),
                "type": item.get("type"),
                "level": item.get("level"),
                "set": item.get("set"),
            }
            for slot, item in (self.get("items") or {}).items()
        ]


class BuildDiscoveryTiming(graphene.ObjectType):
    name = graphene.String(required=True)
    elapsed_ms = graphene.Float(required=True)


class BuildDiscoveryDiagnostics(graphene.ObjectType):
    elapsed_ms = graphene.Float()
    cache_hit = graphene.Boolean()
    app_cache_hit = graphene.Boolean()
    result_count = graphene.Int(required=True)
    solver = graphene.String()
    cache_status = graphene.String()
    solve_lock_acquired = graphene.Boolean()
    lock_wait_ms = graphene.Float()
    solver_status = graphene.String()
    workers = graphene.Int()
    item_count = graphene.Int()
    candidate_count = graphene.Int()
    max_shared_items = graphene.Int()
    max_shared_items_enforced = graphene.Boolean()
    timings = graphene.List(graphene.NonNull(BuildDiscoveryTiming), required=True)

    def resolve_timings(self, info):
        return [
            {"name": name, "elapsed_ms": elapsed_ms}
            for name, elapsed_ms in (self.get("timings") or {}).items()
        ]


class BuildDiscoveryCache(graphene.ObjectType):
    status = graphene.String(required=True)
    storage = graphene.String(required=True)
    solver = graphene.String()


class BuildDiscoveryTargetKinds(graphene.ObjectType):
    ap = graphene.String(required=True)
    mp = graphene.String(required=True)
    range = graphene.String(required=True)

    def resolve_ap(self, info):
        return self["AP"]

    def resolve_mp(self, info):
        return self["MP"]

    def resolve_range(self, info):
        return self["Range"]


class BuildDiscoveryTargetCaps(graphene.ObjectType):
    ap = graphene.Int(required=True)
    mp = graphene.Int(required=True)
    range = graphene.Int(required=True)

    def resolve_ap(self, info):
        return self["AP"]

    def resolve_mp(self, info):
        return self["MP"]

    def resolve_range(self, info):
        return self["Range"]


class BuildDiscoveryTargetSemantics(graphene.ObjectType):
    type = graphene.String(required=True)
    targets = graphene.Field(BuildDiscoveryTargetKinds, required=True)
    caps = graphene.Field(BuildDiscoveryTargetCaps, required=True)
    surplus_scoring = graphene.String(required=True)


class BuildDiscoveryNoBuildReason(graphene.ObjectType):
    code = graphene.String(required=True)
    unavailable_item_ids = graphene.List(
        graphene.NonNull(graphene.String), required=True
    )
    wrong_slot_item_ids = graphene.List(
        graphene.NonNull(graphene.String), required=True
    )


class BuildDiscoveryResult(graphene.ObjectType):
    status = graphene.Field(BuildDiscoveryStatus, required=True)
    dataset_version = graphene.String(required=True)
    solver_version = graphene.String(required=True)
    cache_key = graphene.String()
    query = graphene.Field(BuildDiscoveryQueryResult, required=True)
    target_semantics = graphene.Field(BuildDiscoveryTargetSemantics, required=True)
    warnings = graphene.List(graphene.NonNull(graphene.String), required=True)
    no_build_reason = graphene.Field(BuildDiscoveryNoBuildReason)
    diagnostics = graphene.Field(BuildDiscoveryDiagnostics, required=True)
    cache = graphene.Field(BuildDiscoveryCache, required=True)
    builds = graphene.List(graphene.NonNull(BuildDiscoveryBuild), required=True)


class BuildDiscovery(graphene.Mutation):
    class Arguments:
        input = graphene.Argument(BuildDiscoveryInput, required=True)

    Output = BuildDiscoveryResult

    @tracer.wrap(name="BuildDiscovery.mutate")
    @limiter.limit(
        "6/minute",
        error_message="Build Discovery request limit reached. Retry shortly.",
    )
    def mutate(self, info, input):
        require_build_discovery_beta()
        try:
            query = build_discovery_query_from_input(input)
            query.validate()
            require_build_discovery_index()
            response = build_discovery_cached_response(query)
            return product_build_discovery_response(query, response)
        except BuildDiscoverySolveLockTimeout:
            raise GraphQLError("Build Discovery capacity is busy. Retry shortly.")
        except ValueError as error:
            raise GraphQLError(str(error))
