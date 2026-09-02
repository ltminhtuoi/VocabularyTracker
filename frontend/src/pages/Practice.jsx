import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudentHeader from "../components/StudentHeader";

function Practice() {
  const { setId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState(null);

  const [loading, setLoading] = useState(true);
  const [answering, setAnswering] = useState(false);

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);

  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState(null);

  const [error, setError] = useState("");

  // ========================================
  // START PRACTICE
  // ========================================

  async function startPractice() {
    try {
      setLoading(true);
      setError("");
      setQuestion(null);

      const response = await fetch(
        "http://localhost:5279/api/Practice/start",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            flashcardSetId: Number(setId),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to start practice."
        );
      }

      setSessionId(data.sessionId);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  // ========================================
  // LOAD QUESTION
  // ========================================

  async function loadQuestion(currentSessionId) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5279/api/StudentPractice/question/${currentSessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load question."
        );
      }

      // Practice is finished
      if (data.finished) {
        setFinished(true);

        setResult({
          score: data.score || 0,
          correctAnswers: data.correctAnswers || 0,
          totalQuestions: data.totalQuestions || 0,
        });

        setQuestion(null);
        setLoading(false);

        return;
      }

      /*
       * Make sure options is always an array.
       * This prevents question.options.map()
       * from crashing the page.
       */
      const safeQuestion = {
        ...data,
        options: Array.isArray(data.options)
          ? data.options
          : [],
      };

      setQuestion(safeQuestion);

      setSelectedAnswer(null);
      setAnswerResult(null);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // INITIAL PRACTICE
  // ========================================

  useEffect(() => {
    startPractice();
  }, [setId]);

  // ========================================
  // LOAD QUESTION WHEN SESSION EXISTS
  // ========================================

  useEffect(() => {
    if (sessionId) {
      loadQuestion(sessionId);
    }
  }, [sessionId]);

  // ========================================
  // SUBMIT ANSWER
  // ========================================

  async function submitAnswer(meaning) {
    if (
      answering ||
      selectedAnswer !== null ||
      !question
    ) {
      return;
    }

    setSelectedAnswer(meaning);
    setAnswering(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5279/api/Practice/answer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sessionId: sessionId,
            flashcardId: question.flashcardId,
            selectedMeaning: meaning,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to submit answer."
        );
      }

      setAnswerResult(data);

      setTimeout(() => {
        if (data.finished) {
          setFinished(true);

          setResult({
            score: data.score || 0,
            correctAnswers:
              data.correctAnswers || 0,
            totalQuestions:
              data.totalQuestions || 0,
          });

          setQuestion(null);
          setLoading(false);
          setAnswering(false);
        } else {
          loadQuestion(sessionId);
          setAnswering(false);
        }
      }, 1500);

    } catch (error) {
      setError(error.message);
      setSelectedAnswer(null);
      setAnswering(false);
    }
  }

  // ========================================
  // OPTION STYLE
  // ========================================

  function getOptionClass(option) {
    if (!answerResult) {
      return "";
    }

    if (
      option === answerResult.correctMeaning
    ) {
      return "correct";
    }

    if (
      option === selectedAnswer &&
      !answerResult.isCorrect
    ) {
      return "incorrect";
    }

    return "";
  }

  // ========================================
  // RESTART PRACTICE
  // ========================================

  async function restartPractice() {
    // Reset everything
    setSessionId(null);
    setQuestion(null);
    setSelectedAnswer(null);
    setAnswerResult(null);
    setFinished(false);
    setResult(null);
    setError("");
    setAnswering(false);
    setLoading(true);

    // Start a brand-new session
    try {
      const response = await fetch(
        "http://localhost:5279/api/Practice/start",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            flashcardSetId: Number(setId),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to restart practice."
        );
      }

      setSessionId(data.sessionId);

    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  // ========================================
  // RESULT SCREEN
  // ========================================

  if (finished && result) {
    const percentage = result.score || 0;

    return (
      <div className="practice-page">

        <StudentHeader />

        <main className="practice-result-container">

          <div className="result-card">

            <div className="result-trophy">
              {percentage >= 80
                ? "🏆"
                : percentage >= 50
                ? "⭐"
                : "💪"}
            </div>

            <p className="result-eyebrow">
              PRACTICE COMPLETE
            </p>

            <h1>
              {percentage >= 80
                ? "Amazing work!"
                : percentage >= 50
                ? "Nice job!"
                : "Keep going!"}
            </h1>

            <p className="result-message">
              You finished this practice session.
            </p>

            <div className="result-score">
              {percentage}%
            </div>

            <div className="result-stats">

              <div>
                <span>Correct</span>

                <strong>
                  {result.correctAnswers}
                </strong>
              </div>

              <div>
                <span>Total</span>

                <strong>
                  {result.totalQuestions}
                </strong>
              </div>

            </div>

            <div className="result-actions">

              <button
                className="primary-button"
                onClick={restartPractice}
                disabled={loading}
              >
                {loading
                  ? "Starting..."
                  : "Practice again"}
              </button>

              <button
                className="secondary-button"
                onClick={() =>
                  navigate("/student/history")
                }
              >
                View history
              </button>

            </div>

          </div>

        </main>

      </div>
    );
  }

  // ========================================
  // ERROR SCREEN
  // ========================================

  if (error && !question && !loading) {
    return (
      <div className="practice-page">

        <StudentHeader />

        <main className="practice-container">

          <div className="practice-error">

            <div>!</div>

            <h2>
              Something went wrong
            </h2>

            <p>
              {error}
            </p>

            <button
              className="primary-button"
              onClick={() =>
                navigate("/student")
              }
            >
              Back to my sets
            </button>

          </div>

        </main>

      </div>
    );
  }

  // ========================================
  // LOADING SCREEN
  // ========================================

  if (loading || !question) {
    return (
      <div className="practice-page">

        <StudentHeader />

        <main className="practice-container">

          <div className="practice-loading">

            <div className="loading-circle"></div>

            <p>
              Getting your next question...
            </p>

          </div>

        </main>

      </div>
    );
  }

  // ========================================
  // QUESTION DATA
  // ========================================

  const questionNumber =
    question.questionNumber ||
    question.currentQuestion ||
    1;

  const totalQuestions =
    question.totalQuestions || 1;

  const progress =
    (questionNumber / totalQuestions) * 100;

  /*
   * IMPORTANT:
   * Always create a safe array.
   */
  const options = Array.isArray(
    question.options
  )
    ? question.options
    : [];

  // ========================================
  // QUESTION SCREEN
  // ========================================

  return (
    <div className="practice-page">

      <StudentHeader />

      <main className="practice-container">

        {/* TOP BAR */}

        <div className="practice-top">

          <button
            className="practice-close"
            type="button"
            onClick={() =>
              navigate("/student")
            }
          >
            ×
          </button>

          <div className="practice-title">
            Practice
          </div>

          <div className="practice-question-count">
            {questionNumber}/{totalQuestions}
          </div>

        </div>

        {/* PROGRESS */}

        <div className="practice-progress">

          <div className="practice-progress-track">

            <div
              className="practice-progress-fill"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

        </div>

        {/* QUESTION CARD */}

        <div className="practice-card">

          <p className="practice-label">
            WHAT DOES THIS WORD MEAN?
          </p>

          <div className="practice-word">
            {question.word}
          </div>

          {question.exampleSentence && (
            <p className="practice-example">
              "{question.exampleSentence}"
            </p>
          )}

          {/* ANSWER OPTIONS */}

          {options.length === 0 ? (

            <div className="practice-no-options">

              <div className="practice-no-options-icon">
                !
              </div>

              <h3>
                No answer choices
              </h3>

              <p>
                This question does not have any
                answer choices.
              </p>

              <button
                className="secondary-button"
                type="button"
                onClick={() =>
                  loadQuestion(sessionId)
                }
              >
                Try again
              </button>

            </div>

          ) : (

            <div className="answer-options">

              {options.map(
                (option, index) => (

                  <button
                    key={`${option}-${index}`}
                    type="button"
                    className={`answer-option ${getOptionClass(
                      option
                    )}`}
                    onClick={() =>
                      submitAnswer(option)
                    }
                    disabled={
                      selectedAnswer !== null ||
                      answering
                    }
                  >

                    <span className="answer-letter">
                      {String.fromCharCode(
                        65 + index
                      )}
                    </span>

                    <span>
                      {option}
                    </span>

                    {answerResult &&
                      option ===
                        answerResult.correctMeaning && (
                      <span className="answer-check">
                        ✓
                      </span>
                    )}

                    {answerResult &&
                      option ===
                        selectedAnswer &&
                      !answerResult.isCorrect &&
                      option !==
                        answerResult.correctMeaning && (
                      <span className="answer-cross">
                        ×
                      </span>
                    )}

                  </button>

                )
              )}

            </div>

          )}

          {/* ANSWER FEEDBACK */}

          {answerResult && (
            <div
              className={`answer-feedback ${
                answerResult.isCorrect
                  ? "feedback-correct"
                  : "feedback-incorrect"
              }`}
            >

              <strong>
                {answerResult.isCorrect
                  ? "Correct!"
                  : "Not quite!"}
              </strong>

              {!answerResult.isCorrect && (
                <span>
                  Correct answer:{" "}
                  {answerResult.correctMeaning}
                </span>
              )}

            </div>
          )}

        </div>

      </main>

    </div>
  );
}

export default Practice;

