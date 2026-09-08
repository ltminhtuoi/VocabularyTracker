import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TeacherHeader from "../components/TeacherHeader";
import { API_BASE_URL } from "../services/api";

function TeacherDashboard() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");

  const [students, setStudents] = useState([]);
  const [sets, setSets] = useState([]);

  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingSets, setLoadingSets] = useState(true);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [setName, setSetName] = useState("");
  const [setDescription, setSetDescription] = useState("");

  const [selectedImportSetId, setSelectedImportSetId] =
    useState("");

  const [selectedAssignmentSetId, setSelectedAssignmentSetId] =
    useState("");

  const [selectedStudentId, setSelectedStudentId] =
    useState("");

  const [jsonText, setJsonText] = useState("");

  const [creatingSet, setCreatingSet] = useState(false);
  const [importing, setImporting] = useState(false);
  const [assigning, setAssigning] = useState(false);

  async function loadStudents() {
    try {
      setLoadingStudents(true);

      const response = await fetch(
        `${API_BASE_URL}/TeacherDashboard/students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load students."
        );
      }

      setStudents(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingStudents(false);
    }
  }

  async function loadSets() {
    try {
      setLoadingSets(true);

      const response = await fetch(
        `${API_BASE_URL}/FlashcardSet`,
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
            "Failed to load flashcard sets."
        );
      }

      setSets(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingSets(false);
    }
  }

  useEffect(() => {
    loadStudents();
    loadSets();
  }, []);

  async function createSet(e) {
    e.preventDefault();

    if (!setName.trim()) {
      setError("Please enter a set name.");
      return;
    }

    try {
      setCreatingSet(true);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_BASE_URL}/FlashcardSet?name=${encodeURIComponent(
          setName
        )}&description=${encodeURIComponent(
          setDescription
        )}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create flashcard set."
        );
      }

      setSetName("");
      setSetDescription("");

      setSuccessMessage(
        "Flashcard set created successfully."
      );

      await loadSets();
    } catch (error) {
      setError(error.message);
    } finally {
      setCreatingSet(false);
    }
  }

  async function importFlashcards(e) {
    e.preventDefault();

    if (!selectedImportSetId) {
      setError("Please select a flashcard set.");
      return;
    }

    if (!jsonText.trim()) {
      setError("Please paste your JSON first.");
      return;
    }

    try {
      setImporting(true);
      setError("");
      setSuccessMessage("");

      let parsedJson;

      try {
        parsedJson = JSON.parse(jsonText);
      } catch {
        throw new Error(
          "Invalid JSON. Please check the format."
        );
      }

      const flashcards = Array.isArray(parsedJson)
        ? parsedJson
        : parsedJson.flashcards;

      if (
        !Array.isArray(flashcards) ||
        flashcards.length === 0
      ) {
        throw new Error(
          "No flashcards were found in the JSON."
        );
      }

      const formattedFlashcards = flashcards.map(
        (card) => ({
          word: card.word || "",
          meaning:
            card.meaning ||
            card.correctMeaning ||
            "",
          example:
            card.example ||
            card.exampleSentence ||
            "",
        })
      );

      const invalidCard = formattedFlashcards.find(
        (card) =>
          !card.word.trim() ||
          !card.meaning.trim()
      );

      if (invalidCard) {
        throw new Error(
          "Every flashcard must have a word and meaning."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/Flashcard/import`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            flashcardSetId:
              Number(selectedImportSetId),
            flashcards: formattedFlashcards,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to import flashcards."
        );
      }

      setJsonText("");

      setSuccessMessage(
        `${formattedFlashcards.length} flashcards imported successfully.`
      );

      await loadSets();
    } catch (error) {
      setError(error.message);
    } finally {
      setImporting(false);
    }
  }

  async function assignSet(e) {
    e.preventDefault();

    if (!selectedStudentId) {
      setError("Please select a student.");
      return;
    }

    if (!selectedAssignmentSetId) {
      setError("Please select a flashcard set.");
      return;
    }

    try {
      setAssigning(true);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_BASE_URL}/Assignment?studentId=${selectedStudentId}&flashcardSetId=${selectedAssignmentSetId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to assign flashcard set."
        );
      }

      setSelectedStudentId("");
      setSelectedAssignmentSetId("");

      setSuccessMessage(
        "Flashcard set assigned successfully."
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setAssigning(false);
    }
  }

  const totalStudents = students.length;
  const totalSets = sets.length;

  const totalFlashcards = sets.reduce(
    (total, set) =>
      total + (set.flashcardCount || 0),
    0
  );

  const averageScore =
    students.length > 0
      ? students.reduce(
          (total, student) =>
            total + (student.averageScore || 0),
          0
        ) / students.length
      : 0;

  return (
    <div className="teacher-page">
      <TeacherHeader />

      <main className="teacher-dashboard-content">

        {/* WELCOME */}

        <section className="teacher-welcome">
          <div>
            <p className="teacher-eyebrow">
              TEACHER DASHBOARD
            </p>

            <h1>
              Hi, {name}!
            </h1>

            <p>
              Manage your students and vocabulary
              sets.
            </p>
          </div>

          <div className="teacher-welcome-icon">
            V
          </div>
        </section>

        {/* MESSAGES */}

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

        {successMessage && (
          <div className="teacher-message teacher-message-success">
            <span>✓ {successMessage}</span>

            <button
              type="button"
              onClick={() =>
                setSuccessMessage("")
              }
            >
              ×
            </button>
          </div>
        )}

        {/* STATS */}

        <section className="teacher-stats">

          <div className="teacher-stat-card">
            <div className="teacher-stat-icon green">
              👤
            </div>

            <div>
              <span>Students</span>
              <strong>{totalStudents}</strong>
            </div>
          </div>

          <div className="teacher-stat-card">
            <div className="teacher-stat-icon blue">
              📚
            </div>

            <div>
              <span>Flashcard sets</span>
              <strong>{totalSets}</strong>
            </div>
          </div>

          <div className="teacher-stat-card">
            <div className="teacher-stat-icon yellow">
              ✦
            </div>

            <div>
              <span>Total words</span>
              <strong>{totalFlashcards}</strong>
            </div>
          </div>

          <div className="teacher-stat-card">
            <div className="teacher-stat-icon purple">
              %
            </div>

            <div>
              <span>Average score</span>
              <strong>
                {averageScore.toFixed(0)}%
              </strong>
            </div>
          </div>

        </section>

        {/* CREATE + IMPORT */}

        <section className="teacher-tools-grid">

          {/* CREATE SET */}

          <div className="teacher-tool-card">

            <div className="teacher-tool-header">

              <div className="teacher-tool-icon green">
                +
              </div>

              <div>
                <h2>
                  Create a flashcard set
                </h2>

                <p>
                  Start a new vocabulary collection.
                </p>
              </div>

            </div>

            <form onSubmit={createSet}>

              <div className="teacher-field">

                <label htmlFor="set-name">
                  Set name
                </label>

                <input
                  id="set-name"
                  type="text"
                  value={setName}
                  onChange={(e) =>
                    setSetName(e.target.value)
                  }
                  placeholder="e.g. Daily English"
                />

              </div>

              <div className="teacher-field">

                <label htmlFor="set-description">
                  Description
                </label>

                <input
                  id="set-description"
                  type="text"
                  value={setDescription}
                  onChange={(e) =>
                    setSetDescription(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Common words for beginners"
                />

              </div>

              <button
                className="primary-button teacher-full-button"
                type="submit"
                disabled={creatingSet}
              >
                {creatingSet
                  ? "Creating..."
                  : "Create set"}
              </button>

            </form>

          </div>

          {/* IMPORT */}

          <div className="teacher-tool-card">

            <div className="teacher-tool-header">

              <div className="teacher-tool-icon blue">
                ↓
              </div>

              <div>
                <h2>
                  Import flashcards
                </h2>

                <p>
                  Add many words at once using JSON.
                </p>
              </div>

            </div>

            <form onSubmit={importFlashcards}>

              <div className="teacher-field">

                <label htmlFor="import-set">
                  Flashcard set
                </label>

                <select
                  id="import-set"
                  value={selectedImportSetId}
                  onChange={(e) =>
                    setSelectedImportSetId(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select a set
                  </option>

                  {sets.map((set) => (
                    <option
                      key={set.id}
                      value={set.id}
                    >
                      {set.name}
                    </option>
                  ))}
                </select>

              </div>

              <div className="teacher-field">

                <label htmlFor="json-text">
                  JSON
                </label>

                <textarea
                  id="json-text"
                  value={jsonText}
                  onChange={(e) =>
                    setJsonText(e.target.value)
                  }
                  placeholder={`[
  {
    "word": "apple",
    "meaning": "quả táo",
    "example": "I ate an apple."
  }
]`}
                  rows="7"
                />

              </div>

              <button
                className="primary-button teacher-full-button"
                type="submit"
                disabled={importing}
              >
                {importing
                  ? "Importing..."
                  : "Import flashcards"}
              </button>

            </form>

          </div>

        </section>

        {/* ASSIGN SET */}

        <section className="teacher-tool-card teacher-assignment-card">

          <div className="teacher-tool-header">

            <div className="teacher-tool-icon yellow">
              →
            </div>

            <div>
              <h2>
                Assign a set to a student
              </h2>

              <p>
                Choose a student and give them a
                vocabulary set to practice.
              </p>
            </div>

          </div>

          <form
            className="teacher-assignment-form"
            onSubmit={assignSet}
          >

            <div className="teacher-field">

              <label htmlFor="student-select">
                Student
              </label>

              <select
                id="student-select"
                value={selectedStudentId}
                onChange={(e) =>
                  setSelectedStudentId(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select a student
                </option>

                {students.map((student) => (
                  <option
                    key={student.studentId}
                    value={student.studentId}
                  >
                    {student.name}
                  </option>
                ))}
              </select>

            </div>

            <div className="teacher-field">

              <label htmlFor="assignment-set">
                Flashcard set
              </label>

              <select
                id="assignment-set"
                value={selectedAssignmentSetId}
                onChange={(e) =>
                  setSelectedAssignmentSetId(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select a set
                </option>

                {sets.map((set) => (
                  <option
                    key={set.id}
                    value={set.id}
                  >
                    {set.name}
                  </option>
                ))}
              </select>

            </div>

            <button
              className="primary-button teacher-assign-button"
              type="submit"
              disabled={assigning}
            >
              {assigning
                ? "Assigning..."
                : "Assign set"}
            </button>

          </form>

        </section>

        {/* STUDENTS */}

        <section className="teacher-section">

          <div className="teacher-section-header">

            <div>
              <p className="teacher-eyebrow">
                YOUR STUDENTS
              </p>

              <h2>
                Students
              </h2>
            </div>

            <span>
              {students.length}{" "}
              {students.length === 1
                ? "student"
                : "students"}
            </span>

          </div>

          {loadingStudents ? (
            <div className="teacher-loading">
              <div className="loading-circle"></div>

              <p>
                Loading students...
              </p>
            </div>
          ) : students.length === 0 ? (
            <div className="teacher-empty">

              <div className="teacher-empty-icon">
                👤
              </div>

              <h3>
                No students yet
              </h3>

              <p>
                Add student accounts in Supabase
                and assign them to yourself.
              </p>

            </div>
          ) : (
            <div className="teacher-student-grid">

              {students.map((student) => (

                <button
                  key={student.studentId}
                  type="button"
                  className="teacher-student-card"
                  onClick={() =>
                    navigate(
                      `/teacher/students/${student.studentId}`
                    )
                  }
                >

                  <div className="teacher-student-avatar">
                    {student.name
                      ? student.name
                          .charAt(0)
                          .toUpperCase()
                      : "?"}
                  </div>

                  <div className="teacher-student-info">

                    <h3>
                      {student.name}
                    </h3>

                    <p>
                      @{student.username}
                    </p>

                  </div>

                  <div className="teacher-student-score">

                    <strong>
                      {student.averageScore
                        ? student.averageScore.toFixed(
                            0
                          )
                        : 0}
                      %
                    </strong>

                    <span>
                      {student.totalSessions}{" "}
                      {student.totalSessions === 1
                        ? "session"
                        : "sessions"}
                    </span>

                  </div>

                  <span className="teacher-card-arrow">
                    →
                  </span>

                </button>

              ))}

            </div>
          )}

        </section>

        {/* FLASHCARD SETS */}

        <section className="teacher-section">

          <div className="teacher-section-header">

            <div>
              <p className="teacher-eyebrow">
                YOUR CONTENT
              </p>

              <h2>
                Flashcard sets
              </h2>
            </div>

            <span>
              {sets.length}{" "}
              {sets.length === 1
                ? "set"
                : "sets"}
            </span>

          </div>

          {loadingSets ? (
            <div className="teacher-loading">

              <div className="loading-circle"></div>

              <p>
                Loading flashcard sets...
              </p>

            </div>
          ) : sets.length === 0 ? (
            <div className="teacher-empty">

              <div className="teacher-empty-icon">
                📚
              </div>

              <h3>
                No flashcard sets yet
              </h3>

              <p>
                Create your first set above.
              </p>

            </div>
          ) : (
            <div className="teacher-set-grid">

              {sets.map((set) => (

                <button
                  key={set.id}
                  type="button"
                  className="teacher-set-card"
                  onClick={() =>
                    navigate(
                      `/teacher/sets/${set.id}`
                    )
                  }
                >

                  <div className="teacher-set-icon">
                    ✦
                  </div>

                  <div className="teacher-set-info">

                    <h3>
                      {set.name}
                    </h3>

                    <p>
                      {set.description ||
                        "Vocabulary practice"}
                    </p>

                  </div>

                  <div className="teacher-set-footer">

                    <span>
                      {set.flashcardCount || 0}{" "}
                      words
                    </span>

                    <span>
                      View →
                    </span>

                  </div>

                </button>

              ))}

            </div>
          )}

        </section>

      </main>
    </div>
  );
}

export default TeacherDashboard;

