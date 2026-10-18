"""Focused unit coverage for pure mutation validation and normalization helpers."""

from types import SimpleNamespace

import pytest
from graphql import GraphQLError

from app import app
from app.database.enums import WeaponElementMage, normalize_weapon_mage
from app.mutation_validation_utils import validate_password, validate_username
from app.utils import edit_custom_set_metadata, edit_custom_set_stats


@pytest.mark.parametrize(
    "legacy, expected",
    [
        (WeaponElementMage.FIRE_85, WeaponElementMage.FIRE_100),
        (WeaponElementMage.AIR_50, WeaponElementMage.AIR_10),
        (WeaponElementMage.EARTH_68, WeaponElementMage.EARTH_68),
        (None, None),
    ],
)
def test_weapon_mage_normalization(legacy, expected):
    assert normalize_weapon_mage(legacy) == expected


@pytest.mark.parametrize("password", ["short", "alllowercase1", "ALLUPPERCASE1"])
def test_password_validation_rejects_weak_values(password):
    with app.test_request_context(headers={"Accept-Language": "en"}):
        with pytest.raises(GraphQLError):
            validate_password(password)


def test_username_validation_accepts_documented_shape():
    with app.test_request_context(headers={"Accept-Language": "en"}):
        validate_username("valid_user.123")


def test_metadata_validation_does_not_partially_mutate_on_invalid_level():
    custom_set = SimpleNamespace(name="Before", level=100)
    with app.test_request_context(headers={"Accept-Language": "en"}):
        with pytest.raises(GraphQLError):
            edit_custom_set_metadata(custom_set, "After", 201)
    assert custom_set.name == "Before"
    assert custom_set.level == 100


def test_stat_validation_does_not_partially_mutate_on_invalid_value():
    stats = SimpleNamespace(
        base_vitality=1,
        base_wisdom=1,
        base_strength=1,
        base_intelligence=1,
        base_chance=1,
        base_agility=1,
        scrolled_vitality=1,
        scrolled_wisdom=1,
        scrolled_strength=1,
        scrolled_intelligence=1,
        scrolled_chance=1,
        scrolled_agility=1,
    )
    values = dict(vars(stats), base_strength=1000)
    with app.test_request_context(headers={"Accept-Language": "en"}):
        with pytest.raises(GraphQLError):
            edit_custom_set_stats(SimpleNamespace(stats=stats), values)
    assert set(vars(stats).values()) == {1}
