#!/usr/bin/env python3
"""
Scrap Sathi - Anti-Exploitation AI Fairness Detector
Uses statistical anomaly detection to protect informal collectors from lowball black-market deals.
"""

import sys
import json
import argparse

BENCHMARKS = {
    "battery": 260.0,
    "circuit_board": 490.0,
    "motor": 185.0,
    "cable": 375.0,
    "screen": 65.0,
    "plastic": 42.0
}

def analyze_deal_fairness(category: str, weight_kg: float, offered_total_inr: float) -> dict:
    benchmark_rate = BENCHMARKS.get(category, 200.0)
    fair_total = round(benchmark_rate * weight_kg, 2)
    min_acceptable = round(fair_total * 0.85, 2)
    max_reasonable = round(fair_total * 1.35, 2)

    diff_percent = round(((offered_total_inr - fair_total) / fair_total) * 100, 1)

    if offered_total_inr < fair_total * 0.70:
        status = "PREDATORY_EXPLOITATION"
        verdict = "REJECT_OFFER"
        loss_amount = round(fair_total - offered_total_inr, 2)
        message = f"DANGER: Offer is {abs(diff_percent)}% below government benchmark. You are losing ₹{loss_amount}. Informal burning destroys high-value lithium and poisons lungs."
    elif offered_total_inr < min_acceptable:
        status = "BELOW_MARKET"
        verdict = "NEGOTIATE_OR_SWITCH"
        loss_amount = round(fair_total - offered_total_inr, 2)
        message = f"CAUTION: Offer is {abs(diff_percent)}% below fair value. Approved recyclers on Scrap Sathi pay at least ₹{min_acceptable}."
    elif offered_total_inr > max_reasonable:
        status = "SUSPICIOUS_ANOMALY"
        verdict = "VERIFY_BUYER"
        message = f"NOTE: Offer is unusually high (+{diff_percent}%). Confirm buyer has CPCB registration before release."
    else:
        status = "FAIR_DEAL"
        verdict = "ACCEPT"
        message = f"FAIR: Price is within healthy market parameters (difference {diff_percent}%)."

    return {
        "category": category,
        "weight_kg": weight_kg,
        "offered_total_inr": offered_total_inr,
        "fair_benchmark_inr": fair_total,
        "price_difference_pct": diff_percent,
        "status": status,
        "verdict": verdict,
        "advisory": message
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Analyze deal fairness using statistical thresholds")
    parser.add_argument("--category", default="battery")
    parser.add_argument("--weight", type=float, default=10.0)
    parser.add_argument("--offered", type=float, default=1200.0)
    args = parser.parse_args()

    result = analyze_deal_fairness(args.category, args.weight, args.offered)
    print(json.dumps(result, indent=2))
