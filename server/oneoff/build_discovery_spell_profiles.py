"""Derive Build Discovery class/element spell profiles from synced spell data."""

from __future__ import annotations

import json
import os
import argparse
from typing import Any, Iterable

from oneoff.build_discovery_scoring import (
    RANGE_SOFT_WEIGHT_FALLBACK,
    RANGE_SOFT_WEIGHT_MARGINAL,
    RANGE_SOFT_WEIGHT_NEARLY_USELESS,
    RANGE_SOFT_WEIGHT_USEFUL,
    RANGE_SOFT_WEIGHT_VITAL,
)
from oneoff.build_discovery_core import (
    ELEMENT_PROFILES,
    SUPPORTED_CLASS_NAMES,
    SpellDamageCandidate,
    active_base_stats,
    select_variant_spells,
    spell_candidates_for_profile,
    spell_damage_per_ap,
    spell_range_evidence_weight,
)


PROFILE_VERSION = "build-discovery-class-element-spell-profiles-v1"
SPELL_PROFILE_MODEL = "stateless_spell_profile_v1"
RANGE_PROFILE_MODEL = "range_importance_profile_v1"
PROFILE_LEVELS = (99, 149, 179, 200)


def spell_elements(spell: SpellDamageCandidate) -> list[str]:
    return sorted({line.element for line in spell.damage_lines})


def range_importance_for_weight(weight: float) -> str:
    if weight >= RANGE_SOFT_WEIGHT_VITAL:
        return "vital"
    if weight >= RANGE_SOFT_WEIGHT_USEFUL:
        return "useful"
    if weight >= RANGE_SOFT_WEIGHT_MARGINAL:
        return "marginal"
    if weight <= RANGE_SOFT_WEIGHT_NEARLY_USELESS:
        return "low"
    return "fallback"


def range_profile_from_spells(selected_spells: Iterable[SpellDamageCandidate]) -> dict[str, Any]:
    evidence = [
        (spell, spell_range_evidence_weight(spell))
        for spell in selected_spells
        if spell.damage_lines and spell_range_evidence_weight(spell) > 0
    ]
    total_weight = sum(weight for _, weight in evidence)
    if total_weight <= 0:
        return {
            "profileVersion": RANGE_PROFILE_MODEL,
            "rangeSoftWeight": RANGE_SOFT_WEIGHT_FALLBACK,
            "rangeImportance": range_importance_for_weight(RANGE_SOFT_WEIGHT_FALLBACK),
            "evidence": {
                "totalRangeEvidenceWeight": 0.0,
                "highModifiableShare": 0.0,
                "shortLockedShare": 0.0,
            },
        }

    high_modifiable_weight = sum(
        weight
        for spell, weight in evidence
        if spell.has_modifiable_range and (spell.max_range or 0) >= 4
    )
    short_locked_weight = sum(
        weight
        for spell, weight in evidence
        if not spell.has_modifiable_range and (spell.max_range or 0) <= 2
    )
    high_modifiable_share = high_modifiable_weight / total_weight
    short_locked_share = short_locked_weight / total_weight

    if short_locked_share >= 0.75:
        range_soft_weight = RANGE_SOFT_WEIGHT_NEARLY_USELESS
    elif high_modifiable_share >= 0.75:
        range_soft_weight = RANGE_SOFT_WEIGHT_VITAL
    elif high_modifiable_share >= 0.5:
        range_soft_weight = RANGE_SOFT_WEIGHT_USEFUL
    elif high_modifiable_share >= 0.25:
        range_soft_weight = RANGE_SOFT_WEIGHT_MARGINAL
    else:
        range_soft_weight = RANGE_SOFT_WEIGHT_NEARLY_USELESS

    return {
        "profileVersion": RANGE_PROFILE_MODEL,
        "rangeSoftWeight": range_soft_weight,
        "rangeImportance": range_importance_for_weight(range_soft_weight),
        "evidence": {
            "totalRangeEvidenceWeight": round(total_weight, 4),
            "highModifiableShare": round(high_modifiable_share, 4),
            "shortLockedShare": round(short_locked_share, 4),
        },
    }


def serializable_spell(
    spell: SpellDamageCandidate,
    *,
    reference_stats: dict[str, int],
) -> dict[str, Any]:
    return {
        "name": spell.name,
        "variantPairId": spell.variant_pair_id,
        "apCost": spell.ap_cost,
        "minRange": spell.min_range,
        "maxRange": spell.max_range,
        "hasModifiableRange": spell.has_modifiable_range,
        "castsPerTurn": spell.casts_per_turn,
        "castsPerTarget": spell.casts_per_target,
        "cooldown": spell.cooldown,
        "baseCritChance": spell.base_crit_chance,
        "damageIncrease": spell.damage_increase,
        "critDamageIncrease": spell.crit_damage_increase,
        "maxDamageIncreaseStacks": spell.max_damage_increase_stacks,
        "isWeapon": spell.is_weapon,
        "damageLines": [
            {
                "element": line.element,
                "baseMin": line.base_min,
                "baseMax": line.base_max,
                "critBaseMin": line.crit_base_min,
                "critBaseMax": line.crit_base_max,
                "critChance": line.crit_chance,
                "critBonusDamage": line.crit_bonus_damage,
                "isWeapon": line.is_weapon,
                "isTrap": line.is_trap,
                "weight": line.weight,
                "distance": line.distance,
            }
            for line in spell.damage_lines
        ],
        "elements": spell_elements(spell),
        "expectedDamagePerApAtReferenceStats": round(
            spell_damage_per_ap(spell, reference_stats),
            4,
        ),
        "rangeEvidenceWeight": round(spell_range_evidence_weight(spell), 4),
    }


def derive_spell_profile(
    *,
    class_name: str,
    element: str,
    level: int,
    candidates: Iterable[SpellDamageCandidate] | None = None,
) -> dict[str, Any]:
    reference_stats = active_base_stats()
    raw_candidates = tuple(
        candidates
        if candidates is not None
        else spell_candidates_for_profile(class_name, element, level)
    )
    selected_spells = tuple(select_variant_spells(raw_candidates, reference_stats))
    selected_spells = tuple(
        sorted(
            selected_spells,
            key=lambda spell: spell_damage_per_ap(spell, reference_stats),
            reverse=True,
        )
    )
    range_profile = range_profile_from_spells(selected_spells)
    confidence = "medium" if selected_spells else "low"

    return {
        "profileVersion": PROFILE_VERSION,
        "className": class_name,
        "element": element,
        "level": level,
        "spellProfile": {
            "profileVersion": SPELL_PROFILE_MODEL,
            "rotationModel": SPELL_PROFILE_MODEL,
            "confidence": confidence,
            "candidateCount": len(raw_candidates),
            "selectedVariantCount": len(selected_spells),
            "selectedSpells": [
                serializable_spell(spell, reference_stats=reference_stats)
                for spell in selected_spells
            ],
        },
        "rangeProfile": range_profile,
    }


def derive_all_spell_profiles(
    *,
    class_names: Iterable[str] = SUPPORTED_CLASS_NAMES,
    elements: Iterable[str] = tuple(ELEMENT_PROFILES),
    levels: Iterable[int] = PROFILE_LEVELS,
) -> dict[str, Any]:
    class_name_tuple = tuple(class_names)
    element_tuple = tuple(elements)
    level_tuple = tuple(levels)
    profiles = [
        derive_spell_profile(class_name=class_name, element=element, level=level)
        for class_name in class_name_tuple
        for element in element_tuple
        for level in level_tuple
    ]
    return {
        "profileVersion": PROFILE_VERSION,
        "levels": list(level_tuple),
        "profiles": profiles,
    }


def default_output_path() -> str:
    app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(app_root, "app", "database", "data", "build_discovery_spell_profiles.json")


def write_spell_profiles(output_path: str | None = None) -> dict[str, Any]:
    output_path = output_path or default_output_path()
    profiles = derive_all_spell_profiles()
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as file:
        json.dump(profiles, file, indent=2, sort_keys=True)
        file.write("\n")
    print(
        f"Wrote build discovery spell profiles to {output_path} "
        f"({len(profiles['profiles'])} profiles)."
    )
    return profiles


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default=default_output_path())
    args = parser.parse_args()
    write_spell_profiles(args.output)


if __name__ == "__main__":
    main()
