namespace backend.Models;

public class FlashcardAttempt
{
    public int Id { get; set; }

    public int PracticeSessionId { get; set; }

    public int StudentId { get; set; }

    public int FlashcardId { get; set; }

    public string SelectedMeaning { get; set; } = string.Empty;

    public bool IsCorrect { get; set; }

    public DateTime AnsweredAt { get; set; } = DateTime.UtcNow;

    public PracticeSession PracticeSession { get; set; } = null!;

    public Student Student { get; set; } = null!;

    public Flashcard Flashcard { get; set; } = null!;
}