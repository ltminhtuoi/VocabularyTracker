using System.Security.Claims;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Teacher")]
public class FlashcardSetController : ControllerBase
{
    private readonly AppDbContext _context;

    public FlashcardSetController(AppDbContext context)
    {
        _context = context;
    }

    // GET: /api/FlashcardSet
    [HttpGet]
    public async Task<IActionResult> GetMySets()
    {
        var teacherId = GetCurrentUserId();

        var sets = await _context.FlashcardSets
            .Where(fs => fs.TeacherId == teacherId)
            .Select(fs => new
            {
                id = fs.Id,
                name = fs.Name,
                description = fs.Description,
                createdAt = fs.CreatedAt,
                flashcardCount = fs.Flashcards.Count
            })
            .ToListAsync();

        return Ok(sets);
    }

    // POST: /api/FlashcardSet
    [HttpPost]
    public async Task<IActionResult> CreateSet(
        string name,
        string description = "")
    {
        var teacherId = GetCurrentUserId();

        var set = new FlashcardSet
        {
            TeacherId = teacherId,
            Name = name,
            Description = description
        };

        _context.FlashcardSets.Add(set);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Flashcard set created successfully.",
            setId = set.Id
        });
    }

    // GET: /api/FlashcardSet/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetSet(int id)
    {
        var teacherId = GetCurrentUserId();

        var set = await _context.FlashcardSets
            .Include(fs => fs.Flashcards)
            .FirstOrDefaultAsync(fs =>
                fs.Id == id &&
                fs.TeacherId == teacherId);

        if (set == null)
        {
            return NotFound(new
            {
                message = "Flashcard set not found."
            });
        }

        return Ok(new
        {
            id = set.Id,
            name = set.Name,
            description = set.Description,
            createdAt = set.CreatedAt,
            flashcards = set.Flashcards.Select(f => new
            {
                id = f.Id,
                word = f.Word,
                correctMeaning = f.CorrectMeaning,
                exampleSentence = f.ExampleSentence
            })
        });
    }

    // DELETE: /api/FlashcardSet/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSet(int id)
    {
        var teacherId = GetCurrentUserId();

        var set = await _context.FlashcardSets
            .FirstOrDefaultAsync(fs =>
                fs.Id == id &&
                fs.TeacherId == teacherId);

        if (set == null)
        {
            return NotFound(new
            {
                message = "Flashcard set not found."
            });
        }

        _context.FlashcardSets.Remove(set);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Flashcard set deleted successfully."
        });
    }

    private int GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedAccessException();
        }

        return int.Parse(userId);
    }
}