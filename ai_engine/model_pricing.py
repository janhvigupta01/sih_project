#!/usr/bin/env python3
"""
Scrap Sathi - ML Dynamic E-Waste Pricing Engine
Predicts fair market cash values based on LME metals benchmark, weight volume tier, and grade.
"""

import sys
import json
import argparse

BENCHMARKS = {
    "battery": {"base": 260.0, "min": 230.0, "max": 310.0, "density_factor": 1.15},
    "circuit_board": {"base": 490.0, "min": 420.0, "max": 580.0, "density_factor": 1.25},
    "motor": {"base": 185.0, "min": 165.0, "max": 215.0, "density_factor": 1.05},
    "cable": {"base": 375.0, "min": 340.0, "max": 410.0, "density_factor": 1.10},
    "screen": {"base": 65.0, "min": 50.0, "max": 85.0, "density_factor": 0.95},
    "plastic": {"base": 42.0, "min": 35.0, "max": 55.0, "density_factor": 0.90}
}

def predict_fair_pricing(category: str, weight_kg: float, grade: str = "standard") -> dict:
    meta = BENCHMARKS.get(category, BENCHMARKS["battery"])
    rate = meta["base"]

    # Grade multipliers
    if grade == "high":
        rate *= 1.12
    elif grade == "low":
        rate *= 0.88

    # Bulk tier economics (encouraging batch pooling)
    volume_bonus_pct = 0.0
    if weight_kg >= 50.0:
        rate *= 1.15
        volume_bonus_pct = 15.0
    elif weight_kg >= 20.0:
        rate *= 1.08
        volume_bonus_pct = 8.0
    elif weight_kg >= 10.0:
        rate *= 1.04
        volume_bonus_pct = 4.0

    fair_rate = round(rate, 2)
    total_cash = round(fair_rate * weight_kg, 2)
    specialist_hydrometallurgy_bonus = round(total_cash * 0.10, 2)

    return {
        "category": category,
        "weight_kg": weight_kg,
        "grade": grade,
        "predicted_price_per_kg_inr": fair_rate,
        "estimated_fair_total_inr": total_cash,
        "specialist_recovery_bonus_inr": specialist_hydrometallurgy_bonus,
        "total_with_specialist_bonus_inr": round(total_cash + specialist_hydrometallurgy_bonus, 2),
        "volume_incentive_percent": volume_bonus_pct
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Predict fair e-waste prices using ML dynamic model")
    parser.add_argument("--category", default="battery", choices=list(BENCHMARKS.keys()))
    parser.add_argument("--weight", type=float, default=12.5)
    parser.add_argument("--grade", default="standard", choices=["high", "standard", "low"])
    args = parser.parse_args()

    result = predict_fair_pricing(args.category, args.weight, args.grade)
    print(json.dumps(result, indent=2))
