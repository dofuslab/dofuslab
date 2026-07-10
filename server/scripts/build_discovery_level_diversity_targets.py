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
