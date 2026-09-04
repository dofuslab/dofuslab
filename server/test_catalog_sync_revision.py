import ast
from contextlib import contextmanager
from pathlib import Path
import unittest


SERVER_ROOT = Path(__file__).parent


class FakeSavepoint:
    def __init__(self, session):
        self.session = session
        self.snapshot = list(session.mutations)

    def __enter__(self):
        return self

    def __exit__(self, exception_type, _exception, _traceback):
        if exception_type is not None:
            self.session.mutations[:] = self.snapshot
        return False


class FakeSyncSession:
    def __init__(self):
        self.mutations = []

    def begin_nested(self):
        return FakeSavepoint(self)


def load_functions(relative_path, function_names, namespace):
    source = (SERVER_ROOT / relative_path).read_text(encoding="utf-8")
    tree = ast.parse(source)
    selected = [
        node
        for node in tree.body
        if isinstance(node, ast.FunctionDef) and node.name in function_names
    ]
    exec(compile(ast.Module(body=selected, type_ignores=[]), str(relative_path), "exec"), namespace)
    return namespace


class CatalogSyncRevisionTest(unittest.TestCase):
    def _revision_guard(self, advances):
        def advance_for_changes(_session, *groups):
            if any(groups):
                advances.append(groups)

        return advance_for_changes

    def test_item_upsert_advances_for_changes_not_skips_or_errors(self):
        advances = []

        def update_item(_session, item_id, _record):
            if item_id == "error":
                raise ValueError("invalid")
            return {"created": True, "updated": False, "skipped": None}[item_id]

        namespace = load_functions(
            Path("oneoff/sync_item.py"),
            {"execute_upsert_all"},
            {
                "update_or_create_item": update_item,
                "advance_catalog_revision_for_changes": self._revision_guard(advances),
            },
        )
        records = {
            "items": [
                {"dofusID": result, "name": {"en": result}}
                for result in ("created", "updated", "skipped", "error")
            ]
        }
        result = namespace["execute_upsert_all"](FakeSyncSession(), records)
        self.assertEqual([len(group) for group in result], [1, 1, 1, 1])
        self.assertEqual(len(advances), 1)

        advances.clear()
        namespace["execute_upsert_all"](
            FakeSyncSession(),
            {"items": records["items"][2:]},
        )
        self.assertEqual(advances, [])

    def test_item_sync_advances_once_for_upserts_and_deletes(self):
        advances = []
        namespace = load_functions(
            Path("oneoff/sync_item.py"),
            {"execute_upsert_all", "execute_sync_all"},
            {
                "update_or_create_item": lambda _session, _item_id, _record: True,
                "get_items_to_delete": lambda _session, _ids, _scope: [object()],
                "delete_items_not_in_file": lambda _session, _rows, _scope: ["deleted"],
                "advance_catalog_revision_for_changes": self._revision_guard(advances),
            },
        )
        namespace["execute_sync_all"](
            FakeSyncSession(),
            {"items": [{"dofusID": "1", "name": {"en": "One"}}]},
            {"1"},
        )
        self.assertEqual(len(advances), 1)

    def test_set_sync_advances_once_and_noop_does_not_advance(self):
        advances = []
        namespace = load_functions(
            Path("oneoff/sync_set.py"),
            {"execute_upsert_all", "execute_sync_all"},
            {
                "update_or_create_set": lambda _session, _set_id, _record: False,
                "get_sets_to_delete": lambda _session, _ids: [],
                "delete_sets_not_in_file": lambda _session, _rows: [],
                "advance_catalog_revision_for_changes": self._revision_guard(advances),
            },
        )
        namespace["execute_sync_all"](
            FakeSyncSession(),
            [{"id": "1", "name": {"en": "One"}}],
            {"1"},
        )
        self.assertEqual(len(advances), 1)

        advances.clear()
        namespace["execute_sync_all"](FakeSyncSession(), [], set())
        self.assertEqual(advances, [])

    def test_item_savepoint_keeps_success_and_rolls_back_later_error(self):
        advances = []

        def mutate_item(session, item_id, _record):
            session.mutations.append(item_id)
            if item_id == "error":
                session.mutations.append("partial-error-write")
                raise ValueError("invalid after mutation")
            return True

        namespace = load_functions(
            Path("oneoff/sync_item.py"),
            {"execute_upsert_all"},
            {
                "update_or_create_item": mutate_item,
                "advance_catalog_revision_for_changes": self._revision_guard(advances),
            },
        )
        session = FakeSyncSession()
        result = namespace["execute_upsert_all"](
            session,
            {
                "items": [
                    {"dofusID": "success", "name": {"en": "Success"}},
                    {"dofusID": "error", "name": {"en": "Error"}},
                ]
            },
        )
        self.assertEqual(session.mutations, ["success"])
        self.assertEqual([len(group) for group in result], [1, 0, 0, 1])
        self.assertEqual(len(advances), 1)

    def test_set_savepoint_rolls_back_error_only_without_revision(self):
        advances = []

        def mutate_set(session, set_id, _record):
            session.mutations.extend([set_id, "partial-error-write"])
            raise ValueError("invalid after mutation")

        namespace = load_functions(
            Path("oneoff/sync_set.py"),
            {"execute_upsert_all"},
            {
                "update_or_create_set": mutate_set,
                "advance_catalog_revision_for_changes": self._revision_guard(advances),
            },
        )
        session = FakeSyncSession()
        result = namespace["execute_upsert_all"](
            session,
            [{"id": "error", "name": {"en": "Error"}}],
        )
        self.assertEqual(session.mutations, [])
        self.assertEqual([len(group) for group in result], [0, 0, 0, 1])
        self.assertEqual(advances, [])

    def test_low_level_item_buff_paths_advance_for_all_callers(self):
        advances = []

        class Field:
            def __eq__(self, other):
                return other

        class Buff:
            item_id = Field()

            def __init__(self, **values):
                self.values = values

        class Query:
            def filter(self, _expression):
                return self

            def delete(self):
                return 1

        class Session:
            def __init__(self):
                self.added = []

            def add(self, value):
                self.added.append(value)

            def query(self, _model):
                return Query()

        namespace = load_functions(
            Path("oneoff/sync_buff.py"),
            {"add_item_buffs", "update_item_buffs"},
            {
                "ModelBuff": Buff,
                "to_stat_enum": {"Power": "power"},
                "advance_catalog_revision": lambda _session: advances.append(True),
            },
        )
        record = {
            "buffs": [
                {"stat": "Power", "incrementBy": 10, "maxStacks": 2}
            ]
        }
        session = Session()
        namespace["add_item_buffs"](session, "item-1", record)
        namespace["update_item_buffs"](session, "item-1", record)
        self.assertEqual(len(advances), 2)

        namespace["add_item_buffs"](session, "item-1", {"buffs": []})
        self.assertEqual(len(advances), 2)

    def test_item_image_url_update_advances_only_for_actual_changes(self):
        events = []

        class Item:
            pass

        class ItemRecord:
            def __init__(self, uuid, image_url):
                self.uuid = uuid
                self.image_url = image_url

        class Session:
            def __init__(self, records):
                self.records = records

            def query(self, model):
                self.queried_model = model
                return self.records

            def bulk_update_mappings(self, model, mappings):
                events.append(("update", model, mappings))

            def commit(self):
                events.append(("commit",))

        class Db:
            def __init__(self, records):
                self.session = Session(records)

        namespace = load_functions(
            Path("oneoff/update_image_urls.py"),
            {"update_item_urls_in_db"},
            {
                "db": Db(
                    [
                        ItemRecord("unchanged", "item/1.png"),
                        ItemRecord("changed", "https://old.example/2.png"),
                    ]
                ),
                "ModelItem": Item,
                "re": __import__("re"),
                "advance_catalog_revision": lambda _session: events.append(
                    ("revision",)
                ),
            },
        )
        namespace["update_item_urls_in_db"]()

        self.assertEqual(
            events,
            [
                (
                    "update",
                    Item,
                    [{"uuid": "changed", "image_url": "item/2.png"}],
                ),
                ("revision",),
                ("commit",),
            ],
        )

        events.clear()
        namespace["db"] = Db([ItemRecord("unchanged", "item/1.png")])
        namespace["update_item_urls_in_db"]()
        self.assertEqual(events, [("commit",)])

    def test_class_wipe_deletes_only_spell_buffs(self):
        deletes = []

        class Spell:
            pass

        class SpellVariantPair:
            pass

        class SpellStatId:
            def isnot(self, value):
                return ("spell-stat-is-not", value)

        class Buff:
            spell_stat_id = SpellStatId()

        class Query:
            def __init__(self, model):
                self.model = model
                self.expression = None

            def filter(self, expression):
                self.expression = expression
                return self

            def delete(self, **options):
                deletes.append((self.model, self.expression, options))

        class Session:
            def query(self, model):
                return Query(model)

            def flush(self):
                deletes.append(("flush",))

        namespace = load_functions(
            Path("oneoff/sync_class.py"),
            {"wipeSpellsAndBuffs"},
            {
                "db": type("Db", (), {"session": Session()})(),
                "ModelBuff": Buff,
                "ModelSpell": Spell,
                "ModelSpellVariantPair": SpellVariantPair,
            },
        )
        namespace["wipeSpellsAndBuffs"]()

        self.assertEqual(
            deletes[0],
            (Buff, ("spell-stat-is-not", None), {"synchronize_session": False}),
        )
        self.assertNotIn((Buff, None, {}), deletes)

    def test_class_buff_sync_replaces_each_items_buffs(self):
        replacements = []
        item_record = {"name": "Crimson Dofus", "buffs": []}

        class TranslationResult:
            item_id = "item-1"

        class Query:
            def filter_by(self, **_filters):
                return self

            def one(self):
                return TranslationResult()

        class Session:
            def query(self, _model):
                return Query()

        @contextmanager
        def session_scope():
            yield Session()

        class Json:
            @staticmethod
            def load(_file):
                return {"spells": {}, "items": [item_record]}

        class SyncBuff:
            @staticmethod
            def update_item_buffs(session, item_id, record):
                replacements.append((session, item_id, record))

        namespace = load_functions(
            Path("oneoff/sync_class.py"),
            {"add_buffs"},
            {
                "open": lambda *_args, **_kwargs: __import__("contextlib").nullcontext(
                    object()
                ),
                "os": __import__("os"),
                "app_root": str(SERVER_ROOT),
                "json": Json,
                "session_scope": session_scope,
                "ModelItemTranslation": object(),
                "oneoff": type(
                    "Oneoff",
                    (),
                    {"sync_buff": SyncBuff},
                )(),
            },
        )
        namespace["add_buffs"]()

        self.assertEqual(len(replacements), 1)
        self.assertEqual(replacements[0][1:], ("item-1", item_record))


if __name__ == "__main__":
    unittest.main()
