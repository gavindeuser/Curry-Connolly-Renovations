"use client";

import type { CSSProperties } from "react";
import { startTransition, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Building2, CheckCircle2, Clock3, WalletCards } from "lucide-react";

import { Card } from "@/components/ui/card";
import { LightboxImage } from "@/components/ui/lightbox-image";
import {
  campusGuardrailQuantities,
  guardrailOptions,
  type GuardrailMountType,
  type GuardrailOption,
} from "@/lib/data/guardrail-preconstruction";
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn, formatCurrency } from "@/lib/utils/format";

const guardrailSections = [
  {
    id: "overview",
    label: "Overview",
    eyebrow: "Project Story",
    title: "Pricing summary and project takeaways",
  },
  {
    id: "option-explorer",
    label: "Option Explorer",
    eyebrow: "Material Library",
    title: "Compare the three guardrail directions",
  },
  {
    id: "decision-tool",
    label: "Decision Tool",
    eyebrow: "Selection",
    title: "Choose a railing system and mount type",
  },
  {
    id: "context",
    label: "Context",
    eyebrow: "Study Sheets",
    title: "Floor plans from the source study",
  },
] as const;

type GuardrailSectionId = (typeof guardrailSections)[number]["id"];

const guardrailDecisionToolViews = [
  {
    id: "scenario-picker",
    label: "Design Picker",
    eyebrow: "Selection",
    title: "Choose a guardrail option and mount type for the active scenario",
  },
  {
    id: "ai-helper",
    label: "AI Helper",
    eyebrow: "Recommendation",
    title: "Set priorities and get a best-fit guardrail suggestion",
  },
] as const;

type GuardrailDecisionToolViewId = (typeof guardrailDecisionToolViews)[number]["id"];

const guardrailSourceImages: Record<string, { src: string; alt: string }> = {
  pipe: {
    src: "/source-study-guardrails/pipe-railing.png",
    alt: "Pipe railing reference image from the guardrail pricing study",
  },
  plate: {
    src: "/source-study-guardrails/plate-railing.png",
    alt: "Steel plate railing reference image from the guardrail pricing study",
  },
  glass: {
    src: "/source-study-guardrails/glass-railing.png",
    alt: "Glass guardrail reference image from the guardrail pricing study",
  },
};

const guardrailContextSheets = [
  {
    id: "curry",
    label: "Curry floor plan",
    src: "/source-study-guardrails/curry-floor-plan.png",
    alt: "Curry campus floor plan from the guardrail pricing study",
  },
  {
    id: "connolly",
    label: "Connolly floor plan",
    src: "/source-study-guardrails/connolly-floor-plan.png",
    alt: "Connolly campus floor plan from the guardrail pricing study",
  },
];

type GuardrailPlanId = (typeof guardrailContextSheets)[number]["id"];

type GuardrailPlanAnnotation = {
  label: string;
  x: number;
  y: number;
};

type GuardrailPlanConfig = {
  id: GuardrailPlanId;
  label: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  isGuardrailPixel: (r: number, g: number, b: number) => boolean;
  annotations: GuardrailPlanAnnotation[];
};

type SavedGuardrailScenario = {
  id: string;
  name: string;
  note: string;
  option_id: string;
  mount_type: GuardrailMountType;
  created_at: string;
};

const guardrailPlanConfigs: Record<GuardrailPlanId, GuardrailPlanConfig> = {
  curry: {
    id: "curry",
    label: "Curry",
    src: "/source-study-guardrails/curry-floor-plan.png",
    alt: "Curry campus floor plan with guardrail path overlays",
    width: 850,
    height: 435,
    isGuardrailPixel: (r, g, b) => b > 150 && g > 60 && r < 90 && b - g > 45,
    annotations: [
      { label: "Classroom wings", x: 255, y: 70 },
      { label: "Connector run", x: 485, y: 214 },
      { label: "Admin / MP edge", x: 640, y: 90 },
    ],
  },
  connolly: {
    id: "connolly",
    label: "Connolly",
    src: "/source-study-guardrails/connolly-floor-plan.png",
    alt: "Connolly campus floor plan with guardrail path overlays",
    width: 848,
    height: 582,
    isGuardrailPixel: (r, g, b) => r > 85 && b > 140 && g < 90 && b - g > 70,
    annotations: [
      { label: "North classroom wing", x: 110, y: 46 },
      { label: "South classroom wing", x: 210, y: 355 },
      { label: "East classroom wing", x: 476, y: 66 },
      { label: "Track / courtyard edge", x: 505, y: 428 },
    ],
  },
};

type GuardrailRecommendationPriorityId =
  | "lowestCost"
  | "fastestInstall"
  | "lowestMaintenance"
  | "mostRefinedLook"
  | "concealedFasteners"
  | "highestDurability";

type GuardrailRecommendationPriority = {
  id: GuardrailRecommendationPriorityId;
  label: string;
  description: string;
};

const guardrailRecommendationPriorities: GuardrailRecommendationPriority[] = [
  { id: "lowestCost", label: "Lowest cost", description: "Favor the lowest conceptual cost per linear foot." },
  { id: "fastestInstall", label: "Fastest schedule", description: "Favor the shortest study installation duration." },
  { id: "lowestMaintenance", label: "Low maintenance", description: "Favor systems with the cleanest maintenance profile." },
  { id: "mostRefinedLook", label: "Most refined look", description: "Favor the strongest architectural finish and visual presence." },
  { id: "concealedFasteners", label: "Concealed fasteners", description: "Favor cleaner fastening conditions and less exposed hardware." },
  { id: "highestDurability", label: "Highest durability", description: "Favor robust long-term performance from the study notes." },
];

const guardrailPriorityScores: Record<GuardrailRecommendationPriorityId, Record<string, number>> = {
  lowestCost: { pipe: 5, plate: 2, glass: 1 },
  fastestInstall: { pipe: 5, plate: 4, glass: 1 },
  lowestMaintenance: { pipe: 5, plate: 5, glass: 2 },
  mostRefinedLook: { pipe: 2, plate: 4, glass: 5 },
  concealedFasteners: { pipe: 1, plate: 1, glass: 5 },
  highestDurability: { pipe: 5, plate: 5, glass: 3 },
};

function getOption(optionId: string) {
  return guardrailOptions.find((option) => option.id === optionId) ?? guardrailOptions[0];
}

function getCostForMount(option: GuardrailOption, mountType: GuardrailMountType) {
  return mountType === "side-mounted" ? option.sideMountedCostPerLf : option.topMountedCostPerLf;
}

function formatMountLabel(mountType: GuardrailMountType) {
  return mountType === "side-mounted" ? "Side-mounted" : "Top-mounted";
}

function SelectorCard({
  option,
  selected,
  mountType,
  onSelect,
}: {
  option: GuardrailOption;
  selected: boolean;
  mountType: GuardrailMountType;
  onSelect: (optionId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      className={cn(
        "rounded-[1.75rem] border p-4 text-left transition",
        selected
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
        {selected ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-[var(--core-green)]" /> : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        <span className="rounded-full bg-[var(--concrete)] px-3 py-1">{formatCurrency(getCostForMount(option, mountType))}/LF</span>
        <span className="rounded-full bg-[var(--concrete)] px-3 py-1">{option.installationDuration}</span>
        <span className="rounded-full bg-[var(--concrete)] px-3 py-1">{option.fastenerType}</span>
      </div>
    </button>
  );
}

function DetailList({ title, items, tone }: { title: string; items: string[]; tone: "positive" | "caution" }) {
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

function ExplorerCard({ option }: { option: GuardrailOption }) {
  const sourceImage = guardrailSourceImages[option.id];

  return (
    <details className="group rounded-[1.5rem] border border-[var(--border)] bg-white p-5 open:shadow-[var(--shadow)]">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--core-green)]">Guardrail System</p>
          <h3 className="mt-2 text-xl font-semibold text-[var(--foreground)]">{option.name}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{option.summary}</p>
        </div>
        <div className="rounded-full border border-[var(--border)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)] transition group-open:bg-[var(--concrete)]">
          Expand
        </div>
      </summary>
      <div className="mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[1.25rem] bg-[var(--concrete)] p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Side-mounted cost</p>
              <p className="mt-1 text-lg font-bold">{formatCurrency(option.sideMountedCostPerLf)}/LF</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Top-mounted cost</p>
              <p className="mt-1 text-lg font-bold">{formatCurrency(option.topMountedCostPerLf)}/LF</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Schedule influence</p>
              <p className="mt-1 text-sm font-semibold">{option.installationDuration}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Fastener condition</p>
              <p className="mt-1 text-sm font-semibold">{option.fastenerType}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
            {Object.entries(option.metrics).map(([key, value]) => (
              <div key={key} className="grid grid-cols-[auto,minmax(0,1fr)] items-center gap-3 rounded-xl bg-white px-3 py-2">
                <span className="capitalize">{key.replace(/[A-Z]/g, (match) => ` ${match.toLowerCase()}`)}</span>
                <span className="text-right font-semibold text-[var(--foreground)]">{value}</span>
              </div>
            ))}
          </div>
          {sourceImage ? (
            <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-white">
              <div className="px-4 pb-0 pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--core-green)]">Source Study Image</p>
              </div>
              <div className="p-4 pt-4">
                <LightboxImage src={sourceImage.src} alt={sourceImage.alt} width={700} height={480} />
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

function GuardrailPlanViewer({
  plan,
  showGuardrails,
  showLabels,
}: {
  plan: GuardrailPlanConfig;
  showGuardrails: boolean;
  showLabels: boolean;
}) {
  const [processedImages, setProcessedImages] = useState<{ baseSrc: string; overlaySrc: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const sourceImage = new window.Image();
    sourceImage.crossOrigin = "anonymous";
    sourceImage.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = sourceImage.width;
      canvas.height = sourceImage.height;

      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }

      context.drawImage(sourceImage, 0, 0);
      const sourceImageData = context.getImageData(0, 0, canvas.width, canvas.height);

      const baseImageData = context.createImageData(canvas.width, canvas.height);
      const overlayImageData = context.createImageData(canvas.width, canvas.height);

      for (let index = 0; index < sourceImageData.data.length; index += 4) {
        const r = sourceImageData.data[index];
        const g = sourceImageData.data[index + 1];
        const b = sourceImageData.data[index + 2];
        const a = sourceImageData.data[index + 3];
        const isGuardrail = plan.isGuardrailPixel(r, g, b);

        if (isGuardrail) {
          baseImageData.data[index] = 255;
          baseImageData.data[index + 1] = 255;
          baseImageData.data[index + 2] = 255;
          baseImageData.data[index + 3] = a;

          overlayImageData.data[index] = r;
          overlayImageData.data[index + 1] = g;
          overlayImageData.data[index + 2] = b;
          overlayImageData.data[index + 3] = a;
        } else {
          baseImageData.data[index] = r;
          baseImageData.data[index + 1] = g;
          baseImageData.data[index + 2] = b;
          baseImageData.data[index + 3] = a;

          overlayImageData.data[index] = 0;
          overlayImageData.data[index + 1] = 0;
          overlayImageData.data[index + 2] = 0;
          overlayImageData.data[index + 3] = 0;
        }
      }

      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = canvas.width;
      exportCanvas.height = canvas.height;
      const exportContext = exportCanvas.getContext("2d");
      if (!exportContext) {
        return;
      }

      exportContext.putImageData(baseImageData, 0, 0);
      const baseSrc = exportCanvas.toDataURL("image/png");

      exportContext.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
      exportContext.putImageData(overlayImageData, 0, 0);
      const overlaySrc = exportCanvas.toDataURL("image/png");

      if (!cancelled) {
        setProcessedImages({ baseSrc, overlaySrc });
      }
    };
    sourceImage.src = plan.src;

    return () => {
      cancelled = true;
    };
  }, [plan]);

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-white">
      <div className="relative">
        <img src={processedImages?.baseSrc ?? plan.src} alt={plan.alt} className="h-auto w-full" />
        {showGuardrails && processedImages ? (
          <img src={processedImages.overlaySrc} alt="" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
        ) : null}
        {showLabels
          ? plan.annotations.map((annotation) => (
              <div
                key={`${plan.id}-${annotation.label}`}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-black/82 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_10px_24px_rgba(0,0,0,0.25)]"
                style={{
                  left: `${(annotation.x / plan.width) * 100}%`,
                  top: `${(annotation.y / plan.height) * 100}%`,
                }}
              >
                {annotation.label}
              </div>
            ))
          : null}
      </div>
    </div>
  );
}

export function GuardrailDashboard() {
  const [activeSection, setActiveSection] = useState<GuardrailSectionId>("overview");
  const [activeDecisionToolViewId, setActiveDecisionToolViewId] = useState<GuardrailDecisionToolViewId>("scenario-picker");
  const [selectedOptionId, setSelectedOptionId] = useState<string>(guardrailOptions[0]?.id ?? "pipe");
  const [selectedMountType, setSelectedMountType] = useState<GuardrailMountType>("side-mounted");
  const [selectedPriorities, setSelectedPriorities] = useState<GuardrailRecommendationPriorityId[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<GuardrailPlanId>("curry");
  const [showPlanGuardrails, setShowPlanGuardrails] = useState(true);
  const [showPlanLabels, setShowPlanLabels] = useState(true);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [savedScenarios, setSavedScenarios] = useState<SavedGuardrailScenario[]>([]);
  const [savedScenarioName, setSavedScenarioName] = useState("");
  const [savedScenarioNote, setSavedScenarioNote] = useState("");
  const [savedScenarioMessage, setSavedScenarioMessage] = useState("");
  const [isLoadingSavedScenarios, setIsLoadingSavedScenarios] = useState(false);
  const [isSavingScenario, setIsSavingScenario] = useState(false);

  const selectedOption = getOption(selectedOptionId);
  const selectedImage = guardrailSourceImages[selectedOption.id];
  const selectedPlan = guardrailPlanConfigs[selectedPlanId];
  const isSupabaseConfigured =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const supabase = useMemo(
    () => (isSupabaseConfigured ? createSupabaseBrowserClient() : null),
    [isSupabaseConfigured],
  );
  const defaultSavedScenarioName = selectedOption
    ? `${selectedOption.shortLabel} - ${formatMountLabel(selectedMountType)}`
    : "";

  const selectedCostPerLf = getCostForMount(selectedOption, selectedMountType);
  const curryTotal = selectedCostPerLf * campusGuardrailQuantities.curry;
  const connollyTotal = selectedCostPerLf * campusGuardrailQuantities.connolly;

  const recommendedScenario = useMemo(() => {
    const activePrioritySet = new Set(selectedPriorities);

    if (activePrioritySet.size === 0) {
      return null;
    }

    const scoredOptions = guardrailOptions
      .map((option) => {
        let score = 0;

        activePrioritySet.forEach((priorityId) => {
          score += guardrailPriorityScores[priorityId][option.id] ?? 0;
        });

        return { option, score };
      })
      .sort((a, b) => b.score - a.score);

    const [winner, runnerUp] = scoredOptions;
    const winnerPriorities = Array.from(activePrioritySet).filter(
      (priorityId) => (guardrailPriorityScores[priorityId][winner.option.id] ?? 0) >= 4,
    );
    const appliedPriorities = guardrailRecommendationPriorities.filter((priority) => winnerPriorities.includes(priority.id));

    return {
      winner: winner.option,
      runnerUp: runnerUp?.option ?? null,
      winnerMountType:
        activePrioritySet.has("lowestCost") || activePrioritySet.has("fastestInstall") ? ("top-mounted" as GuardrailMountType) : ("side-mounted" as GuardrailMountType),
      reasons:
        appliedPriorities.length > 0
          ? appliedPriorities.map((priority) => priority.label)
          : guardrailRecommendationPriorities
              .filter((priority) => activePrioritySet.has(priority.id))
              .slice(0, 2)
              .map((priority) => priority.label),
      activePriorities: Array.from(activePrioritySet),
    };
  }, [selectedPriorities]);

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
      .from("saved_guardrail_scenarios")
      .select("id, name, note, option_id, mount_type, created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (isCancelled) {
          return;
        }

        if (error) {
          setSavedScenarioMessage(error.message);
          setSavedScenarios([]);
        } else {
          setSavedScenarios((data ?? []) as SavedGuardrailScenario[]);
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
      setSavedScenarioMessage("Enter a name before saving this guardrail scenario.");
      return;
    }

    setIsSavingScenario(true);
    setSavedScenarioMessage("");

    const { data, error } = await supabase
      .from("saved_guardrail_scenarios")
      .insert({
        user_id: supabaseUser.id,
        name: scenarioName,
        note: savedScenarioNote.trim(),
        option_id: selectedOptionId,
        mount_type: selectedMountType,
      })
      .select("id, name, note, option_id, mount_type, created_at")
      .single();

    if (error) {
      setSavedScenarioMessage(error.message);
      setIsSavingScenario(false);
      return;
    }

    setSavedScenarios((current) => [data as SavedGuardrailScenario, ...current]);
    setSavedScenarioName("");
    setSavedScenarioNote("");
    setSavedScenarioMessage("Guardrail scenario saved to your shared workspace.");
    setIsSavingScenario(false);
  };

  const handleDeleteScenario = async (scenarioId: string) => {
    if (!supabase) {
      return;
    }

    setSavedScenarioMessage("");

    const { error } = await supabase.from("saved_guardrail_scenarios").delete().eq("id", scenarioId);

    if (error) {
      setSavedScenarioMessage(error.message);
      return;
    }

    setSavedScenarios((current) => current.filter((scenario) => scenario.id !== scenarioId));
  };

  return (
    <div
      className="space-y-8 pb-10"
      style={
        {
          "--core-green": "#008348",
          "--core-green-200": "#86d2ac",
          "--concrete": "#f2f3f3",
          "--foreground": "#161616",
          "--muted": "#5b6160",
          "--border": "rgba(17, 17, 17, 0.1)",
          "--shadow": "0 24px 60px rgba(0, 0, 0, 0.08)",
          "--surface": "rgba(255,255,255,0.92)",
        } as CSSProperties
      }
    >
      <header className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(90deg,#000000_0%,#0d0d0d_55%,#141414_100%)] shadow-[0_28px_80px_rgba(0,0,0,0.22)]">
        <div className="flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex h-16 w-32 items-center rounded-[1.25rem] bg-[#050505] px-4 py-3 ring-1 ring-white/10 sm:h-20 sm:w-40 sm:px-5">
              <img src="/logo.svg" alt="CORE Logo" className="h-full w-full object-contain object-left" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--core-green-200)]">CORE Construction</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">Guardrail Options Dashboard</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/72">
                Interactive comparison space for exterior guardrail directions across Curry and Connolly, grounded in the March 25, 2025 pricing study.
              </p>
            </div>
          </div>
        </div>
      </header>

      <Card>
        <div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">Guardrail Sections</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Study-backed comparison for cost, mount type, and design intent
            </h2>
          </div>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {guardrailSections.map((section) => {
            const isActive = section.id === activeSection;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
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
      </Card>

      {activeSection === "overview" ? (
        <section className="overflow-hidden rounded-[2rem] border border-white/50 bg-[linear-gradient(135deg,#0b0b0b_0%,#171717_56%,#008348_160%)] px-6 py-8 shadow-[0_28px_80px_rgba(0,0,0,0.18)] sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--core-green-200)]">Guardrail Decision Support</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Compare exterior guardrail directions quickly without digging back through the pricing exercise.
              </h2>
            </div>
            <div className="grid gap-4">
              <div className="rounded-[1.75rem] border border-white/12 bg-white/8 p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Most economical path</p>
                <p className="mt-2 text-2xl font-bold">Pipe Rail</p>
                <p className="mt-2 text-sm leading-6 text-white/72">
                  Pipe railing is the lowest-cost direction in the study and the quickest installation path at 1 week.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/12 bg-white/8 p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Study caveat</p>
                <p className="mt-2 text-2xl font-bold">Escalation + field changes</p>
                <p className="mt-2 text-sm leading-6 text-white/72">
                  The study notes 3% to 5% escalation every three months past March 31, 2025, and also notes these systems cannot be field modified.
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {activeSection === "option-explorer" ? (
        <div className="space-y-4">
          {guardrailOptions.map((option) => (
            <ExplorerCard key={option.id} option={option} />
          ))}
        </div>
      ) : null}

      {activeSection === "decision-tool" ? (
        <div className="space-y-6">
          <Card>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {guardrailDecisionToolViews.map((view) => {
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
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)]">Recommendation assistant for guardrail direction</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                  Check the priorities that matter most and the app will suggest the best-fit guardrail option using the study data already shown in this tab.
                </p>
                <div className="mt-6 grid gap-3">
                  {guardrailRecommendationPriorities.map((priority) => {
                    const isChecked = selectedPriorities.includes(priority.id);

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
                          onChange={() =>
                            setSelectedPriorities((current) =>
                              current.includes(priority.id)
                                ? current.filter((item) => item !== priority.id)
                                : [...current, priority.id],
                            )
                          }
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

              {recommendedScenario ? (
                <div className="rounded-[1.75rem] border border-[color:rgba(0,131,72,0.2)] bg-[linear-gradient(135deg,rgba(0,131,72,0.1),rgba(255,255,255,0.95))] p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">AI-Style Feedback</p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)]">
                    Recommended option: {recommendedScenario.winner.name}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    Best fit for {recommendedScenario.reasons.join(", ").toLowerCase()} based on the study cost, installation duration, maintenance profile, and visual differentiation.
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    Suggested mount type: <span className="font-semibold text-[var(--foreground)]">{formatMountLabel(recommendedScenario.winnerMountType)}</span>.
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    Runner-up: <span className="font-semibold text-[var(--foreground)]">{recommendedScenario.runnerUp?.name ?? "Not available"}</span>.
                  </p>
                  {!(recommendedScenario.winner.id === selectedOptionId && recommendedScenario.winnerMountType === selectedMountType) ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          startTransition(() => {
                            setSelectedOptionId(recommendedScenario.winner.id);
                            setSelectedMountType(recommendedScenario.winnerMountType);
                          });
                        }}
                        className="rounded-full bg-[var(--core-green)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                      >
                        Apply recommendation
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-[var(--border)] bg-white px-4 py-5 text-sm leading-6 text-[var(--muted)]">
                  Select one or more priorities to generate a recommendation.
                </div>
              )}
            </div>
          </Card>
          ) : null}

          {activeDecisionToolViewId === "scenario-picker" ? (
          <div className="space-y-6">
            <Card>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">Saved Scenarios</p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)]">Keep guardrail options for team review</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Save the current option plus mount type so signed-in teammates can return to shortlist directions quickly.
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
                      placeholder={defaultSavedScenarioName || "Name this guardrail scenario"}
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
                        Loading saved guardrail scenarios...
                      </div>
                    ) : savedScenarios.length > 0 ? (
                      savedScenarios.map((scenario) => {
                        const isActive =
                          scenario.option_id === selectedOptionId && scenario.mount_type === selectedMountType;
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
                                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                                  {scenarioOption?.name} · {formatMountLabel(scenario.mount_type)}
                                </p>
                                {scenario.note ? (
                                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{scenario.note}</p>
                                ) : null}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {!isActive ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      startTransition(() => {
                                        setSelectedOptionId(scenario.option_id);
                                        setSelectedMountType(scenario.mount_type);
                                      })
                                    }
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
                        No saved guardrail scenarios yet. Save one from the current selection to start a shared shortlist.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="mt-5 rounded-[1.25rem] border border-dashed border-[var(--border)] bg-white px-4 py-5 text-sm leading-6 text-[var(--muted)]">
                  Add your Supabase URL and publishable key, then run the SQL in <code>supabase/setup.sql</code> to
                  turn on shared guardrail scenario saving.
                </div>
              )}
            </Card>
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">Material Selection Tool</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)]">Choose the active guardrail scenario</h2>
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Mount type</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {(["side-mounted", "top-mounted"] as GuardrailMountType[]).map((mountType) => {
                    const isSelected = mountType === selectedMountType;

                    return (
                      <button
                        key={mountType}
                        type="button"
                        onClick={() => setSelectedMountType(mountType)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm font-semibold transition",
                          isSelected
                            ? "border-[var(--core-green)] bg-[var(--core-green)] text-white"
                            : "border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--core-green)] hover:text-[var(--core-green)]",
                        )}
                      >
                        {formatMountLabel(mountType)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                {guardrailOptions.map((option) => (
                  <SelectorCard
                    key={option.id}
                    option={option}
                    selected={option.id === selectedOptionId}
                    mountType={selectedMountType}
                    onSelect={setSelectedOptionId}
                  />
                ))}
              </div>
            </Card>

            <Card>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">Summary Card</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)]">{selectedOption.name}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{selectedOption.summary}</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <MetricCard
                  icon={<WalletCards className="h-5 w-5" />}
                  label="Conceptual cost"
                  value={`${formatCurrency(selectedCostPerLf)}/LF`}
                  note={`${formatMountLabel(selectedMountType)} pricing path currently selected.`}
                />
                <MetricCard
                  icon={<Clock3 className="h-5 w-5" />}
                  label="Schedule"
                  value={selectedOption.installationDuration}
                  note="Duration shown in the study pricing matrix for this option."
                />
                <MetricCard
                  icon={<Building2 className="h-5 w-5" />}
                  label="Curry total"
                  value={formatCurrency(curryTotal)}
                  note={`Based on ${campusGuardrailQuantities.curry.toLocaleString()} LF of guardrail.`}
                />
                <MetricCard
                  icon={<Building2 className="h-5 w-5" />}
                  label="Connolly total"
                  value={formatCurrency(connollyTotal)}
                  note={`Based on ${campusGuardrailQuantities.connolly.toLocaleString()} LF of guardrail.`}
                />
              </div>
              <div className="mt-5 rounded-[1.5rem] border border-[var(--border)] bg-[var(--concrete)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Fastener condition</p>
                <p className="mt-2 text-lg font-bold text-[var(--foreground)]">{selectedOption.fastenerType}</p>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  Visual character: <span className="font-semibold text-[var(--foreground)]">{selectedOption.metrics.visualCharacter}</span>
                </p>
              </div>
              {selectedImage ? (
                <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-white">
                  <div className="px-4 pb-0 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--core-green)]">Source Study Image</p>
                  </div>
                  <div className="p-4 pt-4">
                    <LightboxImage src={selectedImage.src} alt={selectedImage.alt} width={700} height={480} />
                  </div>
                </div>
              ) : null}
            </Card>
          </div>
          </div>
          ) : null}
        </div>
      ) : null}

      {activeSection === "context" ? (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">Interactive Plan Review</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)]">Layer guardrail extents over the study floor plans</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              This first-pass 2D viewer keeps the source plan as the base layer, adds a highlighted guardrail trace, and lets you toggle labels and study quantities on top.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {(Object.values(guardrailPlanConfigs) as GuardrailPlanConfig[]).map((plan) => {
                const isSelected = plan.id === selectedPlanId;

                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-semibold transition",
                      isSelected
                        ? "border-[var(--core-green)] bg-[var(--core-green)] text-white"
                        : "border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--core-green)] hover:text-[var(--core-green)]",
                    )}
                  >
                    {plan.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowPlanGuardrails((current) => !current)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition",
                  showPlanGuardrails
                    ? "border-[var(--core-green)] bg-[color:rgba(0,131,72,0.08)] text-[var(--core-green)]"
                    : "border-[var(--border)] bg-white text-[var(--foreground)]",
                )}
              >
                {showPlanGuardrails ? "Hide guardrails" : "Show guardrails"}
              </button>
              <button
                type="button"
                onClick={() => setShowPlanLabels((current) => !current)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition",
                  showPlanLabels
                    ? "border-[var(--core-green)] bg-[color:rgba(0,131,72,0.08)] text-[var(--core-green)]"
                    : "border-[var(--border)] bg-white text-[var(--foreground)]",
                )}
              >
                {showPlanLabels ? "Hide labels" : "Show labels"}
              </button>
            </div>
            <div className="mt-6">
              <GuardrailPlanViewer plan={selectedPlan} showGuardrails={showPlanGuardrails} showLabels={showPlanLabels} />
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">Original Sheets</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)]">Open the source plans at full size</h2>
              <div className="mt-5 grid gap-4">
                {guardrailContextSheets.map((sheet) => (
                  <div key={sheet.id}>
                    <p className="text-sm font-semibold text-[var(--foreground)]">{sheet.label}</p>
                    <div className="mt-3">
                      <LightboxImage
                        src={sheet.src}
                        alt={sheet.alt}
                        width={900}
                        height={700}
                        expandedContainerClassName="!max-w-[98vw]"
                        expandedImageClassName="!max-h-[96vh]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
