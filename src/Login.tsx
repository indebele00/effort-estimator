/ src/Login.tsx
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login({ onLogin, onSignup }: { onLogin: (e:string,p:string)=>Promise<any>; onSignup: (e:string,p:string)=>Promise<any>; }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [mode, setMode] = useState<"login"|"signup">("login");
  const [msg, setMsg] = useState<string|undefined>();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(undefined);
    const fn = mode === "login" ? onLogin : onSignup;
    const res = await fn(email.trim(), pass);
    if (res?.error) setMsg(res.error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl border bg-white p-6 shadow">
        <h1 className="text-xl font-semibold mb-4">{mode === "login" ? "🔐 Sign in" : "✍️ Create account"}</h1>
        <div className="space-y-3">
          <div>
            <Label className="text-sm">Email</Label>
            <Input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div>
            <Label className="text-sm">Password</Label>
            <Input type="password" value={pass} onChange={(e)=>setPass(e.target.value)} placeholder="••••••••" required />
          </div>
          {msg && <div className="text-red-600 text-sm">{msg}</div>}
          <Button type="submit" className="w-full mt-2">
            {mode === "login" ? "Sign in" : "Create account"}
          </Button>
          <button type="button" onClick={()=>setMode(mode==="login"?"signup":"login")} className="text-xs text-slate-600 underline mt-2">
            {mode === "login" ? "No account? Sign up" : "Have an account? Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}

