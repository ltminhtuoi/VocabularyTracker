using System.Security.Claims;
using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Student")]
public class StudentPracticeController : ControllerBase
{
    private readonly AppDbContext _context;

    public StudentPracticeController(AppDbContext context)
    {
        _context = context;
    }

    // ========================================
    // GET: /api/StudentPractice/sets
    // Get flashcard sets assigned to the
    // logged-in student
    // ========================================

    [HttpGet("sets")]
    public async Task<IActionResult> GetMySets()
    {
        var studentUserId = GetCurrentUserId();

        var student = await _context.Students
            .FirstOrDefaultAsync(
                s => s.UserId == studentUserId);

        if (student == null)
        {
            return NotFound(new
            {
                message = "Student profile not found."
            });
        }

        var sets = await _context.StudentFlashcardSets
            .Where(sfs =>
                sfs.StudentId == student.Id)
            .Select(sfs => new
            {
                id = sfs.FlashcardSet.Id,

                name = sfs.FlashcardSet.Name,

                description =
                    sfs.FlashcardSet.Description,

                assignedAt =
                    sfs.AssignedAt,

                flashcardCount =
                    sfs.FlashcardSet.Flashcards.Count,

                completedSessions =
                    _context.PracticeSessions
                        .Where(ps =>
                            ps.StudentId ==
                                student.Id &&
                            ps.FlashcardSetId ==
                                sfs.FlashcardSet.Id &&
                            ps.FinishedAt != null)
                        .Select(ps => new
                        {
                            ps.Score
                        })
                        .ToList()
            })
            .ToListAsync();

        var result = sets.Select(set => new
        {
            set.id,
            set.name,
            set.description,
            set.assignedAt,
            set.flashcardCount,

            completed =
                set.completedSessions.Any(),

            bestScore =
                set.completedSessions.Any()
                    ? set.completedSessions.Max(
                        x => x.Score)
                    : (int?)null,

            practiceCount =
                set.completedSessions.Count
        });

        return Ok(result);
    }

    // ========================================
    // GET: /api/StudentPractice/question/{sessionId}
    // Get the next question
    // ========================================

    [HttpGet("question/{sessionId}")]
    public async Task<IActionResult> GetQuestion(
        int sessionId)
    {
        var studentUserId = GetCurrentUserId();

        // ----------------------------------------
        // Find student
        // ----------------------------------------

        var student = await _context.Students
            .FirstOrDefaultAsync(
                s => s.UserId == studentUserId);

        if (student == null)
        {
            return NotFound(new
            {
                message =
                    "Student profile not found."
            });
        }

        // ----------------------------------------
        // Find practice session
        // ----------------------------------------

        var session =
            await _context.PracticeSessions
                .FirstOrDefaultAsync(ps =>
                    ps.Id == sessionId &&
                    ps.StudentId == student.Id);

        if (session == null)
        {
            return NotFound(new
            {
                message =
                    "Practice session not found."
            });
        }

        // ----------------------------------------
        // Get all flashcards
        // ----------------------------------------

        var flashcards =
            await _context.Flashcards
                .Where(f =>
                    f.FlashcardSetId ==
                    session.FlashcardSetId)
                .ToListAsync();

        // ----------------------------------------
        // Need at least 4 flashcards
        // ----------------------------------------

        if (flashcards.Count < 4)
        {
            return BadRequest(new
            {
                message =
                    "This flashcard set needs at least 4 flashcards."
            });
        }

        // ----------------------------------------
        // Find flashcards already answered
        // ----------------------------------------

        var answeredFlashcardIds =
            await _context.FlashcardAttempts
                .Where(a =>
                    a.PracticeSessionId ==
                    session.Id)
                .Select(a =>
                    a.FlashcardId)
                .ToListAsync();

        // ----------------------------------------
        // Get unanswered flashcards
        // ----------------------------------------

        var remainingFlashcards =
            flashcards
                .Where(f =>
                    !answeredFlashcardIds
                        .Contains(f.Id))
                .ToList();

        // ----------------------------------------
        // Practice finished
        // ----------------------------------------

        if (remainingFlashcards.Count == 0)
        {
            return Ok(new
            {
                finished = true,

                message =
                    "Practice session completed.",

                score =
                    session.Score,

                correctAnswers =
                    session.CorrectAnswers,

                totalQuestions =
                    session.TotalQuestions
            });
        }

        // ----------------------------------------
        // Random generator
        // ----------------------------------------

        // ----------------------------------------
// Smart Review
// ----------------------------------------

var random = new Random();

var history =
    await _context.FlashcardAttempts
        .Where(a =>
            a.StudentId == student.Id &&
            a.Flashcard.FlashcardSetId ==
                session.FlashcardSetId)
        .GroupBy(a => a.FlashcardId)
        .Select(g => new
        {
            FlashcardId = g.Key,

            CorrectCount =
                g.Count(a => a.IsCorrect),

            IncorrectCount =
                g.Count(a => !a.IsCorrect),

            LastReviewedAt =
                g.Max(a => a.AnsweredAt)
        })
        .ToListAsync();

var historyByFlashcard =
    history.ToDictionary(
        h => h.FlashcardId);

var weightedFlashcards =
    remainingFlashcards
        .Select(card =>
        {
            if (!historyByFlashcard.TryGetValue(
                    card.Id,
                    out var h))
            {
                // Brand-new word
                return new
                {
                    Card = card,
                    Weight = 10.0
                };
            }

            var weight = 1.0;

            // More incorrect answers = higher priority
            weight += Math.Min(h.IncorrectCount, 5) * 3.0;

            // Correct answers reduce priority
            weight -= h.CorrectCount * 0.5;

            // Older reviews become more important
            var daysSinceReview =
                (DateTime.UtcNow -
                 h.LastReviewedAt).TotalDays;

            weight +=
                Math.Min(daysSinceReview, 30) * 0.2;

            // Never let the weight become zero/negative
            weight = Math.Max(weight, 0.5);

            return new
            {
                Card = card,
                Weight = weight
            };
        })
        .ToList();

// ----------------------------------------
// Weighted random selection
// ----------------------------------------

var totalWeight =
    weightedFlashcards.Sum(x => x.Weight);

var randomValue =
    random.NextDouble() * totalWeight;

var cumulativeWeight = 0.0;

var question =
    weightedFlashcards
        .First(x =>
        {
            cumulativeWeight += x.Weight;
            return randomValue <= cumulativeWeight;
        })
        .Card;

        // ----------------------------------------
        // Get 3 incorrect meanings
        // ----------------------------------------

        var incorrectMeanings =
            flashcards
                .Where(f =>
                    f.Id != question.Id)
                .Select(f =>
                    f.CorrectMeaning)
                .Where(meaning =>
                    meaning !=
                    question.CorrectMeaning)
                .Distinct()
                .OrderBy(_ =>
                    random.Next())
                .Take(3)
                .ToList();

        // ----------------------------------------
        // Make sure there are 3 wrong choices
        // ----------------------------------------

        if (incorrectMeanings.Count < 3)
        {
            return BadRequest(new
            {
                message =
                    "There are not enough different meanings in this flashcard set. Please add at least 4 flashcards with different Vietnamese meanings."
            });
        }

        // ----------------------------------------
        // Add correct answer
        // ----------------------------------------

        incorrectMeanings.Add(
            question.CorrectMeaning);

        // ----------------------------------------
        // Shuffle all 4 choices
        // ----------------------------------------

        var options =
            incorrectMeanings
                .OrderBy(_ =>
                    random.Next())
                .ToList();

        // ----------------------------------------
        // Return question
        // ----------------------------------------

        return Ok(new
        {
            finished = false,

            sessionId =
                session.Id,

            flashcardId =
                question.Id,

            word =
                question.Word,

            correctMeaning =
                question.CorrectMeaning,

            exampleSentence =
                question.ExampleSentence,

            options =
                options,

            questionNumber =
                answeredFlashcardIds.Count + 1,

            totalQuestions =
                session.TotalQuestions
        });
    }

    // ========================================
    // GET CURRENT USER ID
    // ========================================

    private int GetCurrentUserId()
    {
        var userId =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedAccessException();
        }

        return int.Parse(userId);
    }
}

