import React, { useState } from "react";

export default function Login({
  onLogin,
  onSignup,
}: {
  onLogin: (e: string, p: string) => Promise<any>;
  onSignup: (e: string, p: string) => Promise<any>;
}) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [msg, setMsg] = useState<string | undefined>();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(undefined);
    const fn = mode === "login" ? onLogin : onSignup;
    const res = await fn(email.trim(), pass);
    if (res?.error) setMsg(res.error);
  }

  const box: React.CSSProperties = {
    maxWidth: 380,
    margin: "64px auto",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    background: "#fff",
  };

  return (
    <form onSubmit={submit} style={box}>
      <h1 style={{ fontSize: 18, marginBottom: 12 }}>
        {mode === "login" ? "🔐 Sign in" : "✍️ Create account"}
      </h1>

      <div style={{ display: "grid", gap: 10 }}>
        <label style={{ fontSize: 12 }}>
          Email
          <input
            style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>

        <label style={{ fontSize: 12 }}>
          Password
          <input
            type="password"
            style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="••••••••"
            required
          />
        </label>

        {msg && <div style={{ color: "#b91c1c", fontSize: 12 }}>{msg}</div>}

        <button
          type="submit"
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb" }}
        >
          {mode === "login" ? "Sign in" : "Create account"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          style={{ background: "none", border: "none", color: "#334155", fontSize: 12, textDecoration: "underline" }}
        >
          {mode === "login" ? "No account? Sign up" : "Have an account? Sign in"}
        </button>
      </div>
    </form>
  );
}


