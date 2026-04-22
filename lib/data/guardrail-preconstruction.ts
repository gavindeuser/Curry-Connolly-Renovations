export type GuardrailMountType = "side-mounted" | "top-mounted";

export type GuardrailOption = {
  id: string;
  name: string;
  shortLabel: string;
  sideMountedCostPerLf: number;
  topMountedCostPerLf: number;
  installationDuration: string;
  fastenerType: string;
  summary: string;
  rating: "Value" | "Balanced" | "Premium";
  pros: string[];
  cons: string[];
  metrics: {
    maintenance: string;
    durability: string;
    installComplexity: string;
    visualCharacter: string;
  };
};

export const guardrailStudyNotes = [
  "Study source: Guardrail Pricing Study for Tempe Elementary School District - Curry and Connolly dated March 25, 2025.",
  "Study assumes 700 LF of exterior guardrail at Curry and 2,005 LF at Connolly.",
  "Laser-cut panel areas are excluded from the option quantities and pricing comparison.",
  "Please allow 3% - 5% escalation for every three months past March 31, 2025. Costs do not account for GCs.",
];

export const campusGuardrailQuantities = {
  curry: 700,
  connolly: 2005,
} as const;

export const guardrailOptions: GuardrailOption[] = [
  {
    id: "pipe",
    name: '2-1/2" Steel Pipe Multi-Line Railing',
    shortLabel: "Pipe Rail",
    sideMountedCostPerLf: 150,
    topMountedCostPerLf: 112,
    installationDuration: "1 week",
    fastenerType: "Exposed fastener",
    summary: "Most economical selection in the study with straightforward installation and durable low-maintenance performance.",
    rating: "Value",
    pros: [
      "Lowest cost option in the study.",
      "Ease of installation is explicitly called out.",
      "Low maintenance and high durability.",
      "Has both side-mounted and reduced-cost top-mounted pricing paths.",
    ],
    cons: [
      "Less refined look than the premium alternatives.",
      "All systems in the study note that field modification is not allowed.",
    ],
    metrics: {
      maintenance: "Low",
      durability: "High",
      installComplexity: "Simple",
      visualCharacter: "Practical / economical",
    },
  },
  {
    id: "plate",
    name: "Steel Plate Railing with Rotating Vertical Plates",
    shortLabel: "Rotating Plates",
    sideMountedCostPerLf: 490,
    topMountedCostPerLf: 455,
    installationDuration: "2 weeks",
    fastenerType: "Exposed fastener",
    summary: "Premium steel expression with rotating vertical elements and a strong durability story, but at a major price premium over pipe rail.",
    rating: "Balanced",
    pros: [
      "Distinctive architectural expression.",
      "Ease of installation is still called out in the study.",
      "Low maintenance and high durability.",
      "Has a lower-cost top-mounted alternate in the pricing matrix.",
    ],
    cons: [
      "Large premium over the base pipe railing option.",
      "Exposed fastener approach is less visually quiet than glass.",
      "Cannot be field modified per the study summary.",
    ],
    metrics: {
      maintenance: "Low",
      durability: "High",
      installComplexity: "Moderate",
      visualCharacter: "Architectural / expressive",
    },
  },
  {
    id: "glass",
    name: "Glass Guardrail",
    shortLabel: "Glass",
    sideMountedCostPerLf: 595,
    topMountedCostPerLf: 570,
    installationDuration: "4 weeks",
    fastenerType: "Concealed fastener",
    summary: "Most refined visual option in the study with concealed fastening and laminated safety glass, but highest cost and more maintenance sensitivity.",
    rating: "Premium",
    pros: [
      "Most refined look called out in the study summary.",
      "Concealed fastener condition provides a cleaner finish.",
      "Laminated safety glass with stainless steel top rail.",
    ],
    cons: [
      "Highest cost option in the comparison.",
      "Study specifically notes maintenance considerations.",
      "Longest installation duration in the pricing matrix.",
      "Cannot be field modified per the study summary.",
    ],
    metrics: {
      maintenance: "Higher cleaning sensitivity",
      durability: "Strong but finish-sensitive",
      installComplexity: "Complex",
      visualCharacter: "Refined / clean",
    },
  },
];
