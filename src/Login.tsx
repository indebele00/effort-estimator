import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login({ onSubmit }: { onSubmit: (u: string, p: string) => Promise<boolean> }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const ok = await onSubmit(u.trim(), p);
    setLoading(false);
    if (!ok) setErr("Invalid username or password.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <form onSubmit={handle} className="w-full max-w-sm rounded-xl border bg-white p-6 shadow">
        <h1 className="text-xl font-semibold mb-4">🔐 Sign in</h1>
        <div className="space-y-3">
          <div>
            <Label className="text-sm">Username</Label>
            <Input value={u} onChange={(e)=>setU(e.target.value)} placeholder="admin / ba / dev" required />
          </div>
          <div>
            <Label className="text-sm">Password</Label>
            <Input type="password" value={p} onChange={(e)=>setP(e.target.value)} placeholder="admin123 / ba123 / dev123" required />
          </div>
          {err && <div className="text-red-600 text-sm">{err}</div>}
          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <p className="text-xs text-slate-500 mt-2">
            Demo: <b>admin/admin123</b>, <b>ba/ba123</b> (BA/PMO), <b>dev/dev123</b> (Developer).
          </p>
        </div>
      </form>
    </div>
  );
}
