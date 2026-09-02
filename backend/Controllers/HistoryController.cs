using System.Security.Claims;
using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HistoryController : ControllerBase
{
    private readonly AppDbContext _context;

    public HistoryController(AppDbContext context)
    {
        _context = context;
    }

    // Student: get all of their practice sessions
    [HttpGet("student")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetStudentHistory()
    {
        var userId = GetCurrentUserId();

        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (student == null)
        {
            return NotFound(new
            {
                message = "Student profile not found."
            });
        }

        var history = await _context.PracticeSessions
            .Where(ps => ps.StudentId == student.Id)
            .Include(ps => ps.FlashcardSet)
            .OrderByDescending(ps => ps.StartedAt)
            .Select(ps => new
            {
                sessionId = ps.Id,
                setId = ps.FlashcardSetId,
                setName = ps.FlashcardSet.Name,
                startedAt = ps.StartedAt,
                finishedAt = ps.FinishedAt,
                score = ps.Score,
                correctAnswers = ps.CorrectAnswers,
                totalQuestions = ps.TotalQuestions
            })
            .ToListAsync();

        return Ok(history);
    }

    // Student: get detailed answers from one practice session
    [HttpGet("student/{sessionId}")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetStudentSession(int sessionId)
    {
        var userId = GetCurrentUserId();

        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (student == null)
        {
            return NotFound(new
            {
                message = "Student profile not found."
            });
        }

        var session = await _context.PracticeSessions
            .Include(ps => ps.FlashcardSet)
            .FirstOrDefaultAsync(ps =>
                ps.Id == sessionId &&
                ps.StudentId == student.Id);

        if (session == null)
        {
            return NotFound(new
            {
                message = "Practice session not found."
            });
        }

        var attempts = await _context.FlashcardAttempts
            .Where(a => a.PracticeSessionId == session.Id)
            .Include(a => a.Flashcard)
            .OrderBy(a => a.AnsweredAt)
            .Select(a => new
            {
                attemptId = a.Id,
                flashcardId = a.FlashcardId,
                word = a.Flashcard.Word,
                correctMeaning = a.Flashcard.CorrectMeaning,
                selectedMeaning = a.SelectedMeaning,
                isCorrect = a.IsCorrect,
                answeredAt = a.AnsweredAt
            })
            .ToListAsync();

        return Ok(new
        {
            sessionId = session.Id,
            setId = session.FlashcardSetId,
            setName = session.FlashcardSet.Name,
            startedAt = session.StartedAt,
            finishedAt = session.FinishedAt,
            score = session.Score,
            correctAnswers = session.CorrectAnswers,
            totalQuestions = session.TotalQuestions,
            attempts = attempts
        });
    }

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