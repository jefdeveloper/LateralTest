using Microsoft.Data.Sqlite;

namespace Lateral.Tasks.Api.IntegrationTests
{
    public static class TestDb
    {
        public static SqliteConnection CreateOpenConnection()
        {
            var conn = new SqliteConnection("Data Source=:memory:");
            conn.Open();
            return conn;
        }
    }
}
