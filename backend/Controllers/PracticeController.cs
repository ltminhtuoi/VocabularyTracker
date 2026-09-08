using System.Security.Claims;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Student")]
public class PracticeController : ControllerBase
{
    private readonly AppDbContext _context;

    public PracticeController(AppDbContext context)
    {
        _context = context;
    }

        // POST: /api/Practice/start
    [HttpPost("start")]
    public async Task<IActionResult> StartPractice(
        StartPracticeRequest request)
    {
        var studentUserId = GetCurrentUserId();

        // Find the student's profile
        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.UserId == studentUserId);

        if (student == null)
        {
            return NotFound(new
            {
                message = "Student profile not found."
            });
        }

        // Make sure the student is assigned to this set
        var assigned = await _context.StudentFlashcardSets
            .AnyAsync(sfs =>
                sfs.StudentId == student.Id &&
                sfs.FlashcardSetId == request.FlashcardSetId);

        if (!assigned)
        {
            return Forbid();
        }

        // Get the flashcards
        var flashcardCount = await _context.Flashcards
    .CountAsync(f =>
        f.FlashcardSetId == request.FlashcardSetId);

if (flashcardCount == 0)
{
    return BadRequest(new
    {
        message = "This flashcard set has no flashcards."
    });
}

var flashcardSet = await _context.FlashcardSets
    .FirstOrDefaultAsync(fs =>
        fs.Id == request.FlashcardSetId);

if (flashcardSet == null)
{
    return NotFound(new
    {
        message = "Flashcard set not found."
    });
}

var totalQuestions =
    flashcardSet.WordsToPlay == 0
        ? flashcardCount
        : Math.Min(
            flashcardSet.WordsToPlay,
            flashcardCount
        );

        

        // Create a new practice session
        var session = new PracticeSession
        {
            StudentId = student.Id,
            FlashcardSetId = request.FlashcardSetId,
            StartedAt = DateTime.UtcNow,
            TotalQuestions = totalQuestions,
            CorrectAnswers = 0,
            Score = 0
        };

        _context.PracticeSessions.Add(session);

        await _context.SaveChangesAsync();

        return Ok(new StartPracticeResponse
        {
            SessionId = session.Id,
            FlashcardSetId = session.FlashcardSetId,
            TotalQuestions = session.TotalQuestions
        });
    }

    // POST: /api/Practice/answer
    [HttpPost("answer")]
    public async Task<IActionResult> SubmitAnswer(
        SubmitAnswerRequest request)
    {
        var studentUserId = GetCurrentUserId();

        // Find the student's profile
        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.UserId == studentUserId);

        if (student == null)
        {
            return NotFound(new
            {
                message = "Student profile not found."
            });
        }

        // Find the practice session
        var session = await _context.PracticeSessions
            .FirstOrDefaultAsync(ps =>
                ps.Id == request.SessionId &&
                ps.StudentId == student.Id);

        if (session == null)
        {
            return NotFound(new
            {
                message = "Practice session not found."
            });
        }

        // Find the flashcard
        var flashcard = await _context.Flashcards
            .FirstOrDefaultAsync(f =>
                f.Id == request.FlashcardId &&
                f.FlashcardSetId == session.FlashcardSetId);

        if (flashcard == null)
        {
            return NotFound(new
            {
                message = "Flashcard not found."
            });
        }

        // Make sure the student is assigned to this set
        var assigned = await _context.StudentFlashcardSets
            .AnyAsync(sfs =>
                sfs.StudentId == student.Id &&
                sfs.FlashcardSetId == session.FlashcardSetId);

        if (!assigned)
        {
            return Forbid();
        }

        // Check the answer
        var selectedMeaning =
            request.SelectedMeaning.Trim();

        var isCorrect =
            string.Equals(
                selectedMeaning,
                flashcard.CorrectMeaning.Trim(),
                StringComparison.OrdinalIgnoreCase
            );

        // Record the answer
        var attempt = new FlashcardAttempt
        {
            PracticeSessionId = session.Id,
            StudentId = student.Id,
            FlashcardId = flashcard.Id,
            SelectedMeaning = selectedMeaning,
            IsCorrect = isCorrect,
            AnsweredAt = DateTime.UtcNow
        };

        _context.FlashcardAttempts.Add(attempt);

        // Update session statistics
        session.CorrectAnswers +=
            isCorrect ? 1 : 0;

        var answeredQuestions =
            await _context.FlashcardAttempts
                .CountAsync(a =>
                    a.PracticeSessionId == session.Id)
            + 1;

        session.Score =
            (int)Math.Round(
                (double)session.CorrectAnswers
                / session.TotalQuestions
                * 100
            );

        // Finish the session when all questions are answered
        if (answeredQuestions >= session.TotalQuestions)
        {
            session.FinishedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            sessionId = session.Id,
            isCorrect = isCorrect,
            correctMeaning = flashcard.CorrectMeaning,
            selectedMeaning = selectedMeaning,
            answeredAt = attempt.AnsweredAt,
            correctAnswers = session.CorrectAnswers,
            totalQuestions = session.TotalQuestions,
            score = session.Score,
            finished = session.FinishedAt.HasValue
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