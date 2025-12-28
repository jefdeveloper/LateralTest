using Lateral.Tasks.API.Composition;
using Lateral.Tasks.API.Endpoints;
using Lateral.Tasks.API.Middlewares;
using Lateral.Tasks.Infrastructure.Context;
using Lateral.Tasks.Infrastructure.DependencyInjection;
using Lateral.Tasks.Infrastructure.Seed;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services
    .AddApiModule()
    .AddApplicationModule()
    .AddInfrastructureModule(builder.Configuration)
    .AddEndpointsApiExplorer()
    .AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();

    var db = scope.ServiceProvider.GetRequiredService<TasksDbContext>();
    db.Database.Migrate();

    var seeder = scope.ServiceProvider.GetRequiredService<TasksDbSeeder>();
    await seeder.SeedAsync();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseCors();
app.MapOpenApi();
app.MapScalarApiReference();

app.MapTasksEndpoints();

app.Run();