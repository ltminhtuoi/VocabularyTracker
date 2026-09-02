namespace backend.DTOs;

public class ImportFlashcardRequest
{
    public int FlashcardSetId { get; set; }

    public List<ImportFlashcardItem> Flashcards { get; set; } = new();
}

public class ImportFlashcardItem
{
    public string Word { get; set; } = string.Empty;

    public string Meaning { get; set; } = string.Empty;

    public string Example { get; set; } = string.Empty;
}