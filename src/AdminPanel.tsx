import React, { useMemo, useState } from "react";
import { useAuth, SystemRole, EstimatorPersona, UserEntry } from "./auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function AdminPanel() {
  const { users, upsertUser, deleteUser, user: current } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [systemRole, setSystemRole] = useState<SystemRole>("estimator");
  const [persona, setPersona] = useState<EstimatorPersona>("BA/PMO");

  const rows = useMemo(
    () => Object.entries(users).map(([name, e]) => ({ name, ...e })),
    [users]
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    const entry: UserEntry = { password, systemRole };
    if (systemRole === "estimator") entry.persona = persona;

    upsertUser(username, entry);
    setUsername(""); setPassword("");
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-lg font-semibold mb-3">Admin · User Management</h2>

      <form onSubmit={submit} className="grid md:grid-cols-5 gap-3 items-end border rounded-xl p-3 mb-6">
        <div>
          <Label className="text-sm">Username</Label>
          <Input value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="e.g. dev2" required />
        </div>
        <div>
          <Label className="text-sm">Password</Label>
          <Input value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••" required />
        </div>
        <div>
          <Label className="text-sm">System Role</Label>
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            value={systemRole}
            onChange={(e)=>setSystemRole(e.target.value as SystemRole)}
          >
            <option value="estimator">estimator</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div>
          <Label className="text-sm">Persona (estimators)</Label>
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            value={persona}
            onChange={(e)=>setPersona(e.target.value as EstimatorPersona)}
            disabled={systemRole !== "estimator"}
          >
            <option value="BA/PMO">BA/PMO</option>
            <option value="Developer">Developer</option>
          </select>
        </div>
        <div>
          <Button type="submit" className="w-full">Add / Update</Button>
        </div>
      </form>

      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-2 border-b">Username</th>
              <th className="text-left p-2 border-b">System Role</th>
              <th className="text-left p-2 border-b">Persona</th>
              <th className="text-left p-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.name} className="odd:bg-white even:bg-slate-50/40">
                <td className="p-2 border-b">{r.name}</td>
                <td className="p-2 border-b">{r.systemRole}</td>
                <td className="p-2 border-b">{r.persona ?? "—"}</td>
                <td className="p-2 border-b">
                  <Button
                    onClick={()=> deleteUser(r.name)}
                    disabled={current?.username === r.name}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="p-2" colSpan={4}>No users.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500 mt-3">
        Note: This demo stores users client-side in <code>localStorage</code>. For production, use a real backend/IdP.
      </p>
    </div>
  );
}
