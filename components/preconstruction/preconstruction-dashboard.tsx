"use client";

import type { CSSProperties } from "react";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Building2, CheckCircle2, Clock3, Layers3, Printer, WalletCards } from "lucide-react";
import type { User } from "@supabase/supabase-js";

import { Card } from "@/components/ui/card";
import { LightboxImage } from "@/components/ui/lightbox-image";
import {
  getCombination,
  getOptionById,
  skinOptions,
  structuralOptions,
  systemCombinations,
  type MaterialOption,
  type SystemCombination,
} from "@/lib/data/preconstruction";
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn, formatCurrency } from "@/lib/utils/format";

type SelectorProps = {
  label: string;
  options: MaterialOption[];
  selectedId: string;
  onSelect: (optionId: string) => void;
};

function SelectorGroup({ label, options, selectedId, onSelect }: SelectorProps) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">{label}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Select one option to build a paired system scenario.</p>
        </div>
      </div>
      <div className="grid gap-3">
        {options.map((option) => {
          const isSelected = option.id === selectedId;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={cn(
                "rounded-[1.75rem] border p-4 text-left transition",
                isSelected
                  ? "border-[var(--core-green)] bg-[color:rgba(0,131,72,0.08)] shadow-[0_20px_40px_rgba(0,131,72,0.08)]"
                  : "border-[var(--border)] bg-white hover:border-[color:rgba(0,131,72,0.45)] hover:bg-[color:rgba(0,131,72,0.03)]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-[var(--foreground)]">{option.name}</h3>
                    <span className="rounded-full bg-black px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                      {option.rating}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{option.description}</p>
                </div>
                {isSelected ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-[var(--core-green)]" /> : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                <span className="rounded-full bg-[var(--concrete)] px-3 py-1">{formatCurrency(option.costPerSf)}/SF</span>
                <span className="rounded-full bg-[var(--concrete)] px-3 py-1">{option.scheduleWeeks} weeks</span>
                <span className="rounded-full bg-[var(--concrete)] px-3 py-1">{option.leadTime}</span>
              </div>
              {option.compatibilityNote ? (
                <p className="mt-3 rounded-2xl border border-[color:rgba(0,131,72,0.22)] bg-[color:rgba(0,131,72,0.08)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--core-green)]">
                  Limited pairing: {option.compatibilityNote}
                </p>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type MetricCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
};

function MetricCard({ icon, label, value, note }: MetricCardProps) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-[color:rgba(0,131,72,0.1)] p-2 text-[var(--core-green)]">{icon}</div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{value}</p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{note}</p>
    </div>
  );
}

type DetailListProps = {
  title: string;
  items: string[];
  tone: "positive" | "caution";
};

function DetailList({ title, items, tone }: DetailListProps) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--foreground)]">{title}</h3>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="flex gap-3">
            <span
              className={cn(
                "mt-2 h-2.5 w-2.5 shrink-0 rounded-full",
                tone === "positive" ? "bg-[var(--core-green)]" : "bg-black/55",
              )}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExplorerCard({ option }: { option: MaterialOption }) {
  const sourceImage = optionSourceImages[option.id];

  return (
    <details className="group rounded-[1.5rem] border border-[var(--border)] bg-white p-5 open:shadow-[var(--shadow)]">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--core-green)]">
            {option.category === "structural" ? "Structural System" : "Architectural Skin"}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-[var(--foreground)]">{option.name}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{option.description}</p>
        </div>
        <div className="rounded-full border border-[var(--border)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)] transition group-open:bg-[var(--concrete)]">
          Expand
        </div>
      </summary>
      <div className="mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[1.25rem] bg-[var(--concrete)] p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Conceptual Cost</p>
              <p className="mt-1 text-lg font-bold">{formatCurrency(option.costPerSf)}/SF</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Schedule Influence</p>
              <p className="mt-1 text-lg font-bold">{option.scheduleWeeks} weeks</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Lead Time</p>
              <p className="mt-1 text-sm font-semibold">{option.leadTime}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Decision Lens</p>
              <p className="mt-1 text-sm font-semibold">{option.rating}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
            {Object.entries(option.metrics).map(([key, value]) =>
              value ? (
                <div key={key} className="grid grid-cols-[auto,minmax(0,1fr)] items-center gap-3 rounded-xl bg-white px-3 py-2">
                  <span className="capitalize">{key}</span>
                  <span className="text-right font-semibold text-[var(--foreground)]">{value}</span>
                </div>
              ) : null,
            )}
          </div>
          {option.compatibilityNote ? (
            <div className="mt-4 rounded-xl border border-[color:rgba(0,131,72,0.22)] bg-white px-3 py-3 text-sm font-semibold text-[var(--core-green)]">
              Limited pairing: {option.compatibilityNote}
            </div>
          ) : null}
          {sourceImage ? (
            <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-white">
              <div className="px-4 pb-0 pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--core-green)]">Source Study Image</p>
              </div>
              <div className="p-4 pt-4">
                <LightboxImage src={sourceImage.src} alt={sourceImage.alt} width={700} height={500} />
              </div>
            </div>
          ) : null}
        </div>
        <div className="grid gap-4">
          <DetailList title="Advantages" items={option.pros} tone="positive" />
          <DetailList title="Considerations" items={option.cons} tone="caution" />
        </div>
      </div>
    </details>
  );
}

function PlaceholderCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="overflow-hidden bg-[linear-gradient(135deg,rgba(0,131,72,0.12),rgba(255,255,255,0.92))]">
      <div className="flex min-h-64 flex-col justify-between rounded-[1.75rem] border border-dashed border-[color:rgba(0,0,0,0.15)] bg-[color:rgba(255,255,255,0.65)] p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--core-green)]">Future Feature</p>
          <h3 className="mt-3 text-2xl font-bold text-[var(--foreground)]">{title}</h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">{description}</p>
        </div>
        <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
          <span className="rounded-full bg-black px-3 py-1 text-white">Reserved</span>
          <span>Component stub is ready for future project-specific model integrations.</span>
        </div>
      </div>
    </Card>
  );
}

type RankingRow = {
  id: string;
  rank: number;
  label: string;
  costPerSf: number;
  durationWeeks: number;
  selected: boolean;
};

type SavedPairing = {
  id: string;
  name: string;
  note: string;
  structural_id: string;
  skin_id: string;
  created_at: string;
};

const skinStructureSections = [
  {
    id: "overview",
    label: "Overview",
    eyebrow: "Project Story",
    title: "Hero summary and study framing",
  },
  {
    id: "option-explorer",
    label: "Option Explorer",
    eyebrow: "Material Library",
    title: "Browse every structural and skin option",
  },
  {
    id: "decision-tool",
    label: "Decision Tool",
    eyebrow: "Scenario Builder",
    title: "Pair systems and review the active combination",
  },
  {
    id: "rankings",
    label: "Rankings",
    eyebrow: "Study Tables",
    title: "Sorted cost and duration rankings",
  },
] as const;

type SkinStructureSectionId = (typeof skinStructureSections)[number]["id"];
type SkinStructureRenderableSectionId = SkinStructureSectionId | "future-ready";

const decisionToolViews = [
  {
    id: "scenario-picker",
    label: "Design Picker",
    eyebrow: "Selection",
    title: "Choose a structural system and skin for the active scenario",
  },
  {
    id: "ai-helper",
    label: "AI Helper",
    eyebrow: "Recommendation",
    title: "Set priorities and get a best-fit assembly suggestion",
  },
] as const;

type DecisionToolViewId = (typeof decisionToolViews)[number]["id"];

const optionSourceImages: Record<string, { src: string; alt: string }> = {
  "icf-block": {
    src: "/source-study-docx/icf-block.png",
    alt: "ICF block visual from the Tempe Curry and Connolly skin and structure options study",
  },
  "structural-masonry": {
    src: "/source-study-docx/structural-masonry.png",
    alt: "Structural masonry visual from the Tempe Curry and Connolly skin and structure options study",
  },
  "steel-stud-infill": {
    src: "/source-study-docx/steel-stud-infill.png",
    alt: "Structural steel with metal stud infill visual from the Tempe Curry and Connolly skin and structure options study",
  },
  "tilt-panels": {
    src: "/source-study-docx/tilt-panels.png",
    alt: "Tilt concrete panels visual from the Tempe Curry and Connolly skin and structure options study",
  },
  "precast-concrete": {
    src: "/source-study-docx/precast-concrete.png",
    alt: "Insulated precast concrete visual from the Tempe Curry and Connolly skin and structure options study",
  },
  eifs: {
    src: "/source-study-docx/eifs.jpeg",
    alt: "EIFS visual from the Tempe Curry and Connolly skin and structure options study",
  },
  "masonry-veneer": {
    src: "/source-study-docx/masonry-veneer.png",
    alt: "Masonry veneer visual from the Tempe Curry and Connolly skin and structure options study",
  },
  "metal-corten": {
    src: "/source-study-docx/metal-wall-panels.png",
    alt: "Corten panel visual from the Tempe Curry and Connolly skin and structure options study",
  },
  "metal-acm": {
    src: "/source-study-docx/metal-acm.png",
    alt: "ACM panel visual from the Tempe Curry and Connolly skin and structure options study",
  },
  "metal-flush-seam": {
    src: "/source-study-docx/metal-wall-panels.png",
    alt: "Flush seam metal panel visual from the Tempe Curry and Connolly skin and structure options study",
  },
  "fiber-cement-panels": {
    src: "/source-study-docx/fiber-cement-panels.png",
    alt: "Fiber cement panel visual from the Tempe Curry and Connolly skin and structure options study",
  },
  "exposed-structural-masonry": {
    src: "/source-study-docx/exposed-structural-masonry.png",
    alt: "Exposed structural masonry visual from the Tempe Curry and Connolly skin and structure options study",
  },
  "exposed-tilt": {
    src: "/source-study-docx/exposed-tilt.png",
    alt: "Exposed insulated tilt concrete panel visual from the Tempe Curry and Connolly skin and structure options study",
  },
};

const optionThermalScores: Record<string, number> = {
  "icf-block": 5,
  "structural-masonry": 2,
  "steel-stud-infill": 3,
  "tilt-panels": 2,
  "precast-concrete": 3,
  eifs: 5,
  "masonry-veneer": 2,
  "metal-corten": 2,
  "metal-acm": 2,
  "metal-flush-seam": 2,
  "fiber-cement-panels": 3,
  "exposed-structural-masonry": 3,
  "exposed-tilt": 2,
};

const optionDurabilityScores: Record<string, number> = {
  "icf-block": 5,
  "structural-masonry": 5,
  "steel-stud-infill": 4,
  "tilt-panels": 5,
  "precast-concrete": 5,
  eifs: 4,
  "masonry-veneer": 4,
  "metal-corten": 5,
  "metal-acm": 5,
  "metal-flush-seam": 5,
  "fiber-cement-panels": 4,
  "exposed-structural-masonry": 5,
  "exposed-tilt": 5,
};

const optionMaintenanceScores: Record<string, number> = {
  "icf-block": 3,
  "structural-masonry": 3,
  "steel-stud-infill": 3,
  "tilt-panels": 4,
  "precast-concrete": 4,
  eifs: 5,
  "masonry-veneer": 2,
  "metal-corten": 5,
  "metal-acm": 5,
  "metal-flush-seam": 5,
  "fiber-cement-panels": 4,
  "exposed-structural-masonry": 3,
  "exposed-tilt": 4,
};

const optionFlexibilityScores: Record<string, number> = {
  "icf-block": 3,
  "structural-masonry": 3,
  "steel-stud-infill": 5,
  "tilt-panels": 2,
  "precast-concrete": 2,
  eifs: 5,
  "masonry-veneer": 4,
  "metal-corten": 4,
  "metal-acm": 5,
  "metal-flush-seam": 4,
  "fiber-cement-panels": 4,
  "exposed-structural-masonry": 3,
  "exposed-tilt": 2,
};

type RecommendationPriorityId =
  | "lowestCost"
  | "fastestSchedule"
  | "lowProcurementRisk"
  | "bestThermalPerformance"
  | "highestDurability"
  | "lowestMaintenance"
  | "mostDesignFlexibility";

type RecommendationPriority = {
  id: RecommendationPriorityId;
  label: string;
  description: string;
};

const recommendationPriorities: RecommendationPriority[] = [
  { id: "lowestCost", label: "Lowest cost", description: "Favor the lowest studied total cost per square foot." },
  { id: "fastestSchedule", label: "Fastest schedule", description: "Favor assemblies with shorter overall duration." },
  { id: "lowProcurementRisk", label: "Low procurement risk", description: "Favor shorter combined lead times." },
  { id: "bestThermalPerformance", label: "Best thermal", description: "Favor stronger envelope insulation performance." },
  { id: "highestDurability", label: "Highest durability", description: "Favor long-life, secure, resilient systems." },
  { id: "lowestMaintenance", label: "Low maintenance", description: "Favor systems described as low maintenance." },
  { id: "mostDesignFlexibility", label: "Design flexibility", description: "Favor systems that support more finish and form options." },
];

type RecommendationResult = {
  combination: SystemCombination;
  structural: MaterialOption;
  skin: MaterialOption;
  score: number;
  leadWeeks: number;
  breakdown: Array<{ id: RecommendationPriorityId; score: number }>;
};

function parseLeadTimeWeeks(value: string) {
  const match = value.match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

function normalizeAscending(value: number, min: number, max: number) {
  if (max === min) {
    return 1;
  }

  return (max - value) / (max - min);
}

function averageOptionScore(map: Record<string, number>, structuralId: string, skinId: string) {
  return ((map[structuralId] ?? 3) + (map[skinId] ?? 3)) / 2;
}

function getPriorityReason(
  priorityId: RecommendationPriorityId,
  result: RecommendationResult,
) {
  switch (priorityId) {
    case "lowestCost":
      return `It stays near the low end of the study at ${formatCurrency(result.combination.totalCostPerSf)}/SF.`;
    case "fastestSchedule":
      return `Its ${result.combination.totalScheduleWeeks}-week duration keeps it among the quicker assemblies studied.`;
    case "lowProcurementRisk":
      return `Its combined lead-time profile is relatively manageable at about ${result.leadWeeks} weeks.`;
    case "bestThermalPerformance":
      return `${result.structural.shortLabel} plus ${result.skin.shortLabel} leans into stronger envelope performance and operating-efficiency talking points.`;
    case "highestDurability":
      return `Both selections score well for durability and long-term resilience in the study language.`;
    case "lowestMaintenance":
      return `The pairing favors lower-upkeep materials, which helps frame lifecycle simplicity.`;
    case "mostDesignFlexibility":
      return `This combination keeps more room for finish variety and design expression.`;
    default:
      return result.combination.bestFor;
  }
}

function RankingTable({
  title,
  description,
  rows,
  mode,
}: {
  title: string;
  description: string;
  rows: RankingRow[];
  mode: "cost" | "duration";
}) {
  return (
    <Card>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">{title}</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)]">Ranked assembly table</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{description}</p>
      </div>
      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--concrete)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold uppercase tracking-[0.12em]">Rank</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-[0.12em]">Assembly</th>
                {mode === "cost" ? (
                  <>
                    <th className="px-4 py-3 font-semibold uppercase tracking-[0.12em]">Cost / SF</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-[0.12em]">Duration</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 font-semibold uppercase tracking-[0.12em]">Duration</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-[0.12em]">Cost / SF</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-t border-[var(--border)]",
                    row.selected ? "bg-[color:rgba(0,131,72,0.06)]" : "bg-white",
                  )}
                >
                  <td className="px-4 py-3 font-bold text-[var(--foreground)]">{row.rank}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[var(--foreground)]">{row.label}</div>
                    {row.selected ? (
                      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--core-green)]">
                        Current selection
                      </div>
                    ) : null}
                  </td>
                  {mode === "cost" ? (
                    <>
                      <td className="px-4 py-3 font-medium text-[var(--foreground)]">{formatCurrency(row.costPerSf)}</td>
                      <td className="px-4 py-3 font-medium text-[var(--foreground)]">{row.durationWeeks} weeks</td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium text-[var(--foreground)]">{row.durationWeeks} weeks</td>
                      <td className="px-4 py-3 font-medium text-[var(--foreground)]">{formatCurrency(row.costPerSf)}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-[var(--border)] bg-[var(--concrete)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
          {mode === "cost" ? "Sorted from lowest to highest total cost per square foot" : "Sorted from fastest to slowest total duration"}
        </div>
      </div>
    </Card>
  );
}

function getStructuralModelStyle(structuralName?: string) {
  switch (structuralName) {
    case "Insulated Concrete Form (ICF) Block":
      return {
        height: 196,
        width: 188,
        sideColor: "linear-gradient(180deg,#008348,#006d3c)",
        topColor: "linear-gradient(180deg,#ffffff,#eef3f0)",
        badge: "ICF core",
      };
    case "Structural Masonry":
      return {
        height: 196,
        width: 192,
        sideColor: "linear-gradient(180deg,#5f6765,#3f4544)",
        topColor: "linear-gradient(180deg,#f2f3f3,#d8dddc)",
        badge: "CMU wall",
      };
    case "Full Structural Steel with Metal Stud Infill":
      return {
        height: 182,
        width: 212,
        sideColor: "linear-gradient(180deg,#282828,#111111)",
        topColor: "linear-gradient(180deg,#e9eceb,#ffffff)",
        badge: "Steel frame",
      };
    case "Concrete Tilt Panels":
      return {
        height: 188,
        width: 220,
        sideColor: "linear-gradient(180deg,#8d9492,#666d6b)",
        topColor: "linear-gradient(180deg,#fafafa,#e6e9e8)",
        badge: "Tilt wall",
      };
    case "Insulated Precast Concrete":
      return {
        height: 210,
        width: 220,
        sideColor: "linear-gradient(180deg,#727977,#505655)",
        topColor: "linear-gradient(180deg,#ffffff,#ecefee)",
        badge: "Precast panel",
      };
    default:
      return {
        height: 192,
        width: 192,
        sideColor: "linear-gradient(180deg,#008348,#006d3c)",
        topColor: "linear-gradient(180deg,#ffffff,#eef3f0)",
        badge: "System",
      };
  }
}

function getSkinModelStyle(skinName?: string) {
  switch (skinName) {
    case "Exterior Insulation Finishing System (EIFS)":
      return {
        facade: "linear-gradient(135deg,#ffffff 0%,#f2f3f3 100%)",
        overlay: "linear-gradient(180deg,rgba(0,131,72,0.14),rgba(255,255,255,0.18))",
        accent: "#008348",
        label: "EIFS",
      };
    case "Masonry Veneer":
      return {
        facade: "linear-gradient(135deg,#b96d4f 0%,#9a573b 100%)",
        overlay: "repeating-linear-gradient(0deg,rgba(255,255,255,0.22) 0 2px,transparent 2px 18px), repeating-linear-gradient(90deg,rgba(255,255,255,0.22) 0 2px,transparent 2px 30px)",
        accent: "#8f4d35",
        label: "Veneer",
      };
    case "Metal Wall Panels - Corten":
      return {
        facade: "linear-gradient(135deg,#8f4f36 0%,#6e3421 100%)",
        overlay: "repeating-linear-gradient(90deg,rgba(255,255,255,0.18) 0 2px,transparent 2px 24px)",
        accent: "#7d3c28",
        label: "Corten",
      };
    case "Metal Wall Panels - ACM":
      return {
        facade: "linear-gradient(135deg,#dfe4e3 0%,#b8c0be 100%)",
        overlay: "repeating-linear-gradient(90deg,rgba(0,0,0,0.09) 0 1px,transparent 1px 26px)",
        accent: "#6e7774",
        label: "ACM",
      };
    case "Metal Wall Panels - Flush Seam":
      return {
        facade: "linear-gradient(135deg,#ecefed 0%,#cfd6d4 100%)",
        overlay: "repeating-linear-gradient(90deg,rgba(0,0,0,0.14) 0 2px,transparent 2px 22px)",
        accent: "#7e8784",
        label: "Flush seam",
      };
    case "Fiber Cement Panels":
      return {
        facade: "linear-gradient(135deg,#d8d8d2 0%,#f1efe9 100%)",
        overlay: "repeating-linear-gradient(0deg,rgba(0,0,0,0.07) 0 2px,transparent 2px 28px), repeating-linear-gradient(90deg,rgba(0,0,0,0.06) 0 2px,transparent 2px 34px)",
        accent: "#8e9185",
        label: "Fiber cement",
      };
    case "Exposed Structural Masonry (Architectural Finish)":
      return {
        facade: "linear-gradient(135deg,#b1b5b3 0%,#8b918f 100%)",
        overlay: "repeating-linear-gradient(0deg,rgba(255,255,255,0.22) 0 2px,transparent 2px 18px), repeating-linear-gradient(90deg,rgba(255,255,255,0.16) 0 2px,transparent 2px 30px)",
        accent: "#6a716f",
        label: "Exposed CMU",
      };
    case "Exposed Tilt Concrete Panels":
      return {
        facade: "linear-gradient(135deg,#d7dbda 0%,#bcc4c1 100%)",
        overlay: "linear-gradient(180deg,rgba(255,255,255,0.2),rgba(0,0,0,0.04))",
        accent: "#8f9996",
        label: "Exposed tilt",
      };
    default:
      return {
        facade: "linear-gradient(135deg,#ffffff 0%,#f2f3f3 100%)",
        overlay: "linear-gradient(180deg,rgba(0,131,72,0.14),rgba(255,255,255,0.18))",
        accent: "#008348",
        label: "Skin",
      };
  }
}

function InteractiveModelCard({
  structuralName,
  skinName,
}: {
  structuralName?: string;
  skinName?: string;
}) {
  const [rotation, setRotation] = useState({ x: -18, y: 28 });
  const dragState = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startRotationX: number;
    startRotationY: number;
  } | null>(null);

  const stopDragging = () => {
    dragState.current = null;
  };
  const structuralStyle = getStructuralModelStyle(structuralName);
  const skinStyle = getSkinModelStyle(skinName);
  const facadeWidth = structuralStyle.width;
  const facadeHeight = structuralStyle.height;
  const depth = Math.max(68, Math.round(facadeWidth * 0.42));

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startRotationX: rotation.x,
      startRotationY: rotation.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current || dragState.current.pointerId !== event.pointerId) {
      return;
    }

    if (event.pointerType === "mouse" && (event.buttons & 1) !== 1) {
      stopDragging();
      return;
    }

    const deltaX = event.clientX - dragState.current.startX;
    const deltaY = event.clientY - dragState.current.startY;

    setRotation({
      x: dragState.current.startRotationX - deltaY * 0.22,
      y: dragState.current.startRotationY + deltaX * 0.28,
    });
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragState.current?.pointerId !== event.pointerId) {
      return;
    }

    stopDragging();

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <Card className="overflow-hidden bg-[linear-gradient(135deg,rgba(0,131,72,0.14),rgba(255,255,255,0.94))]">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--core-green)]">Interactive Preview</p>
          <h3 className="mt-3 text-2xl font-bold text-[var(--foreground)]">3D Model</h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
            Drag the model to spin it around. This lightweight preview now responds to the active structural system and skin so the visual cue changes with the selected pairing.
          </p>
          <div className="mt-5 text-sm font-semibold text-[var(--foreground)]">Click and drag</div>
        </div>

        <div
          className="relative min-h-80 overflow-hidden rounded-[1.75rem] border border-white/50 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(242,243,243,0.78)_42%,rgba(17,17,17,0.08)_100%)]"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onLostPointerCapture={stopDragging}
          style={{ perspective: "1100px", touchAction: "none" }}
        >
          <div className="absolute inset-x-10 bottom-8 h-8 rounded-full bg-black/10 blur-xl" />
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 sm:h-72 sm:w-72">
            <div
              className="relative h-full w-full [transform-style:preserve-3d] transition-transform duration-75"
              style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
            >
              <div
                className="absolute left-1/2 top-1/2 rounded-[1.5rem] border border-black/10 shadow-[0_24px_50px_rgba(0,0,0,0.12)]"
                style={{
                  width: facadeWidth,
                  height: facadeHeight,
                  transform: `translate(-50%, -50%) translateZ(${depth}px)`,
                  background: skinStyle.facade,
                }}
              >
                <div
                  className="absolute inset-4 rounded-[1rem]"
                  style={{
                    background: skinStyle.overlay,
                    border: `1px solid ${skinStyle.accent}33`,
                  }}
                />
                <div className="absolute left-4 right-4 top-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.14em] text-black/55">
                  <span>{skinStyle.label}</span>
                  <span>{structuralStyle.badge}</span>
                </div>
              </div>
              <div
                className="absolute left-1/2 top-1/2 rounded-[1.5rem] border border-black/10"
                style={{
                  width: facadeWidth,
                  height: facadeHeight,
                  transform: `translate(-50%, -50%) rotateY(180deg) translateZ(${depth}px)`,
                  background: "linear-gradient(135deg,#dce2df 0%,#ffffff 100%)",
                }}
              />
              <div
                className="absolute left-1/2 top-1/2 rounded-[1.5rem] border border-black/10"
                style={{
                  width: depth * 2,
                  height: facadeHeight,
                  transform: `translate(-50%, -50%) rotateY(90deg) translateZ(${facadeWidth / 2}px)`,
                  background: structuralStyle.sideColor,
                }}
              />
              <div
                className="absolute left-1/2 top-1/2 rounded-[1.5rem] border border-black/10"
                style={{
                  width: depth * 2,
                  height: facadeHeight,
                  transform: `translate(-50%, -50%) rotateY(-90deg) translateZ(${facadeWidth / 2}px)`,
                  background: "linear-gradient(180deg,#282828,#111111)",
                }}
              />
              <div
                className="absolute left-1/2 top-1/2 rounded-[1.5rem] border border-black/10"
                style={{
                  width: facadeWidth,
                  height: depth * 2,
                  transform: `translate(-50%, -50%) rotateX(90deg) translateZ(${facadeHeight / 2}px)`,
                  background: structuralStyle.topColor,
                }}
              />
              <div
                className="absolute left-1/2 top-1/2 rounded-[1.5rem] border border-black/10"
                style={{
                  width: facadeWidth,
                  height: depth * 2,
                  transform: `translate(-50%, -50%) rotateX(-90deg) translateZ(${facadeHeight / 2}px)`,
                  background: "linear-gradient(180deg,#d9dcdb,#f2f3f3)",
                }}
              />

              <div
                className="absolute left-1/2 top-1/2 rounded-[1rem] border border-white/40 shadow-[0_16px_40px_rgba(0,131,72,0.18)]"
                style={{
                  width: Math.max(84, Math.round(facadeWidth * 0.38)),
                  height: Math.max(84, Math.round(facadeHeight * 0.38)),
                  transform: `translate3d(-50%, calc(-50% - ${Math.round(facadeHeight * 0.18)}px), ${depth + 16}px)`,
                  background: structuralStyle.sideColor,
                }}
              />
              <div
                className="absolute left-1/2 top-1/2 rounded-[999px] border border-white/60 bg-white/92"
                style={{
                  width: Math.max(120, Math.round(facadeWidth * 0.72)),
                  height: 46,
                  transform: `translate3d(-50%, calc(-50% + ${Math.round(facadeHeight * 0.24)}px), ${depth + 16}px)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function PreconstructionDashboard() {
  const themeVars = {
    "--core-green": "#008348",
    "--core-green-200": "#86d2ac",
    "--concrete": "#f2f3f3",
    "--foreground": "#161616",
    "--muted": "#5b6160",
    "--border": "rgba(17, 17, 17, 0.1)",
    "--shadow": "0 24px 60px rgba(0, 0, 0, 0.08)",
  } as CSSProperties;
  const [selectedStructuralId, setSelectedStructuralId] = useState("icf-block");
  const [selectedSkinId, setSelectedSkinId] = useState("eifs");
  const [activeSectionId, setActiveSectionId] = useState<SkinStructureRenderableSectionId>("overview");
  const [activeDecisionToolViewId, setActiveDecisionToolViewId] = useState<DecisionToolViewId>("scenario-picker");
  const [selectedPriorityIds, setSelectedPriorityIds] = useState<RecommendationPriorityId[]>([]);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [savedPairings, setSavedPairings] = useState<SavedPairing[]>([]);
  const [savedPairingName, setSavedPairingName] = useState("");
  const [savedPairingNote, setSavedPairingNote] = useState("");
  const [savedPairingMessage, setSavedPairingMessage] = useState("");
  const [isLoadingSavedPairings, setIsLoadingSavedPairings] = useState(false);
  const [isSavingPairing, setIsSavingPairing] = useState(false);

  const isSupabaseConfigured =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const supabase = useMemo(
    () => (isSupabaseConfigured ? createSupabaseBrowserClient() : null),
    [isSupabaseConfigured],
  );

  const compatibleSkinIdsByStructural = useMemo(
    () =>
      structuralOptions.reduce<Record<string, string[]>>((accumulator, option) => {
        accumulator[option.id] = systemCombinations
          .filter((combination) => combination.structuralId === option.id)
          .map((combination) => combination.skinId);
        return accumulator;
      }, {}),
    [],
  );
  const compatibleStructuralIdsBySkin = useMemo(
    () =>
      skinOptions.reduce<Record<string, string[]>>((accumulator, option) => {
        accumulator[option.id] = systemCombinations
          .filter((combination) => combination.skinId === option.id)
          .map((combination) => combination.structuralId);
        return accumulator;
      }, {}),
    [],
  );

  const handleStructuralSelect = (structuralId: string) => {
    const compatibleSkinIds = compatibleSkinIdsByStructural[structuralId] ?? [];
    const nextSkinId = compatibleSkinIds.includes(selectedSkinId) ? selectedSkinId : compatibleSkinIds[0];

    setSelectedStructuralId(structuralId);

    if (nextSkinId) {
      setSelectedSkinId(nextSkinId);
    }
  };

  const handleSkinSelect = (skinId: string) => {
    const compatibleStructuralIds = compatibleStructuralIdsBySkin[skinId] ?? [];
    const nextStructuralId = compatibleStructuralIds.includes(selectedStructuralId)
      ? selectedStructuralId
      : compatibleStructuralIds[0];

    setSelectedSkinId(skinId);

    if (nextStructuralId) {
      setSelectedStructuralId(nextStructuralId);
    }
  };

  const selectedStructural = getOptionById(selectedStructuralId);
  const selectedSkin = getOptionById(selectedSkinId);
  const selectedCombination = getCombination(selectedStructuralId, selectedSkinId);
  const selectedStructuralImage = optionSourceImages[selectedStructuralId];
  const selectedSkinImage = optionSourceImages[selectedSkinId];

  const togglePriority = (priorityId: RecommendationPriorityId) => {
    setSelectedPriorityIds((current) =>
      current.includes(priorityId) ? current.filter((id) => id !== priorityId) : [...current, priorityId],
    );
  };

  const combinedPros = [...(selectedStructural?.pros ?? []), ...(selectedSkin?.pros ?? [])].slice(0, 5);
  const combinedCons = [...(selectedStructural?.cons ?? []), ...(selectedSkin?.cons ?? [])].slice(0, 5);
  const defaultSavedPairingName =
    selectedStructural && selectedSkin ? `${selectedStructural.shortLabel} + ${selectedSkin.shortLabel}` : "";
  const activeSavedPairing = savedPairings.find(
    (pairing) => pairing.structural_id === selectedStructuralId && pairing.skin_id === selectedSkinId,
  );
  const combinationRows = useMemo(
    () =>
      systemCombinations.map((combination) => {
        const structural = getOptionById(combination.structuralId);
        const skin = getOptionById(combination.skinId);

        return {
          id: combination.id,
          label: `${structural?.name} + ${skin?.name}`,
          costPerSf: combination.totalCostPerSf,
          durationWeeks: combination.totalScheduleWeeks,
          selected: combination.id === selectedCombination?.id,
        };
      }),
    [selectedCombination?.id],
  );
  const costRankRows = useMemo(
    () =>
      [...combinationRows]
        .sort((a, b) => a.costPerSf - b.costPerSf || a.durationWeeks - b.durationWeeks)
        .map((row, index) => ({ ...row, rank: index + 1 })),
    [combinationRows],
  );
  const durationRankRows = useMemo(
    () =>
      [...combinationRows]
        .sort((a, b) => a.durationWeeks - b.durationWeeks || a.costPerSf - b.costPerSf)
        .map((row, index) => ({ ...row, rank: index + 1 })),
    [combinationRows],
  );
  const recommendation = useMemo(() => {
    const activePriorityIds = [...selectedPriorityIds];

    if (activePriorityIds.length === 0) {
      return {
        activePriorityIds,
        rankedResults: [] as RecommendationResult[],
        primaryResult: null as RecommendationResult | null,
        secondaryResult: null as RecommendationResult | null,
      };
    }

    const costs = systemCombinations.map((combination) => combination.totalCostPerSf);
    const durations = systemCombinations.map((combination) => combination.totalScheduleWeeks);
    const leadWeeksList = systemCombinations.map((combination) => {
      const structural = getOptionById(combination.structuralId);
      const skin = getOptionById(combination.skinId);
      return parseLeadTimeWeeks(structural?.leadTime ?? "0") + parseLeadTimeWeeks(skin?.leadTime ?? "0");
    });

    const minCost = Math.min(...costs);
    const maxCost = Math.max(...costs);
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    const minLeadWeeks = Math.min(...leadWeeksList);
    const maxLeadWeeks = Math.max(...leadWeeksList);

    const rankedResults = systemCombinations
      .map((combination) => {
        const structural = getOptionById(combination.structuralId);
        const skin = getOptionById(combination.skinId);

        if (!structural || !skin) {
          return null;
        }

        const leadWeeks = parseLeadTimeWeeks(structural.leadTime) + parseLeadTimeWeeks(skin.leadTime);
        const breakdown = activePriorityIds.map((priorityId) => {
          switch (priorityId) {
            case "lowestCost":
              return { id: priorityId, score: normalizeAscending(combination.totalCostPerSf, minCost, maxCost) * 30 };
            case "fastestSchedule":
              return { id: priorityId, score: normalizeAscending(combination.totalScheduleWeeks, minDuration, maxDuration) * 30 };
            case "lowProcurementRisk":
              return { id: priorityId, score: normalizeAscending(leadWeeks, minLeadWeeks, maxLeadWeeks) * 20 };
            case "bestThermalPerformance":
              return { id: priorityId, score: averageOptionScore(optionThermalScores, structural.id, skin.id) * 4 };
            case "highestDurability":
              return { id: priorityId, score: averageOptionScore(optionDurabilityScores, structural.id, skin.id) * 4 };
            case "lowestMaintenance":
              return { id: priorityId, score: averageOptionScore(optionMaintenanceScores, structural.id, skin.id) * 3.5 };
            case "mostDesignFlexibility":
              return { id: priorityId, score: averageOptionScore(optionFlexibilityScores, structural.id, skin.id) * 3.5 };
            default:
              return { id: priorityId, score: 0 };
          }
        });

        return {
          combination,
          structural,
          skin,
          leadWeeks,
          breakdown: [...breakdown].sort((a, b) => b.score - a.score),
          score: breakdown.reduce((total, entry) => total + entry.score, 0),
        } satisfies RecommendationResult;
      })
      .filter((result): result is RecommendationResult => result !== null)
      .sort((a, b) => b.score - a.score || a.combination.totalCostPerSf - b.combination.totalCostPerSf);

    return {
      activePriorityIds,
      rankedResults,
      primaryResult: rankedResults[0] ?? null,
      secondaryResult: rankedResults[1] ?? null,
    };
  }, [selectedPriorityIds]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isCancelled = false;

    void supabase.auth.getUser().then(({ data }) => {
      if (!isCancelled) {
        setSupabaseUser(data.user ?? null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
    });

    return () => {
      isCancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !supabaseUser) {
      setSavedPairings([]);
      return;
    }

    let isCancelled = false;
    setIsLoadingSavedPairings(true);
    setSavedPairingMessage("");

    void supabase
      .from("saved_skin_structure_pairings")
      .select("id, name, note, structural_id, skin_id, created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (isCancelled) {
          return;
        }

        if (error) {
          setSavedPairingMessage(error.message);
          setSavedPairings([]);
        } else {
          setSavedPairings((data ?? []) as SavedPairing[]);
        }

        setIsLoadingSavedPairings(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [supabase, supabaseUser]);

  const handleSavePairing = async () => {
    if (!supabase || !supabaseUser || !selectedStructural || !selectedSkin) {
      return;
    }

    const pairingName = savedPairingName.trim() || defaultSavedPairingName;

    if (!pairingName) {
      setSavedPairingMessage("Enter a name before saving this pairing.");
      return;
    }

    setIsSavingPairing(true);
    setSavedPairingMessage("");

    const { data, error } = await supabase
      .from("saved_skin_structure_pairings")
      .insert({
        user_id: supabaseUser.id,
        name: pairingName,
        note: savedPairingNote.trim(),
        structural_id: selectedStructuralId,
        skin_id: selectedSkinId,
      })
      .select("id, name, note, structural_id, skin_id, created_at")
      .single();

    if (error) {
      setSavedPairingMessage(error.message);
      setIsSavingPairing(false);
      return;
    }

    setSavedPairings((current) => [data as SavedPairing, ...current]);
    setSavedPairingName("");
    setSavedPairingNote("");
    setSavedPairingMessage("Pairing saved to your shared workspace.");
    setIsSavingPairing(false);
  };

  const handleDeletePairing = async (pairingId: string) => {
    if (!supabase) {
      return;
    }

    setSavedPairingMessage("");

    const { error } = await supabase.from("saved_skin_structure_pairings").delete().eq("id", pairingId);

    if (error) {
      setSavedPairingMessage(error.message);
      return;
    }

    setSavedPairings((current) => current.filter((pairing) => pairing.id !== pairingId));
  };

  useEffect(() => {
    document.title = "CORE Pre-Construction Dashboard";
  }, []);

  const activeSection = skinStructureSections.find((section) => section.id === activeSectionId) ?? skinStructureSections[0];

  return (
    <>
    <div className="print-report hidden print:block">
      <div className="print-report__sheet mx-auto bg-white text-black">
        <div className="border-b border-black/15 pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#008348]">CORE Construction</p>
          <h1 className="mt-2 text-2xl font-bold">Skin + Structure Option Report</h1>
          <p className="mt-2 text-xs text-black/70">Precon Dashboard for Tempe Curry and Connolly Renovations</p>
          <p className="mt-1 text-xs text-black/70">{new Date().toLocaleDateString()}</p>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#008348]">Selected Options</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/55">Structural System</p>
              <p className="mt-1 text-base font-bold">{selectedStructural?.name}</p>
            </div>
            <div className="rounded-2xl border border-black/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/55">Architectural Skin</p>
              <p className="mt-1 text-base font-bold">{selectedSkin?.name}</p>
            </div>
          </div>
          {activeSavedPairing?.note ? (
            <div className="mt-3 rounded-2xl border border-black/10 bg-[#f2f3f3] px-3 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#008348]">Saved Note</p>
              <p className="mt-1 text-xs leading-5 text-black/75">{activeSavedPairing.note}</p>
            </div>
          ) : null}
        </div>

        {selectedCombination ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/55">Estimated Cost</p>
              <p className="mt-1 text-base font-bold">{formatCurrency(selectedCombination.totalCostPerSf)}/SF</p>
            </div>
            <div className="rounded-2xl border border-black/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/55">Schedule Duration</p>
              <p className="mt-1 text-base font-bold">{selectedCombination.totalScheduleWeeks} weeks</p>
            </div>
            <div className="rounded-2xl border border-black/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/55">Lead Time</p>
              <p className="mt-1 text-base font-bold">{selectedCombination.leadTimeImpact}</p>
            </div>
            <div className="rounded-2xl border border-black/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/55">Best Fit</p>
              <p className="mt-1 text-sm font-bold leading-5">{selectedCombination.bestFor}</p>
            </div>
          </div>
        ) : null}

        {selectedCombination ? (
          <div className="mt-5 rounded-2xl border border-black/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#008348]">Constructability Focus</p>
            <div className="mt-2 space-y-2">
              {selectedCombination.considerations.map((item, index) => (
                <div key={`print-consideration-${index}`} className="flex gap-2 text-xs leading-5 text-black/75">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#008348]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {selectedStructuralImage || selectedSkinImage ? (
          <div className="mt-5 rounded-2xl border border-black/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#008348]">Visual Pairing</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {selectedStructuralImage ? (
                <div className="overflow-hidden rounded-xl border border-black/10 bg-[#f2f3f3] p-2">
                  <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/55">Structural System</p>
                  <p className="px-1 pt-1 text-xs font-bold">{selectedStructural?.name}</p>
                  <img
                    src={selectedStructuralImage.src}
                    alt={selectedStructuralImage.alt}
                    className="mt-2 h-36 w-full rounded-lg object-contain"
                  />
                </div>
              ) : null}
              {selectedSkinImage ? (
                <div className="overflow-hidden rounded-xl border border-black/10 bg-[#f2f3f3] p-2">
                  <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/55">Architectural Skin</p>
                  <p className="px-1 pt-1 text-xs font-bold">{selectedSkin?.name}</p>
                  <img
                    src={selectedSkinImage.src}
                    alt={selectedSkinImage.alt}
                    className="mt-2 h-36 w-full rounded-lg object-contain"
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="print-keep-together mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-black/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#008348]">Advantages</p>
            <div className="mt-2 space-y-2">
              {combinedPros.map((item, index) => (
                <div key={`print-pro-${index}`} className="flex gap-2 text-xs leading-5 text-black/75">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#008348]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-black/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#008348]">Considerations</p>
            <div className="mt-2 space-y-2">
              {combinedCons.map((item, index) => (
                <div key={`print-con-${index}`} className="flex gap-2 text-xs leading-5 text-black/75">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-black/55" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      className="space-y-8 pb-10 print:hidden"
      style={{
        ...themeVars,
        fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <header className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(90deg,#000000_0%,#0d0d0d_55%,#141414_100%)] shadow-[0_28px_80px_rgba(0,0,0,0.22)]">
        <div className="flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex h-16 w-32 items-center rounded-[1.25rem] bg-[#050505] px-4 py-3 ring-1 ring-white/10 sm:h-20 sm:w-40 sm:px-5">
              <img src="/logo.svg" alt="CORE Logo" className="h-full w-full object-contain object-left" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--core-green-200)]">CORE Construction</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Skin + Structure Decision Dashboard
              </h1>
              <p className="mt-2 text-sm leading-6 text-white/72">
                Interactive comparison tool for evaluating wall systems, exterior skins, and paired assembly tradeoffs.
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="rounded-[2rem] border border-[var(--border)] bg-white/80 p-5 shadow-[var(--shadow)] backdrop-blur">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">Skin + Structure Sections</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)]">{activeSection.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Use these internal tabs to focus on one part of the dashboard at a time.
            </p>
          </div>
          <div className="rounded-full bg-[var(--concrete)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]">
            {activeSection.eyebrow}
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {skinStructureSections.map((section) => {
            const isActive = section.id === activeSectionId;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSectionId(section.id)}
                className={cn(
                  "rounded-[1.5rem] border p-4 text-left transition",
                  isActive
                    ? "border-[var(--core-green)] bg-[color:rgba(0,131,72,0.08)]"
                    : "border-[var(--border)] bg-white hover:border-[color:rgba(0,131,72,0.38)] hover:bg-[color:rgba(0,131,72,0.03)]",
                )}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--core-green)]">{section.eyebrow}</p>
                <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">{section.label}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{section.title}</p>
              </button>
            );
          })}
        </div>
      </section>

      {activeSectionId === "overview" ? (
        <section
          id="overview"
          className="overflow-hidden rounded-[2rem] border border-white/50 bg-[linear-gradient(135deg,#0b0b0b_0%,#171717_56%,#008348_160%)] px-6 py-8 shadow-[0_28px_80px_rgba(0,0,0,0.18)] sm:px-8"
        >
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--core-green-200)]">Decision Support Prototype</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Explore construction systems visually instead of flipping through static option-study pages.
              </h2>
            </div>
            <div className="grid gap-4">
              <div className="rounded-[1.75rem] border border-white/12 bg-white/8 p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Lowest cost in study</p>
                <p className="mt-2 text-2xl font-bold">ICF + EIFS</p>
                <p className="mt-2 text-sm leading-6 text-white/72">
                  Ranked first at $69/SF and 45 weeks in the summary table, making it the baseline recommendation path.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/12 bg-white/8 p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Document conclusion</p>
                <p className="mt-2 text-2xl font-bold">CORE recommends ICF</p>
                <p className="mt-2 text-sm leading-6 text-white/72">
                  The conclusion states ICF is the most cost-effective and schedule-efficient option, with the added benefit of high thermal performance.
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {activeSectionId === "option-explorer" ? (
        <section id="option-explorer" className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">Expandable Option Explorer</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Browse each material option on demand</h2>
          </div>
          <div className="grid gap-8 xl:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--core-green)]">Structural Systems</p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)]">Primary wall and structure options</h3>
              </div>
              <div className="grid gap-4">
                {structuralOptions.map((option) => (
                  <ExplorerCard key={option.id} option={option} />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--core-green)]">Architectural Skins</p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)]">Exterior finish and cladding options</h3>
              </div>
              <div className="grid gap-4">
                {skinOptions.map((option) => (
                  <ExplorerCard key={option.id} option={option} />
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {activeSectionId === "decision-tool" ? (
        <div id="decision-tool" className="space-y-6">
          <Card>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">Decision Tool Views</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)]">Split recommendation support from manual scenario selection</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {decisionToolViews.map((view) => {
                const isActive = view.id === activeDecisionToolViewId;

                return (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => setActiveDecisionToolViewId(view.id)}
                    className={cn(
                      "rounded-[1.5rem] border p-4 text-left transition",
                      isActive
                        ? "border-[var(--core-green)] bg-[color:rgba(0,131,72,0.08)]"
                        : "border-[var(--border)] bg-white hover:border-[color:rgba(0,131,72,0.38)] hover:bg-[color:rgba(0,131,72,0.03)]",
                    )}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--core-green)]">{view.eyebrow}</p>
                    <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">{view.label}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{view.title}</p>
                  </button>
                );
              })}
            </div>
          </Card>

          {activeDecisionToolViewId === "ai-helper" ? (
            <Card>
              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">Project Priorities</p>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)]">Recommendation assistant</h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    Check the priorities that matter most and the app will rank the studied assemblies.
                  </p>
                  <div className="mt-6 grid gap-3">
                    {recommendationPriorities.map((priority) => {
                      const isChecked = selectedPriorityIds.includes(priority.id);

                      return (
                        <label
                          key={priority.id}
                          className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-[1.25rem] border px-4 py-3 transition",
                            isChecked
                              ? "border-[var(--core-green)] bg-[color:rgba(0,131,72,0.06)]"
                              : "border-[var(--border)] bg-white hover:border-[var(--core-green)]",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePriority(priority.id)}
                            className="mt-1 h-4 w-4 accent-[var(--core-green)]"
                          />
                          <span>
                            <span className="block text-sm font-semibold text-[var(--foreground)]">{priority.label}</span>
                            <span className="mt-1 block text-sm leading-6 text-[var(--muted)]">{priority.description}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(242,243,243,0.96))] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">AI-Style Feedback</p>
                      <h3 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)]">Best-fit assembly</h3>
                    </div>
                    <div className="rounded-full bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                      Grounded in study data
                    </div>
                  </div>

                  {recommendation.primaryResult ? (
                    <>
                      <div className="mt-6 rounded-[1.5rem] border border-[var(--border)] bg-white p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--core-green)]">Recommended pairing</p>
                        <h4 className="mt-2 text-2xl font-bold text-[var(--foreground)]">
                          {recommendation.primaryResult.structural.name} + {recommendation.primaryResult.skin.name}
                        </h4>
                        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                          {recommendation.primaryResult.combination.bestFor}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                          <span className="rounded-full bg-[var(--concrete)] px-3 py-1">
                            {formatCurrency(recommendation.primaryResult.combination.totalCostPerSf)}/SF
                          </span>
                          <span className="rounded-full bg-[var(--concrete)] px-3 py-1">
                            {recommendation.primaryResult.combination.totalScheduleWeeks} weeks
                          </span>
                          <span className="rounded-full bg-[var(--concrete)] px-3 py-1">
                            approx. {recommendation.primaryResult.leadWeeks} weeks lead time
                          </span>
                        </div>
                        {recommendation.primaryResult.combination.id !== selectedCombination?.id ? (
                          <button
                            type="button"
                            onClick={() =>
                              startTransition(() => {
                                setSelectedStructuralId(recommendation.primaryResult!.combination.structuralId);
                                setSelectedSkinId(recommendation.primaryResult!.combination.skinId);
                              })
                            }
                            className="mt-5 rounded-full bg-[var(--core-green)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
                          >
                            Apply recommendation
                          </button>
                        ) : null}
                      </div>

                      <div className="mt-6 grid gap-4 xl:grid-cols-2">
                        <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5">
                          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--core-green)]">Why it fits</p>
                          <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
                            {recommendation.primaryResult.breakdown.slice(0, 3).map((entry) => (
                              <div key={entry.id} className="flex items-start gap-3">
                                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[var(--core-green)]" />
                                <span>{getPriorityReason(entry.id, recommendation.primaryResult!)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5">
                          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--core-green)]">Tradeoffs</p>
                          <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
                            {recommendation.primaryResult.combination.considerations.slice(0, 2).map((item, index) => (
                              <div key={`tradeoff-${index}`} className="flex items-start gap-3">
                                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-black/55" />
                                <span>{item}</span>
                              </div>
                            ))}
                            {recommendation.primaryResult.skin.cons?.[0] ? (
                              <div className="flex items-start gap-3">
                                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-black/55" />
                                <span>{recommendation.primaryResult.skin.cons[0]}</span>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {recommendation.secondaryResult ? (
                        <div className="mt-6 rounded-[1.5rem] border border-[var(--border)] bg-white p-5">
                          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--core-green)]">Runner-up</p>
                          <h4 className="mt-2 text-xl font-bold text-[var(--foreground)]">
                            {recommendation.secondaryResult.structural.name} + {recommendation.secondaryResult.skin.name}
                          </h4>
                          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                            Strong alternative if you want a different balance of cost, time, or design expression.
                          </p>
                        </div>
                      ) : null}
                      {recommendation.activePriorityIds.length > 0 ? null : null}
                    </>
                  ) : (
                    <div className="mt-6 rounded-[1.5rem] border border-dashed border-[var(--border)] bg-white p-6 text-sm leading-6 text-[var(--muted)]">
                      Select at least one priority to generate a recommendation.
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ) : null}

          {activeDecisionToolViewId === "scenario-picker" ? (
            <section className="space-y-6">
            <Card>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">Saved Pairings</p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)]">Keep option sets for later review</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Save the current structural plus skin combination so signed-in teammates can revisit it quickly.
                  </p>
                </div>
                <div className="rounded-full bg-[var(--concrete)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]">
                  {supabaseUser?.email ?? "Supabase required"}
                </div>
              </div>

              {isSupabaseConfigured ? (
                <>
                  <div className="mt-5 grid gap-3">
                    <input
                      type="text"
                      value={savedPairingName}
                      onChange={(event) => setSavedPairingName(event.target.value)}
                      placeholder={defaultSavedPairingName || "Name this pairing"}
                      className="w-full rounded-[1.25rem] border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--core-green)]"
                    />
                    <textarea
                      value={savedPairingNote}
                      onChange={(event) => setSavedPairingNote(event.target.value)}
                      placeholder="Optional note for why this pairing matters"
                      rows={3}
                      className="w-full rounded-[1.25rem] border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--core-green)]"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => void handleSavePairing()}
                        disabled={!supabaseUser || isSavingPairing}
                        className="rounded-full bg-[var(--core-green)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSavingPairing ? "Saving..." : "Save current pairing"}
                      </button>
                    </div>
                  </div>

                  {savedPairingMessage ? (
                    <p className="mt-4 rounded-[1rem] border border-[color:rgba(0,131,72,0.2)] bg-white px-4 py-3 text-sm text-[var(--foreground)]">
                      {savedPairingMessage}
                    </p>
                  ) : null}

                  <div className="mt-5 grid gap-3">
                    {isLoadingSavedPairings ? (
                      <div className="rounded-[1.25rem] border border-dashed border-[var(--border)] bg-white px-4 py-5 text-sm text-[var(--muted)]">
                        Loading saved pairings...
                      </div>
                    ) : savedPairings.length > 0 ? (
                      savedPairings.map((pairing) => {
                        const isActive =
                          pairing.structural_id === selectedStructuralId && pairing.skin_id === selectedSkinId;
                        const pairingStructural = getOptionById(pairing.structural_id);
                        const pairingSkin = getOptionById(pairing.skin_id);

                        return (
                          <div
                            key={pairing.id}
                            className={cn(
                              "rounded-[1.25rem] border bg-white p-4",
                              isActive ? "border-[var(--core-green)]" : "border-[var(--border)]",
                            )}
                          >
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="text-lg font-semibold text-[var(--foreground)]">{pairing.name}</h4>
                                  {isActive ? (
                                    <span className="rounded-full bg-[color:rgba(0,131,72,0.1)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--core-green)]">
                                      Active
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                                  {pairingStructural?.name} + {pairingSkin?.name}
                                </p>
                                {pairing.note ? (
                                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{pairing.note}</p>
                                ) : null}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {!isActive ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      startTransition(() => {
                                        setSelectedStructuralId(pairing.structural_id);
                                        setSelectedSkinId(pairing.skin_id);
                                      })
                                    }
                                    className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                                  >
                                    Load pairing
                                  </button>
                                ) : null}
                                <button
                                  type="button"
                                  onClick={() => void handleDeletePairing(pairing.id)}
                                  className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-black"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="rounded-[1.25rem] border border-dashed border-[var(--border)] bg-white px-4 py-5 text-sm text-[var(--muted)]">
                        No saved pairings yet. Save one from the current selection to start building a shared shortlist.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="mt-5 rounded-[1.25rem] border border-dashed border-[var(--border)] bg-white px-4 py-5 text-sm leading-6 text-[var(--muted)]">
                  Add your Supabase URL and publishable key, then run the SQL in <code>supabase/setup.sql</code> to
                  turn on shared saved pairings.
                </div>
              )}
            </Card>
            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">Material Selection System</p>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)]">Build a paired option scenario</h2>
                </div>
                <div className="hidden rounded-full bg-[var(--concrete)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] lg:block">
                  One structural + one skin
                </div>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <SelectorGroup
                  label="Structural System"
                  options={structuralOptions}
                  selectedId={selectedStructuralId}
                  onSelect={handleStructuralSelect}
                />
                <SelectorGroup
                  label="Architectural Skin"
                  options={skinOptions}
                  selectedId={selectedSkinId}
                  onSelect={handleSkinSelect}
                />
              </div>
            </Card>

            <Card className="bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(242,243,243,0.96))]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">Summary Card</p>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)]">
                    {selectedStructural?.name} + {selectedSkin?.name}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--core-green)] hover:text-[var(--core-green)]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Printer className="h-4 w-4" />
                      Print Report
                    </span>
                  </button>
                  <div className="rounded-full bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                    Active scenario
                  </div>
                </div>
              </div>

              {selectedCombination ? (
                <>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                    <MetricCard
                      icon={<WalletCards className="h-5 w-5" />}
                      label="Estimated Cost"
                      value={`${formatCurrency(selectedCombination.totalCostPerSf)}/SF`}
                      note="Budgetary benchmark drawn from the study summary table for client interview conversations."
                    />
                    <MetricCard
                      icon={<Clock3 className="h-5 w-5" />}
                      label="Schedule Duration"
                      value={`${selectedCombination.totalScheduleWeeks} weeks`}
                      note="Study duration used to compare structure plus enclosure pairings in one view."
                    />
                    <MetricCard
                      icon={<Layers3 className="h-5 w-5" />}
                      label="Lead Time"
                      value={selectedCombination.leadTimeImpact}
                      note="Use this to talk about early-release packages and procurement pressure."
                    />
                    <MetricCard
                      icon={<Building2 className="h-5 w-5" />}
                      label="Best Fit"
                      value={selectedCombination.bestFor}
                      note="Short narrative to help marketing frame the real study outcome quickly."
                    />
                  </div>

                  <div className="mt-6 rounded-[1.5rem] border border-[var(--border)] bg-white p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--core-green)]">Constructability Focus</p>
                    <div className="mt-3 space-y-3 text-sm leading-6 text-[var(--muted)]">
                      {selectedCombination.considerations.map((item, index) => (
                        <div key={`consideration-${index}`} className="flex items-start gap-3">
                          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[var(--core-green)]" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedStructuralImage || selectedSkinImage ? (
                    <div className="mt-6 rounded-[1.5rem] border border-[var(--border)] bg-white p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">Visual Pairing</p>
                          <h3 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)]">Selected system references</h3>
                        </div>
                        <div className="rounded-full bg-[var(--concrete)] px-4 py-2 text-sm font-semibold">
                          Active selection
                        </div>
                      </div>
                      <div className="mt-6 grid gap-4 xl:grid-cols-2">
                        {selectedStructuralImage ? (
                          <div className="overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--concrete)]">
                            <div className="px-4 pb-0 pt-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--core-green)]">Structural System</p>
                              <h4 className="mt-2 text-lg font-semibold text-[var(--foreground)]">{selectedStructural?.name}</h4>
                            </div>
                            <div className="p-4 pt-3">
                              <LightboxImage src={selectedStructuralImage.src} alt={selectedStructuralImage.alt} width={700} height={500} />
                            </div>
                          </div>
                        ) : null}
                        {selectedSkinImage ? (
                          <div className="overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--concrete)]">
                            <div className="px-4 pb-0 pt-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--core-green)]">Architectural Skin</p>
                              <h4 className="mt-2 text-lg font-semibold text-[var(--foreground)]">{selectedSkin?.name}</h4>
                            </div>
                            <div className="p-4 pt-3">
                              <LightboxImage src={selectedSkinImage.src} alt={selectedSkinImage.alt} width={700} height={500} />
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">Pros / Cons</p>
                        <h3 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)]">Performance and risk snapshot</h3>
                      </div>
                      <div className="rounded-full bg-[var(--concrete)] px-4 py-2 text-sm font-semibold">
                        Combined view
                      </div>
                    </div>
                    <div className="mt-6 grid gap-4 xl:grid-cols-2">
                      <DetailList title="Advantages" items={combinedPros} tone="positive" />
                      <DetailList title="Considerations" items={combinedCons} tone="caution" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-6 rounded-[1.5rem] border border-dashed border-[var(--border)] bg-white p-6 text-sm text-[var(--muted)]">
                  This combination is unavailable.
                </div>
              )}
            </Card>
            </div>
          </section>
          ) : null}

        </div>
      ) : null}

      {activeSectionId === "rankings" ? (
        <section className="grid gap-6 xl:grid-cols-2">
          <RankingTable
            title="Rank by Cost"
            description="Assemblies sorted from lowest total cost per square foot to highest using the study summary values."
            rows={costRankRows}
            mode="cost"
          />
          <RankingTable
            title="Rank by Timeframe"
            description="Assemblies sorted from shortest to longest duration so teams can compare schedule impact directly."
            rows={durationRankRows}
            mode="duration"
          />
        </section>
      ) : null}

      {activeSectionId === "future-ready" ? (
        <section id="future-ready" className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">Future-Ready Architecture</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Designed to grow into richer decision support</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              The current data model already separates systems, skins, and pairings, so project-specific visual layers can subscribe to the same selection state later.
            </p>
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <InteractiveModelCard
              structuralName={selectedStructural?.name}
              skinName={selectedSkin?.name}
            />
            <PlaceholderCard
              title="Construction Phasing View (Future Feature)"
              description="Reserved for a layered 2D sequence view showing erection order, enclosure milestones, and major procurement dependencies tied to the current paired system."
            />
          </div>
        </section>
      ) : null}
    </div>
    </>
  );
}
