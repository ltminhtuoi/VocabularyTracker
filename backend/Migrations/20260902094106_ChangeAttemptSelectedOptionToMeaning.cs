using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class ChangeAttemptSelectedOptionToMeaning : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FlashcardAttempts_AnswerOptions_SelectedOptionId",
                table: "FlashcardAttempts");

            migrationBuilder.DropIndex(
                name: "IX_FlashcardAttempts_SelectedOptionId",
                table: "FlashcardAttempts");

            migrationBuilder.DropColumn(
                name: "SelectedOptionId",
                table: "FlashcardAttempts");

            migrationBuilder.AddColumn<string>(
                name: "SelectedMeaning",
                table: "FlashcardAttempts",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SelectedMeaning",
                table: "FlashcardAttempts");

            migrationBuilder.AddColumn<int>(
                name: "SelectedOptionId",
                table: "FlashcardAttempts",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_FlashcardAttempts_SelectedOptionId",
                table: "FlashcardAttempts",
                column: "SelectedOptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_FlashcardAttempts_AnswerOptions_SelectedOptionId",
                table: "FlashcardAttempts",
                column: "SelectedOptionId",
                principalTable: "AnswerOptions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
