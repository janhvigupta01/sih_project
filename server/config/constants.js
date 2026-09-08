// JNARDDC (Jawaharlal Nehru Aluminium Research Development and Design Centre)
// & Ministry of Mines e-waste critical mineral stoichiometric coefficients

module.exports = {
  // Critical metal concentrations per kg of raw material (in grams)
  MINERAL_COEFFICIENTS: {
    battery: {
      name: 'Lithium-Ion Battery',
      lithium_g_per_kg: 25.0,    // ~2.5% Li
      cobalt_g_per_kg: 140.0,    // ~14.0% Co
      neodymium_g_per_kg: 0.0,
      copper_g_per_kg: 160.0,    // ~16.0% Cu
      gold_g_per_kg: 0.0,
      hazardous_level: 'High (Fire & Toxic Acid Risk)',
      handling_tip: 'DO NOT crush or expose to water/fire. Store in dry, insulated bins.'
    },
    circuit_board: {
      name: 'Printed Circuit Board (PCB)',
      lithium_g_per_kg: 0.0,
      cobalt_g_per_kg: 2.5,
      neodymium_g_per_kg: 1.2,
      copper_g_per_kg: 185.0,    // ~18.5% Cu
      gold_g_per_kg: 0.28,       // ~280 mg Au per kg
      hazardous_level: 'Critical (Acid dipping creates lethal cyanide/NOx gas)',
      handling_tip: 'NEVER dip in acid or open flame. Keep whole for pyrometallurgical & hydrometallurgical recovery.'
    },
    motor: {
      name: 'Electric Motor & Pump',
      lithium_g_per_kg: 0.0,
      cobalt_g_per_kg: 0.0,
      neodymium_g_per_kg: 35.0,  // ~3.5% Nd (Neodymium-Iron-Boron magnets)
      copper_g_per_kg: 210.0,    // ~21.0% Copper windings
      gold_g_per_kg: 0.0,
      hazardous_level: 'Low-Medium',
      handling_tip: 'Keep magnet assemblies intact for specialized rare-earth demagnetization.'
    },
    cable: {
      name: 'Insulated Copper Cable & Wire',
      lithium_g_per_kg: 0.0,
      cobalt_g_per_kg: 0.0,
      neodymium_g_per_kg: 0.0,
      copper_g_per_kg: 580.0,    // ~58% pure copper inside PVC/rubber sheath
      gold_g_per_kg: 0.0,
      hazardous_level: 'High if burned (Dioxins, furans cause cancer)',
      handling_tip: 'NEVER burn wires! Burning destroys copper purity and releases carcinogenic smoke.'
    },
    screen: {
      name: 'CRT Tube & Flat Display Panel',
      lithium_g_per_kg: 0.0,
      cobalt_g_per_kg: 0.0,
      neodymium_g_per_kg: 4.5,
      copper_g_per_kg: 75.0,
      gold_g_per_kg: 0.05,
      hazardous_level: 'High (Leaded glass & mercury phosphors)',
      handling_tip: 'Handle with care. Implosion hazard and toxic phosphor powders.'
    },
    plastic: {
      name: 'Flame-Retardant E-Waste Plastic',
      lithium_g_per_kg: 0.0,
      cobalt_g_per_kg: 0.0,
      neodymium_g_per_kg: 0.0,
      copper_g_per_kg: 0.0,
      gold_g_per_kg: 0.0,
      hazardous_level: 'Medium (Brominated flame retardants)',
      handling_tip: 'Sort by resin code; do not mix with regular domestic PET/polyethylene.'
    }
  },

  // Base JNARDDC benchmark prices in ₹ / kg (live benchmark rates)
  BENCHMARK_PRICES_INR: {
    battery: { base: 260, min: 230, max: 310, trend: 'up', changePct: '+6.4%' },
    circuit_board: { base: 490, min: 420, max: 580, trend: 'up', changePct: '+4.2%' },
    motor: { base: 185, min: 165, max: 215, trend: 'up', changePct: '+2.8%' },
    cable: { base: 375, min: 340, max: 410, trend: 'down', changePct: '-1.1%' },
    screen: { base: 65, min: 50, max: 85, trend: 'stable', changePct: '0.0%' },
    plastic: { base: 42, min: 35, max: 55, trend: 'up', changePct: '+1.8%' }
  },

  ROLES: {
    COLLECTOR: 'collector',
    RECYCLER: 'recycler',
    GOVT: 'govt',
    ADMIN: 'admin'
  },

  BATCH_STATUS: {
    SCANNED: 'scanned',
    POOLED: 'pooled',
    MATCHED: 'matched',
    IN_TRANSIT: 'in_transit',
    PENDING_VERIFICATION: 'pending_verification',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  }
};
