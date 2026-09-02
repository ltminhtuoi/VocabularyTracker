namespace backend.Models;

public class Flashcard
{
    public int Id { get; set; }

    public int FlashcardSetId { get; set; }

    public string Word { get; set; } = string.Empty;

    public string CorrectMeaning { get; set; } = string.Empty;

    public string ExampleSentence { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public FlashcardSet FlashcardSet { get; set; } = null!;

    public ICollection<AnswerOption> AnswerOptions { get; set; } = new List<AnswerOption>();
}