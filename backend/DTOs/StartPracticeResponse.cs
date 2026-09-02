namespace backend.DTOs;

public class StartPracticeResponse
{
    public int SessionId { get; set; }

    public int FlashcardSetId { get; set; }

    public int TotalQuestions { get; set; }
}