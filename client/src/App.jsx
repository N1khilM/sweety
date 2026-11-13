import { useState } from "react";
import AuthForm from "./components/AuthForm";
import "./index.css";

function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");

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

  return <h1>Welcome, {user.name}!</h1>;
}

export default App;
