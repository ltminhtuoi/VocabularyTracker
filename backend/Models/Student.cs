using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Student
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int TeacherId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Student's user account
    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    // Teacher's user account
    [ForeignKey(nameof(TeacherId))]
    public User Teacher { get; set; } = null!;
}