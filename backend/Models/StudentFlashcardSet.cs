namespace backend.Models;

public class StudentFlashcardSet
{
    public int Id { get; set; }

    public int StudentId { get; set; }

    public int FlashcardSetId { get; set; }

    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    public Student Student { get; set; } = null!;

    public FlashcardSet FlashcardSet { get; set; } = null!;
}