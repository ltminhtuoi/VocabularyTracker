import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import FlashcardSetDetails from "./pages/FlashcardSetDetails";
import Practice from "./pages/Practice";
import History from "./pages/History";
import HistoryDetails from "./pages/HistoryDetails";
import StudentPerformance from "./pages/StudentPerformance";
import TeacherHistoryDetails from "./pages/TeacherHistoryDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/teacher"
          element={<TeacherDashboard />}
        />

        <Route
          path="/teacher/sets/:id"
          element={<FlashcardSetDetails />}
        />

        <Route
          path="/student"
          element={<StudentDashboard />}
        />

        <Route
          path="/student/practice/:setId"
          element={<Practice />}
        />

        <Route
          path="/student/history"
          element={<History />}
        />
        <Route
          path="/student/history/:sessionId"
          element={<HistoryDetails />}
        />
        <Route
          path="/teacher/students/:studentId"
          element={<StudentPerformance />}
        />
        <Route
          path="/teacher/history/:sessionId"
          element={<TeacherHistoryDetails />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;