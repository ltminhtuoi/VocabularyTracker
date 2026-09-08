import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TeacherHeader from "../components/TeacherHeader";
import { API_BASE_URL } from "../services/api";

function FlashcardSetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [set, setSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deletingFlashcardId, setDeletingFlashcardId] =
    useState(null);

  const token = localStorage.getItem("token");

  async function loadSet() {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/FlashcardSet/${id}`,
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
            "Failed to load flashcard set."
        );
      }

      setSet(data);
      setError("");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSet();
  }, [id]);

  async function deleteFlashcard(flashcardId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this flashcard?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingFlashcardId(flashcardId);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/Flashcard/${flashcardId}`,
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
            "Failed to delete flashcard."
        );
      }

      await loadSet();
    } catch (error) {
      setError(error.message);
    } finally {
      setDeletingFlashcardId(null);
    }
  }

  async function deleteSet() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${set.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/FlashcardSet/${id}`,
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
            "Failed to delete flashcard set."
        );
      }

      navigate("/teacher");
    } catch (error) {
      setError(error.message);
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="teacher-page">
        <TeacherHeader />

        <main className="set-details-content">
          <div className="teacher-loading">
            <div className="loading-circle"></div>

            <p>
              Loading flashcard set...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error && !set) {
    return (
      <div className="teacher-page">
        <TeacherHeader />

        <main className="set-details-content">
          <div className="set-details-error">

            <div className="set-error-icon">
              !
            </div>

            <h2>
              Unable to load set
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

  if (!set) {
    return (
      <div className="teacher-page">
        <TeacherHeader />

        <main className="set-details-content">
          <div className="set-details-error">

            <div className="set-error-icon">
              ?
            </div>

            <h2>
              Flashcard set not found
            </h2>

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

  const flashcards = set.flashcards || [];

  return (
    <div className="teacher-page">

      <TeacherHeader />

      <main className="set-details-content">

        {/* BACK */}

        <button
          className="set-details-back"
          type="button"
          onClick={() =>
            navigate("/teacher")
          }
        >
          ← Back to dashboard
        </button>

        {/* SET HEADER */}

        <section className="set-details-header">

          <div className="set-details-header-main">

            <div className="set-details-icon">
              ✦
            </div>

            <div className="set-details-title">

              <p className="teacher-eyebrow">
                FLASHCARD SET
              </p>

              <h1>
                {set.name}
              </h1>

              <p>
                {set.description ||
                  "Vocabulary practice"}
              </p>

            </div>

          </div>

          <div className="set-details-header-count">

            <strong>
              {flashcards.length}
            </strong>

            <span>
              {flashcards.length === 1
                ? "word"
                : "words"}
            </span>

          </div>

        </section>

        {/* ERROR */}

        {error && (
          <div className="teacher-message teacher-message-error">

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>

          </div>
        )}

        {/* ACTIONS */}

        <section className="set-details-actions">

          <div>

            <p className="teacher-eyebrow">
              SET MANAGEMENT
            </p>

            <h2>
              Manage this set
            </h2>

          </div>

          <button
            className="danger-outline-button set-delete-button"
            type="button"
            onClick={deleteSet}
            disabled={deleting}
          >
            {deleting
              ? "Deleting..."
              : "Delete set"}
          </button>

        </section>

        {/* FLASHCARDS */}

        <section className="set-details-section">

          <div className="teacher-section-header">

            <div>

              <p className="teacher-eyebrow">
                VOCABULARY
              </p>

              <h2>
                Flashcards
              </h2>

            </div>

            <span>
              {flashcards.length}{" "}
              {flashcards.length === 1
                ? "word"
                : "words"}
            </span>

          </div>

          {flashcards.length === 0 ? (

            <div className="teacher-empty">

              <div className="teacher-empty-icon">
                📚
              </div>

              <h3>
                No flashcards yet
              </h3>

              <p>
                This set is empty. Go back to the
                dashboard to import some vocabulary.
              </p>

              <button
                className="primary-button set-empty-button"
                type="button"
                onClick={() =>
                  navigate("/teacher")
                }
              >
                Back to dashboard
              </button>

            </div>

          ) : (

            <div className="flashcard-list">

              {flashcards.map(
                (flashcard, index) => (

                  <article
                    key={flashcard.id}
                    className="flashcard-item"
                  >

                    <div className="flashcard-number">
                      {index + 1}
                    </div>

                    <div className="flashcard-content">

                      <div className="flashcard-word-row">

                        <h3>
                          {flashcard.word}
                        </h3>

                        <button
                          className="flashcard-delete-button"
                          type="button"
                          disabled={
                            deletingFlashcardId ===
                            flashcard.id
                          }
                          onClick={() =>
                            deleteFlashcard(
                              flashcard.id
                            )
                          }
                        >
                          {deletingFlashcardId ===
                          flashcard.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>

                      <div className="flashcard-meaning">

                        <span>
                          Vietnamese meaning
                        </span>

                        <strong>
                          {flashcard.correctMeaning}
                        </strong>

                      </div>

                      {flashcard.exampleSentence && (
                        <div className="flashcard-example">

                          <span>
                            Example
                          </span>

                          <p>
                            "{flashcard.exampleSentence}"
                          </p>

                        </div>
                      )}

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </section>

      </main>
    </div>
  );
}

export default FlashcardSetDetails;

