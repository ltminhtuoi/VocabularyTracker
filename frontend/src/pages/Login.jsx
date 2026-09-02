import { useState } from "react";
import { login } from "../services/api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    setError("");

    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    setLoading(true);

    try {
      const data = await login(username, password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("name", data.name);

      if (data.role === "Teacher") {
        window.location.href = "/teacher";
      } else {
        window.location.href = "/student";
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">

      <div className="login-container">

        {/* LOGO */}
        <div className="login-brand">
          <div className="login-logo">
            V
          </div>

          <h1>Vocabulary Tracker</h1>

          <p>
            Learn a little every day.
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="login-card">

          <div className="login-card-header">
            <h2>Welcome back!</h2>

            <p>
              Log in to continue learning.
            </p>
          </div>

          <form onSubmit={handleLogin}>

            <div className="login-field">
              <label htmlFor="username">
                Username
              </label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button
              className="login-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>

          </form>
        </div>

        <p className="login-footer">
          Vocabulary Tracker
        </p>

      </div>

    </div>
  );
}

export default Login;

