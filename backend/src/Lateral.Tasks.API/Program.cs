using Lateral.Tasks.API.Composition;
using Lateral.Tasks.API.Endpoints;
using Lateral.Tasks.Infrastructure.DependencyInjection;
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

var app = builder.Build();

await app.MigrateAndSeedAsync();

app.UseMiddlewares();

app.UseCors();
app.MapOpenApi();
app.MapScalarApiReference();

app.MapTasksEndpoints();

app.Run();