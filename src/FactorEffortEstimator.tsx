import React, { useMemo, useState } from "react";

// ------------------ Factor Definitions ------------------
const FACTORS = {
  TaskType: { Feature: 1.0, Bug: 1.1, Refactor: 0.9, Spike: 1.1 },
  Complexity: { Simple: 0.75, Medium: 1.0, High: 1.5, "Very High": 2.0 },
  CodeImpact: { Modify: 1.0, New: 1.3, BugFix: 1.1, Refactor: 0.9, Spike: 1.2 },
  Dependencies: { None: 0.9, Few: 1.0, Many: 1.2, External: 1.4 },
  TechNovelty: { Familiar: 0.9, Mixed: 1.1, New: 1.3 },
  MeetingsLoad: { Low: 0.9, Medium: 1.0, High: 1.2 },
  DeveloperLevel: { Senior: 0.8, Mid: 1.0, Junior: 1.2 },
  LOCBucket: { "<100": 0.8, "100–300": 1.0, "300–700": 1.3, ">700": 1.6 },
  AvailabilityFactor: { "100%": 1.0, "50%": 1.5, "25%": 1.75 },
} as const;

const RISK = { Low: 0.05, Medium: 0.15, High: 0.3 } as const;

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
    if (day !== 0 && day !== 6) daysRemaining -= 1;
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
export default function FactorEffortEstimator({
  defaultRole = "BA/PMO",
}: {
  defaultRole?: "BA/PMO" | "Developer";
}) {
  const [role, setRole] = useState<"BA/PMO" | "Developer">(defaultRole);
  const [baseEffort, setBaseEffort] = useState(8);
  const [focusHoursPerDay, setFocusHoursPerDay] = useState(5);
  const [availabilityFactor, setAvailabilityFactor] =
    useState<keyof typeof FACTORS.AvailabilityFactor>("100%");

  const [taskType, setTaskType] =
    useState<keyof typeof FACTORS.TaskType>("Feature");
  const [complexity, setComplexity] =
    useState<keyof typeof FACTORS.Complexity>("Medium");
  const [codeImpact, setCodeImpact] =
    useState<keyof typeof FACTORS.CodeImpact>("Modify");
  const [dependencies, setDependencies] =
    useState<keyof typeof FACTORS.Dependencies>("Few");
  const [techNovelty, setTechNovelty] =
    useState<keyof typeof FACTORS.TechNovelty>("Mixed");
  const [meetingsLoad, setMeetingsLoad] =
    useState<keyof typeof FACTORS.MeetingsLoad>("Medium");
  const [developerLevel, setDeveloperLevel] =
    useState<keyof typeof FACTORS.DeveloperLevel>("Mid");
  const [locBucket, setLocBucket] =
    useState<keyof typeof FACTORS.LOCBucket>("100–300");
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
    const devMultiplier =
      role === "Developer" ? FACTORS.DeveloperLevel[developerLevel] : 1.0;
    return product([...m, devMultiplier]);
  }, [
    role,
    taskType,
    complexity,
    codeImpact,
    dependencies,
    techNovelty,
    meetingsLoad,
    locBucket,
    availabilityFactor,
    developerLevel,
  ]);

  const effortBase = useMemo(
    () => baseEffort * multiplierProduct,
    [baseEffort, multiplierProduct]
  );
  const effortWithRisk = useMemo(
    () => effortBase * (1 + RISK[risk]),
    [effortBase, risk]
  );

  const workingDaysNeeded = useMemo(() => {
    if (focusHoursPerDay <= 0) return 0;
    return ceil(effortWithRisk / focusHoursPerDay, 2);
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

  // Basic layout with native inputs
  const box = { border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 };

  return (
    <div style={{ minHeight: "100vh", padding: 16, background: "#f8fafc" }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gap: 16,
          gridTemplateColumns: "1fr 1.5fr",
        }}
      >
        {/* Inputs */}
        <div style={{ ...box, background: "#fff" }}>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Inputs</h2>

          <div style={{ display: "grid", gap: 12 }}>
            <Row>
              <Select label="Role" value={role} onChange={(v) => setRole(v as any)} options={["BA/PMO","Developer"]} />
            </Row>

            <Row>
              <Number label="Base Effort (hrs)" value={baseEffort} onChange={setBaseEffort} min={1} step={0.5} />
              <Number label="Focus Hours/Day" value={focusHoursPerDay} onChange={setFocusHoursPerDay} min={1} max={10} step={0.5} />
            </Row>

            <Row>
              <Select label="Availability % (capacity)" value={availabilityFactor}
                onChange={(v)=> setAvailabilityFactor(v as any)}
                options={Object.keys(FACTORS.AvailabilityFactor)} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12 }}>Start Date</label>
                <input type="date" value={startDateStr} onChange={(e)=>setStartDateStr(e.target.value)} />
              </div>
            </Row>

            <Row>
              <Select label="Task Type" value={taskType} onChange={(v)=>setTaskType(v as any)} options={Object.keys(FACTORS.TaskType)} />
              <Select label="Complexity" value={complexity} onChange={(v)=>setComplexity(v as any)} options={Object.keys(FACTORS.Complexity)} />
            </Row>
            <Row>
              <Select label="Code Impact" value={codeImpact} onChange={(v)=>setCodeImpact(v as any)} options={Object.keys(FACTORS.CodeImpact)} />
              <Select label="Dependencies" value={dependencies} onChange={(v)=>setDependencies(v as any)} options={Object.keys(FACTORS.Dependencies)} />
            </Row>
            <Row>
              <Select label="Tech Novelty" value={techNovelty} onChange={(v)=>setTechNovelty(v as any)} options={Object.keys(FACTORS.TechNovelty)} />
              <Select label="Meetings Load" value={meetingsLoad} onChange={(v)=>setMeetingsLoad(v as any)} options={Object.keys(FACTORS.MeetingsLoad)} />
            </Row>
            {role === "Developer" && (
              <Row>
                <Select label="Developer Level" value={developerLevel} onChange={(v)=>setDeveloperLevel(v as any)} options={Object.keys(FACTORS.DeveloperLevel)} />
                <Select label="LOC Bucket" value={locBucket} onChange={(v)=>setLocBucket(v as any)} options={Object.keys(FACTORS.LOCBucket)} />
              </Row>
            )}
            {role !== "Developer" && (
              <Row>
                <Select label="LOC Bucket" value={locBucket} onChange={(v)=>setLocBucket(v as any)} options={Object.keys(FACTORS.LOCBucket)} />
                <span />
              </Row>
            )}
            <Row>
              <Select label="Risk Level" value={risk} onChange={(v)=>setRisk(v as any)} options={Object.keys(RISK)} />
              <span />
            </Row>

            <div>
              <button onClick={resetAll} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f1f5f9" }}>
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={{ ...box, background: "#fff" }}>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Results</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 14 }}>
            <KV label="Role" value={role} />
            <KV label="Multiplier Product" value={multiplierProduct.toFixed(3)} />
            <KV label="Effort (Base) – hrs" value={effortBase.toFixed(2)} />
            <KV label="Risk Buffer" value={`${Math.round(RISK[risk]*100)}%`} />
            <KV label="Effort (With Risk) – hrs" value={effortWithRisk.toFixed(2)} emphasize />
            <KV label="Availability (capacity)" value={`${availabilityFactor} (×${FACTORS.AvailabilityFactor[availabilityFactor].toFixed(2)})`} />
            <KV label="Focus Hours/Day" value={focusHoursPerDay.toFixed(2)} />
            <KV label="Working Days Needed" value={String(workingDaysNeeded)} emphasize />
            <KV label="Projected End Date" value={formatDateISO(endDate)} emphasize />
          </div>
          <p style={{ fontSize: 12, color: "#6b7280", marginTop: 12 }}>
            Note: End date excludes weekends. Make Base Effort and Focus Hours/Day non-zero (required).
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>;
}

function Number({
  label, value, onChange, min, max, step = 1,
}: {
  label: string; value: number; onChange: (v: number)=>void; min?: number; max?: number; step?: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12 }}>{label}</label>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        step={step}
        onChange={(e)=> onChange(Number(e.target.value))}
      />
    </div>
  );
}

function Select({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string)=>void; options: string[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12 }}>{label}</label>
      <select value={value} onChange={(e)=>onChange(e.target.value)}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function KV({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", padding: 12, border: "1px solid #e5e7eb",
      borderRadius: 12, background: emphasize ? "#f8fafc" : undefined, fontWeight: emphasize ? 600 : 400
    }}>
      <div style={{ color: "#64748b" }}>{label}</div>
      <div style={{ color: "#0f172a" }}>{value || "—"}</div>
    </div>
  );
}
