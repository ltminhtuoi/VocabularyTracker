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
[Authorize(Roles = "Teacher")]
public class FlashcardController : ControllerBase
{
    private readonly AppDbContext _context;

    public FlashcardController(AppDbContext context)
    {
        _context = context;
    }

    // GET: /api/Flashcard/set/{setId}
    [HttpGet("set/{setId}")]
    public async Task<IActionResult> GetFlashcards(int setId)
    {
        var teacherId = GetCurrentUserId();

        var flashcards = await _context.Flashcards
            .Include(f => f.FlashcardSet)
            .Where(f =>
                f.FlashcardSetId == setId &&
                f.FlashcardSet.TeacherId == teacherId)
            .Select(f => new
            {
                id = f.Id,
                word = f.Word,
                correctMeaning = f.CorrectMeaning,
                exampleSentence = f.ExampleSentence
            })
            .ToListAsync();

        return Ok(flashcards);
    }

    // POST: /api/Flashcard/import
    [HttpPost("import")]
    public async Task<IActionResult> ImportFlashcards(
        ImportFlashcardRequest request)
    {
        var teacherId = GetCurrentUserId();

        // Make sure the flashcard set belongs to this teacher
        var flashcardSet = await _context.FlashcardSets
            .FirstOrDefaultAsync(fs =>
                fs.Id == request.FlashcardSetId &&
                fs.TeacherId == teacherId);

        if (flashcardSet == null)
        {
            return NotFound(new
            {
                message = "Flashcard set not found."
            });
        }

        // Make sure the request contains flashcards
        if (request.Flashcards == null ||
            request.Flashcards.Count == 0)
        {
            return BadRequest(new
            {
                message = "No flashcards were provided."
            });
        }

        var flashcards = new List<Flashcard>();

        foreach (var item in request.Flashcards)
        {
            // Skip invalid items
            if (string.IsNullOrWhiteSpace(item.Word) ||
                string.IsNullOrWhiteSpace(item.Meaning))
            {
                continue;
            }

            var flashcard = new Flashcard
            {
                FlashcardSetId = request.FlashcardSetId,
                Word = item.Word.Trim(),
                CorrectMeaning = item.Meaning.Trim(),
                ExampleSentence = item.Example?.Trim() ?? string.Empty
            };

            flashcards.Add(flashcard);
        }

        if (flashcards.Count == 0)
        {
            return BadRequest(new
            {
                message = "No valid flashcards were found."
            });
        }

        _context.Flashcards.AddRange(flashcards);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Flashcards imported successfully.",
            importedCount = flashcards.Count,
            setId = request.FlashcardSetId
        });
    }

    // DELETE: /api/Flashcard/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFlashcard(int id)
    {
        var teacherId = GetCurrentUserId();

        var flashcard = await _context.Flashcards
            .Include(f => f.FlashcardSet)
            .FirstOrDefaultAsync(f =>
                f.Id == id &&
                f.FlashcardSet.TeacherId == teacherId);

        if (flashcard == null)
        {
            return NotFound(new
            {
                message = "Flashcard not found."
            });
        }

        _context.Flashcards.Remove(flashcard);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Flashcard deleted successfully."
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