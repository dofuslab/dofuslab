"""Shared Iop level-diversity target matrix."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from oneoff.build_discovery_prototype import BuildDiscoveryQuery


@dataclass(frozen=True)
class LevelDiversityTarget:
    name: str
    level: int
    element: str
    budget_tier: int
    ap: int
    mp: int
    range_target: Optional[int]


LEVEL_DIVERSITY_TARGETS = (
    LevelDiversityTarget("level_50_strength_7_3_1_budget1", 50, "strength", 1, 7, 3, 1),
    LevelDiversityTarget("level_50_intelligence_7_4_0_budget1", 50, "intelligence", 1, 7, 4, 0),
    LevelDiversityTarget("level_50_chance_7_5_1_budget2", 50, "chance", 2, 7, 5, 1),
    LevelDiversityTarget("level_60_strength_10_4_2_budget2", 60, "strength", 2, 10, 4, 2),
    LevelDiversityTarget("level_60_intelligence_10_4_3_budget2", 60, "intelligence", 2, 10, 4, 3),
    LevelDiversityTarget("level_60_chance_9_3_2_budget1", 60, "chance", 1, 9, 3, 2),
    LevelDiversityTarget("level_60_agility_9_3_none_budget1", 60, "agility", 1, 9, 3, None),
    LevelDiversityTarget("level_80_agility_10_5_1_budget2", 80, "agility", 2, 10, 5, 1),
    LevelDiversityTarget("level_80_strength_9_5_2_budget1", 80, "strength", 1, 9, 5, 2),
    LevelDiversityTarget("level_100_strength_12_5_none_budget2", 100, "strength", 2, 12, 5, None),
    LevelDiversityTarget("level_120_intelligence_11_5_1_budget2", 120, "intelligence", 2, 11, 5, 1),
    LevelDiversityTarget("level_120_chance_12_5_1_budget3", 120, "chance", 3, 12, 5, 1),
    LevelDiversityTarget("level_120_agility_11_4_1_budget1", 120, "agility", 1, 11, 4, 1),
    LevelDiversityTarget("level_150_strength_9_4_2_budget1", 150, "strength", 1, 9, 4, 2),
    LevelDiversityTarget("level_150_intelligence_12_5_2_budget3", 150, "intelligence", 3, 12, 5, 2),
    LevelDiversityTarget("level_150_chance_12_4_2_budget2", 150, "chance", 2, 12, 4, 2),
    LevelDiversityTarget("level_150_agility_11_5_2_budget2", 150, "agility", 2, 11, 5, 2),
    LevelDiversityTarget("level_160_strength_12_5_3_budget3", 160, "strength", 3, 12, 5, 3),
    LevelDiversityTarget("level_160_intelligence_12_5_2_budget2", 160, "intelligence", 2, 12, 5, 2),
    LevelDiversityTarget("level_160_chance_11_6_none_budget3", 160, "chance", 3, 11, 6, None),
    LevelDiversityTarget("level_160_agility_12_6_3_budget4", 160, "agility", 4, 12, 6, 3),
    LevelDiversityTarget("level_180_strength_12_5_3_budget3", 180, "strength", 3, 12, 5, 3),
    LevelDiversityTarget("level_199_strength_12_6_2_budget4", 199, "strength", 4, 12, 6, 2),
    LevelDiversityTarget("level_199_intelligence_12_5_2_budget3", 199, "intelligence", 3, 12, 5, 2),
    LevelDiversityTarget("level_199_chance_10_6_3_budget2", 199, "chance", 2, 10, 6, 3),
    LevelDiversityTarget("level_199_agility_10_5_2_budget2", 199, "agility", 2, 10, 5, 2),
    LevelDiversityTarget("level_199_strength_12_6_5_budget4", 199, "strength", 4, 12, 6, 5),
)

BOUNDARY_LEVEL_TARGETS = (
    LevelDiversityTarget("boundary_level_1_strength_6_3_none_budget1", 1, "strength", 1, 6, 3, None),
    LevelDiversityTarget("boundary_level_19_intelligence_6_3_none_budget1", 19, "intelligence", 1, 6, 3, None),
    LevelDiversityTarget("boundary_level_20_chance_6_3_none_budget1", 20, "chance", 1, 6, 3, None),
    LevelDiversityTarget("boundary_level_99_agility_6_3_none_budget1", 99, "agility", 1, 6, 3, None),
    LevelDiversityTarget("boundary_level_100_strength_7_3_none_budget1", 100, "strength", 1, 7, 3, None),
    LevelDiversityTarget("boundary_level_149_intelligence_11_5_1_budget2", 149, "intelligence", 2, 11, 5, 1),
    LevelDiversityTarget("boundary_level_150_chance_11_5_1_budget2", 150, "chance", 2, 11, 5, 1),
    LevelDiversityTarget("boundary_level_179_agility_12_5_2_budget3", 179, "agility", 3, 12, 5, 2),
    LevelDiversityTarget("boundary_level_180_strength_12_5_3_budget3", 180, "strength", 3, 12, 5, 3),
    LevelDiversityTarget("boundary_level_200_strength_10_5_0_budget4", 200, "strength", 4, 10, 5, 0),
)

AP_MP_RANGE_COVERAGE_TARGETS = (
    LevelDiversityTarget("coverage_level_1_strength_min_budget1", 1, "strength", 1, 6, 3, None),
    LevelDiversityTarget("coverage_level_20_chance_range_budget1", 20, "chance", 1, 6, 3, 1),
    LevelDiversityTarget("coverage_level_50_intelligence_mp_budget1", 50, "intelligence", 1, 6, 6, None),
    LevelDiversityTarget("coverage_level_80_agility_ap_mp_budget2", 80, "agility", 2, 10, 5, 0),
    LevelDiversityTarget("coverage_level_99_strength_pre100_cap_budget3", 99, "strength", 3, 12, 6, 6),
    LevelDiversityTarget("coverage_level_100_intelligence_min_budget1", 100, "intelligence", 1, 7, 3, None),
    LevelDiversityTarget("coverage_level_120_chance_range_budget2", 120, "chance", 2, 7, 3, 6),
    LevelDiversityTarget("coverage_level_150_agility_mid_budget2", 150, "agility", 2, 10, 5, 3),
    LevelDiversityTarget("coverage_level_179_strength_cap_budget3", 179, "strength", 3, 12, 6, 6),
    LevelDiversityTarget("coverage_level_180_intelligence_cap_budget3", 180, "intelligence", 3, 12, 6, 6),
    LevelDiversityTarget("coverage_level_199_chance_mid_budget2", 199, "chance", 2, 11, 6, 3),
    LevelDiversityTarget("coverage_level_200_agility_cap_budget4", 200, "agility", 4, 12, 6, 6),
)

AP_MP_RANGE_GRID_NEXT_MINIMUM_TARGETS = (
    LevelDiversityTarget("grid_next_min_level_1_strength_6_3_none_budget2", 1, "strength", 2, 6, 3, None),
    LevelDiversityTarget("grid_next_min_level_20_strength_6_3_none_budget1", 20, "strength", 1, 6, 3, None),
    LevelDiversityTarget("grid_next_min_level_50_strength_6_3_none_budget1", 50, "strength", 1, 6, 3, None),
    LevelDiversityTarget("grid_next_min_level_80_strength_6_3_none_budget1", 80, "strength", 1, 6, 3, None),
    LevelDiversityTarget("grid_next_min_level_99_strength_6_3_none_budget1", 99, "strength", 1, 6, 3, None),
    LevelDiversityTarget("grid_next_min_level_100_strength_7_3_none_budget2", 100, "strength", 2, 7, 3, None),
    LevelDiversityTarget("grid_next_min_level_120_strength_7_3_none_budget1", 120, "strength", 1, 7, 3, None),
    LevelDiversityTarget("grid_next_min_level_150_strength_7_3_none_budget1", 150, "strength", 1, 7, 3, None),
    LevelDiversityTarget("grid_next_min_level_179_strength_7_3_none_budget1", 179, "strength", 1, 7, 3, None),
    LevelDiversityTarget("grid_next_min_level_180_strength_7_3_none_budget1", 180, "strength", 1, 7, 3, None),
    LevelDiversityTarget("grid_next_min_level_199_strength_7_3_none_budget1", 199, "strength", 1, 7, 3, None),
    LevelDiversityTarget("grid_next_min_level_200_strength_7_3_none_budget1", 200, "strength", 1, 7, 3, None),
)

AP_MP_RANGE_GRID_NEXT_MINIMUM_2_TARGETS = (
    LevelDiversityTarget("grid_next_min2_level_1_strength_6_3_none_budget3", 1, "strength", 3, 6, 3, None),
    LevelDiversityTarget("grid_next_min2_level_20_strength_6_3_none_budget2", 20, "strength", 2, 6, 3, None),
    LevelDiversityTarget("grid_next_min2_level_50_strength_6_3_none_budget2", 50, "strength", 2, 6, 3, None),
    LevelDiversityTarget("grid_next_min2_level_80_strength_6_3_none_budget2", 80, "strength", 2, 6, 3, None),
    LevelDiversityTarget("grid_next_min2_level_99_strength_6_3_none_budget2", 99, "strength", 2, 6, 3, None),
    LevelDiversityTarget("grid_next_min2_level_100_strength_7_3_none_budget3", 100, "strength", 3, 7, 3, None),
    LevelDiversityTarget("grid_next_min2_level_120_strength_7_3_none_budget2", 120, "strength", 2, 7, 3, None),
    LevelDiversityTarget("grid_next_min2_level_150_strength_7_3_none_budget2", 150, "strength", 2, 7, 3, None),
    LevelDiversityTarget("grid_next_min2_level_179_strength_7_3_none_budget2", 179, "strength", 2, 7, 3, None),
    LevelDiversityTarget("grid_next_min2_level_180_strength_7_3_none_budget2", 180, "strength", 2, 7, 3, None),
    LevelDiversityTarget("grid_next_min2_level_199_strength_7_3_none_budget2", 199, "strength", 2, 7, 3, None),
    LevelDiversityTarget("grid_next_min2_level_200_strength_7_3_none_budget2", 200, "strength", 2, 7, 3, None),
)

AP_MP_RANGE_GRID_NEXT_CAP_TARGETS = (
    LevelDiversityTarget("grid_next_cap_level_1_strength_12_6_6_budget4", 1, "strength", 4, 12, 6, 6),
    LevelDiversityTarget("grid_next_cap_level_20_strength_12_6_6_budget4", 20, "strength", 4, 12, 6, 6),
    LevelDiversityTarget("grid_next_cap_level_50_strength_12_6_6_budget4", 50, "strength", 4, 12, 6, 6),
    LevelDiversityTarget("grid_next_cap_level_80_strength_12_6_6_budget4", 80, "strength", 4, 12, 6, 6),
    LevelDiversityTarget("grid_next_cap_level_99_strength_12_6_6_budget4", 99, "strength", 4, 12, 6, 6),
    LevelDiversityTarget("grid_next_cap_level_100_strength_12_6_6_budget4", 100, "strength", 4, 12, 6, 6),
    LevelDiversityTarget("grid_next_cap_level_120_strength_12_6_6_budget4", 120, "strength", 4, 12, 6, 6),
    LevelDiversityTarget("grid_next_cap_level_150_strength_12_6_6_budget4", 150, "strength", 4, 12, 6, 6),
    LevelDiversityTarget("grid_next_cap_level_179_strength_12_6_6_budget4", 179, "strength", 4, 12, 6, 6),
    LevelDiversityTarget("grid_next_cap_level_180_strength_12_6_6_budget4", 180, "strength", 4, 12, 6, 6),
    LevelDiversityTarget("grid_next_cap_level_199_strength_12_6_6_budget4", 199, "strength", 4, 12, 6, 6),
    LevelDiversityTarget("grid_next_cap_level_200_strength_12_6_6_budget4", 200, "strength", 4, 12, 6, 6),
)


def query_for_target(target: LevelDiversityTarget) -> BuildDiscoveryQuery:
    return BuildDiscoveryQuery(
        level=target.level,
        elements=(target.element,),
        ap_target=target.ap,
        mp_target=target.mp,
        range_target=target.range_target,
        budget_tier=target.budget_tier,
        exo_policy="none" if target.budget_tier < 3 else "allow",
        limit=1,
        top_k=25,
        beam_width=100,
        per_signature_cap=10,
        relevant_set_limit=40,
    )
