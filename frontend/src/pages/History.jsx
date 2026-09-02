import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentHeader from "../components/StudentHeader";

function History() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadHistory() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5279/api/History/student",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load history."
        );
      }

      setHistory(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  function formatDate(dateString) {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  }

  function formatTime(dateString) {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }

  function getScoreClass(score) {
    if (score >= 80) return "score-good";
    if (score >= 50) return "score-average";
    return "score-low";
  }

  const totalSessions = history.length;

  const averageScore =
    totalSessions > 0
      ? history.reduce(
          (total, session) =>
            total + (session.score || 0),
          0
        ) / totalSessions
      : 0;

  const bestScore =
    totalSessions > 0
      ? Math.max(
          ...history.map(
            (session) => session.score || 0
          )
        )
      : 0;

  const totalCorrect = history.reduce(
    (total, session) =>
      total + (session.correctAnswers || 0),
    0
  );

  return (
    <div className="student-page">
      <StudentHeader />

      <main className="history-page-content">

        {/* HEADER */}
        <section className="history-header">

          <div>
            <p className="student-eyebrow">
              YOUR PROGRESS
            </p>

            <h1>Practice history</h1>

            <p>
              See how you've been doing over time.
            </p>
          </div>

          <div className="history-header-icon">
            ↗
          </div>

        </section>

        {/* ERROR */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* STATS */}
        {!loading && !error && history.length > 0 && (
          <section className="history-stats">

            <div className="history-stat-card">
              <div className="history-stat-icon green">
                ✓
              </div>

              <div>
                <span>Sessions</span>
                <strong>{totalSessions}</strong>
              </div>
            </div>

            <div className="history-stat-card">
              <div className="history-stat-icon blue">
                %
              </div>

              <div>
                <span>Average score</span>
                <strong>
                  {averageScore.toFixed(0)}%
                </strong>
              </div>
            </div>

            <div className="history-stat-card">
              <div className="history-stat-icon yellow">
                ★
              </div>

              <div>
                <span>Best score</span>
                <strong>{bestScore}%</strong>
              </div>
            </div>

            <div className="history-stat-card">
              <div className="history-stat-icon red">
                +
              </div>

              <div>
                <span>Correct answers</span>
                <strong>{totalCorrect}</strong>
              </div>
            </div>

          </section>
        )}

        {/* LOADING */}
        {loading && (
          <div className="history-loading">

            <div className="loading-circle"></div>

            <p>Loading your history...</p>

          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          history.length === 0 && (
            <div className="history-empty">

              <div className="history-empty-icon">
                ◷
              </div>

              <h2>No practice history yet</h2>

              <p>
                Complete your first practice session
                and your results will appear here.
              </p>

              <button
                className="primary-button"
                onClick={() =>
                  navigate("/student")
                }
              >
                Start practicing
              </button>

            </div>
          )}

        {/* HISTORY LIST */}
        {!loading &&
          !error &&
          history.length > 0 && (
            <section className="history-section">

              <div className="history-section-header">

                <div>
                  <p className="student-eyebrow">
                    RECENT ACTIVITY
                  </p>

                  <h2>Your sessions</h2>
                </div>

                <span>
                  {history.length}{" "}
                  {history.length === 1
                    ? "session"
                    : "sessions"}
                </span>

              </div>

              <div className="history-list">

                {history.map((session) => (
                  <button
                    key={session.sessionId}
                    className="history-card"
                    onClick={() =>
                      navigate(
                        `/student/history/${session.sessionId}`
                      )
                    }
                  >

                    <div className="history-card-left">

                      <div className="history-set-icon">
                        ✦
                      </div>

                      <div className="history-card-info">

                        <h3>
                          {session.setName}
                        </h3>

                        <p>
                          {formatDate(
                            session.startedAt
                          )}{" "}
                          ·{" "}
                          {formatTime(
                            session.startedAt
                          )}
                        </p>

                      </div>

                    </div>

                    <div className="history-card-right">

                      <div
                        className={`history-score ${getScoreClass(
                          session.score
                        )}`}
                      >
                        {session.score}%
                      </div>

                      <div className="history-correct">
                        {session.correctAnswers}/
                        {session.totalQuestions}{" "}
                        correct
                      </div>

                      <span className="history-arrow">
                        →
                      </span>

                    </div>

                  </button>
                ))}

              </div>

            </section>
          )}

      </main>
    </div>
  );
}

export default History;