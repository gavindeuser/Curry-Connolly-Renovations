"use client";

import type { CSSProperties } from "react";
import { startTransition, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { ArrowRight, Building2, Clock3, Printer, WalletCards, Wrench } from "lucide-react";

import { Card } from "@/components/ui/card";
import { LightboxImage } from "@/components/ui/lightbox-image";
import {
  hvacLifecycleScenarios,
  hvacOptions,
  hvacStudyNotes,
  type HvacLifecycleScenario,
  type HvacOption,
} from "@/lib/data/hvac-preconstruction";
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn, formatCurrency } from "@/lib/utils/format";

function getOption(id: string) {
  return hvacOptions.find((option) => option.id === id);
}

function getScenarios(optionId: string) {
  return hvacLifecycleScenarios.filter((scenario) => scenario.optionId === optionId);
}

const hvacSourceImages: Record<string, { src: string; alt: string }> = {
  rtu: {
    src: "/source-study-hvac/rtu.png",
    alt: "Rooftop package unit reference image from the HVAC study source document",
  },
  "central-plant": {
    src: "/source-study-hvac/central-plant.png",
    alt: "Air-cooled central plant reference image from the HVAC study source document",
  },
  vrf: {
    src: "/source-study-hvac/vrf.png",
    alt: "VRF system reference image from the HVAC study source document",
  },
};

function HvacSelector({
  options,
  selectedId,
  onSelect,
}: {
  options: HvacOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
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
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{option.summary}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              <span className="rounded-full bg-[var(--concrete)] px-3 py-1">
                {option.addToBasePrice === 0 ? "In base price" : `${formatCurrency(option.addToBasePrice)} add`}
              </span>
              <span className="rounded-full bg-[var(--concrete)] px-3 py-1">{option.availability}</span>
              <span className="rounded-full bg-[var(--concrete)] px-3 py-1">{option.lifeExpectancy}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
}) {
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

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--foreground)]">{title}</h3>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="flex gap-3">
            <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--core-green)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LifecycleTable({
  scenarios,
  selectedOptionId,
}: {
  scenarios: HvacLifecycleScenario[];
  selectedOptionId: string;
}) {
  const sortedRows = [...scenarios]
    .filter((scenario) => scenario.id !== "rtu-typical")
    .sort((a, b) => a.totalCost - b.totalCost);

  return (
    <Card>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">Lifecycle Ranking</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)]">Connolly maintenance + replacement outlook</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Ranked by total lifecycle cost using the study&apos;s Connolly-only maintenance and replacement scenarios.
        </p>
      </div>
      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--concrete)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold uppercase tracking-[0.12em]">Rank</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-[0.12em]">Scenario</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-[0.12em]">Lifecycle Total</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-[0.12em]">Replacement Cadence</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row, index) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-t border-[var(--border)]",
                    row.optionId === selectedOptionId ? "bg-[color:rgba(0,131,72,0.06)]" : "bg-white",
                  )}
                >
                  <td className="px-4 py-3 font-bold text-[var(--foreground)]">{index + 1}</td>
                  <td className="px-4 py-3 font-semibold text-[var(--foreground)]">
                    {row.id === "rtu-harsh-az" ? "RTUs" : row.label}
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--foreground)]">{formatCurrency(row.totalCost)}</td>
                  <td className="px-4 py-3 text-[var(--foreground)]">{row.replacementCadence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

const hvacSections = [
  {
    id: "overview",
    label: "Overview",
    eyebrow: "Project Story",
    title: "Mechanical study framing and key caveats",
  },
  {
    id: "decision-tool",
    label: "Decision Tool",
    eyebrow: "Selection",
    title: "Choose a system and review the active HVAC scenario",
  },
  {
    id: "tradeoffs",
    label: "Tradeoffs",
    eyebrow: "Pros / Cons",
    title: "Advantages and considerations by selected option",
  },
] as const;

type HvacSectionId = (typeof hvacSections)[number]["id"];
type HvacRenderableSectionId = HvacSectionId | "lifecycle" | "notes";

const hvacDecisionToolViews = [
  {
    id: "scenario-picker",
    label: "Design Picker",
    eyebrow: "Selection",
    title: "Choose an HVAC system and review the active scenario",
  },
  {
    id: "ai-helper",
    label: "AI Helper",
    eyebrow: "Recommendation",
    title: "Set priorities and get a best-fit HVAC suggestion",
  },
] as const;

type HvacDecisionToolViewId = (typeof hvacDecisionToolViews)[number]["id"];

type HvacRecommendationPriorityId =
  | "lowestFirstCost"
  | "lowestLifecycleCost"
  | "highestEfficiency"
  | "lowestMaintenance"
  | "quietestOperation"
  | "simplestInstallation"
  | "widestCampusFit";

type HvacRecommendationPriority = {
  id: HvacRecommendationPriorityId;
  label: string;
  description: string;
};

const hvacRecommendationPriorities: HvacRecommendationPriority[] = [
  { id: "lowestFirstCost", label: "Lowest first cost", description: "Favor the smallest add to base price and lowest first-cost path." },
  { id: "lowestLifecycleCost", label: "Lowest lifecycle", description: "Favor the lowest Connolly maintenance and replacement total shown." },
  { id: "highestEfficiency", label: "Best efficiency", description: "Favor stronger study language around energy performance." },
  { id: "lowestMaintenance", label: "Low maintenance", description: "Favor the lower maintenance profiles in the study." },
  { id: "quietestOperation", label: "Quiet operation", description: "Favor options with quieter operational profiles." },
  { id: "simplestInstallation", label: "Simple install", description: "Favor lower installation complexity and simpler system packaging." },
  { id: "widestCampusFit", label: "Widest campus fit", description: "Favor options that apply across more district facilities." },
];

const hvacEfficiencyScores: Record<string, number> = {
  rtu: 2,
  "central-plant": 3,
  vrf: 5,
};

const hvacMaintenanceScores: Record<string, number> = {
  rtu: 2,
  "central-plant": 5,
  vrf: 3,
};

const hvacNoiseScores: Record<string, number> = {
  rtu: 2,
  "central-plant": 1,
  vrf: 5,
};

const hvacInstallationScores: Record<string, number> = {
  rtu: 5,
  "central-plant": 4,
  vrf: 2,
};

const hvacCampusFitScores: Record<string, number> = {
  rtu: 4,
  "central-plant": 1,
  vrf: 5,
};

type HvacRecommendationResult = {
  option: HvacOption;
  scenarioTotal: number;
  score: number;
  breakdown: Array<{ id: HvacRecommendationPriorityId; score: number }>;
};

type SavedHvacScenario = {
  id: string;
  name: string;
  note: string;
  option_id: string;
  created_at: string;
};

function normalizeAscending(value: number, min: number, max: number) {
  if (max === min) {
    return 1;
  }

  return (max - value) / (max - min);
}

function getHvacPriorityReason(
  priorityId: HvacRecommendationPriorityId,
  result: HvacRecommendationResult,
) {
  switch (priorityId) {
    case "lowestFirstCost":
      return result.option.addToBasePrice === 0
        ? "It stays in the base estimate with no add to base price."
        : `Its add to base price lands at ${formatCurrency(result.option.addToBasePrice)}.`;
    case "lowestLifecycleCost":
      return `Its best Connolly lifecycle total is ${formatCurrency(result.scenarioTotal)} in the study table.`;
    case "highestEfficiency":
      return result.option.metrics.energyEfficiency === "High"
        ? "It carries the strongest efficiency story in the comparison."
        : `Its study efficiency rating is ${result.option.metrics.energyEfficiency.toLowerCase()}.`;
    case "lowestMaintenance":
      return `Its maintenance range is listed at ${result.option.maintenancePerMonth}.`;
    case "quietestOperation":
      return `Its noise profile is framed as ${result.option.metrics.noise.toLowerCase()}.`;
    case "simplestInstallation":
      return `Its installation complexity is described as ${result.option.metrics.installationComplexity.toLowerCase()}.`;
    case "widestCampusFit":
      return `It applies to ${result.option.availability.toLowerCase()}, giving it broader district fit.`;
    default:
      return result.option.summary;
  }
}

export function HvacDashboard() {
  const themeVars = {
    "--core-green": "#008348",
    "--core-green-200": "#86d2ac",
    "--concrete": "#f2f3f3",
    "--foreground": "#161616",
    "--muted": "#5b6160",
    "--border": "rgba(17, 17, 17, 0.1)",
    "--shadow": "0 24px 60px rgba(0, 0, 0, 0.08)",
  } as CSSProperties;

  const [selectedOptionId, setSelectedOptionId] = useState("rtu");
  const [activeSectionId, setActiveSectionId] = useState<HvacRenderableSectionId>("overview");
  const [activeDecisionToolViewId, setActiveDecisionToolViewId] = useState<HvacDecisionToolViewId>("scenario-picker");
  const [selectedPriorityIds, setSelectedPriorityIds] = useState<HvacRecommendationPriorityId[]>([]);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [savedScenarios, setSavedScenarios] = useState<SavedHvacScenario[]>([]);
  const [savedScenarioName, setSavedScenarioName] = useState("");
  const [savedScenarioNote, setSavedScenarioNote] = useState("");
  const [savedScenarioMessage, setSavedScenarioMessage] = useState("");
  const [isLoadingSavedScenarios, setIsLoadingSavedScenarios] = useState(false);
  const [isSavingScenario, setIsSavingScenario] = useState(false);
  const selectedOption = getOption(selectedOptionId);
  const selectedScenarios = getScenarios(selectedOptionId);
  const selectedLifecycleTotal = Math.min(...selectedScenarios.map((scenario) => scenario.totalCost));
  const selectedOptionImage = hvacSourceImages[selectedOptionId];
  const activeSavedScenario = savedScenarios.find((scenario) => scenario.option_id === selectedOptionId);
  const isSupabaseConfigured =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const supabase = useMemo(
    () => (isSupabaseConfigured ? createSupabaseBrowserClient() : null),
    [isSupabaseConfigured],
  );
  const defaultSavedScenarioName = selectedOption ? `${selectedOption.shortLabel} review path` : "";

  const togglePriority = (priorityId: HvacRecommendationPriorityId) => {
    setSelectedPriorityIds((current) =>
      current.includes(priorityId) ? current.filter((id) => id !== priorityId) : [...current, priorityId],
    );
  };

  const recommendation = useMemo(() => {
    const activePriorityIds = [...selectedPriorityIds];

    if (activePriorityIds.length === 0) {
      return {
        activePriorityIds,
        primaryResult: null as HvacRecommendationResult | null,
        secondaryResult: null as HvacRecommendationResult | null,
      };
    }

    const lifecycleTotals = hvacOptions.map((option) => Math.min(...getScenarios(option.id).map((scenario) => scenario.totalCost)));
    const addToBaseValues = hvacOptions.map((option) => option.addToBasePrice);
    const minLifecycle = Math.min(...lifecycleTotals);
    const maxLifecycle = Math.max(...lifecycleTotals);
    const minFirstCost = Math.min(...addToBaseValues);
    const maxFirstCost = Math.max(...addToBaseValues);

    const ranked = hvacOptions
      .map((option) => {
        const scenarioTotal = Math.min(...getScenarios(option.id).map((scenario) => scenario.totalCost));
        const breakdown = activePriorityIds.map((priorityId) => {
          switch (priorityId) {
            case "lowestFirstCost":
              return { id: priorityId, score: normalizeAscending(option.addToBasePrice, minFirstCost, maxFirstCost) * 30 };
            case "lowestLifecycleCost":
              return { id: priorityId, score: normalizeAscending(scenarioTotal, minLifecycle, maxLifecycle) * 30 };
            case "highestEfficiency":
              return { id: priorityId, score: (hvacEfficiencyScores[option.id] ?? 3) * 5 };
            case "lowestMaintenance":
              return { id: priorityId, score: (hvacMaintenanceScores[option.id] ?? 3) * 5 };
            case "quietestOperation":
              return { id: priorityId, score: (hvacNoiseScores[option.id] ?? 3) * 4 };
            case "simplestInstallation":
              return { id: priorityId, score: (hvacInstallationScores[option.id] ?? 3) * 4 };
            case "widestCampusFit":
              return { id: priorityId, score: (hvacCampusFitScores[option.id] ?? 3) * 4 };
            default:
              return { id: priorityId, score: 0 };
          }
        });

        return {
          option,
          scenarioTotal,
          breakdown: [...breakdown].sort((a, b) => b.score - a.score),
          score: breakdown.reduce((total, entry) => total + entry.score, 0),
        } satisfies HvacRecommendationResult;
      })
      .sort((a, b) => b.score - a.score || a.option.addToBasePrice - b.option.addToBasePrice);

    return {
      activePriorityIds,
      primaryResult: ranked[0] ?? null,
      secondaryResult: ranked[1] ?? null,
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
      setSavedScenarios([]);
      return;
    }

    let isCancelled = false;
    setIsLoadingSavedScenarios(true);
    setSavedScenarioMessage("");

    void supabase
      .from("saved_hvac_scenarios")
      .select("id, name, note, option_id, created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (isCancelled) {
          return;
        }

        if (error) {
          setSavedScenarioMessage(error.message);
          setSavedScenarios([]);
        } else {
          setSavedScenarios((data ?? []) as SavedHvacScenario[]);
        }

        setIsLoadingSavedScenarios(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [supabase, supabaseUser]);

  const handleSaveScenario = async () => {
    if (!supabase || !supabaseUser || !selectedOption) {
      return;
    }

    const scenarioName = savedScenarioName.trim() || defaultSavedScenarioName;

    if (!scenarioName) {
      setSavedScenarioMessage("Enter a name before saving this HVAC scenario.");
      return;
    }

    setIsSavingScenario(true);
    setSavedScenarioMessage("");

    const { data, error } = await supabase
      .from("saved_hvac_scenarios")
      .insert({
        user_id: supabaseUser.id,
        name: scenarioName,
        note: savedScenarioNote.trim(),
        option_id: selectedOptionId,
      })
      .select("id, name, note, option_id, created_at")
      .single();

    if (error) {
      setSavedScenarioMessage(error.message);
      setIsSavingScenario(false);
      return;
    }

    setSavedScenarios((current) => [data as SavedHvacScenario, ...current]);
    setSavedScenarioName("");
    setSavedScenarioNote("");
    setSavedScenarioMessage("HVAC scenario saved to your shared workspace.");
    setIsSavingScenario(false);
  };

  const handleDeleteScenario = async (scenarioId: string) => {
    if (!supabase) {
      return;
    }

    setSavedScenarioMessage("");

    const { error } = await supabase.from("saved_hvac_scenarios").delete().eq("id", scenarioId);

    if (error) {
      setSavedScenarioMessage(error.message);
      return;
    }

    setSavedScenarios((current) => current.filter((scenario) => scenario.id !== scenarioId));
  };

  useEffect(() => {
    document.title = "CORE Pre-Construction Dashboard | HVAC";
  }, []);

  const activeSection = hvacSections.find((section) => section.id === activeSectionId) ?? hvacSections[0];

  if (!selectedOption) {
    return null;
  }

  return (
    <>
    <div className="print-report hidden print:block">
      <div className="print-report__sheet mx-auto bg-white text-black">
        <div className="border-b border-black/15 pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#008348]">CORE Construction</p>
          <h1 className="mt-2 text-2xl font-bold">HVAC Option Report</h1>
          <p className="mt-2 text-xs text-black/70">Precon Dashboard for Tempe Curry and Connolly Renovations</p>
          <p className="mt-1 text-xs text-black/70">{new Date().toLocaleDateString()}</p>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#008348]">Selected Option</p>
          <div className="mt-3 rounded-2xl border border-black/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/55">HVAC System</p>
            <p className="mt-1 text-base font-bold">{selectedOption.name}</p>
          </div>
          {activeSavedScenario?.note ? (
            <div className="mt-3 rounded-2xl border border-black/10 bg-[#f2f3f3] px-3 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#008348]">Saved Note</p>
              <p className="mt-1 text-xs leading-5 text-black/75">{activeSavedScenario.note}</p>
            </div>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-black/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/55">Base Price Impact</p>
            <p className="mt-1 text-base font-bold">
              {selectedOption.addToBasePrice === 0 ? "Included" : formatCurrency(selectedOption.addToBasePrice)}
            </p>
          </div>
          <div className="rounded-2xl border border-black/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/55">Availability</p>
            <p className="mt-1 text-base font-bold">{selectedOption.availability}</p>
          </div>
          <div className="rounded-2xl border border-black/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/55">Life Expectancy</p>
            <p className="mt-1 text-sm font-bold leading-5">{selectedOption.lifeExpectancy}</p>
          </div>
          <div className="rounded-2xl border border-black/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/55">Best Lifecycle Total</p>
            <p className="mt-1 text-base font-bold">{formatCurrency(selectedLifecycleTotal)}</p>
          </div>
        </div>

        {selectedOptionImage ? (
          <div className="mt-5 rounded-2xl border border-black/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#008348]">Source Study Image</p>
            <div className="mt-3 overflow-hidden rounded-xl border border-black/10 bg-[#f2f3f3] p-2">
              <img src={selectedOptionImage.src} alt={selectedOptionImage.alt} className="h-44 w-full rounded-lg object-contain" />
            </div>
          </div>
        ) : null}

        <div className="print-keep-together mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-black/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#008348]">Advantages</p>
            <div className="mt-2 space-y-2">
              {selectedOption.pros.map((item, index) => (
                <div key={`print-hvac-pro-${index}`} className="flex gap-2 text-xs leading-5 text-black/75">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#008348]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-black/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#008348]">Considerations</p>
            <div className="mt-2 space-y-2">
              {selectedOption.cons.map((item, index) => (
                <div key={`print-hvac-con-${index}`} className="flex gap-2 text-xs leading-5 text-black/75">
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
                HVAC Options Dashboard
              </h1>
              <p className="mt-2 text-sm leading-6 text-white/72">
                Interactive mechanical-system comparison for upfront cost, maintenance burden, and replacement outlook.
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="rounded-[2rem] border border-[var(--border)] bg-white/80 p-5 shadow-[var(--shadow)] backdrop-blur">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">HVAC Sections</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)]">{activeSection.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Use these internal tabs to focus on one part of the HVAC dashboard at a time.
            </p>
          </div>
          <div className="rounded-full bg-[var(--concrete)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]">
            {activeSection.eyebrow}
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {hvacSections.map((section) => {
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
        <section className="overflow-hidden rounded-[2rem] border border-white/50 bg-[linear-gradient(135deg,#0b0b0b_0%,#171717_56%,#008348_160%)] px-6 py-8 shadow-[0_28px_80px_rgba(0,0,0,0.18)] sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--core-green-200)]">Mechanical Decision Support</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Compare rooftop units, a central plant, and VRF without flipping through maintenance spreadsheets.
              </h2>
            </div>
            <div className="grid gap-4">
              <div className="rounded-[1.75rem] border border-white/12 bg-white/8 p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Base estimate path</p>
                <p className="mt-2 text-2xl font-bold">RTUs</p>
                <p className="mt-2 text-sm leading-6 text-white/72">
                  Rooftop package units are included in CORE&apos;s base price schematic design estimate at {formatCurrency(6550490)} and carry no add to base price.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/12 bg-white/8 p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Study caveat</p>
                <p className="mt-2 text-2xl font-bold">Connolly lifecycle only</p>
                <p className="mt-2 text-sm leading-6 text-white/72">
                  The maintenance and replacement table applies to Connolly only, and the central plant option is not considered for Curry.
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {activeSectionId === "decision-tool" ? (
      <div className="space-y-6">
      <Card>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {hvacDecisionToolViews.map((view) => {
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
              Check the priorities that matter most and the app will rank the HVAC systems in this study.
            </p>
            <div className="mt-6 grid gap-3">
              {hvacRecommendationPriorities.map((priority) => {
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
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)]">Best-fit HVAC option</h3>
              </div>
              <div className="rounded-full bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                Grounded in study data
              </div>
            </div>

            {recommendation.primaryResult ? (
              <>
                <div className="mt-6 rounded-[1.5rem] border border-[var(--border)] bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--core-green)]">Recommended option</p>
                  <h4 className="mt-2 text-2xl font-bold text-[var(--foreground)]">{recommendation.primaryResult.option.name}</h4>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    {recommendation.primaryResult.option.summary}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    <span className="rounded-full bg-[var(--concrete)] px-3 py-1">
                      {recommendation.primaryResult.option.addToBasePrice === 0 ? "In base price" : `${formatCurrency(recommendation.primaryResult.option.addToBasePrice)} add`}
                    </span>
                    <span className="rounded-full bg-[var(--concrete)] px-3 py-1">
                      {formatCurrency(recommendation.primaryResult.scenarioTotal)} lifecycle
                    </span>
                    <span className="rounded-full bg-[var(--concrete)] px-3 py-1">
                      {recommendation.primaryResult.option.availability}
                    </span>
                  </div>
                  {recommendation.primaryResult.option.id !== selectedOptionId ? (
                    <button
                      type="button"
                      onClick={() =>
                        startTransition(() => {
                          setSelectedOptionId(recommendation.primaryResult!.option.id);
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
                          <span>{getHvacPriorityReason(entry.id, recommendation.primaryResult!)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--core-green)]">Tradeoffs</p>
                    <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
                      {recommendation.primaryResult.option.cons.slice(0, 3).map((item, index) => (
                        <div key={`hvac-tradeoff-${index}`} className="flex items-start gap-3">
                          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-black/55" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {recommendation.secondaryResult ? (
                  <div className="mt-6 rounded-[1.5rem] border border-[var(--border)] bg-white p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--core-green)]">Runner-up</p>
                    <h4 className="mt-2 text-xl font-bold text-[var(--foreground)]">{recommendation.secondaryResult.option.name}</h4>
                    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                      Strong alternative if the team wants a different balance between first cost, lifecycle, and system complexity.
                    </p>
                  </div>
                ) : null}
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
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">Saved Scenarios</p>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)]">Keep HVAC options for team review</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Save the current HVAC choice so signed-in teammates can return to shortlist options quickly.
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
                  value={savedScenarioName}
                  onChange={(event) => setSavedScenarioName(event.target.value)}
                  placeholder={defaultSavedScenarioName || "Name this HVAC scenario"}
                  className="w-full rounded-[1.25rem] border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--core-green)]"
                />
                <textarea
                  value={savedScenarioNote}
                  onChange={(event) => setSavedScenarioNote(event.target.value)}
                  placeholder="Optional note for why this scenario matters"
                  rows={3}
                  className="w-full rounded-[1.25rem] border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--core-green)]"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => void handleSaveScenario()}
                    disabled={!supabaseUser || isSavingScenario}
                    className="rounded-full bg-[var(--core-green)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingScenario ? "Saving..." : "Save current scenario"}
                  </button>
                </div>
              </div>

              {savedScenarioMessage ? (
                <p className="mt-4 rounded-[1rem] border border-[color:rgba(0,131,72,0.2)] bg-white px-4 py-3 text-sm text-[var(--foreground)]">
                  {savedScenarioMessage}
                </p>
              ) : null}

              <div className="mt-5 grid gap-3">
                {isLoadingSavedScenarios ? (
                  <div className="rounded-[1.25rem] border border-dashed border-[var(--border)] bg-white px-4 py-5 text-sm text-[var(--muted)]">
                    Loading saved HVAC scenarios...
                  </div>
                ) : savedScenarios.length > 0 ? (
                  savedScenarios.map((scenario) => {
                    const isActive = scenario.option_id === selectedOptionId;
                    const scenarioOption = getOption(scenario.option_id);

                    return (
                      <div
                        key={scenario.id}
                        className={cn(
                          "rounded-[1.25rem] border bg-white p-4",
                          isActive ? "border-[var(--core-green)]" : "border-[var(--border)]",
                        )}
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-lg font-semibold text-[var(--foreground)]">{scenario.name}</h4>
                              {isActive ? (
                                <span className="rounded-full bg-[color:rgba(0,131,72,0.1)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--core-green)]">
                                  Active
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{scenarioOption?.name}</p>
                            {scenario.note ? (
                              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{scenario.note}</p>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {!isActive ? (
                              <button
                                type="button"
                                onClick={() => startTransition(() => setSelectedOptionId(scenario.option_id))}
                                className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                              >
                                Load scenario
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => void handleDeleteScenario(scenario.id)}
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
                    No saved HVAC scenarios yet. Save one from the current selection to start a shared shortlist.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-[1.25rem] border border-dashed border-[var(--border)] bg-white px-4 py-5 text-sm leading-6 text-[var(--muted)]">
              Add your Supabase URL and publishable key, then run the SQL in <code>supabase/setup.sql</code> to
              turn on shared HVAC scenario saving.
            </div>
          )}
        </Card>
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">System Selection</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)]">Choose an HVAC approach</h2>
          </div>
          <HvacSelector options={hvacOptions} selectedId={selectedOptionId} onSelect={setSelectedOptionId} />
        </Card>

        <Card className="bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(242,243,243,0.96))]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">Summary Card</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)]">{selectedOption.name}</h2>
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

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <MetricCard
                icon={<WalletCards className="h-5 w-5" />}
              label="Base Price Impact"
              value={selectedOption.addToBasePrice === 0 ? "Included" : formatCurrency(selectedOption.addToBasePrice)}
              note={`Directly reflects the study's pricing add relative to CORE's base price schematic design estimate of ${formatCurrency(6550490)}.`}
            />
            <MetricCard
              icon={<Building2 className="h-5 w-5" />}
              label="Availability"
              value={selectedOption.availability}
              note="Use this to separate district-wide options from Connolly-only approaches."
            />
            <MetricCard
              icon={<Clock3 className="h-5 w-5" />}
              label="Life Expectancy"
              value={selectedOption.lifeExpectancy}
              note="Pulled from the study's pros and cons matrix."
            />
            <MetricCard
              icon={<Wrench className="h-5 w-5" />}
              label="Best Lifecycle Total"
              value={formatCurrency(selectedLifecycleTotal)}
                note="Lowest total among the lifecycle scenarios shown for this option on the Connolly table."
              />
            </div>
            {selectedOptionImage ? (
              <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-white">
                <div className="px-4 pb-0 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--core-green)]">Source Study Image</p>
                </div>
                <div className="p-4 pt-4">
                  <LightboxImage src={selectedOptionImage.src} alt={selectedOptionImage.alt} width={700} height={500} />
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      </section>
      ) : null}
      </div>
      ) : null}

      {activeSectionId === "tradeoffs" ? (
      <section className="grid gap-6 xl:grid-cols-2">
        <DetailList title="Advantages" items={selectedOption.pros} />
        <DetailList title="Considerations" items={selectedOption.cons} />
        <Card>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">Study Metrics</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">Selected system snapshot</h2>
          </div>
          <div className="mt-6 grid gap-3">
            {Object.entries(selectedOption.metrics).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm">
                <span className="capitalize text-[var(--muted)]">{key.replace(/([A-Z])/g, " $1")}</span>
                <span className="font-semibold text-[var(--foreground)]">{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
      ) : null}

      {activeSectionId === "lifecycle" ? (
        <LifecycleTable scenarios={hvacLifecycleScenarios} selectedOptionId={selectedOptionId} />
      ) : null}

      {activeSectionId === "notes" ? (
      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">Study Notes</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">Important caveats</h2>
          </div>
          <div className="mt-6 grid gap-4">
            {hvacStudyNotes.slice(1).map((note, index) => (
              <div key={`note-${index}`} className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 text-sm leading-6 text-[var(--muted)]">
                {note}
              </div>
            ))}
          </div>
        </Card>
      </section>
      ) : null}
    </div>
    </>
  );
}
