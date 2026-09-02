import { useNavigate } from "react-router-dom";

function StudentHeader() {
  const navigate = useNavigate();

  const name = localStorage.getItem("name");

  function logout() {
    localStorage.clear();
    window.location.href = "/";
  }

  return (
    <header className="student-header">

      <div
        className="student-logo"
        onClick={() => navigate("/student")}
      >
        Vocabulary Tracker
      </div>

      <nav className="student-nav">

        <button
          onClick={() => navigate("/student")}
        >
          My Sets
        </button>

        <button
          onClick={() =>
            navigate("/student/history")
          }
        >
          History
        </button>

      </nav>

      <div className="student-header-right">

        <span>{name}</span>

        <button
          className="logout-button"
          onClick={logout}
        >
          Log out
        </button>

      </div>

    </header>
  );
}

export default StudentHeader;

