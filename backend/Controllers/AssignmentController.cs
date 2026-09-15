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
public class AssignmentController : ControllerBase
{    private readonly AppDbContext _context;
    public AssignmentController(AppDbContext context) { _context = context;}
    [HttpPost]
    public async Task<IActionResult> AssignSet(int studentId, int flashcardSetId)
    {   var teacherId = GetCurrentUserId();
        var student = await _context.Students.FirstOrDefaultAsync(s => s.Id == studentId && s.TeacherId == teacherId);
        if (student == null) { return NotFound(new { message = "Student not found."});}
        var flashcardSet = await _context.FlashcardSets.FirstOrDefaultAsync(fs => fs.Id == flashcardSetId && fs.TeacherId == teacherId);
        if (flashcardSet == null) { return NotFound(new { message = "Flashcard set not found."});}
        var alreadyAssigned = await _context.StudentFlashcardSets.AnyAsync(sfs => sfs.StudentId == studentId && sfs.FlashcardSetId == flashcardSetId);
        if (alreadyAssigned){ return BadRequest(new { message = "This flashcard set is already assigned to this student."});}
        var assignment = new StudentFlashcardSet {StudentId = studentId, FlashcardSetId = flashcardSetId};
        _context.StudentFlashcardSets.Add(assignment);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Flashcard set assigned successfully.", assignmentId = assignment.Id});}
    [HttpGet("student/{studentId}")]
    public async Task<IActionResult> GetStudentAssignments(int studentId)
    {   var teacherId = GetCurrentUserId();
        var studentExists = await _context.Students.AnyAsync(s => s.Id == studentId && s.TeacherId == teacherId);
        if (!studentExists) { return NotFound(new {message = "Student not found."});}
        var assignments = await _context.StudentFlashcardSets.Where(sfs => sfs.StudentId == studentId).Include(sfs => sfs.FlashcardSet).Select(sfs => new {assignmentId = sfs.Id, setId = sfs.FlashcardSetId, setName = sfs.FlashcardSet.Name, description = sfs.FlashcardSet.Description, assignedAt = sfs.AssignedAt}).ToListAsync();
        return Ok(assignments);}
    [HttpDelete("{id}")]
    public async Task<IActionResult> RemoveAssignment(int id)
    {   var teacherId = GetCurrentUserId();
        var assignment = await _context.StudentFlashcardSets.Include(sfs => sfs.Student).FirstOrDefaultAsync(sfs => sfs.Id == id && sfs.Student.TeacherId == teacherId);
        if (assignment == null){ return NotFound(new { message = "Assignment not found."});}
        _context.StudentFlashcardSets.Remove(assignment);
        await _context.SaveChangesAsync();
        return Ok(new{ message = "Assignment removed successfully."});}
    private int GetCurrentUserId()
    {   var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)){throw new UnauthorizedAccessException();}
        return int.Parse(userId);}}