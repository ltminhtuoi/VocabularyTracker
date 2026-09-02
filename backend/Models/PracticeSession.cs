namespace backend.Models;

public class PracticeSession
{
    public int Id { get; set; }

    public int StudentId { get; set; }

    public int FlashcardSetId { get; set; }

    public DateTime StartedAt { get; set; } = DateTime.UtcNow;

    public DateTime? FinishedAt { get; set; }

    public int Score { get; set; }

    public int TotalQuestions { get; set; }

    public int CorrectAnswers { get; set; }

    public Student Student { get; set; } = null!;

    public FlashcardSet FlashcardSet { get; set; } = null!;

    public ICollection<FlashcardAttempt> Attempts { get; set; } = new List<FlashcardAttempt>();
}