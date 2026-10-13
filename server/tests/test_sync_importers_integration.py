"""Run against a migrated, seeded disposable database."""

import copy

import pytest

from app import session_scope
from app.database.model_item import ModelItem
from app.database.model_buff import ModelBuff
from app.database.model_spell import ModelSpell
from app.database.model_spell_variant_pair import ModelSpellVariantPair
from oneoff.sync_class import load_class_sources
from oneoff.sync_item import apply_item_update_plan, plan_item_update
from oneoff.sync_spell import update_spell
from oneoff import sync_game_data


class RollbackProbe(Exception):
    pass


def test_item_plan_apply_agree_and_rollback_preserves_unchanged_stat_ids():
    source = next(
        record
        for records in sync_game_data.load_and_validate_all(
            sync_game_data.os.path.join(sync_game_data.app_root, "app/database/data"),
            sync_game_data.allowed_file_names,
        )[2].values()
        for record in records
        if record.get("dofusID") == "737"
    )
    with session_scope() as db_session:
        item = db_session.query(ModelItem).filter_by(dofus_db_id="737").one()
        baseline_stat_ids = {
            stat.stat: stat.uuid for stat in item.stats if stat.stat is not None
        }

    changed = copy.deepcopy(source)
    changed["stats"][0]["minStat"] = -123
    changed["stats"][0]["maxStat"] = -100
    changed["stats"] = list(reversed(changed["stats"]))

    try:
        with session_scope() as db_session:
            item = db_session.query(ModelItem).filter_by(dofus_db_id="737").one()
            plan = plan_item_update(db_session, item, changed)
            assert plan["changed"]
            apply_item_update_plan(db_session, plan)
            db_session.flush()
            assert not plan_item_update(db_session, item, changed)["changed"]
            remaining_ids = {
                stat.stat: stat.uuid for stat in item.stats if stat.stat is not None
            }
            for stat, stat_id in baseline_stat_ids.items():
                if stat in remaining_ids:
                    assert remaining_ids[stat] == stat_id
            raise RollbackProbe()
    except RollbackProbe:
        pass

    with session_scope() as db_session:
        item = db_session.query(ModelItem).filter_by(dofus_db_id="737").one()
        assert not plan_item_update(db_session, item, source)["changed"]


def test_combined_sync_rolls_back_when_a_late_stage_fails(monkeypatch):
    with session_scope() as db_session:
        original_level = (
            db_session.query(ModelItem).filter_by(dofus_db_id="737").one().level
        )

    monkeypatch.setattr(
        sync_game_data, "preview_set_changes", lambda *args: ([], [], [])
    )
    monkeypatch.setattr(
        sync_game_data, "preview_item_changes", lambda *args: ([], [], [])
    )
    monkeypatch.setattr(
        sync_game_data,
        "preview_class_changes",
        lambda *args: {
            "classes_create": 0,
            "classes_update": 0,
            "spells_create": 0,
            "spells_update": 1,
            "spells_delete": 0,
            "legacy_null_spells": 0,
            "pairs_reconcile": 0,
        },
    )
    monkeypatch.setattr(
        sync_game_data,
        "execute_set_sync_all",
        lambda *args: ([], [], [], [], []),
    )

    def mutate_item(db_session, *_):
        db_session.query(ModelItem).filter_by(dofus_db_id="737").one().level += 99
        return [], ["737"], [], [], []

    monkeypatch.setattr(sync_game_data, "execute_item_sync_all", mutate_item)
    monkeypatch.setattr(
        sync_game_data,
        "execute_class_sync",
        lambda *args: (_ for _ in ()).throw(RollbackProbe()),
    )
    monkeypatch.setattr("builtins.input", lambda _: "SYNC ALL GAME DATA")

    with pytest.raises(RollbackProbe):
        sync_game_data.sync_game_data()

    with session_scope() as db_session:
        assert (
            db_session.query(ModelItem).filter_by(dofus_db_id="737").one().level
            == original_level
        )


def test_targeted_spell_update_repairs_pair_and_rebuilds_buffs_atomically():
    classes, buffs = load_class_sources()
    buff_record = next(
        spell for spell_records in buffs["spells"].values() for spell in spell_records
    )
    spell_id = str(buff_record["dofusID"])
    class_record = next(
        class_record
        for class_record in classes
        if any(
            str(spell["dofusID"]) == spell_id
            for pair in class_record["spells"]
            for spell in pair
        )
    )
    pair_records = next(
        pair
        for pair in class_record["spells"]
        if any(str(spell["dofusID"]) == spell_id for spell in pair)
    )
    spell_record = next(
        spell for spell in pair_records if str(spell["dofusID"]) == spell_id
    )
    sibling_id = next(
        str(spell["dofusID"])
        for spell in pair_records
        if str(spell["dofusID"]) != spell_id
    )

    try:
        with session_scope() as db_session:
            spell = db_session.query(ModelSpell).filter_by(dofus_db_id=spell_id).one()
            sibling = (
                db_session.query(ModelSpell).filter_by(dofus_db_id=sibling_id).one()
            )
            wrong_pair = ModelSpellVariantPair(
                class_id=spell.spell_variant_pair.class_id
            )
            db_session.add(wrong_pair)
            db_session.flush()
            spell.spell_variant_pair_id = wrong_pair.uuid
            db_session.flush()

            update_spell(
                db_session,
                class_record["names"]["en"],
                pair_records,
                spell_record,
                False,
                buff_record,
            )
            db_session.flush()
            assert spell.spell_variant_pair_id == sibling.spell_variant_pair_id
            expected_buffs = sum(len(level["buffs"]) for level in buff_record["levels"])
            actual_buffs = (
                db_session.query(ModelBuff)
                .join(ModelBuff.spell_stats)
                .filter_by(spell_id=spell.uuid)
                .count()
            )
            assert actual_buffs == expected_buffs
            raise RollbackProbe()
    except RollbackProbe:
        pass
