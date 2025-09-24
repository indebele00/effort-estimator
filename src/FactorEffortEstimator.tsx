// src/FactorEffortEstimator.tsx
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calculator, CalendarDays, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

// ------------------ Factor Definitions ------------------
const FACTORS = {
  TaskType: {
    Feature: 1.0,
    Bug: 1.1,
    Refactor: 0.9,
    Spike: 1.1,
  },
  Complexity: {
    Simple: 0.75,
    Medium: 1.0,
    High: 1.5,
    "Very High": 2.0,
  },
  CodeImpact: {
    Modify: 1.0,
    New: 1.3,
    BugFix: 1.1,
    Refactor: 0.9,
    Spike: 1.2,
  },
  Dependencies: {
    None: 0.9,
    Few: 1.0,
    Many: 1.2,
    External: 1.4,
  },
  TechNovelty: {
    Familiar: 0.9,
    Mixed: 1.1,
    New: 1.3,
  },
  MeetingsLoad: {
    Low: 0.9,
    Medium: 1.0,
    High: 1.2,
  },
  DeveloperLevel: {
    Senior: 0.8,
    Mid: 1.0,
    Junior: 1.2,
  },
  LOCBucket: {
    "<100": 0.8,
    "100–300": 1.0,
    "300–700": 1.3,
    ">700": 1.6,
  },
  AvailabilityFactor: {
    "100%": 1.0,
    "50%": 1.5,
    "25%": 1.75,
  },
} as const;

const RISK = {
  Low: 0.05,
  Medium: 0.15,
  High: 0.3,
} as const;

// ------------------ Helpers ------------------
function product(values: number[]): number {
  return values.reduce((acc, v) => acc * v, 1);
}

function ceil(num: number, precision = 0): number {
  const p = Math.pow(10, precision);
  return Math.ceil(num * p) / p;
}

function addWorkdays(start: Date, nDays: number): Date {
  let daysRemaining = nDays;
  const d = new Date(start);
  d.setHours(0, 0, 0, 0);
  while (daysRemaining > 0) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) {
      daysRemaining -= 1;
    }
  }
  return d;
}

function formatDateISO(d: Date | null): string {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ------------------ Component ------------------
export default function FactorEffortEstimator({ defaultRole = 'BA/PMO' }:{ defaultRole?: 'BA/PMO'|'Developer' }) {
  const [role, setRole] = useState<'BA/PMO'|'Developer'>(defaultRole);
  const [baseEffort, setBaseEffort] = useState(8); // editable & required
  const [focusHoursPerDay, setFocusHoursPerDay] = useState(5); // editable & required
  // Availability now modelled as a multiplier factor, not a divisor
  const [availabilityFactor, setAvailabilityFactor] = useState<keyof typeof FACTORS.AvailabilityFactor>("100%");

  const [taskType, setTaskType] = useState<keyof typeof FACTORS.TaskType>("Feature");
  const [complexity, setComplexity] = useState<keyof typeof FACTORS.Complexity>("Medium");
  const [codeImpact, setCodeImpact] = useState<keyof typeof FACTORS.CodeImpact>("Modify");
  const [dependencies, setDependencies] = useState<keyof typeof FACTORS.Dependencies>("Few");
  const [techNovelty, setTechNovelty] = useState<keyof typeof FACTORS.TechNovelty>("Mixed");
  const [meetingsLoad, setMeetingsLoad] = useState<keyof typeof FACTORS.MeetingsLoad>("Medium");
  const [developerLevel, setDeveloperLevel] = useState<keyof typeof FACTORS.DeveloperLevel>("Mid");
  const [locBucket, setLocBucket] = useState<keyof typeof FACTORS.LOCBucket>("100–300");
  const [risk, setRisk] = useState<keyof typeof RISK>("Medium");
  const [startDateStr, setStartDateStr] = useState<string>("");

  const multiplierProduct = useMemo(() => {
    const m = [
      FACTORS.TaskType[taskType],
      FACTORS.Complexity[complexity],
      FACTORS.CodeImpact[codeImpact],
      FACTORS.Dependencies[dependencies],
      FACTORS.TechNovelty[techNovelty],
      FACTORS.MeetingsLoad[meetingsLoad],
      FACTORS.LOCBucket[locBucket],
      FACTORS.AvailabilityFactor[availabilityFactor],
    ];
    const devMultiplier = role === 'Developer' ? FACTORS.DeveloperLevel[developerLevel] : 1.0;
    return product([...m, devMultiplier]);
  }, [role, taskType, complexity, codeImpact, dependencies, techNovelty, meetingsLoad, locBucket, availabilityFactor, developerLevel]);

  const effortBase = useMemo(() => baseEffort * multiplierProduct, [baseEffort, multiplierProduct]);
  const effortWithRisk = useMemo(() => effortBase * (1 + RISK[risk]), [effortBase, risk]);

  const workingDaysNeeded = useMemo(() => {
    if (focusHoursPerDay <= 0) return 0;
    return ceil(effortWithRisk / (focusHoursPerDay), 2);
  }, [effortWithRisk, focusHoursPerDay]);

  const endDate = useMemo(() => {
    if (!startDateStr || workingDaysNeeded <= 0) return null;
    const start = new Date(startDateStr);
    const wholeDays = Math.ceil(workingDaysNeeded);
    return addWorkdays(start, wholeDays);
  }, [startDateStr, workingDaysNeeded]);

  function resetAll() {
    setRole(defaultRole);
    setBaseEffort(8);
    setFocusHoursPerDay(5);
    setAvailabilityFactor("100%");
    setTaskType("Feature");
    setComplexity("Medium");
    setCodeImpact("Modify");
    setDependencies("Few");
    setTechNovelty("Mixed");
    setMeetingsLoad("Medium");
    setDeveloperLevel("Mid");
    setLocBucket("100–300");
    setRisk("Medium");
    setStartDateStr("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="mx-auto max-w-5xl grid md:grid-cols-5 gap-6">
        <Card className="md:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><Calculator className="h-5 w-5"/>Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Role" value={role} setValue={setRole as any} options={["BA/PMO","Developer"]} />
              <div />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Base Effort (hrs)" value={baseEffort} setValue={setBaseEffort} min={1} step={0.5} />
              <NumberField label="Focus Hours/Day" value={focusHoursPerDay} setValue={setFocusHoursPerDay} min={1} max={10} step={0.5} />
              <SelectField label="Availability % (capacity)" value={availabilityFactor} setValue={setAvailabilityFactor as any} options={Object.keys(FACTORS.AvailabilityFactor)} />
              <div>
                <Label className="text-sm">Start Date</Label>
                <Input type="date" value={startDateStr} onChange={(e)=>setStartDateStr(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Task Type" value={taskType} setValue={setTaskType} options={Object.keys(FACTORS.TaskType)} />
              <SelectField label="Complexity" value={complexity} setValue={setComplexity} options={Object.keys(FACTORS.Complexity)} />
              <SelectField label="Code Impact" value={codeImpact} setValue={setCodeImpact} options={Object.keys(FACTORS.CodeImpact)} />
              <SelectField label="Dependencies" value={dependencies} setValue={setDependencies} options={Object.keys(FACTORS.Dependencies)} />
              <SelectField label="Tech Novelty" value={techNovelty} setValue={setTechNovelty} options={Object.keys(FACTORS.TechNovelty)} />
              <SelectField label="Meetings Load" value={meetingsLoad} setValue={setMeetingsLoad} options={Object.keys(FACTORS.MeetingsLoad)} />
              {role === 'Developer' && (
                <SelectField label="Developer Level" value={developerLevel} setValue={setDeveloperLevel} options={Object.keys(FACTORS.DeveloperLevel)} />
              )}
              <SelectField label="LOC Bucket" value={locBucket} setValue={setLocBucket} options={Object.keys(FACTORS.LOCBucket)} />
              <SelectField label="Risk Level" value={risk} setValue={setRisk} options={Object.keys(RISK)} />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" onClick={resetAll} className="rounded-2xl"><RefreshCw className="mr-2 h-4 w-4"/>Reset</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><CalendarDays className="h-5 w-5"/>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <KV label="Role" value={role} />
              <KV label="Multiplier Product" value={multiplierProduct.toFixed(3)} />
              <KV label="Effort (Base) – hrs" value={effortBase.toFixed(2)} />
              <KV label="Risk Buffer" value={`${Math.round(RISK[risk]*100)}%`} />
              <KV label="Effort (With Risk) – hrs" value={effortWithRisk.toFixed(2)} emphasize />
              <KV label="Availability (capacity)" value={`${availabilityFactor} (×${FACTORS.AvailabilityFactor[availabilityFactor].toFixed(2)})`} />
              <KV label="Focus Hours/Day" value={focusHoursPerDay.toFixed(2)} />
              <KV label="Working Days Needed" value={workingDaysNeeded.toString()} emphasize />
              <KV label="Projected End Date" value={formatDateISO(endDate)} emphasize />
            </div>
            <p className="text-xs text-muted-foreground mt-4">Note: End date excludes weekends. Make Base Effort and Focus Hours/Day non-zero (required). For public holidays, extend to ingest a holiday calendar.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KV({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className={cn("flex flex-col p-3 border rounded-xl", emphasize && "bg-slate-50 font-semibold shadow-inner")}> 
      <div className="text-slate-500">{label}</div>
      <div className="text-slate-900 text-base">{value || "—"}</div>
    </div>
  );
}

function NumberField({ label, value, setValue, min, max, step = 1, suffix }: { label: string; value: number; setValue: (v: number)=>void; min?: number; max?: number; step?: number; suffix?: string; }) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          onChange={(e)=> setValue(Number(e.target.value))}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">{suffix}</span>}
      </div>
    </div>
  );
}

function SelectField<T extends string>({ label, value, setValue, options }: { label: string; value: T; setValue: (v: T)=>void; options: string[]; }) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <Select value={value} onValueChange={(v)=> setValue(v as T)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt)=> (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
