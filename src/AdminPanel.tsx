// src/AdminPanel.tsx
import React, { useEffect, useState } from "react";
import { useAuth, Profile, SystemRole, EstimatorPersona } from "./auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminPanel() {
  const { listProfiles, updateProfile, user } = useAuth();
  const [rows, setRows] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try { setRows(await listProfiles()); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const saveRow = async (id: string) => {
    const r = rows.find(x => x.id === id)!;
    await updateProfile(id, { username: r.username ?? "", role: r.role, persona: r.persona ?? undefined });
  };

  if (loading) return <div className="p-4">Loading users…</div>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-lg font-semibold mb-3">Admin · User Management</h2>

      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-2 border-b">Email / Username</th>
              <th className="text-left p-2 border-b">Role</th>
              <th className="text-left p-2 border-b">Persona</th>
              <th className="text-left p-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="odd:bg-white even:bg-slate-50/40">
                <td className="p-2 border-b">
                  <Input value={r.username ?? ""} onChange={(e)=> setRows(rows.map(x=>x.id===r.id?{...x, username:e.target.value}:x))} />
                </td>
                <td className="p-2 border-b">
                  <select
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    value={r.role}
                    onChange={(e)=> setRows(rows.map(x=>x.id===r.id?{...x, role: e.target.value as SystemRole}:x))}
                  >
                    <option value="estimator">estimator</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="p-2 border-b">
                  <select
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    value={r.persona ?? ""}
                    onChange={(e)=> setRows(rows.map(x=>x.id===r.id?{...x, persona: (e.target.value || null) as EstimatorPersona | null}:x))}
                  >
                    <option value="">—</option>
                    <option value="BA/PMO">BA/PMO</option>
                    <option value="Developer">Developer</option>
                  </select>
                </td>
                <td className="p-2 border-b">
                  <Button onClick={()=> saveRow(r.id)} disabled={user?.id===r.id && rows.find(x=>x.id===r.id)?.role!=="admin"}>Save</Button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="p-2" colSpan={4}>No users.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
