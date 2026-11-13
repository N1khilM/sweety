import { useState } from "react";
import AuthForm from "./components/AuthForm";
import Dashboard from "./pages/Dashboard";
import "./index.css";

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });
  const [mode, setMode] = useState("login");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setMode("login");
  };

  if (!user) {
    return (
      <main className="auth-container">
        <section className="auth-card">
          <h1>Sweety 🍬</h1>
          <p>Your personal blood glucose companion.</p>

          <AuthForm
            mode={mode}
            onSuccess={setUser}
            onSwitch={() => setMode(mode === "login" ? "register" : "login")}
          />
        </section>
      </main>
    );
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App;
