using BCrypt.Net;

Console.Write("Enter password: ");

var password = Console.ReadLine();

var hash = BCrypt.Net.BCrypt.HashPassword(password);

Console.WriteLine();
Console.WriteLine("BCrypt hash:");
Console.WriteLine(hash);