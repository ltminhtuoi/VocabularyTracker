namespace backend.Models;

public class AnswerOption
{
    public int Id { get; set; }

    public int FlashcardId { get; set; }

    public string Meaning { get; set; } = string.Empty;

    public bool IsCorrect { get; set; }

    public Flashcard Flashcard { get; set; } = null!;
}