// src/App.tsx
import * as React from "react";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import Login from "./Login";
import AdminPanel from "./AdminPanel";
import FactorEffortEstimator from "./FactorEffortEstimator";
import { Button } from "@/components/ui/button";

function Shell() {
  const { user, loading, login, signup, logout } = useAuth();
  const [showAdmin, setShowAdmin] = React.useState(true);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!user) return <Login onLogin={login} onSignup={signup} />;

  const isAdmin = user.systemRole === "admin";
  return (
    <div>
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
        <div className="text-sm text-slate-600">
          Signed in as <b>{user.email}</b> · Role: <b>{user.systemRole}</b>
          {user.persona && <> · Persona: <b>{user.persona}</b></>}
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && <>
            <Button onClick={() => setShowAdmin(true)}>Admin</Button>
            <Button onClick={() => setShowAdmin(false)}>Estimator</Button>
          </>}
          <Button onClick={()=>logout()}>Logout</Button>
        </div>
      </div>
      {isAdmin ? (showAdmin ? <AdminPanel /> : <FactorEffortEstimator defaultRole={user.persona ?? "BA/PMO"} />)
               : <FactorEffortEstimator defaultRole={user.persona ?? "BA/PMO"} />}
    </div>
  );
}

export default function App() {
  return <AuthProvider><Shell /></AuthProvider>;
}
