import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentHeader from "../components/StudentHeader";
import { API_BASE_URL } from "../services/api";
function StudentDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mainSet = sets.find((set) => set.name.startsWith("Main-"));
  async function loadSets() {
    try {
      const response = await fetch(`${API_BASE_URL}/StudentPractice/sets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to load flashcard sets.");
      }
      setSets(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadSets();
  }, []);
  const completedSets = sets.filter((set) => set.completed).length;
  const totalFlashcards = sets.reduce(
    (total, set) => total + (set.flashcardCount || 0),
    0,
  );
  const averageScore =
    completedSets > 0
      ? sets
          .filter((set) => set.completed)
          .reduce((total, set) => total + (set.bestScore || 0), 0) /
        completedSets
      : 0;
  const otherSets = sets.filter((set) => !set.name.startsWith("Main-"));
  return (
    <div className="student-page">
      <StudentHeader />

      <main className="student-content">
        <section className="student-welcome">
          <div>
            <p className="student-eyebrow"> KEEP LEARNING </p>{" "}
            <h1>Hi, {name}!</h1>
            <p>Ready to learn some new words?</p>
          </div>
          <div className="welcome-character">
            <span>V</span>{" "}
          </div>
        </section>
        {error && <div className="error-message">{error}</div>}
        {!loading && !error && mainSet && (
          <section className="student-main-set">
            {" "}
            <div className="student-main-content">
              {" "}
              <p className="student-eyebrow">THIS WEEK</p>
              <h2>Ready?</h2>
              <p>Practice your words.</p>
              <span>{mainSet.flashcardCount || 0} words</span>
            </div>
            <button
              className="student-main-play-button"
              onClick={() => navigate(`/student/practice/${mainSet.id}`)}
            >
              <span className="play-icon">▶</span> PLAY{" "}
            </button>
          </section>
        )}
        {!loading && !error && sets.length > 0 && (
          <section className="student-stats-grid">
            {" "}
            <div className="student-stat-card">
              <div className="student-stat-icon green"> ✓ </div>{" "}
              <div>
                {" "}
                <span>Completed</span> <strong>{completedSets}</strong>
              </div>{" "}
            </div>{" "}
            <div className="student-stat-card">
              {" "}
              <div className="student-stat-icon blue"> 📚</div>
              <div>
                {" "}
                <span>Total words</span>
                <strong>{totalFlashcards}</strong>{" "}
              </div>{" "}
            </div>{" "}
            <div className="student-stat-card">
              {" "}
              <div className="student-stat-icon yellow"> ★ </div>{" "}
              <div>
                {" "}
                <span>Best average</span>{" "}
                <strong> {averageScore.toFixed(0)}%</strong>
              </div>
            </div>
          </section>
        )}
        <section className="student-sets-section">
          {" "}
          <div className="student-section-header">
            {" "}
            <div>
              {" "}
              <p className="student-eyebrow"> YOUR LEARNING </p>
              <h2>My flashcard sets</h2>{" "}
            </div>{" "}
            {!loading && !error && (
              <span className="set-count">{otherSets.length} sets </span>
            )}
          </div>
          {loading && (
            <div className="student-loading">
              {" "}
              <div className="loading-circle"></div>{" "}
              <p>Loading your sets...</p>{" "}
            </div>
          )}
          {!loading && !error && sets.length === 0 && (
            <div className="student-empty">
              <div className="empty-icon"></div>
              <h3>Nothing here yet</h3>
              <p> Your teacher hasn't assigned any flashcard sets yet.</p>
            </div>
          )}
          {!loading && !error && otherSets.length > 0 && (
            <div className="student-set-grid">
              {" "}
              {otherSets.map((set) => {
                const score = set.bestScore || 0;
                return (
                  <div className="student-set-card" key={set.id}>
                    {" "}
                    <div className="student-set-top">
                      {" "}
                      <div className="student-set-icon"> ✦ </div>{" "}
                      {set.completed && (
                        <span className="completed-badge">✓ Completed </span>
                      )}
                    </div>
                    <div className="student-set-body">
                      <h3>{set.name}</h3>{" "}
                      <p> {set.description || "Vocabulary practice"} </p>{" "}
                      <div className="student-set-info">
                        {" "}
                        <span> {set.flashcardCount} words </span>
                        {set.completed && (
                          <span>
                            {" "}
                            Best: <strong> {score}% </strong>{" "}
                          </span>
                        )}
                      </div>
                      <div className="student-progress">
                        {" "}
                        <div className="student-progress-label">
                          {" "}
                          <span>
                            {" "}
                            {set.completed ? "Completed" : "Not started"}{" "}
                          </span>{" "}
                          <span> {set.completed ? "100%" : "0%"} </span>
                        </div>
                        <div className="progress-bar">
                          {" "}
                          <div
                            className="progress-bar-fill"
                            style={{ width: set.completed ? "100%" : "0%" }}
                          />{" "}
                        </div>{" "}
                      </div>{" "}
                    </div>
                    <button
                      className="student-practice-button"
                      onClick={() => navigate(`/student/practice/${set.id}`)}
                    >
                      {" "}
                      {set.completed ? "Practice again" : "Start practice"}{" "}
                      <span>→</span>{" "}
                    </button>{" "}
                  </div>
                );
              })}{" "}
            </div>
          )}{" "}
        </section>{" "}
      </main>
    </div>
  );
}
export default StudentDashboard;
