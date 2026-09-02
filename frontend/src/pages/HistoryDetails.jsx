import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudentHeader from "../components/StudentHeader";

function HistoryDetails() {
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
        `http://localhost:5279/api/History/student/${sessionId}`,
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
            "Failed to load history details."
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

  function formatDateTime(dateString) {
    if (!dateString) return "-";

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

  /*
   * LOADING
   */

  if (loading) {
    return (
      <div className="student-page">
        <StudentHeader />

        <main className="history-details-content">
          <div className="history-loading">
            <div className="loading-circle"></div>

            <p>
              Loading practice details...
            </p>
          </div>
        </main>
      </div>
    );
  }

  /*
   * ERROR
   */

  if (error || !details) {
    return (
      <div className="student-page">
        <StudentHeader />

        <main className="history-details-content">
          <div className="history-details-error">

            <div className="history-error-icon">
              !
            </div>

            <h2>
              Something went wrong
            </h2>

            <p>
              {error ||
                "Practice session not found."}
            </p>

            <button
              className="primary-button"
              onClick={() =>
                navigate("/student/history")
              }
            >
              Back to history
            </button>

          </div>
        </main>
      </div>
    );
  }

  /*
   * MAIN PAGE
   */

  return (
    <div className="student-page">

      <StudentHeader />

      <main className="history-details-content">

        {/* BACK BUTTON */}

        <button
          className="history-back-button"
          onClick={() =>
            navigate("/student/history")
          }
        >
          ← Back to history
        </button>

        {/* HEADER */}

        <section className="history-details-header">

          <div>

            <p className="student-eyebrow">
              PRACTICE SESSION
            </p>

            <h1>
              {details.setName}
            </h1>

            <p>
              Completed on{" "}
              {formatDate(details.finishedAt)}
            </p>

          </div>

          <div
            className={`history-details-score ${getScoreClass(
              details.score
            )}`}
          >
            {details.score}%
          </div>

        </section>

        {/* SUMMARY */}

        <section className="history-summary">

          <div>
            <span>Correct</span>

            <strong>
              {details.correctAnswers}
              <small>
                /{details.totalQuestions}
              </small>
            </strong>
          </div>

          <div>
            <span>Started</span>

            <strong className="summary-time">
              {formatDateTime(
                details.startedAt
              )}
            </strong>
          </div>

          <div>
            <span>Finished</span>

            <strong className="summary-time">
              {formatDateTime(
                details.finishedAt
              )}
            </strong>
          </div>

        </section>

        {/* ANSWER DETAILS */}

        <section className="history-answers-section">

          <div className="history-section-header">

            <div>

              <p className="student-eyebrow">
                ANSWER REVIEW
              </p>

              <h2>
                Your answers
              </h2>

            </div>

            <span>
              {details.attempts.length}{" "}
              {details.attempts.length === 1
                ? "question"
                : "questions"}
            </span>

          </div>

          <div className="history-answers-list">

            {details.attempts.map(
              (attempt, index) => (

                <div
                  key={attempt.attemptId}
                  className={`history-answer-card ${
                    attempt.isCorrect
                      ? "answer-is-correct"
                      : "answer-is-wrong"
                  }`}
                >

                  {/* QUESTION NUMBER */}

                  <div className="history-answer-number">
                    {index + 1}
                  </div>

                  {/* CONTENT */}

                  <div className="history-answer-content">

                    <div className="history-answer-word-row">

                      <h3>
                        {attempt.word}
                      </h3>

                      <span
                        className={`answer-status ${
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

                    {/* ANSWERS */}

                    <div className="history-answer-meanings">

                      <div>

                        <span>
                          Your answer
                        </span>

                        <strong>
                          {attempt.selectedMeaning}
                        </strong>

                      </div>

                      <div>

                        <span>
                          Correct answer
                        </span>

                        <strong className="correct-meaning">
                          {attempt.correctMeaning}
                        </strong>

                      </div>

                    </div>

                    {/* TIME */}

                    <p className="history-answer-time">

                      Answered{" "}
                      {formatDateTime(
                        attempt.answeredAt
                      )}

                    </p>

                  </div>

                  {/* STATUS ICON */}

                  <div
                    className={`history-answer-icon ${
                      attempt.isCorrect
                        ? "answer-icon-correct"
                        : "answer-icon-wrong"
                    }`}
                  >
                    {attempt.isCorrect
                      ? "✓"
                      : "×"}
                  </div>

                </div>

              )
            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default HistoryDetails;
