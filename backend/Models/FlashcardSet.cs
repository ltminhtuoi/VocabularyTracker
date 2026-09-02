namespace backend.Models;

public class FlashcardSet
{
    public int Id { get; set; }

    public int TeacherId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User Teacher { get; set; } = null!;

    public ICollection<Flashcard> Flashcards { get; set; } = new List<Flashcard>();
}