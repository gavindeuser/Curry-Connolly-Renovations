export type DecisionCategory = "structural" | "architectural";

export type MaterialOption = {
  id: string;
  name: string;
  category: DecisionCategory;
  shortLabel: string;
  description: string;
  costPerSf: number;
  scheduleWeeks: number;
  leadTime: string;
  rating: "Value" | "Balanced" | "Premium";
  metrics: {
    thermal?: string;
    durability?: string;
    flexibility?: string;
    speed?: string;
  };
  compatibilityNote?: string;
  pros: string[];
  cons: string[];
};

export type SystemCombination = {
  id: string;
  structuralId: string;
  skinId: string;
  totalCostPerSf: number;
  totalScheduleWeeks: number;
  leadTimeImpact: string;
  bestFor: string;
  considerations: string[];
};

export const prototypeAssumptions = [
  "Dataset is sourced from the Tempe ESD Curry ES & Connolly MS Rebuild Skin Structure (vertical) Options Study dated October 30, 2024.",
  "The study assumes 170,000 square feet of exterior wall with heights varying from 21 feet to 45 feet.",
  "The source document notes that architectural skins will likely be used in combinations throughout the building, such as 30% EIFS with 70% exposed structural masonry.",
  "Costs are budgetary and the study requests 1.5% escalation for every quarter past November 1, 2024. Costs do not include GCs.",
];

export const structuralOptions: MaterialOption[] = [
  {
    id: "icf-block",
    name: "Insulated Concrete Form (ICF) Block",
    category: "structural",
    shortLabel: "ICF",
    description: "Integrated insulated wall system with cast-in-place concrete core and strong thermal performance.",
    costPerSf: 30.5,
    scheduleWeeks: 49.5,
    leadTime: "2 weeks",
    rating: "Value",
    metrics: {
      thermal: "Approx. R-34 wall",
      durability: "High strength and security",
      speed: "Fastest average duration",
    },
    pros: [
      "Approximate total wall R-value of 34 with low thermal conductivity.",
      "Long-term heating and cooling savings called out in the study.",
      "High strength and security.",
    ],
    cons: [
      "Requires an exterior skin.",
      "Future conduit retrofit requires a hot knife through foam.",
    ],
  },
  {
    id: "structural-masonry",
    name: "Structural Masonry",
    category: "structural",
    shortLabel: "Masonry",
    description: "Grey CMU structural wall assembly with strong security and conventional detailing.",
    costPerSf: 32,
    scheduleWeeks: 68.2,
    leadTime: "9 weeks",
    rating: "Balanced",
    metrics: {
      durability: "High strength and security",
      thermal: "Requires added interior insulation wall",
      speed: "Longer average duration",
    },
    pros: [
      "High strength and security.",
      "Can support exposed architectural finish strategies.",
      "Conventional system with broad market familiarity.",
    ],
    cons: [
      "Requires minimum 3-5/8 inch furred interior stud walls with gypsum board to meet insulation requirements.",
      "If not properly sealed, it has higher possibility of moisture infiltration.",
    ],
  },
  {
    id: "steel-stud-infill",
    name: "Full Structural Steel with Metal Stud Infill",
    category: "structural",
    shortLabel: "Steel",
    description: "Steel frame with metal stud infill suited to complex geometry and multiple exterior finish types.",
    costPerSf: 31,
    scheduleWeeks: 84.4,
    leadTime: "34 weeks",
    rating: "Balanced",
    metrics: {
      flexibility: "High",
      thermal: "Batt insulation R-19",
      speed: "Longest average duration",
    },
    pros: [
      "Flexible design works well with complex shapes and various architectural finishes.",
      "Lower structural unit cost than several other systems in the study.",
      "Maintains structural quality while supporting façade variety.",
    ],
    cons: [
      "Longest structural lead time in the study.",
      "Average assembly duration is the slowest of the structural options analyzed.",
    ],
  },
  {
    id: "tilt-panels",
    name: "Concrete Tilt Panels",
    category: "structural",
    shortLabel: "Tilt",
    description: "Concrete tilt wall system that reduces schedule and delivers durable, secure exterior walls.",
    costPerSf: 35,
    scheduleWeeks: 59.4,
    leadTime: "22 weeks",
    rating: "Balanced",
    metrics: {
      durability: "High strength and security",
      speed: "Schedule reduction noted",
      flexibility: "Less ideal for complex forms",
    },
    pros: [
      "More cost effective than cast-in-place walls.",
      "Reduces construction schedule.",
      "High strength and security.",
    ],
    cons: [
      "Not ideal for complex buildings with various heights and architectural features.",
      "Requires interior furred stud walls with gypsum board.",
    ],
  },
  {
    id: "precast-concrete",
    name: "Insulated Precast Concrete",
    category: "structural",
    shortLabel: "Precast",
    description: "Factory-cast insulated precast panels with strong durability, moisture resistance, and integrated finish potential.",
    costPerSf: 58,
    scheduleWeeks: 65.4,
    leadTime: "20 weeks",
    rating: "Premium",
    metrics: {
      thermal: "Typical R-12 to R-16 integrated insulation",
      durability: "High strength",
      speed: "Faster on-site assembly",
    },
    pros: [
      "Lower labor and installation time on-site.",
      "Architectural finishes can be cast directly, reducing additional exterior needs.",
      "Factory-controlled casting enhances moisture resistance and fire resistance.",
    ],
    cons: [
      "Best for simpler shapes.",
      "Custom designs add cost and complexity.",
    ],
  },
];

export const skinOptions: MaterialOption[] = [
  {
    id: "eifs",
    name: "Exterior Insulation Finishing System (EIFS)",
    category: "architectural",
    shortLabel: "EIFS",
    description: "Direct-applied finish system used as the lowest-cost skin option in the study.",
    costPerSf: 22,
    scheduleWeeks: 45,
    leadTime: "4 weeks",
    rating: "Value",
    metrics: {
      thermal: "Supports higher wall R-values in pairings",
      flexibility: "High design flexibility",
      durability: "Impact resistant",
    },
    pros: [
      "Low maintenance with color guaranteed for 20 years.",
      "Impact resistant.",
      "Most moisture resistant surface and strong design flexibility per the study.",
    ],
    cons: [
      "Study provides a range of $19 to $22 per square foot rather than one exact unit price.",
      "Used as a finish system, so final performance depends on the structural wall behind it.",
    ],
  },
  {
    id: "masonry-veneer",
    name: "Masonry Veneer",
    category: "architectural",
    shortLabel: "Veneer",
    description: "Traditional veneer system with full-height or wainscot applications and a premium cost profile.",
    costPerSf: 70,
    scheduleWeeks: 64,
    leadTime: "16 weeks",
    rating: "Premium",
    metrics: {
      durability: "High",
      flexibility: "Many decorative options",
    },
    pros: [
      "Includes flashing and weep system for moisture control.",
      "Many decorative options.",
      "Lightweight compared to natural brick.",
    ],
    cons: [
      "Highest skin-only unit cost in the study.",
      "Field-applied masonry sealer is required.",
    ],
  },
  {
    id: "metal-corten",
    name: "Metal Wall Panels - Corten",
    category: "architectural",
    shortLabel: "Corten",
    description: "Weathering steel panel system with a distinctive rust-like patina and durable concealed-fastener assembly.",
    costPerSf: 35,
    scheduleWeeks: 40,
    leadTime: "5 weeks",
    rating: "Balanced",
    metrics: {
      durability: "High",
      flexibility: "Distinctive aesthetic",
    },
    pros: [
      "Low maintenance and high durability.",
      "Naturally weathering steel forms a protective layer over time.",
      "Creates a unique, changing appearance with no additional finish required.",
    ],
    cons: [
      "Aesthetic is highly specific and may not fit every client brief.",
      "Requires sheet-applied waterproofing and metal Z-channel attachment.",
    ],
  },
  {
    id: "metal-acm",
    name: "Metal Wall Panels - ACM",
    category: "architectural",
    shortLabel: "ACM",
    description: "Concealed-fastener ACM façade with premium cost and broad factory color options.",
    costPerSf: 43,
    scheduleWeeks: 58,
    leadTime: "10 weeks",
    rating: "Premium",
    metrics: {
      durability: "High",
      flexibility: "Standard and custom colors",
    },
    pros: [
      "Low maintenance and high durability.",
      "Factory finish available in standard and custom colors.",
      "Extended lifespan and warranty.",
    ],
    cons: [
      "Higher cost than Corten and flush seam metal options.",
      "Requires sheet-applied waterproofing and metal Z-channel attachment.",
    ],
  },
  {
    id: "metal-flush-seam",
    name: "Metal Wall Panels - Flush Seam",
    category: "architectural",
    shortLabel: "Flush",
    description: "Flush seam metal panel option with the same cost profile as Corten in the study summary.",
    costPerSf: 35,
    scheduleWeeks: 40,
    leadTime: "8 weeks",
    rating: "Balanced",
    metrics: {
      durability: "High",
      flexibility: "Standard and custom colors",
    },
    pros: [
      "Low maintenance and high durability.",
      "Factory finish available in standard and custom colors.",
      "Extended lifespan and warranty.",
    ],
    cons: [
      "Requires sheet-applied waterproofing and metal Z-channel attachment.",
      "The study summary gives this option the same total assembly results as Corten rather than a unique ranking line.",
    ],
  },
  {
    id: "fiber-cement-panels",
    name: "Fiber Cement Panels",
    category: "architectural",
    shortLabel: "Fiber",
    description: "Prefinished panelized skin with multiple aesthetic options and direct attachment to several backup walls.",
    costPerSf: 43,
    scheduleWeeks: 42,
    leadTime: "8 weeks",
    rating: "Balanced",
    metrics: {
      flexibility: "Many aesthetic options",
      speed: "Moderate",
    },
    compatibilityNote: "Study summary only shows this skin paired with ICF Block.",
    pros: [
      "Nichiha and Allura panel options are cited in the study.",
      "Prefinished standard and custom finish colors.",
      "Attaches directly to masonry, ICF block, and DensGlass sheathing.",
    ],
    cons: [
      "Only one full paired combination appears in the summary table.",
      "Requires waterproofing membrane behind the panel system.",
    ],
  },
  {
    id: "exposed-structural-masonry",
    name: "Exposed Structural Masonry (Architectural Finish)",
    category: "architectural",
    shortLabel: "Exposed CMU",
    description: "Decorative exposed masonry finish that can double as the finish system on structural masonry walls.",
    costPerSf: 8.5,
    scheduleWeeks: 58,
    leadTime: "16 weeks",
    rating: "Value",
    metrics: {
      thermal: "Interior foam noted at R-20.5",
      durability: "High strength and security",
    },
    compatibilityNote: "This architectural finish is only shown with Structural Masonry in the study.",
    pros: [
      "Can double as the finish system with decorative block.",
      "High strength and security.",
      "Lowest added-cost finish option in the study.",
    ],
    cons: [
      "Requires minimum 3-5/8 inch furred interior stud walls with gypsum board to meet insulation requirements.",
      "If not properly sealed, it has higher possibility of moisture infiltration.",
    ],
  },
  {
    id: "exposed-tilt",
    name: "Exposed Tilt Concrete Panels",
    category: "architectural",
    shortLabel: "Exposed Tilt",
    description: "Exposed insulated tilt finish strategy formed directly into tilt wall panels.",
    costPerSf: 40,
    scheduleWeeks: 44,
    leadTime: "22 weeks",
    rating: "Balanced",
    metrics: {
      durability: "High strength and security",
      speed: "Schedule reduction noted",
    },
    compatibilityNote: "This finish strategy is only shown with Tilt Concrete Panels in the study.",
    pros: [
      "Exterior form options can be applied while pouring panels.",
      "Reduces construction schedule.",
      "High strength and security.",
    ],
    cons: [
      "Not ideal for complex buildings with various heights and architectural features.",
      "Specific to tilt-panel assemblies rather than broadly interchangeable.",
    ],
  },
];

export const systemCombinations: SystemCombination[] = [
  {
    id: "icf-eifs",
    structuralId: "icf-block",
    skinId: "eifs",
    totalCostPerSf: 69,
    totalScheduleWeeks: 45,
    leadTimeImpact: "2 week structure lead plus 4 week EIFS lead",
    bestFor: "The study's lowest-cost baseline and CORE's recommended majority wall approach.",
    considerations: ["Summary table ranks this combination #1 by cost.", "Conclusion cites ICF as the most cost-effective and schedule-efficient option with high thermal performance."],
  },
  {
    id: "structural-masonry-exposed-structural-masonry",
    structuralId: "structural-masonry",
    skinId: "exposed-structural-masonry",
    totalCostPerSf: 73,
    totalScheduleWeeks: 58,
    leadTimeImpact: "9 week structure lead plus 16 week finish lead",
    bestFor: "Projects wanting masonry durability with an integrated architectural expression.",
    considerations: ["Summary table lists this as Exposed Structural Masonry (R-25).", "The architectural finish can double as the finish system with decorative block."],
  },
  {
    id: "steel-eifs",
    structuralId: "steel-stud-infill",
    skinId: "eifs",
    totalCostPerSf: 78,
    totalScheduleWeeks: 86,
    leadTimeImpact: "34 week structure lead dominates overall sequence",
    bestFor: "Complex forms that still need the study's lowest-cost exterior skin.",
    considerations: ["Steel system offers the most design flexibility in the study.", "Schedule is significantly longer than the ICF baseline."],
  },
  {
    id: "structural-masonry-eifs",
    structuralId: "structural-masonry",
    skinId: "eifs",
    totalCostPerSf: 87,
    totalScheduleWeeks: 71,
    leadTimeImpact: "Moderate with masonry wall duration driving completion",
    bestFor: "Clients who want conventional masonry structure with a lower-cost finish system.",
    considerations: ["Higher moisture-control discipline is needed if masonry is not properly sealed.", "R-value shown in summary is R-33."],
  },
  {
    id: "tilt-eifs",
    structuralId: "tilt-panels",
    skinId: "eifs",
    totalCostPerSf: 91,
    totalScheduleWeeks: 63,
    leadTimeImpact: "22 week tilt lead with schedule reduction noted in the study",
    bestFor: "Teams prioritizing durable panels and a moderate total cost.",
    considerations: ["Study notes tilt is not ideal for complex heights and features.", "R-value shown in summary is R-29."],
  },
  {
    id: "icf-metal-corten",
    structuralId: "icf-block",
    skinId: "metal-corten",
    totalCostPerSf: 97,
    totalScheduleWeeks: 40,
    leadTimeImpact: "Short combined procurement path compared with many alternatives",
    bestFor: "A faster, design-forward alternative to ICF plus EIFS.",
    considerations: ["Summary shows this combination 5 weeks faster than option #1.", "The same total appears for flush seam panels in the source table."],
  },
  {
    id: "icf-metal-flush-seam",
    structuralId: "icf-block",
    skinId: "metal-flush-seam",
    totalCostPerSf: 97,
    totalScheduleWeeks: 40,
    leadTimeImpact: "Short combined procurement path compared with many alternatives",
    bestFor: "A clean metal-panel alternative using the same summary values shown for the duplicate Corten line.",
    considerations: ["The source summary includes duplicate $97 / 40 week rows, matching the separate Corten and flush seam options listed earlier.", "This pairing preserves the actual option list from the PDF."],
  },
  {
    id: "steel-metal-corten",
    structuralId: "steel-stud-infill",
    skinId: "metal-corten",
    totalCostPerSf: 99,
    totalScheduleWeeks: 75,
    leadTimeImpact: "Steel lead drives early package timing",
    bestFor: "Architecturally expressive steel-framed schemes.",
    considerations: ["Summary table repeats this total cost and duration for two metal-panel variants.", "R-value shown in summary is R-34."],
  },
  {
    id: "steel-metal-flush-seam",
    structuralId: "steel-stud-infill",
    skinId: "metal-flush-seam",
    totalCostPerSf: 99,
    totalScheduleWeeks: 75,
    leadTimeImpact: "Steel lead drives early package timing",
    bestFor: "Flush seam interpretation of the duplicated $99 steel-panel pairing in the source study.",
    considerations: ["Used to preserve all listed façade options without inventing new pricing.", "Long steel lead remains the primary schedule driver."],
  },
  {
    id: "icf-fiber-cement-panels",
    structuralId: "icf-block",
    skinId: "fiber-cement-panels",
    totalCostPerSf: 104,
    totalScheduleWeeks: 42,
    leadTimeImpact: "Short structure lead with moderate panel procurement",
    bestFor: "ICF projects wanting a prefinished panel aesthetic.",
    considerations: ["Summary ranks this combination faster than the ICF plus EIFS baseline by 3 weeks.", "R-value shown in summary is R-32."],
  },
  {
    id: "icf-metal-acm",
    structuralId: "icf-block",
    skinId: "metal-acm",
    totalCostPerSf: 107,
    totalScheduleWeeks: 58,
    leadTimeImpact: "ACM procurement extends beyond EIFS and Corten options",
    bestFor: "ICF walls paired with a premium metal-panel finish.",
    considerations: ["Premium finish cost raises total while keeping ICF structural advantages.", "R-value shown in summary is R-33."],
  },
  {
    id: "structural-masonry-metal-corten",
    structuralId: "structural-masonry",
    skinId: "metal-corten",
    totalCostPerSf: 108,
    totalScheduleWeeks: 60,
    leadTimeImpact: "Moderate overall duration with masonry and panel sequencing",
    bestFor: "Masonry-backed façades seeking a weathering-steel exterior look.",
    considerations: ["Source table repeats this line for two equal-cost metal variants.", "R-value shown in summary is R-33."],
  },
  {
    id: "structural-masonry-metal-flush-seam",
    structuralId: "structural-masonry",
    skinId: "metal-flush-seam",
    totalCostPerSf: 108,
    totalScheduleWeeks: 60,
    leadTimeImpact: "Moderate overall duration with masonry and panel sequencing",
    bestFor: "Flush seam interpretation of the duplicated masonry plus metal-panel line.",
    considerations: ["Maps the duplicate summary row to the separately listed flush seam panel option.", "R-value shown in summary is R-33."],
  },
  {
    id: "steel-metal-acm",
    structuralId: "steel-stud-infill",
    skinId: "metal-acm",
    totalCostPerSf: 109,
    totalScheduleWeeks: 88,
    leadTimeImpact: "Long structural lead plus premium panel lead",
    bestFor: "Steel-framed schemes prioritizing premium color and finish options.",
    considerations: ["One of the slowest pairings in the study.", "R-value shown in summary is R-34."],
  },
  {
    id: "tilt-metal-corten",
    structuralId: "tilt-panels",
    skinId: "metal-corten",
    totalCostPerSf: 112,
    totalScheduleWeeks: 52,
    leadTimeImpact: "Tilt lead offset by relatively quick panel installation",
    bestFor: "Teams wanting durable tilt structure with a stronger design statement.",
    considerations: ["Source table repeats this line for two equal-cost metal variants.", "R-value shown in summary is R-29."],
  },
  {
    id: "tilt-metal-flush-seam",
    structuralId: "tilt-panels",
    skinId: "metal-flush-seam",
    totalCostPerSf: 112,
    totalScheduleWeeks: 52,
    leadTimeImpact: "Tilt lead offset by relatively quick panel installation",
    bestFor: "Flush seam interpretation of the duplicated tilt plus metal-panel line.",
    considerations: ["Maintains the source option list without manufacturing new totals.", "R-value shown in summary is R-29."],
  },
  {
    id: "tilt-exposed-tilt",
    structuralId: "tilt-panels",
    skinId: "exposed-tilt",
    totalCostPerSf: 116,
    totalScheduleWeeks: 44,
    leadTimeImpact: "Integrated tilt finish helps compress total duration",
    bestFor: "Tilt-wall projects seeking an exposed finish and faster schedule than the baseline.",
    considerations: ["Summary lists this as Exposed Concrete Tilt Panels.", "This option is 1 week faster than ICF plus EIFS in the source table."],
  },
  {
    id: "structural-masonry-metal-acm",
    structuralId: "structural-masonry",
    skinId: "metal-acm",
    totalCostPerSf: 119,
    totalScheduleWeeks: 74,
    leadTimeImpact: "Premium panel procurement with slower masonry assembly",
    bestFor: "Traditional masonry-backed walls with a premium panel finish.",
    considerations: ["Source table repeats this line twice.", "R-value shown in summary is R-33."],
  },
  {
    id: "precast-concrete-eifs",
    structuralId: "precast-concrete",
    skinId: "eifs",
    totalCostPerSf: 121,
    totalScheduleWeeks: 67,
    leadTimeImpact: "20 week precast lead plus fast EIFS package",
    bestFor: "Precast projects seeking the lowest-cost enclosure finish available to that structure.",
    considerations: ["Summary shows one of the highest R-values in the study at R-43.", "Study notes integrated finishes can reduce added exterior needs."],
  },
  {
    id: "tilt-metal-acm",
    structuralId: "tilt-panels",
    skinId: "metal-acm",
    totalCostPerSf: 123,
    totalScheduleWeeks: 65,
    leadTimeImpact: "Moderate to high due to premium panel lead",
    bestFor: "Tilt-wall solutions with a premium panelized finish.",
    considerations: ["Source table repeats this line twice.", "R-value shown in summary is R-29."],
  },
  {
    id: "precast-concrete-metal-corten",
    structuralId: "precast-concrete",
    skinId: "metal-corten",
    totalCostPerSf: 142,
    totalScheduleWeeks: 56,
    leadTimeImpact: "Precast and panel coordination front-loads procurement",
    bestFor: "High-performance precast backed by a durable metal-panel finish.",
    considerations: ["Source table repeats this line for two metal variants.", "R-value shown in summary is R-43."],
  },
  {
    id: "precast-concrete-metal-flush-seam",
    structuralId: "precast-concrete",
    skinId: "metal-flush-seam",
    totalCostPerSf: 142,
    totalScheduleWeeks: 56,
    leadTimeImpact: "Precast and panel coordination front-loads procurement",
    bestFor: "Flush seam interpretation of the duplicated precast plus metal-panel line.",
    considerations: ["Used to preserve the separate flush seam option from the PDF.", "R-value shown in summary is R-43."],
  },
  {
    id: "icf-masonry-veneer",
    structuralId: "icf-block",
    skinId: "masonry-veneer",
    totalCostPerSf: 142,
    totalScheduleWeeks: 64,
    leadTimeImpact: "Short structure lead but long masonry-veneer finish duration",
    bestFor: "ICF projects wanting a traditional masonry character.",
    considerations: ["Total cost jumps substantially relative to EIFS and metal-panel skins.", "R-value shown in summary is R-25."],
  },
  {
    id: "steel-masonry-veneer",
    structuralId: "steel-stud-infill",
    skinId: "masonry-veneer",
    totalCostPerSf: 151,
    totalScheduleWeeks: 94,
    leadTimeImpact: "Combines the longest structure lead with a premium veneer finish",
    bestFor: "Architecturally flexible programs where schedule pressure is secondary.",
    considerations: ["This is the longest total duration in the summary table.", "R-value shown in summary is R-34."],
  },
  {
    id: "precast-concrete-metal-acm",
    structuralId: "precast-concrete",
    skinId: "metal-acm",
    totalCostPerSf: 153,
    totalScheduleWeeks: 69,
    leadTimeImpact: "Premium panel procurement with early precast release coordination",
    bestFor: "Precast assemblies aiming for a premium factory-finished exterior.",
    considerations: ["Source table repeats this line twice.", "R-value shown in summary is R-43."],
  },
  {
    id: "structural-masonry-masonry-veneer",
    structuralId: "structural-masonry",
    skinId: "masonry-veneer",
    totalCostPerSf: 161,
    totalScheduleWeeks: 85,
    leadTimeImpact: "High due to masonry backup plus masonry veneer finish",
    bestFor: "Masonry-heavy expression where durability and appearance outweigh speed.",
    considerations: ["R-value shown in summary is R-33.", "This is one of the highest-cost non-precast pairings."],
  },
  {
    id: "tilt-masonry-veneer",
    structuralId: "tilt-panels",
    skinId: "masonry-veneer",
    totalCostPerSf: 167,
    totalScheduleWeeks: 77,
    leadTimeImpact: "Tilt sequencing plus masonry veneer extends duration",
    bestFor: "Tilt structure paired with a more traditional façade expression.",
    considerations: ["R-value shown in summary is R-30.", "The veneer finish largely erodes the schedule advantage tilt provides elsewhere."],
  },
  {
    id: "precast-concrete-masonry-veneer",
    structuralId: "precast-concrete",
    skinId: "masonry-veneer",
    totalCostPerSf: 197,
    totalScheduleWeeks: 80,
    leadTimeImpact: "Highest total cost path in the study",
    bestFor: "Special cases where both precast structure and masonry veneer are non-negotiable.",
    considerations: ["This ranks last by cost in the source summary.", "R-value shown in summary is R-44."],
  },
];

export function getOptionById(optionId: string) {
  return [...structuralOptions, ...skinOptions].find((option) => option.id === optionId);
}

export function getCombination(structuralId: string, skinId: string) {
  return systemCombinations.find((combination) => combination.structuralId === structuralId && combination.skinId === skinId);
}
