import { useNavigate } from "react-router-dom";

function TeacherHeader() {
  const navigate = useNavigate();

  const name = localStorage.getItem("name");

  function logout() {
    localStorage.clear();
    window.location.href = "/";
  }

  return (
    <header className="teacher-header">

      <div
        className="teacher-logo"
        onClick={() => navigate("/teacher")}
      >
        Vocabulary Tracker
      </div>

      <nav className="teacher-nav">

        <button
          type="button"
          onClick={() => navigate("/teacher")}
        >
          Dashboard
        </button>

      </nav>

      <div className="teacher-header-right">

        <span>
          {name}
        </span>

        <button
          type="button"
          className="logout-button"
          onClick={logout}
        >
          Log out
        </button>

      </div>

    </header>
  );
}

export default TeacherHeader;

