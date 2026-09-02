import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TeacherHeader from "../components/TeacherHeader";

function TeacherHistoryDetails() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDetails() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5279/api/TeacherDashboard/session/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load practice session."
        );
      }

      setDetails(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDetails();
  }, [sessionId]);

  function formatDateTime(dateString) {
    if (!dateString) {
      return "-";
    }

    return new Date(dateString).toLocaleString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }

  function getScoreClass(score) {
    if (score >= 80) {
      return "score-good";
    }

    if (score >= 50) {
      return "score-average";
    }

    return "score-low";
  }

  if (loading) {
    return (
      <div className="teacher-page">
        <TeacherHeader />

        <main className="teacher-history-details-content">
          <div className="teacher-loading">
            <div className="loading-circle"></div>

            <p>
              Loading practice details...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="teacher-page">
        <TeacherHeader />

        <main className="teacher-history-details-content">

          <div className="teacher-history-error">

            <div className="teacher-error-icon">
              !
            </div>

            <h2>
              Unable to load practice
            </h2>

            <p>
              {error ||
                "Practice session not found."}
            </p>

            <button
              className="primary-button"
              onClick={() =>
                navigate("/teacher")
              }
            >
              Back to dashboard
            </button>

          </div>

        </main>
      </div>
    );
  }

  const attempts = details.attempts || [];

  const score = details.score || 0;

  return (
    <div className="teacher-page">

      <TeacherHeader />

      <main className="teacher-history-details-content">

        {/* BACK */}

        <button
          className="teacher-history-back"
          onClick={() =>
            navigate(
              `/teacher/students/${details.studentId}`
            )
          }
        >
          ← Back to {details.studentName}
        </button>

        {/* HEADER */}

        <section className="teacher-history-header">

          <div className="teacher-history-header-main">

            <div className="teacher-history-icon">
              ✓
            </div>

            <div>

              <p className="teacher-eyebrow">
                PRACTICE SESSION
              </p>

              <h1>
                {details.setName}
              </h1>

              <p>
                {details.studentName}
              </p>

            </div>

          </div>

          <div
            className={`teacher-history-score ${getScoreClass(
              score
            )}`}
          >
            {score}%
          </div>

        </section>

        {/* SUMMARY */}

        <section className="teacher-history-summary">

          <div className="teacher-history-summary-card">

            <span>
              Correct answers
            </span>

            <strong>
              {details.correctAnswers}
              <small>
                {" "}
                / {details.totalQuestions}
              </small>
            </strong>

          </div>

          <div className="teacher-history-summary-card">

            <span>
              Started
            </span>

            <strong className="summary-date">
              {formatDateTime(
                details.startedAt
              )}
            </strong>

          </div>

          <div className="teacher-history-summary-card">

            <span>
              Finished
            </span>

            <strong className="summary-date">
              {formatDateTime(
                details.finishedAt
              )}
            </strong>

          </div>

        </section>

        {/* ANSWERS */}

        <section className="teacher-history-answers">

          <div className="teacher-section-header">

            <div>

              <p className="teacher-eyebrow">
                ANSWER BREAKDOWN
              </p>

              <h2>
                Answers
              </h2>

            </div>

            <span>
              {attempts.length}{" "}
              {attempts.length === 1
                ? "question"
                : "questions"}
            </span>

          </div>

          {attempts.length === 0 ? (
            <div className="teacher-empty">

              <div className="teacher-empty-icon">
                ✓
              </div>

              <h3>
                No answers recorded
              </h3>

              <p>
                There are no answers for this
                practice session.
              </p>

            </div>
          ) : (
            <div className="teacher-history-answer-list">

              {attempts.map(
                (attempt, index) => (

                  <div
                    key={attempt.attemptId}
                    className={`teacher-history-answer-card ${
                      attempt.isCorrect
                        ? "history-answer-correct"
                        : "history-answer-wrong"
                    }`}
                  >

                    <div className="teacher-history-answer-number">
                      {index + 1}
                    </div>

                    <div
                      className={`teacher-history-answer-status ${
                        attempt.isCorrect
                          ? "status-correct"
                          : "status-wrong"
                      }`}
                    >
                      {attempt.isCorrect
                        ? "✓"
                        : "×"}
                    </div>

                    <div className="teacher-history-answer-content">

                      <div className="teacher-history-word-row">

                        <h3>
                          {attempt.word}
                        </h3>

                        <span
                          className={`teacher-history-status-label ${
                            attempt.isCorrect
                              ? "status-correct"
                              : "status-wrong"
                          }`}
                        >
                          {attempt.isCorrect
                            ? "Correct"
                            : "Incorrect"}
                        </span>

                      </div>

                      <div className="teacher-history-meaning-grid">

                        <div
                          className={
                            attempt.isCorrect
                              ? "selected-answer-correct"
                              : "selected-answer-wrong"
                          }
                        >

                          <span>
                            Student's answer
                          </span>

                          <strong>
                            {attempt.selectedMeaning}
                          </strong>

                        </div>

                        <div className="correct-answer-box">

                          <span>
                            Correct answer
                          </span>

                          <strong>
                            {attempt.correctMeaning}
                          </strong>

                        </div>

                      </div>

                      <p className="teacher-history-answer-time">
                        Answered{" "}
                        {formatDateTime(
                          attempt.answeredAt
                        )}
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>
          )}

        </section>

      </main>
    </div>
  );
}

export default TeacherHistoryDetails;

