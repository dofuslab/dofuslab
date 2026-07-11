import ast
import unittest
from pathlib import Path


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

    def test_experiment_caches_total_stat_expressions(self):
        source = EXPERIMENT_PATH.read_text(encoding="utf-8")

        self.assertIn("total_stat_expr_cache", source)
        self.assertIn("if stat in total_stat_expr_cache", source)

    def test_experiment_bounds_set_count_domains_by_compatible_slots(self):
        source = EXPERIMENT_PATH.read_text(encoding="utf-8")

        self.assertIn("non_dofus_slots_by_set", source)
        self.assertIn("dofus_item_ids_by_set", source)
        self.assertIn("item_ids_by_set", source)
        self.assertIn("max_selectable_slots", source)
        self.assertIn("min(\n            DOFUS_GROUP_SIZE", source)

    def test_experiment_reports_model_size_diagnostics(self):
        source = EXPERIMENT_PATH.read_text(encoding="utf-8")

        self.assertIn("modelStats", source)
        self.assertIn("slotCandidateCounts", source)
        self.assertIn("slotVarCount", source)
        self.assertIn("exactSetCountVarCount", source)
        self.assertIn("conditionConstraintCount", source)

    def test_experiment_groups_equivalent_dofus_slots(self):
        source = EXPERIMENT_PATH.read_text(encoding="utf-8")

        self.assertIn('DOFUS_GROUP_SLOT = "dofus"', source)
        self.assertIn("DOFUS_GROUP_SIZE = 6", source)
        self.assertIn("model.Add(sum(slot_vars) == DOFUS_GROUP_SIZE)", source)
        self.assertIn('selected_by_slot[f"dofus_{index}"]', source)

    def test_server_requirements_include_ortools_pin(self):
        requirements = REQUIREMENTS_PATH.read_text(encoding="utf-8")

        self.assertIn("ortools==9.7.2996", requirements)


if __name__ == "__main__":
    unittest.main()
