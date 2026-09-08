#!/usr/bin/env python3
"""
JNARDDC (Jawaharlal Nehru Aluminium Research Development and Design Centre)
Critical Mineral Stoichiometric Estimator
Smart India Hackathon 2026 - Problem Statement 26229: Kabadiwala Connect
"""

import sys
import json
import argparse

MINERAL_COEFFICIENTS = {
    "battery": {
        "name": "Lithium-Ion Battery",
        "lithium_g_per_kg": 25.0,    # ~2.5% Li
        "cobalt_g_per_kg": 140.0,    # ~14.0% Co
        "neodymium_g_per_kg": 0.0,
        "copper_g_per_kg": 160.0,    # ~16.0% Cu
        "gold_g_per_kg": 0.0,
        "hazard": "High risk of thermal runaway and hydrofluoric acid gas"
    },
    "circuit_board": {
        "name": "Printed Circuit Board (PCB)",
        "lithium_g_per_kg": 0.0,
        "cobalt_g_per_kg": 2.5,
        "neodymium_g_per_kg": 1.2,
        "copper_g_per_kg": 185.0,    # ~18.5% Cu
        "gold_g_per_kg": 0.28,       # ~280 mg Au
        "hazard": "Acid dipping causes lethal cyanide/NOx gas emissions"
    },
    "motor": {
        "name": "Electric Motor & Pump",
        "lithium_g_per_kg": 0.0,
        "cobalt_g_per_kg": 0.0,
        "neodymium_g_per_kg": 35.0,  # ~3.5% Nd (NdFeB magnets)
        "copper_g_per_kg": 210.0,    # ~21.0% Cu
        "gold_g_per_kg": 0.0,
        "hazard": "Crushing hazard; permanent high-flux magnetic pinch"
    },
    "cable": {
        "name": "Insulated Copper Cable & Wire",
        "lithium_g_per_kg": 0.0,
        "cobalt_g_per_kg": 0.0,
        "neodymium_g_per_kg": 0.0,
        "copper_g_per_kg": 580.0,    # ~58% Cu
        "gold_g_per_kg": 0.0,
        "hazard": "Burning PVC releases carcinogenic dioxins & furans"
    },
    "screen": {
        "name": "CRT Tube & Display Panel",
        "lithium_g_per_kg": 0.0,
        "cobalt_g_per_kg": 0.0,
        "neodymium_g_per_kg": 4.5,
        "copper_g_per_kg": 75.0,
        "gold_g_per_kg": 0.05,
        "hazard": "Leaded glass implosion & toxic mercury/cadmium phosphors"
    },
    "plastic": {
        "name": "E-Waste Flame Retardant Plastic",
        "lithium_g_per_kg": 0.0,
        "cobalt_g_per_kg": 0.0,
        "neodymium_g_per_kg": 0.0,
        "copper_g_per_kg": 0.0,
        "gold_g_per_kg": 0.0,
        "hazard": "Brominated flame retardants need specialized pyrolytic sorting"
    }
}

def calculate_recovery(category: str, weight_kg: float) -> dict:
    item = MINERAL_COEFFICIENTS.get(category, MINERAL_COEFFICIENTS["battery"])
    
    li_g = round(item["lithium_g_per_kg"] * weight_kg, 2)
    co_g = round(item["cobalt_g_per_kg"] * weight_kg, 2)
    nd_g = round(item["neodymium_g_per_kg"] * weight_kg, 2)
    cu_g = round(item["copper_g_per_kg"] * weight_kg, 2)
    au_g = round(item["gold_g_per_kg"] * weight_kg, 3)

    # Recovery score (0 - 100)
    score_map = {
        "circuit_board": 96,
        "battery": 93,
        "motor": 88,
        "cable": 84,
        "screen": 78,
        "plastic": 72
    }
    score = score_map.get(category, 75)
    carbon_offset_kg = round(weight_kg * 5.04, 2)

    return {
        "category": category,
        "category_name": item["name"],
        "weight_kg": weight_kg,
        "lithium_grams": li_g,
        "cobalt_grams": co_g,
        "neodymium_grams": nd_g,
        "copper_grams": cu_g,
        "gold_grams": au_g,
        "recovery_score": score,
        "carbon_offset_kg": carbon_offset_kg,
        "environmental_hazard": item["hazard"]
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Estimate critical minerals in e-waste batches")
    parser.add_argument("--category", default="battery", choices=list(MINERAL_COEFFICIENTS.keys()))
    parser.add_argument("--weight", type=float, default=5.0)
    args = parser.parse_args()

    result = calculate_recovery(args.category, args.weight)
    print(json.dumps(result, indent=2))
