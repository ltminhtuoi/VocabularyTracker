using backend.Models;
using Microsoft.EntityFrameworkCore;
namespace backend.Data;
public class AppDbContext : DbContext
{   public AppDbContext(DbContextOptions<AppDbContext> options): base(options){}
    public DbSet<User> Users { get; set; }
    public DbSet<Student> Students { get; set; }
    public DbSet<FlashcardSet> FlashcardSets { get; set; }
    public DbSet<Flashcard> Flashcards { get; set; }
    public DbSet<AnswerOption> AnswerOptions { get; set; }
    public DbSet<StudentFlashcardSet> StudentFlashcardSets { get; set; }
    public DbSet<PracticeSession> PracticeSessions { get; set; }
    public DbSet<FlashcardAttempt> FlashcardAttempts { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {   base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Student>().HasOne(s => s.User).WithMany().HasForeignKey(s => s.UserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Student>().HasOne(s => s.Teacher).WithMany().HasForeignKey(s => s.TeacherId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<FlashcardSet>().HasOne(fs => fs.Teacher).WithMany().HasForeignKey(fs => fs.TeacherId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Flashcard>().HasOne(f => f.FlashcardSet).WithMany(fs => fs.Flashcards).HasForeignKey(f => f.FlashcardSetId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<AnswerOption>().HasOne(a => a.Flashcard).WithMany(f => f.AnswerOptions).HasForeignKey(a => a.FlashcardId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<StudentFlashcardSet>().HasOne(sfs => sfs.Student).WithMany().HasForeignKey(sfs => sfs.StudentId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<StudentFlashcardSet>().HasOne(sfs => sfs.FlashcardSet).WithMany().HasForeignKey(sfs => sfs.FlashcardSetId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<PracticeSession>().HasOne(ps => ps.Student).WithMany().HasForeignKey(ps => ps.StudentId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<PracticeSession>().HasOne(ps => ps.FlashcardSet).WithMany().HasForeignKey(ps => ps.FlashcardSetId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<FlashcardAttempt>().HasOne(fa => fa.PracticeSession).WithMany(ps => ps.Attempts).HasForeignKey(fa => fa.PracticeSessionId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<FlashcardAttempt>().HasOne(fa => fa.Student).WithMany().HasForeignKey(fa => fa.StudentId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<FlashcardAttempt>().HasOne(fa => fa.Flashcard).WithMany().HasForeignKey(fa => fa.FlashcardId).OnDelete(DeleteBehavior.Restrict);}}