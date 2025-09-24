import * as React from "react";
import FactorEffortEstimator from "./FactorEffortEstimator";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import Login from "./Login";
import AdminPanel from "./AdminPanel";
import { Button } from "@/components/ui/button";

function Shell() {
  const { user, login, logout } = useAuth();
  const [showAdmin, setShowAdmin] = React.useState(true);

  if (!user) return <Login onSubmit={login} />;

  const isAdmin = user.systemRole === "admin";
  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
        <div className="text-sm text-slate-600">
          Signed in as <b>{user.username}</b> · System role: <b>{user.systemRole}</b>
          {user.persona && <> · Persona: <b>{user.persona}</b></>}
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <Button onClick={() => setShowAdmin(true)}>Admin</Button>
              <Button onClick={() => setShowAdmin(false)}>Estimator</Button>
            </>
          )}
          <Button onClick={logout}>Logout</Button>
        </div>
      </div>

      {/* Body */}
      {isAdmin ? (
        showAdmin ? <AdminPanel /> : <FactorEffortEstimator /* defaultRole prop optional */ />
      ) : (
        <FactorEffortEstimator /* defaultRole prop optional */ />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
