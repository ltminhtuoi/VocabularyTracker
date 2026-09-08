import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TeacherHeader from "../components/TeacherHeader";
import { API_BASE_URL } from "../services/api";

function StudentPerformance() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [student, setStudent] = useState(null);
  const [weakWords, setWeakWords] = useState([]);
  const [assignedSets, setAssignedSets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [removingAssignmentId, setRemovingAssignmentId] =
    useState(null);

  async function loadPerformance() {
    const response = await fetch(
      `${API_BASE_URL}/TeacherDashboard/student/${studentId}`,
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
          "Failed to load student performance."
      );
    }

    setStudent(data);
  }

  async function loadWeakWords() {
    const response = await fetch(
      `${API_BASE_URL}/TeacherDashboard/student/${studentId}/weak-words`,
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
          "Failed to load weak words."
      );
    }

    setWeakWords(data);
  }

  async function loadAssignedSets() {
    const response = await fetch(
      `${API_BASE_URL}/Assignment/student/${studentId}`,
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
          "Failed to load assigned sets."
      );
    }

    setAssignedSets(data);
  }

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        loadPerformance(),
        loadWeakWords(),
        loadAssignedSets(),
      ]);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [studentId]);

  async function removeAssignment(assignmentId) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this flashcard set from this student?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingAssignmentId(assignmentId);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/Assignment/${assignmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to remove assignment."
        );
      }

      setAssignedSets((currentSets) =>
        currentSets.filter(
          (assignment) =>
            assignment.id !== assignmentId
        )
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setRemovingAssignmentId(null);
    }
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

  function formatDate(dateString) {
    if (!dateString) {
      return "-";
    }

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

  if (loading) {
    return (
      <div className="teacher-page">
        <TeacherHeader />

        <main className="teacher-performance-content">
          <div className="teacher-loading">
            <div className="loading-circle"></div>

            <p>
              Loading student performance...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="teacher-page">
        <TeacherHeader />

        <main className="teacher-performance-content">
          <div className="teacher-performance-error">

            <div className="teacher-error-icon">
              !
            </div>

            <h2>
              Unable to load student
            </h2>

            <p>
              {error}
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

  const totalSessions =
    student?.totalSessions || 0;

  const totalQuestions =
    student?.totalQuestions || 0;

  const averageScore =
    student?.averageScore || 0;

  const sessions = student?.sessions || [];

  const attempts = student?.attempts || [];

  return (
    <div className="teacher-page">

      <TeacherHeader />

      <main className="teacher-performance-content">

        {/* BACK */}

        <button
          className="teacher-back-button"
          onClick={() =>
            navigate("/teacher")
          }
        >
          ← Back to dashboard
        </button>

        {error && (
          <div className="teacher-message teacher-message-error">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
            >
              ×
            </button>
          </div>
        )}

        {/* STUDENT HEADER */}

        <section className="teacher-student-profile">

          <div className="teacher-profile-avatar">
            {student.name
              ? student.name
                  .charAt(0)
                  .toUpperCase()
              : "?"}
          </div>

          <div className="teacher-profile-info">

            <p className="teacher-eyebrow">
              STUDENT PERFORMANCE
            </p>

            <h1>
              {student.name}
            </h1>

            <p>
              @{student.username}
            </p>

          </div>

        </section>

        {/* STATS */}

        <section className="teacher-performance-stats">

          <div className="teacher-performance-stat">

            <span className="performance-stat-label">
              Average score
            </span>

            <strong
              className={getScoreClass(
                averageScore
              )}
            >
              {averageScore.toFixed(0)}%
            </strong>

          </div>

          <div className="teacher-performance-stat">

            <span className="performance-stat-label">
              Practice sessions
            </span>

            <strong>
              {totalSessions}
            </strong>

          </div>

          <div className="teacher-performance-stat">

            <span className="performance-stat-label">
              Questions answered
            </span>

            <strong>
              {totalQuestions}
            </strong>

          </div>

          <div className="teacher-performance-stat">

            <span className="performance-stat-label">
              Wrong words
            </span>

            <strong className="performance-stat-warning">
              {weakWords.length}
            </strong>

          </div>

        </section>

        {/* ASSIGNED SETS */}

        <section className="teacher-performance-section">

          <div className="teacher-section-header">

            <div>

              <p className="teacher-eyebrow">
                LEARNING MATERIAL
              </p>

              <h2>
                Assigned sets
              </h2>

            </div>

            <span>
              {assignedSets.length}{" "}
              {assignedSets.length === 1
                ? "set"
                : "sets"}
            </span>

          </div>

          {assignedSets.length === 0 ? (
            <div className="teacher-empty">

              <div className="teacher-empty-icon">
                📚
              </div>

              <h3>
                No sets assigned
              </h3>

              <p>
                This student doesn't have any
                flashcard sets yet.
              </p>

            </div>
          ) : (
            <div className="assigned-set-list">

              {assignedSets.map(
                (assignment) => {

                  const set =
                    assignment.flashcardSet ||
                    assignment.set ||
                    assignment;

                  const assignmentId =
                    assignment.id;

                  const setName =
                    set.name ||
                    assignment.name ||
                    "Flashcard set";

                  const description =
                    set.description ||
                    assignment.description ||
                    "Vocabulary practice";

                  const flashcardCount =
                    set.flashcardCount ??
                    assignment.flashcardCount;

                  const assignedAt =
                    assignment.assignedAt;

                  return (
                    <div
                      key={assignmentId}
                      className="assigned-set-card"
                    >

                      <div className="assigned-set-icon">
                        ✦
                      </div>

                      <div className="assigned-set-info">

                        <h3>
                          {setName}
                        </h3>

                        <p>
                          {description}
                        </p>

                        <div className="assigned-set-meta">

                          {flashcardCount !==
                            undefined && (
                            <span>
                              {flashcardCount}{" "}
                              words
                            </span>
                          )}

                          {assignedAt && (
                            <span>
                              Assigned{" "}
                              {formatDate(
                                assignedAt
                              )}
                            </span>
                          )}

                        </div>

                      </div>

                      <button
                        className="danger-outline-button"
                        type="button"
                        disabled={
                          removingAssignmentId ===
                          assignmentId
                        }
                        onClick={() =>
                          removeAssignment(
                            assignmentId
                          )
                        }
                      >
                        {removingAssignmentId ===
                        assignmentId
                          ? "Removing..."
                          : "Remove"}
                      </button>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* PRACTICE HISTORY */}

        <section className="teacher-performance-section">

          <div className="teacher-section-header">

            <div>

              <p className="teacher-eyebrow">
                PRACTICE ACTIVITY
              </p>

              <h2>
                Practice history
              </h2>

            </div>

            <span>
              {sessions.length}{" "}
              {sessions.length === 1
                ? "session"
                : "sessions"}
            </span>

          </div>

          {sessions.length === 0 ? (
            <div className="teacher-empty">

              <div className="teacher-empty-icon">
                ◷
              </div>

              <h3>
                No practice yet
              </h3>

              <p>
                Practice sessions will appear
                here after the student starts
                learning.
              </p>

            </div>
          ) : (
            <div className="teacher-session-list">

              {sessions.map((session) => (

                <div
                  key={session.id}
                  className="teacher-session-card"
                  onClick={() =>
                    navigate(
                      `/teacher/history/${session.id}`
                    )
                  }
                >

                  <div className="teacher-session-main">

                    <div className="teacher-session-icon">
                      ✓
                    </div>

                    <div>

                      <h3>
                        {session.setName}
                      </h3>

                      <p>
                        {formatDateTime(
                          session.startedAt
                        )}
                      </p>

                    </div>

                  </div>

                  <div className="teacher-session-result">

                    <strong
                      className={getScoreClass(
                        session.score
                      )}
                    >
                      {session.score}%
                    </strong>

                    <span>
                      {session.correctAnswers}/
                      {session.totalQuestions}
                    </span>

                  </div>

                  <button
                    className="teacher-view-button"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();

                      navigate(
                        `/teacher/history/${session.id}`
                      );
                    }}
                  >
                    View answers
                  </button>

                  <span className="teacher-card-arrow">
                    →
                  </span>

                </div>

              ))}

            </div>
          )}

        </section>

        {/* WEAK WORDS */}

        <section className="teacher-performance-section">

          <div className="teacher-section-header">

            <div>

              <p className="teacher-eyebrow">
                NEEDS PRACTICE
              </p>

              <h2>
                Weak words
              </h2>

            </div>

            <span>
              {weakWords.length}{" "}
              {weakWords.length === 1
                ? "word"
                : "words"}
            </span>

          </div>

          {weakWords.length === 0 ? (
            <div className="teacher-strong-message">

              <div className="strong-message-icon">
                ✓
              </div>

              <div>

                <h3>
                  No weak words yet
                </h3>

                <p>
                  Great! There are no incorrect
                  answers recorded for this student.
                </p>

              </div>

            </div>
          ) : (
            <div className="weak-word-list">

              {weakWords.map((word) => (

                <div
                  key={word.flashcardId}
                  className="weak-word-card"
                >

                  <div className="weak-word-icon">
                    !
                  </div>

                  <div className="weak-word-content">

                    <h3>
                      {word.word}
                    </h3>

                    <p>
                      {word.correctMeaning}
                    </p>

                    <span>
                      Last wrong:{" "}
                      {formatDateTime(
                        word.lastWrongAt
                      )}
                    </span>

                  </div>

                  <div className="weak-word-count">

                    <strong>
                      {word.wrongCount}
                    </strong>

                    <span>
                      {word.wrongCount === 1
                        ? "mistake"
                        : "mistakes"}
                    </span>

                  </div>

                </div>

              ))}

            </div>
          )}

        </section>

        {/* ANSWER HISTORY */}

        <section className="teacher-performance-section">

          <div className="teacher-section-header">

            <div>

              <p className="teacher-eyebrow">
                ANSWER HISTORY
              </p>

              <h2>
                Recent answers
              </h2>

            </div>

            <span>
              {attempts.length}{" "}
              {attempts.length === 1
                ? "answer"
                : "answers"}
            </span>

          </div>

          {attempts.length === 0 ? (
            <div className="teacher-empty">

              <div className="teacher-empty-icon">
                ✓
              </div>

              <h3>
                No answers yet
              </h3>

              <p>
                Answer history will appear here
                after practice.
              </p>

            </div>
          ) : (
            <div className="teacher-attempt-list">

              {attempts.map(
                (attempt) => (

                  <div
                    key={attempt.attemptId}
                    className={`teacher-attempt-card ${
                      attempt.isCorrect
                        ? "teacher-attempt-correct"
                        : "teacher-attempt-wrong"
                    }`}
                  >

                    <div
                      className={`teacher-attempt-status ${
                        attempt.isCorrect
                          ? "status-correct"
                          : "status-wrong"
                      }`}
                    >
                      {attempt.isCorrect
                        ? "✓"
                        : "×"}
                    </div>

                    <div className="teacher-attempt-content">

                      <h3>
                        {attempt.word}
                      </h3>

                      <div className="teacher-attempt-answer">

                        <span>
                          Selected:
                        </span>

                        <strong>
                          {attempt.selectedMeaning}
                        </strong>

                      </div>

                      {!attempt.isCorrect && (
                        <div className="teacher-attempt-answer correct-answer">

                          <span>
                            Correct:
                          </span>

                          <strong>
                            {attempt.correctMeaning}
                          </strong>

                        </div>
                      )}

                    </div>

                    <time>
                      {formatDateTime(
                        attempt.answeredAt
                      )}
                    </time>

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

export default StudentPerformance;

