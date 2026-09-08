import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudentHeader from "../components/StudentHeader";
import { Home, RotateCcw } from "lucide-react";
import { API_BASE_URL } from "../services/api";

function Mascot({ size = 100, score = 0 }) {
  const isAmazing = score >= 90;
  const isGreat = score >= 80;
  const isNice = score >= 50;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* ears */}
      <ellipse
        cx={isAmazing ? "32" : "35"}
        cy={isAmazing ? "19" : "22"}
        rx="10"
        ry="21"
        fill="#58CC02"
        transform={isNice ? "" : "rotate(-5 35 22)"}
      />

      <ellipse
        cx={isAmazing ? "68" : "65"}
        cy={isAmazing ? "19" : "22"}
        rx="10"
        ry="21"
        fill="#58CC02"
        transform={isNice ? "" : "rotate(5 65 22)"}
      />

      {/* inner ears */}
      <ellipse
        cx={isAmazing ? "32" : "35"}
        cy={isAmazing ? "19" : "22"}
        rx="4"
        ry="13"
        fill="#A8E86B"
      />

      <ellipse
        cx={isAmazing ? "68" : "65"}
        cy={isAmazing ? "19" : "22"}
        rx="4"
        ry="13"
        fill="#A8E86B"
      />

      {/* head */}
      <circle
        cx="50"
        cy="55"
        r="32"
        fill="#58CC02"
      />

      {/* AMAZING - excited eyes */}
      {isAmazing ? (
        <>
          <circle cx="38" cy="51" r="4.5" fill="#263238" />
          <circle cx="62" cy="51" r="4.5" fill="#263238" />

          <circle cx="39.5" cy="49.5" r="1.3" fill="white" />
          <circle cx="63.5" cy="49.5" r="1.3" fill="white" />

          {/* happy eyebrows */}
          <path
            d="M34 44C37 41 40 41 43 43"
            stroke="#263238"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M57 43C60 41 63 41 66 44"
            stroke="#263238"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          {/* normal eyes */}
          <circle
            cx="39"
            cy="52"
            r="4"
            fill="#263238"
          />
          <circle
            cx="61"
            cy="52"
            r="4"
            fill="#263238"
          />

          {/* eye highlights */}
          <circle
            cx="40.5"
            cy="50.5"
            r="1.2"
            fill="white"
          />
          <circle
            cx="62.5"
            cy="50.5"
            r="1.2"
            fill="white"
          />
        </>
      )}

      {/* nose */}
      <path
        d="M47 61C49 59 51 59 53 61C51 64 49 64 47 61Z"
        fill="#263238"
      />

      {/* 90%+ big happy smile */}
      {isAmazing && (
        <path
          d="M42 65C45 72 55 72 58 65"
          stroke="#263238"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}

      {/* 80-89% happy smile */}
      {isGreat && !isAmazing && (
        <path
          d="M43 65C46 70 54 70 57 65"
          stroke="#263238"
          strokeWidth="2.3"
          strokeLinecap="round"
        />
      )}

      {/* 50-79% gentle smile */}
      {isNice && !isGreat && (
        <path
          d="M44 65C47 68 53 68 56 65"
          stroke="#263238"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}

      {/* below 50% - concerned expression */}
      {!isNice && (
        <>
          <path
            d="M34 46C37 44 40 44 43 46"
            stroke="#263238"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M57 46C60 44 63 44 66 46"
            stroke="#263238"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M43 69C46 66 54 66 57 69"
            stroke="#263238"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

function Practice() {
  const { setId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState(null);

  const [loading, setLoading] = useState(true);
  const [answering, setAnswering] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

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
        `${API_BASE_URL}/Practice/start`,
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
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/StudentPractice/question/${currentSessionId}`,
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
        `${API_BASE_URL}/Practice/answer`,
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

      setTimeout(async () => {
        setTransitioning(true);

        await new Promise((resolve) =>
          setTimeout(resolve, 300)
        );

        if (data.finished) {
          setFinished(true);

          setResult({
            score: data.score || 0,
            correctAnswers: data.correctAnswers || 0,
            totalQuestions: data.totalQuestions || 0,
          });

          setQuestion(null);
          setAnswering(false);
          setTransitioning(false);
        } else {
          await loadQuestion(sessionId);

          setAnswering(false);

          setTimeout(() => {
            setTransitioning(false);
          }, 50);
        }
      }, 1200);

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
        `${API_BASE_URL}/Practice/start`,
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

  let message = "";

  if (percentage >= 90) {
    message = "Amazing!";
  } else if (percentage >= 80) {
    message = "Great job!";
  } else if (percentage >= 50) {
    message = "Nice work!";
  } else {
    message = "Good try!";
  }

  return (
    <div className="practice-page">
      <StudentHeader />

      <main className="practice-result-container">
        <div className="result-card">

          <div className="result-character">
            <Mascot size={100} score={percentage} />
          </div>

          <h1 className="result-title">
            {message}
          </h1>

          <div className="result-score-box">

            <div className="result-score">
              {percentage}%
            </div>

            <p className="result-correct">
              {result.correctAnswers} of{" "}
              {result.totalQuestions} correct
            </p>

            <div className="result-progress">
              <div
                className="result-progress-fill"
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>

          </div>

          <div className="result-actions">
  <button
    className="result-icon-button practice-again-icon"
    onClick={restartPractice}
    disabled={loading}
    title="Practice again"
    aria-label="Practice again"
    type="button"
  >
    <RotateCcw size={21} strokeWidth={2.2} />
  </button>

  <button
    className="result-icon-button home-icon"
    onClick={() => navigate("/student")}
    title="Go home"
    aria-label="Go home"
    type="button"
  >
    <Home size={21} strokeWidth={2.2} />
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

        <div
          className={`practice-card ${
            transitioning ? "is-transitioning" : ""
          }`}
        >

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

