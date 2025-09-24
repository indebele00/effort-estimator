import React, { useEffect, useState } from "react";
import { useAuth, Profile } from "./auth/AuthContext";

export default function AdminPanel() {
  const { listProfiles, updateProfile, user } = useAuth();
  const [rows, setRows] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try { setRows(await listProfiles()); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function saveRow(id: string) {
    const r = rows.find(x => x.id === id)!;
    await updateProfile(id, {
      username: r.username ?? "",
      role: r.role,
      persona: r.persona ?? undefined
    });
  }

  if (loading) return <div style={{ padding: 16 }}>Loading users…</div>;

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontSize: 18, marginBottom: 8 }}>Admin · User Management</h2>

      <div style={{ overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: 12 }}>
        <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8fafc" }}>
            <tr>
              <th style={th}>Email / Username</th>
              <th style={th}>Role</th>
              <th style={th}>Persona</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} style={{ background: "#fff" }}>
                <td style={td}>
                  <input
                    value={r.username ?? ""}
                    onChange={(e) => setRows(rows.map(x => x.id === r.id ? { ...x, username: e.target.value } : x))}
                    style={input}
                  />
                </td>
                <td style={td}>
                  <select
                    value={r.role}
                    onChange={(e) => setRows(rows.map(x => x.id === r.id ? { ...x, role: e.target.value as any } : x))}
                    style={select}
                  >
                    <option value="estimator">estimator</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td style={td}>
                  <select
                    value={r.persona ?? ""}
                    onChange={(e) => setRows(rows.map(x => x.id === r.id ? { ...x, persona: (e.target.value || null) as any } : x))}
                    style={select}
                  >
                    <option value="">—</option>
                    <option value="BA/PMO">BA/PMO</option>
                    <option value="Developer">Developer</option>
                  </select>
                </td>
                <td style={td}>
                  <button onClick={() => saveRow(r.id)} style={button} disabled={user?.id === r.id && r.role !== "admin"}>
                    Save
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td style={{ ...td, padding: 12 }} colSpan={4}>No users.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th: React.CSSProperties = { textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" };
const td: React.CSSProperties = { padding: 8, borderBottom: "1px solid #e5e7eb" };
const input: React.CSSProperties = { width: "100%", padding: 8, border: "1px solid #e5e7eb", borderRadius: 8 };
const select: React.CSSProperties = { width: "100%", padding: 8, border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff" };
const button: React.CSSProperties = { padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#f1f5f9" };
