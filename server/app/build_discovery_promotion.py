import json
from datetime import datetime, timezone

import graphene
from ddtrace import tracer
from flask_babel import _
from graphql import GraphQLError

from app import session_scope
from app.database.model_class_translation import ModelClassTranslation
from app.database.model_generation_request import ModelGenerationRequest
from app.database.model_item import ModelItem
from app.token_utils import decode_token, encode_token
from app.utils import (
    edit_custom_set_metadata,
    edit_custom_set_stats,
    get_or_create_custom_set,
    verified,
)
from oneoff.build_discovery_core import dataset_version, query_summary


PROMOTION_TOKEN_SALT = "build-discovery-promotion-v1"
PROMOTION_TOKEN_TTL_SECONDS = 3600
MAX_GENERATION_REQUEST_PAYLOAD_BYTES = 20000


def sign_build_discovery_candidate(query, response, build, *, rank=None):
    return encode_token(
        {
            "source": "build_discovery",
            "datasetVersion": response.get("datasetVersion") or dataset_version(),
            "solverVersion": response.get("solverVersion"),
            "query": query_summary(query),
            "build": build,
            "rank": rank,
            "warnings": response.get("warnings") or [],
        },
        PROMOTION_TOKEN_SALT,
    )


def decode_build_discovery_promotion_token(token):
    payload = decode_token(
        token,
        PROMOTION_TOKEN_SALT,
        expiration=PROMOTION_TOKEN_TTL_SECONDS,
    )
    if not isinstance(payload, dict) or payload.get("source") != "build_discovery":
        raise GraphQLError(_("This generated build has expired or is invalid."))
    query = payload.get("query")
    build = payload.get("build")
    if not isinstance(query, dict) or not isinstance(build, dict):
        raise GraphQLError(_("This generated build has expired or is invalid."))
    return payload


def validate_generation_request_payload(request_payload):
    if request_payload is None:
        return
    try:
        encoded_payload = json.dumps(request_payload, sort_keys=True)
    except TypeError:
        raise GraphQLError(_("Generation request payload is invalid."))
    if len(encoded_payload.encode("utf-8")) > MAX_GENERATION_REQUEST_PAYLOAD_BYTES:
        raise GraphQLError(_("Generation request payload is too large."))


def generated_request_class_name(query):
    if not isinstance(query, dict):
        return None
    class_name = query.get("className")
    return class_name if isinstance(class_name, str) and class_name else None


def generated_default_class_id(db_session, query):
    class_name = generated_request_class_name(query)
    if not class_name:
        return None
    translation = (
        db_session.query(ModelClassTranslation)
        .filter_by(locale="en", name=class_name)
        .one_or_none()
    )
    return translation.class_id if translation else None


def generated_build_stats(build):
    base_allocation = build.get("baseAllocation") or {}
    if not isinstance(base_allocation, dict):
        raise GraphQLError(_("This generated build has invalid base characteristics."))
    stat_names = ("vitality", "wisdom", "strength", "intelligence", "chance", "agility")
    return {
        **{f"scrolled_{stat}": 0 for stat in stat_names},
        **{
            f"base_{stat}": int(base_allocation.get(stat.title(), 0))
            for stat in stat_names
        },
    }


def generated_build_items(db_session, build):
    item_payloads = build.get("items") or {}
    exos = build.get("exos") or {}
    if not isinstance(item_payloads, dict) or not item_payloads:
        raise GraphQLError(_("Generated builds must include at least one item."))
    if not isinstance(exos, dict):
        raise GraphQLError(_("This generated build has invalid exomages."))

    exo_item_ids = {
        stat: exo.get("itemId") for stat, exo in exos.items() if isinstance(exo, dict)
    }
    items = []
    for item_payload in item_payloads.values():
        if not isinstance(item_payload, dict) or not item_payload.get("internalId"):
            raise GraphQLError(_("This generated build is missing an item import ID."))
        item = (
            db_session.query(ModelItem)
            .filter(ModelItem.uuid == item_payload["internalId"])
            .one()
        )
        dofus_id = item_payload.get("id")
        items.append(
            {
                "item": item,
                "ap_exo": exo_item_ids.get("AP") == dofus_id,
                "mp_exo": exo_item_ids.get("MP") == dofus_id,
                "range_exo": exo_item_ids.get("Range") == dofus_id,
            }
        )
    return items


def create_import_generated_custom_set_mutation(
    custom_set_type, generation_request_type
):
    class ImportGeneratedCustomSet(graphene.Mutation):
        class Arguments:
            name = graphene.NonNull(graphene.String)
            promotion_token = graphene.NonNull(graphene.String)

        custom_set = graphene.Field(custom_set_type, required=True)
        generation_request = graphene.Field(generation_request_type, required=True)

        @tracer.wrap(name="ImportGeneratedCustomSet.mutate")
        @verified
        def mutate(self, info, **kwargs):
            payload = decode_build_discovery_promotion_token(
                kwargs.get("promotion_token")
            )
            query = payload["query"]
            build = payload["build"]
            level = query.get("level")
            if not isinstance(level, int):
                raise GraphQLError(_("This generated build has an invalid level."))
            request_payload = {
                "generatedAt": datetime.now(timezone.utc).isoformat(),
                "query": query,
                "warnings": payload.get("warnings") or [],
                "candidate": {
                    "rank": payload.get("rank"),
                    "score": build.get("score"),
                    "itemIds": sorted(
                        item.get("id")
                        for item in (build.get("items") or {}).values()
                        if isinstance(item, dict) and item.get("id")
                    ),
                    "exos": build.get("exos") or {},
                    "baseAllocation": build.get("baseAllocation") or {},
                },
            }
            validate_generation_request_payload(request_payload)

            with session_scope() as db_session:
                custom_set = get_or_create_custom_set(None, db_session)
                edit_custom_set_metadata(custom_set, kwargs.get("name"), level)
                edit_custom_set_stats(custom_set, generated_build_stats(build))
                default_class_id = generated_default_class_id(db_session, query)
                if default_class_id:
                    custom_set.default_class_id = default_class_id
                items = generated_build_items(db_session, build)
                custom_set.equip_items(items, db_session)
                generation_request = ModelGenerationRequest(
                    custom_set_id=custom_set.uuid,
                    source="build_discovery",
                    dataset_version=payload.get("datasetVersion"),
                    solver_version=payload.get("solverVersion"),
                    request_payload=request_payload,
                )
                db_session.add(generation_request)

            return ImportGeneratedCustomSet(
                custom_set=custom_set,
                generation_request=generation_request,
            )

    return ImportGeneratedCustomSet
