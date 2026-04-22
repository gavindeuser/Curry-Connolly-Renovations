export type HvacOption = {
  id: string;
  name: string;
  shortLabel: string;
  availability: string;
  upfrontCost: number;
  addToBasePrice: number;
  maintenancePerMonth: string;
  lifeExpectancy: string;
  rating: "Value" | "Balanced" | "Premium";
  summary: string;
  pros: string[];
  cons: string[];
  metrics: {
    energyEfficiency: string;
    installationComplexity: string;
    waterUsage: string;
    noise: string;
  };
};

export type HvacLifecycleScenario = {
  id: string;
  optionId: string;
  label: string;
  totalCost: number;
  replacementCost: number;
  maintenanceCost: number;
  replacementCadence: string;
};

export const hvacStudyNotes = [
  "Study source: HVAC Option Study for Curry Elementary & Connolly Middle School dated May 21, 2025.",
  "Budgetary analysis does not account for variable operating costs such as electricity, water, utility rates, or rebates.",
  "Lifecycle table on page 3 applies to Connolly Middle School only.",
  "Air-Cooled Central Plant with VAVs is not considered for Curry.",
];

export const hvacOptions: HvacOption[] = [
  {
    id: "rtu",
    name: "Rooftop Package Units",
    shortLabel: "RTUs",
    availability: "Curry + Connolly",
    upfrontCost: 6550490,
    addToBasePrice: 0,
    maintenancePerMonth: "$3,000-$4,500 / month",
    lifeExpectancy: "15-20 years typical, 8-10 years in harsher AZ climate",
    rating: "Value",
    summary: "Lowest upfront cost and included in CORE's base schematic estimate, but carries higher long-term lifecycle exposure.",
    pros: [
      "Simple, pre-assembled installation.",
      "Rooftop mount saves indoor space.",
      "No water needed.",
      "All-in-one enclosure simplifies the equipment package.",
    ],
    cons: [
      "Low to moderate energy efficiency.",
      "80-90 dB noise may require isolation.",
      "Limited per unit operational capacity.",
      "Higher long-term operations and replacement exposure.",
    ],
    metrics: {
      energyEfficiency: "Low to Moderate",
      installationComplexity: "Simple",
      waterUsage: "No water needed",
      noise: "80-90 dB",
    },
  },
  {
    id: "central-plant",
    name: "Air-Cooled Central Plant with VAVs",
    shortLabel: "Central Plant",
    availability: "Connolly only",
    upfrontCost: 10089551,
    addToBasePrice: 5940000,
    maintenancePerMonth: "$2,000-$3,500 / month",
    lifeExpectancy: "20-25 years",
    rating: "Premium",
    summary: "Highest first cost but lower monthly maintenance and longer life expectancy than RTUs in the study.",
    pros: [
      "Moderate energy efficiency.",
      "No water needed.",
      "Up to 500 tons of operational capacity.",
      "Lowest monthly maintenance range in the study.",
    ],
    cons: [
      "Only applies to Connolly.",
      "Highest upfront cost in the comparison.",
      "90-100 dB noise needs mitigation.",
      "Higher long-term operating cost than the study's VRF ROI narrative.",
    ],
    metrics: {
      energyEfficiency: "Moderate",
      installationComplexity: "Relatively simple",
      waterUsage: "No water needed",
      noise: "90-100 dB",
    },
  },
  {
    id: "vrf",
    name: "VRF (Variable Refrigerant Flow) Systems",
    shortLabel: "VRF",
    availability: "Curry + Connolly + Care Center",
    upfrontCost: 8733987,
    addToBasePrice: 4120000,
    maintenancePerMonth: "$3,000-$4,500 / month",
    lifeExpectancy: "15-20 years, indoor units vary",
    rating: "Balanced",
    summary: "Middle first-cost option with the strongest efficiency story, especially at part-load and in zoned spaces.",
    pros: [
      "High energy efficiency, especially at part-load.",
      "Flexible indoor and outdoor placement.",
      "Closed loop with no water used.",
      "Quieter for interior environments.",
    ],
    cons: [
      "Complex installation with many components and piping.",
      "Best suited to mid-sized, zoned spaces rather than very large centralized loads.",
      "Lifecycle maintenance range is similar to RTUs in the study.",
      "Complete system shift pricing applies across Connolly, Curry, and the Care Center.",
    ],
    metrics: {
      energyEfficiency: "High",
      installationComplexity: "Complex",
      waterUsage: "Closed loop; no water used",
      noise: "Quieter for interiors",
    },
  },
];

export const hvacLifecycleScenarios: HvacLifecycleScenario[] = [
  {
    id: "rtu-typical",
    optionId: "rtu",
    label: "RTUs - Typical life expectancy",
    totalCost: 14387990,
    replacementCost: 7500000,
    maintenanceCost: 337500,
    replacementCadence: "15-20 years",
  },
  {
    id: "rtu-harsh-az",
    optionId: "rtu",
    label: "RTUs - Harsher AZ climate",
    totalCost: 21887990,
    replacementCost: 15000000,
    maintenanceCost: 337500,
    replacementCadence: "8-10 years",
  },
  {
    id: "central-plant",
    optionId: "central-plant",
    label: "Air-Cooled Central Plant",
    totalCost: 20852051,
    replacementCost: 10500000,
    maintenanceCost: 262500,
    replacementCadence: "20-25 years",
  },
  {
    id: "vrf",
    optionId: "vrf",
    label: "VRF System",
    totalCost: 24071487,
    replacementCost: 15000000,
    maintenanceCost: 337500,
    replacementCadence: "15-20 years",
  },
];
