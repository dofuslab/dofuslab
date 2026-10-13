from app.database.enums import WeaponElementMage, normalize_weapon_mage


def test_normalize_weapon_mage_keeps_current_percentages():
    assert normalize_weapon_mage(None) is None
    assert (
        normalize_weapon_mage(WeaponElementMage.FIRE_100) is WeaponElementMage.FIRE_100
    )
    assert (
        normalize_weapon_mage(WeaponElementMage.WATER_68) is WeaponElementMage.WATER_68
    )


def test_normalize_weapon_mage_maps_historical_percentages():
    assert (
        normalize_weapon_mage(WeaponElementMage.EARTH_85) is WeaponElementMage.EARTH_100
    )
    assert normalize_weapon_mage(WeaponElementMage.AIR_50) is WeaponElementMage.AIR_10
    assert (
        normalize_weapon_mage(WeaponElementMage.FIRE_85.value)
        is WeaponElementMage.FIRE_100
    )
