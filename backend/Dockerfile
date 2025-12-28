FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Lateral.Tasks.sln ./

COPY src/Lateral.Tasks.API/Lateral.Tasks.API.csproj src/Lateral.Tasks.API/
COPY src/Lateral.Tasks.Application/Lateral.Tasks.Application.csproj src/Lateral.Tasks.Application/
COPY src/Lateral.Tasks.Domain/Lateral.Tasks.Domain.csproj src/Lateral.Tasks.Domain/
COPY src/Lateral.Tasks.Infrastructure/Lateral.Tasks.Infrastructure.csproj src/Lateral.Tasks.Infrastructure/

RUN dotnet restore

COPY src/ src/

RUN dotnet publish src/Lateral.Tasks.API/Lateral.Tasks.API.csproj \
    -c Release \
    -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish ./

ENTRYPOINT ["dotnet", "Lateral.Tasks.API.dll"]
