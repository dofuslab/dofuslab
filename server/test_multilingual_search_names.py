import ast
from collections import defaultdict
from pathlib import Path
import unittest


SERVER_ROOT = Path(__file__).parent


class ImmediatePromise:
    @staticmethod
    def resolve(value):
        return value


class QueryField:
    def in_(self, values):
        return ("in", tuple(values))


class TranslationModel:
    item_id = QueryField()
    set_id = QueryField()
    locale = QueryField()


class Translation:
    def __init__(self, *, item_id=None, set_id=None, locale, name):
        self.item_id = item_id
        self.set_id = set_id
        self.locale = locale
        self.name = name


class FakeQuery:
    def __init__(self, rows):
        self.rows = rows
        self.filter_expression = None
        self.order_fields = None

    def filter(self, expression):
        self.filter_expression = expression
        return self

    def order_by(self, *fields):
        self.order_fields = fields
        return self

    def __iter__(self):
        return iter(self.rows)


class FakeSession:
    def __init__(self, rows):
        self.query_object = FakeQuery(rows)
        self.queried_model = None

    def query(self, model):
        self.queried_model = model
        return self.query_object


class FakeDB:
    def __init__(self, rows):
        self.session = FakeSession(rows)


def load_function(function_name, namespace):
    relative_path = Path("app/loaders.py")
    source = (SERVER_ROOT / relative_path).read_text(encoding="utf-8")
    tree = ast.parse(source)
    selected = [
        node
        for node in tree.body
        if isinstance(node, ast.FunctionDef) and node.name == function_name
    ]
    if len(selected) != 1:
        raise AssertionError(f"Expected one {function_name} function")
    exec(
        compile(ast.Module(body=selected, type_ignores=[]), str(relative_path), "exec"),
        namespace,
    )
    return namespace[function_name]


def resolver_loader_name(type_name, resolver_name):
    schema_path = SERVER_ROOT / "app/schema.py"
    tree = ast.parse(schema_path.read_text(encoding="utf-8"))
    type_node = next(
        node
        for node in tree.body
        if isinstance(node, ast.ClassDef) and node.name == type_name
    )
    resolver = next(
        node
        for node in type_node.body
        if isinstance(node, ast.FunctionDef) and node.name == resolver_name
    )
    loader_get = next(
        node
        for node in ast.walk(resolver)
        if isinstance(node, ast.Call)
        and isinstance(node.func, ast.Attribute)
        and node.func.attr == "get"
    )
    return ast.literal_eval(loader_get.args[0])


class MultilingualSearchNamesTest(unittest.TestCase):
    def _run_loader(self, function_name, model_name, rows, ids):
        db = FakeDB(rows)
        model = TranslationModel
        loader = load_function(
            function_name,
            {
                "db": db,
                model_name: model,
                "defaultdict": defaultdict,
                "Promise": ImmediatePromise,
            },
        )
        result = loader(ids)
        self.assertIs(db.session.queried_model, model)
        self.assertEqual(db.session.query_object.filter_expression, ("in", tuple(ids)))
        self.assertIsNotNone(db.session.query_object.order_fields)
        return result

    def test_item_names_include_every_translation_and_preserve_batch_order(self):
        rows = [
            Translation(item_id="item-b", locale="en", name="Bow"),
            Translation(item_id="item-b", locale="fr", name="Arc"),
            Translation(item_id="item-a", locale="en", name="Sword"),
            Translation(item_id="item-a", locale="es", name="Espada"),
        ]
        self.assertEqual(
            self._run_loader(
                "load_all_item_names",
                "ModelItemTranslation",
                rows,
                ["item-a", "missing", "item-b"],
            ),
            [["Sword", "Espada"], [], ["Bow", "Arc"]],
        )

    def test_set_names_include_every_translation_and_use_empty_list_fallback(self):
        rows = [
            Translation(set_id="set-2", locale="de", name="Zweites Set"),
            Translation(set_id="set-2", locale="en", name="Second Set"),
        ]
        self.assertEqual(
            self._run_loader(
                "load_all_set_names",
                "ModelSetTranslation",
                rows,
                ["set-1", "set-2", "set-3"],
            ),
            [[], ["Zweites Set", "Second Set"], []],
        )

    def test_search_name_resolvers_use_the_all_translation_loaders(self):
        self.assertEqual(
            resolver_loader_name("Item", "resolve_search_names"),
            "all_item_names_loader",
        )
        self.assertEqual(
            resolver_loader_name("Set", "resolve_search_names"),
            "all_set_names_loader",
        )


if __name__ == "__main__":
    unittest.main()
