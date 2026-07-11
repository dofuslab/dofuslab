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


EXPERIMENT_PATH = experiment_path()


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


if __name__ == "__main__":
    unittest.main()
