namespace backend.DTOs;

public class SubmitAnswerRequest
{
    public int SessionId { get; set; }

    public int FlashcardId { get; set; }

    public string SelectedMeaning { get; set; } = string.Empty;
}