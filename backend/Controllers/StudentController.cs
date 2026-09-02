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
public class StudentController : ControllerBase
{
    private readonly AppDbContext _context;

    public StudentController(AppDbContext context)
    {
        _context = context;
    }

    // GET: /api/Student
    [HttpGet]
    public async Task<IActionResult> GetMyStudents()
    {
        var teacherId = GetCurrentUserId();

        var students = await _context.Students
            .Include(s => s.User)
            .Where(s => s.TeacherId == teacherId)
            .Select(s => new
            {
                studentId = s.Id,
                userId = s.UserId,
                username = s.User.Username,
                name = s.User.Name,
                createdAt = s.CreatedAt
            })
            .ToListAsync();

        return Ok(students);
    }

    // POST: /api/Student
    [HttpPost]
    public async Task<IActionResult> AddStudent(int userId)
    {
        var teacherId = GetCurrentUserId();

        var studentUser = await _context.Users
            .FirstOrDefaultAsync(u =>
                u.Id == userId &&
                u.Role == "Student");

        if (studentUser == null)
        {
            return NotFound(new
            {
                message = "Student user not found."
            });
        }

        var alreadyExists = await _context.Students
            .AnyAsync(s => s.UserId == userId);

        if (alreadyExists)
        {
            return BadRequest(new
            {
                message = "This student is already assigned."
            });
        }

        var student = new Student
        {
            UserId = userId,
            TeacherId = teacherId
        };

        _context.Students.Add(student);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Student added successfully.",
            studentId = student.Id
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