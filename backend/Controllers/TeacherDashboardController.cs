using System.Security.Claims;
using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Teacher")]
public class TeacherDashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public TeacherDashboardController(AppDbContext context)
    {
        _context = context;
    }

    // ==========================================
    // GET ALL STUDENTS
    // ==========================================

    [HttpGet("students")]
    public async Task<IActionResult> GetStudents()
    {
        var teacherId = GetCurrentUserId();

        var students = await _context.Students
            .Where(s => s.TeacherId == teacherId)
            .Include(s => s.User)
            .Select(s => new
            {
                studentId = s.Id,
                userId = s.UserId,
                username = s.User.Username,
                name = s.User.Name,

                totalSessions =
                    _context.PracticeSessions
                        .Count(ps =>
                            ps.StudentId == s.Id),

                averageScore =
                    _context.PracticeSessions
                        .Where(ps =>
                            ps.StudentId == s.Id)
                        .Select(ps =>
                            (double?)ps.Score)
                        .Average() ?? 0
            })
            .ToListAsync();

        return Ok(students);
    }

    // ==========================================
    // GET STUDENT PERFORMANCE
    // ==========================================

    [HttpGet("student/{studentId}")]
    public async Task<IActionResult> GetStudentPerformance(
        int studentId)
    {
        var teacherId = GetCurrentUserId();

        var student = await _context.Students
            .Include(s => s.User)
            .FirstOrDefaultAsync(s =>
                s.Id == studentId &&
                s.TeacherId == teacherId);

        if (student == null)
        {
            return NotFound(new
            {
                message = "Student not found."
            });
        }

        var sessions =
            await _context.PracticeSessions
                .Where(ps =>
                    ps.StudentId == studentId)
                .Include(ps =>
                    ps.FlashcardSet)
                .OrderByDescending(ps =>
                    ps.StartedAt)
                .Select(ps => new
                {
                    id = ps.Id,
                    setName =
                        ps.FlashcardSet.Name,
                    startedAt =
                        ps.StartedAt,
                    finishedAt =
                        ps.FinishedAt,
                    score =
                        ps.Score,
                    correctAnswers =
                        ps.CorrectAnswers,
                    totalQuestions =
                        ps.TotalQuestions
                })
                .ToListAsync();

        var attempts =
            await _context.FlashcardAttempts
                .Where(a =>
                    a.StudentId == studentId)
                .Include(a =>
                    a.Flashcard)
                .OrderByDescending(a =>
                    a.AnsweredAt)
                .Select(a => new
                {
                    attemptId = a.Id,
                    sessionId =
                        a.PracticeSessionId,
                    word =
                        a.Flashcard.Word,
                    correctMeaning =
                        a.Flashcard.CorrectMeaning,
                    selectedMeaning =
                        a.SelectedMeaning,
                    isCorrect =
                        a.IsCorrect,
                    answeredAt =
                        a.AnsweredAt
                })
                .ToListAsync();

        var totalSessions = sessions.Count;

        var averageScore = totalSessions > 0
            ? sessions.Average(s =>
                (double)s.score)
            : 0;

        var totalQuestions = sessions.Sum(
            s => s.totalQuestions);

        return Ok(new
        {
            studentId = student.Id,
            username = student.User.Username,
            name = student.User.Name,

            totalSessions = totalSessions,

            averageScore = Math.Round(
                averageScore,
                1),

            totalQuestions = totalQuestions,

            sessions = sessions,

            attempts = attempts
        });
    }

    // ==========================================
    // GET STUDENT WEAK WORDS
    // ==========================================

    [HttpGet("student/{studentId}/weak-words")]
    public async Task<IActionResult> GetWeakWords(
        int studentId)
    {
        var teacherId = GetCurrentUserId();

        var studentExists =
            await _context.Students
                .AnyAsync(s =>
                    s.Id == studentId &&
                    s.TeacherId == teacherId);

        if (!studentExists)
        {
            return NotFound(new
            {
                message = "Student not found."
            });
        }

        var weakWords =
            await _context.FlashcardAttempts
                .Where(a =>
                    a.StudentId == studentId &&
                    !a.IsCorrect)
                .Include(a =>
                    a.Flashcard)
                .GroupBy(a => new
                {
                    a.FlashcardId,
                    a.Flashcard.Word,
                    a.Flashcard.CorrectMeaning
                })
                .Select(g => new
                {
                    flashcardId =
                        g.Key.FlashcardId,

                    word =
                        g.Key.Word,

                    correctMeaning =
                        g.Key.CorrectMeaning,

                    wrongCount =
                        g.Count(),

                    lastWrongAt =
                        g.Max(a =>
                            a.AnsweredAt)
                })
                .OrderByDescending(x =>
                    x.wrongCount)
                .ToListAsync();

        return Ok(weakWords);
    }

    // ==========================================
    // GET ONE PRACTICE SESSION DETAILS
    // ==========================================

    [HttpGet("session/{sessionId}")]
    public async Task<IActionResult> GetSessionDetails(
        int sessionId)
    {
        var teacherId = GetCurrentUserId();

        // Find the practice session.
        // The student must belong to this teacher.
        var session =
            await _context.PracticeSessions
                .Include(ps =>
                    ps.Student)
                    .ThenInclude(s =>
                        s.User)
                .Include(ps =>
                    ps.FlashcardSet)
                .FirstOrDefaultAsync(ps =>
                    ps.Id == sessionId &&
                    ps.Student.TeacherId ==
                        teacherId);

        if (session == null)
        {
            return NotFound(new
            {
                message =
                    "Practice session not found."
            });
        }

        // Get every answer from this session.
        var attempts =
            await _context.FlashcardAttempts
                .Where(a =>
                    a.PracticeSessionId ==
                    session.Id)
                .Include(a =>
                    a.Flashcard)
                .OrderBy(a =>
                    a.AnsweredAt)
                .Select(a => new
                {
                    attemptId = a.Id,

                    flashcardId =
                        a.FlashcardId,

                    word =
                        a.Flashcard.Word,

                    correctMeaning =
                        a.Flashcard.CorrectMeaning,

                    selectedMeaning =
                        a.SelectedMeaning,

                    isCorrect =
                        a.IsCorrect,

                    answeredAt =
                        a.AnsweredAt
                })
                .ToListAsync();

        return Ok(new
        {
            sessionId =
                session.Id,

            studentId =
                session.StudentId,

            studentName =
                session.Student.User.Name,

            setId =
                session.FlashcardSetId,

            setName =
                session.FlashcardSet.Name,

            startedAt =
                session.StartedAt,

            finishedAt =
                session.FinishedAt,

            score =
                session.Score,

            correctAnswers =
                session.CorrectAnswers,

            totalQuestions =
                session.TotalQuestions,

            attempts =
                attempts
        });
    }

    // ==========================================
    // GET CURRENT TEACHER ID
    // ==========================================

    private int GetCurrentUserId()
    {
        var userId = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedAccessException();
        }

        return int.Parse(userId);
    }
}

