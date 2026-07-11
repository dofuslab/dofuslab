from __future__ import annotations

import ast
import sys
import unittest
from pathlib import Path


SERVER_ROOT = Path(__file__).resolve().parents[1]
if str(SERVER_ROOT) not in sys.path:
    sys.path.insert(0, str(SERVER_ROOT))


def experiment_path() -> Path:
    script_path = Path(__file__).resolve()
    host_repo_path = script_path.parents[2] / "server" / "oneoff" / "build_discovery_cpsat_experiment.py"
    if host_repo_path.exists():
        return host_repo_path
    container_server_path = script_path.parents[1] / "oneoff" / "build_discovery_cpsat_experiment.py"
    return container_server_path


def requirements_path() -> Path:
    script_path = Path(__file__).resolve()
    host_repo_path = script_path.parents[2] / "server" / "requirements.txt"
    if host_repo_path.exists():
        return host_repo_path
    return script_path.parents[1] / "requirements.txt"


EXPERIMENT_PATH = experiment_path()
REQUIREMENTS_PATH = requirements_path()

try:
    from ortools.sat.python import cp_model
    from oneoff.build_discovery_cpsat_experiment import (
        CandidateCollectionCallback,
        build_model_metadata,
        state_signature,
        build_model,
        reconstruct_state,
    )
    from oneoff.build_discovery_prototype import BuildState, BuildTarget, configure_damage_profile, target_level_context
except Exception as exc:  # pragma: no cover - exercised only in incomplete envs.
    cp_model = None
    CandidateCollectionCallback = None
    build_model_metadata = None
    state_signature = None
    build_model = None
    reconstruct_state = None
    BuildState = None
    BuildTarget = None
    configure_damage_profile = None
    target_level_context = None
    IMPORT_ERROR = exc
else:
    IMPORT_ERROR = None


def item(
    item_id: str,
    item_type: str,
    *,
    stats: dict[str, int] | None = None,
    set_id: str | None = None,
    conditions: dict | None = None,
) -> dict:
    stats = stats or {}
    return {
        "dofusID": item_id,
        "uuid": item_id,
        "_name": item_id,
        "itemType": item_type,
        "level": 1,
        "setID": set_id,
        "_stats": dict(stats),
        "stats": [{"stat": stat, "maxStat": value} for stat, value in stats.items()],
        "conditions": {"conditions": conditions or {}, "customConditions": {}},
    }


def fixture_sets() -> dict:
    return {
        "dofus_set": {
            "id": "dofus_set",
            "_name": "Dofus Fixture Set",
            "_bonus_stats": {
                "0": {},
                "1": {},
                "2": {"Strength": 200},
            },
        }
    }


def singleton_fixture_sets() -> dict:
    return {
        **fixture_sets(),
        "singleton_set": {
            "id": "singleton_set",
            "_name": "Singleton Fixture Set",
            "_bonus_stats": {"0": {}, "1": {}},
        },
        "one_item_bonus_set": {
            "id": "one_item_bonus_set",
            "_name": "One Item Bonus Fixture Set",
            "_bonus_stats": {"0": {}, "1": {"Strength": 1}},
        },
    }


def base_fixture_items(*, dofus_items: list[dict] | None = None) -> list[dict]:
    if dofus_items is None:
        dofus_items = [
            item("dofus_a", "Dofus", set_id="dofus_set"),
            item("dofus_b", "Trophy", set_id="dofus_set"),
            item("dofus_c", "Dofus"),
            item("dofus_d", "Trophy"),
            item("dofus_e", "Dofus"),
            item("dofus_f", "Trophy"),
        ]
    return [
        item("amulet", "Amulet"),
        item("belt", "Belt"),
        item("weapon", "Sword"),
        item("shield", "Shield"),
        item("ring_good", "Ring", stats={"Strength": 20}),
        item("ring_other", "Ring"),
        item("boots", "Boots"),
        item("hat", "Hat"),
        item("cloak", "Cloak"),
        item("pet", "Pet"),
        *dofus_items,
    ]


def solve_fixture(items: list[dict], *, sets: dict | None = None, target: BuildTarget | None = None):
    if IMPORT_ERROR is not None:
        raise unittest.SkipTest(f"CP-SAT imports unavailable: {IMPORT_ERROR}")
    configure_damage_profile("strength")
    target = target or BuildTarget(ap=7, mp=3, range=0, level=200, range_required=False)
    with target_level_context(target.level):
        model, slot_item_vars, exo_vars, model_stats = build_model(
            items,
            sets or fixture_sets(),
            target,
            forbidden_signatures=[],
            max_shared_item_cuts=[],
            max_shared_items=None,
            objective_weights={"Strength": 1.0, "AP": 0.0, "MP": 0.0, "Range": 0.0},
            exo_policy="none",
        )
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 2
    solver.parameters.num_search_workers = 1
    status = solver.Solve(model)
    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        return status, None, model_stats
    with target_level_context(target.level):
        state, invalid = reconstruct_state(
            solver,
            slot_item_vars,
            exo_vars,
            items,
            sets or fixture_sets(),
            target,
            0.45,
            1.0,
            0.0,
        )
    if invalid:
        raise AssertionError(invalid)
    return status, state, model_stats


class BuildDiscoveryCpsatExperimentContractTest(unittest.TestCase):
    def test_experiment_file_is_preserved_without_product_import_side_effects(self):
        source = EXPERIMENT_PATH.read_text(encoding="utf-8")
        module = ast.parse(source)

        function_names = {
            node.name
            for node in module.body
            if isinstance(node, ast.FunctionDef)
        }

        self.assertIn("solve_once", function_names)
        self.assertIn("solve_query", function_names)
        self.assertIn("query_from_args", function_names)
        self.assertIn("build_model", function_names)
        self.assertIn("reconstruct_state", function_names)
        self.assertIn("main", function_names)

    def test_experiment_documents_that_it_is_not_product_path(self):
        source = EXPERIMENT_PATH.read_text(encoding="utf-8")

        self.assertIn("intentionally isolated from the product path", source)
        self.assertIn("DEFAULT_TIME_LIMIT_SECONDS", source)
        self.assertIn("candidate-limit", source)
        self.assertIn("collection-mode", source)
        self.assertIn("objective-mode", source)

    def test_experiment_accepts_milestone_query_fields(self):
        source = EXPERIMENT_PATH.read_text(encoding="utf-8")

        self.assertIn("--level", source)
        self.assertIn("--element", source)
        self.assertIn("--target-ap", source)
        self.assertIn("--target-mp", source)
        self.assertIn("--target-range", source)
        self.assertIn("--budget-tier", source)
        self.assertIn("--exo-policy", source)

    def test_experiment_can_disable_exo_variables(self):
        source = EXPERIMENT_PATH.read_text(encoding="utf-8")

        self.assertIn('exo_stats = () if exo_policy == "none"', source)

    def test_experiment_encodes_simple_item_conditions(self):
        source = EXPERIMENT_PATH.read_text(encoding="utf-8")

        self.assertIn("CONDITION_STAT_TO_STAT_NAME", source)
        self.assertIn("add_condition_constraints", source)
        self.assertIn("OnlyEnforceIf(presence)", source)
        self.assertIn("AddBoolOr", source)

    def test_experiment_caches_total_stat_expressions(self):
        source = EXPERIMENT_PATH.read_text(encoding="utf-8")

        self.assertIn("total_stat_expr_cache", source)
        self.assertIn("if stat in total_stat_expr_cache", source)

    def test_experiment_bounds_set_count_domains_by_compatible_slots(self):
        source = EXPERIMENT_PATH.read_text(encoding="utf-8")

        self.assertIn("non_dofus_slots_by_set", source)
        self.assertIn("dofus_item_ids_by_set", source)
        self.assertIn("ring_item_ids_by_set", source)
        self.assertIn("item_ids_by_set", source)
        self.assertIn("max_selectable_slots", source)
        self.assertIn("min(DOFUS_GROUP_SIZE", source)
        self.assertIn("min(RING_GROUP_SIZE", source)

    def test_experiment_reports_model_size_diagnostics(self):
        source = EXPERIMENT_PATH.read_text(encoding="utf-8")

        self.assertIn("modelStats", source)
        self.assertIn("slotCandidateCounts", source)
        self.assertIn("slotVarCount", source)
        self.assertIn("exactSetCountVarCount", source)
        self.assertIn("conditionConstraintCount", source)

    def test_model_metadata_precomputes_static_model_inputs(self):
        if IMPORT_ERROR is not None:
            raise unittest.SkipTest(f"CP-SAT imports unavailable: {IMPORT_ERROR}")
        metadata = build_model_metadata(base_fixture_items(), fixture_sets())

        self.assertEqual(metadata.item_by_id["amulet"]["itemType"], "Amulet")
        self.assertEqual(len(metadata.candidates_by_slot["dofus"]), 6)
        self.assertEqual(metadata.selected_set_ids, {"dofus_set"})
        self.assertEqual(metadata.max_set_counts["dofus_set"], 2)
        self.assertEqual(metadata.set_bonus_by_id["dofus_set"]["2"], {"Strength": 200})
        self.assertIn("Strength", metadata.item_objective_stats_by_id["ring_good"])

    def test_model_skips_useless_singleton_set_count_vars_only(self):
        if IMPORT_ERROR is not None:
            raise unittest.SkipTest(f"CP-SAT imports unavailable: {IMPORT_ERROR}")
        items = [
            *base_fixture_items(),
            item("singleton_hat", "Hat", set_id="singleton_set"),
            item("one_item_bonus_belt", "Belt", set_id="one_item_bonus_set"),
        ]
        _model, _slot_item_vars, _exo_vars, model_stats = build_model(
            items,
            singleton_fixture_sets(),
            BuildTarget(ap=7, mp=3, range=0, level=200, range_required=False),
            forbidden_signatures=[],
            max_shared_item_cuts=[],
            max_shared_items=None,
            objective_weights={"Strength": 1.0, "AP": 0.0, "MP": 0.0, "Range": 0.0},
            exo_policy="none",
        )

        self.assertGreaterEqual(model_stats["skippedSetCountVarCount"], 2)
        self.assertGreater(model_stats["exactSetCountVarCount"], model_stats["skippedSetCountVarCount"])

    def test_model_reuses_single_slot_presence_vars(self):
        if IMPORT_ERROR is not None:
            raise unittest.SkipTest(f"CP-SAT imports unavailable: {IMPORT_ERROR}")
        items = [
            *base_fixture_items(),
            item("conditioned_hat", "Hat", conditions={"stat": "VITALITY", "operator": ">", "value": 1}),
            item("conditioned_ring", "Ring", conditions={"stat": "VITALITY", "operator": ">", "value": 1}),
        ]
        _model, _slot_item_vars, _exo_vars, model_stats = build_model(
            items,
            fixture_sets(),
            BuildTarget(ap=7, mp=3, range=0, level=200, range_required=False),
            forbidden_signatures=[],
            max_shared_item_cuts=[],
            max_shared_items=None,
            objective_weights={"Strength": 1.0, "AP": 0.0, "MP": 0.0, "Range": 0.0},
            exo_policy="allow",
        )

        self.assertGreaterEqual(model_stats["reusedPresenceVarCount"], 1)
        self.assertGreaterEqual(model_stats["createdPresenceVarCount"], 1)

    def test_model_groups_rings_when_exos_are_disabled(self):
        if IMPORT_ERROR is not None:
            raise unittest.SkipTest(f"CP-SAT imports unavailable: {IMPORT_ERROR}")
        model, slot_item_vars, _exo_vars, model_stats = build_model(
            base_fixture_items(),
            fixture_sets(),
            BuildTarget(ap=7, mp=3, range=0, level=200, range_required=False),
            forbidden_signatures=[],
            max_shared_item_cuts=[],
            max_shared_items=None,
            objective_weights={"Strength": 1.0, "AP": 0.0, "MP": 0.0, "Range": 0.0},
            exo_policy="none",
        )

        self.assertIsNotNone(model)
        self.assertTrue(model_stats["groupedRingSlot"])
        self.assertIn("ring", model_stats["slotCandidateCounts"])
        self.assertNotIn("ring_1", model_stats["slotCandidateCounts"])
        self.assertNotIn("ring_2", model_stats["slotCandidateCounts"])
        self.assertEqual(
            sorted(slot for slot, _item_id in slot_item_vars if slot == "ring"),
            ["ring", "ring"],
        )

    def test_model_keeps_explicit_ring_slots_when_exos_are_allowed(self):
        if IMPORT_ERROR is not None:
            raise unittest.SkipTest(f"CP-SAT imports unavailable: {IMPORT_ERROR}")
        _model, _slot_item_vars, exo_vars, model_stats = build_model(
            base_fixture_items(),
            fixture_sets(),
            BuildTarget(ap=7, mp=3, range=0, level=200, range_required=False),
            forbidden_signatures=[],
            max_shared_item_cuts=[],
            max_shared_items=None,
            objective_weights={"Strength": 1.0, "AP": 0.0, "MP": 0.0, "Range": 0.0},
            exo_policy="allow",
        )

        self.assertFalse(model_stats["groupedRingSlot"])
        self.assertNotIn("ring", model_stats["slotCandidateCounts"])
        self.assertIn("ring_1", model_stats["slotCandidateCounts"])
        self.assertIn("ring_2", model_stats["slotCandidateCounts"])
        self.assertTrue(any(slot.startswith("ring_") for slot, _stat in exo_vars))

    def test_model_rejects_grouped_ring_metadata_when_exos_are_allowed(self):
        if IMPORT_ERROR is not None:
            raise unittest.SkipTest(f"CP-SAT imports unavailable: {IMPORT_ERROR}")
        metadata = build_model_metadata(base_fixture_items(), fixture_sets(), group_rings=True)

        with self.assertRaisesRegex(ValueError, "Grouped ring metadata"):
            build_model(
                base_fixture_items(),
                fixture_sets(),
                BuildTarget(ap=7, mp=3, range=0, level=200, range_required=False),
                forbidden_signatures=[],
                max_shared_item_cuts=[],
                max_shared_items=None,
                objective_weights={"Strength": 1.0, "AP": 0.0, "MP": 0.0, "Range": 0.0},
                exo_policy="allow",
                metadata=metadata,
            )

    def test_model_skips_duplicate_set_bonus_upper_bound_leaf_conditions(self):
        if IMPORT_ERROR is not None:
            raise unittest.SkipTest(f"CP-SAT imports unavailable: {IMPORT_ERROR}")
        items = [
            *base_fixture_items(),
            item(
                "set_bonus_bound_hat",
                "Hat",
                conditions={
                    "and": [
                        {"stat": "SET_BONUS", "operator": "<", "value": 2},
                        {"stat": "VITALITY", "operator": ">", "value": 1},
                    ]
                },
            ),
        ]
        _model, _slot_item_vars, _exo_vars, model_stats = build_model(
            items,
            fixture_sets(),
            BuildTarget(ap=7, mp=3, range=0, level=200, range_required=False),
            forbidden_signatures=[],
            max_shared_item_cuts=[],
            max_shared_items=None,
            objective_weights={"Strength": 1.0, "AP": 0.0, "MP": 0.0, "Range": 0.0},
            exo_policy="none",
        )

        self.assertGreaterEqual(model_stats["skippedSetBonusConditionCount"], 1)

    def test_model_preserves_or_set_bonus_condition_constraints(self):
        if IMPORT_ERROR is not None:
            raise unittest.SkipTest(f"CP-SAT imports unavailable: {IMPORT_ERROR}")
        items = [
            *base_fixture_items(),
            item(
                "set_bonus_or_hat",
                "Hat",
                conditions={
                    "or": [
                        {"stat": "SET_BONUS", "operator": "<", "value": 2},
                        {"stat": "VITALITY", "operator": ">", "value": 99999},
                    ]
                },
            ),
        ]
        _model, _slot_item_vars, _exo_vars, model_stats = build_model(
            items,
            fixture_sets(),
            BuildTarget(ap=7, mp=3, range=0, level=200, range_required=False),
            forbidden_signatures=[],
            max_shared_item_cuts=[],
            max_shared_items=None,
            objective_weights={"Strength": 1.0, "AP": 0.0, "MP": 0.0, "Range": 0.0},
            exo_policy="none",
        )

        self.assertEqual(model_stats["skippedSetBonusConditionCount"], 0)

    def test_experiment_exposes_callback_candidate_collection(self):
        source = EXPERIMENT_PATH.read_text(encoding="utf-8")

        self.assertIn("CpSolverSolutionCallback", source)
        self.assertIn("CandidateCollectionCallback", source)
        self.assertIn('collection_mode == "callback"', source)
        self.assertIn("StopSearch", source)

    def test_callback_candidate_collection_produces_valid_fixture_candidate(self):
        if IMPORT_ERROR is not None:
            raise unittest.SkipTest(f"CP-SAT imports unavailable: {IMPORT_ERROR}")
        configure_damage_profile("strength")
        target = BuildTarget(ap=7, mp=3, range=0, level=200, range_required=False)
        items = base_fixture_items()
        sets = fixture_sets()
        model, slot_item_vars, exo_vars, model_stats = build_model(
            items,
            sets,
            target,
            forbidden_signatures=[],
            max_shared_item_cuts=[],
            max_shared_items=None,
            objective_weights={"Strength": 1.0, "AP": 0.0, "MP": 0.0, "Range": 0.0},
            exo_policy="none",
        )
        collector = CandidateCollectionCallback(
            slot_item_vars=slot_item_vars,
            exo_vars=exo_vars,
            items=items,
            sets=sets,
            target=target,
            candidate_limit=3,
            generic_damage_weight=0.45,
            survivability_weight=1.0,
            negative_resistance_penalty_weight=0.0,
        )
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 2
        solver.parameters.num_search_workers = 1

        status = solver.Solve(model, collector)

        self.assertIn(status, (cp_model.OPTIMAL, cp_model.FEASIBLE))
        self.assertGreaterEqual(collector.solution_count, 1)
        self.assertGreaterEqual(len(collector.candidates), 1)
        self.assertEqual(collector.candidates[0].stats["AP"], 7)
        self.assertEqual(model_stats["slotVarCount"], len(slot_item_vars))

    def test_callback_can_stop_after_candidate_limit(self):
        if IMPORT_ERROR is not None:
            raise unittest.SkipTest(f"CP-SAT imports unavailable: {IMPORT_ERROR}")
        configure_damage_profile("strength")
        target = BuildTarget(ap=7, mp=3, range=0, level=200, range_required=False)
        items = base_fixture_items()
        sets = fixture_sets()
        model, slot_item_vars, exo_vars, _model_stats = build_model(
            items,
            sets,
            target,
            forbidden_signatures=[],
            max_shared_item_cuts=[],
            max_shared_items=None,
            objective_weights={"Strength": 1.0, "AP": 0.0, "MP": 0.0, "Range": 0.0},
            exo_policy="none",
        )
        collector = CandidateCollectionCallback(
            slot_item_vars=slot_item_vars,
            exo_vars=exo_vars,
            items=items,
            sets=sets,
            target=target,
            candidate_limit=1,
            generic_damage_weight=0.45,
            survivability_weight=1.0,
            negative_resistance_penalty_weight=0.0,
            stop_after_candidates=True,
        )
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 2
        solver.parameters.num_search_workers = 1

        status = solver.Solve(model, collector)

        self.assertIn(status, (cp_model.OPTIMAL, cp_model.FEASIBLE))
        self.assertEqual(len(collector.candidates), 1)
        self.assertTrue(collector.stopped_after_candidate_limit)

    def test_candidate_signature_distinguishes_exo_choices(self):
        if IMPORT_ERROR is not None:
            raise unittest.SkipTest(f"CP-SAT imports unavailable: {IMPORT_ERROR}")
        gear = {
            "amulet": item("amulet", "Amulet"),
            "ring_1": item("ring", "Ring"),
        }
        ap_exo_state = BuildState(slots=gear, exos={"AP": "ring"})
        mp_exo_state = BuildState(slots=gear, exos={"MP": "ring"})

        self.assertNotEqual(state_signature(ap_exo_state), state_signature(mp_exo_state))

    def test_callback_records_candidate_event_metadata(self):
        if IMPORT_ERROR is not None:
            raise unittest.SkipTest(f"CP-SAT imports unavailable: {IMPORT_ERROR}")
        configure_damage_profile("strength")
        target = BuildTarget(ap=7, mp=3, range=0, level=200, range_required=False)
        items = base_fixture_items()
        sets = fixture_sets()
        model, slot_item_vars, exo_vars, _model_stats = build_model(
            items,
            sets,
            target,
            forbidden_signatures=[],
            max_shared_item_cuts=[],
            max_shared_items=None,
            objective_weights={"Strength": 1.0, "AP": 0.0, "MP": 0.0, "Range": 0.0},
            exo_policy="none",
        )
        collector = CandidateCollectionCallback(
            slot_item_vars=slot_item_vars,
            exo_vars=exo_vars,
            items=items,
            sets=sets,
            target=target,
            candidate_limit=3,
            generic_damage_weight=0.45,
            survivability_weight=1.0,
            negative_resistance_penalty_weight=0.0,
        )
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 2
        solver.parameters.num_search_workers = 1

        solver.Solve(model, collector)

        self.assertGreaterEqual(len(collector.candidate_events), 1)
        event = collector.candidate_events[0]
        self.assertIn("callbackIndex", event)
        self.assertIn("wallTimeMs", event)
        self.assertIn("objective", event)
        self.assertIn("itemIds", event)
        self.assertIn("exos", event)

    def test_experiment_groups_equivalent_dofus_slots(self):
        source = EXPERIMENT_PATH.read_text(encoding="utf-8")

        self.assertIn('DOFUS_GROUP_SLOT = "dofus"', source)
        self.assertIn("DOFUS_GROUP_SIZE = 6", source)
        self.assertIn("model.Add(sum(slot_vars) == min(DOFUS_GROUP_SIZE, len(slot_vars)))", source)
        self.assertIn('selected_by_slot[f"dofus_{index}"]', source)

    def test_server_requirements_include_ortools_pin(self):
        requirements = REQUIREMENTS_PATH.read_text(encoding="utf-8")

        self.assertIn("ortools==9.7.2996", requirements)


class BuildDiscoveryCpsatSemanticFixtureTest(unittest.TestCase):
    def setUp(self):
        if IMPORT_ERROR is not None:
            self.skipTest(f"CP-SAT imports unavailable: {IMPORT_ERROR}")

    def test_grouped_dofus_reconstructs_six_output_slots_and_set_bonus(self):
        status, state, model_stats = solve_fixture(base_fixture_items())

        self.assertIn(status, (cp_model.OPTIMAL, cp_model.FEASIBLE))
        self.assertIsNotNone(state)
        dofus_slots = [slot for slot in state.slots if slot.startswith("dofus_")]
        self.assertEqual(len(dofus_slots), 6)
        self.assertEqual(len({state.slots[slot]["dofusID"] for slot in dofus_slots}), 6)
        self.assertEqual(state.set_counts.get("dofus_set"), 2)
        self.assertGreaterEqual(state.stats.get("Strength", 0), 200)
        self.assertEqual(model_stats["slotCandidateCounts"]["dofus"], 6)

    def test_low_level_model_allows_empty_pet_and_dofus_slots(self):
        items = [
            fixture_item
            for fixture_item in base_fixture_items(dofus_items=[])
            if fixture_item["itemType"] != "Pet"
        ]
        target = BuildTarget(ap=6, mp=3, range=0, level=1, range_required=False, min_ap=6)

        status, state, model_stats = solve_fixture(items, target=target)

        self.assertIn(status, (cp_model.OPTIMAL, cp_model.FEASIBLE))
        self.assertIsNotNone(state)
        self.assertEqual(model_stats["slotCandidateCounts"]["dofus"], 0)
        self.assertNotIn("pet", state.slots)
        self.assertEqual([slot for slot in state.slots if slot.startswith("dofus_")], [])
        self.assertGreaterEqual(state.stats.get("AP", 0), 6)
        self.assertGreaterEqual(state.stats.get("MP", 0), 3)

    def test_prysmaradite_limit_allows_at_most_one(self):
        dofus_items = [
            item("prys_a", "Prysmaradite", stats={"Strength": 500}),
            item("prys_b", "Prysmaradite", stats={"Strength": 400}),
            item("dofus_c", "Dofus"),
            item("dofus_d", "Trophy"),
            item("dofus_e", "Dofus"),
            item("dofus_f", "Trophy"),
            item("dofus_g", "Dofus"),
        ]

        _status, state, _model_stats = solve_fixture(base_fixture_items(dofus_items=dofus_items))

        selected_prys = [
            slot
            for slot, selected_item in state.slots.items()
            if slot.startswith("dofus_") and selected_item["itemType"] == "Prysmaradite"
        ]
        self.assertEqual(len(selected_prys), 1)

    def test_same_ring_item_cannot_fill_both_ring_slots(self):
        _status, state, _model_stats = solve_fixture(base_fixture_items())

        self.assertNotEqual(
            state.slots["ring_1"]["dofusID"],
            state.slots["ring_2"]["dofusID"],
        )

    def test_and_condition_is_encoded_before_reconstruction(self):
        items = base_fixture_items()
        items = [
            item(
                "bad_weapon",
                "Sword",
                stats={"Strength": 1000},
                conditions={
                    "and": [
                        {"operator": ">", "stat": "VITALITY", "value": 99999},
                    ]
                },
            )
            if candidate["dofusID"] == "weapon"
            else candidate
            for candidate in items
        ]
        items.append(item("valid_weapon", "Sword", stats={"Strength": 1}))

        _status, state, _model_stats = solve_fixture(items)

        self.assertEqual(state.slots["weapon"]["dofusID"], "valid_weapon")

    def test_or_condition_is_encoded_before_reconstruction(self):
        items = base_fixture_items()
        items = [
            item(
                "bad_weapon",
                "Sword",
                stats={"Strength": 1000},
                conditions={
                    "or": [
                        {"operator": "<", "stat": "AP", "value": 1},
                        {"operator": ">", "stat": "VITALITY", "value": 99999},
                    ]
                },
            )
            if candidate["dofusID"] == "weapon"
            else candidate
            for candidate in items
        ]
        items.append(item("valid_weapon", "Sword", stats={"Strength": 1}))

        _status, state, _model_stats = solve_fixture(items)

        self.assertEqual(state.slots["weapon"]["dofusID"], "valid_weapon")


if __name__ == "__main__":
    unittest.main()
