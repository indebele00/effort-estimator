// src/FactorEffortEstimator.tsx
import React, { useState } from "react";

export default function FactorEffortEstimator({ defaultRole = "BA/PMO" }:{ defaultRole?: "BA/PMO" | "Developer" }) {
  const [role, setRole] = useState<"BA/PMO" | "Developer">(defaultRole);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>
        <h1 className="text-2xl font-bold mb-2">Effort Estimator</h1>
        <p className="mb-4">Placeholder UI. Role: <b>{role}</b></p>
        <select
          className="border rounded px-2 py-1"
          value={role}
          onChange={(e)=>setRole(e.target.value as "BA/PMO" | "Developer")}
        >
          <option>BA/PMO</option>
          <option>Developer</option>
        </select>
      </div>
    </div>
  );
}

