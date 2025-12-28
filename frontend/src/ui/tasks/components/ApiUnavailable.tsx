import { Alert, Button, Paper, Stack, Typography, Box } from "@mui/material";

type Props = {
  message?: string | null;
  apiBase: string;
  onRetry: () => void;
};

export function ApiUnavailable({ message, apiBase, onRetry }: Props) {
  return (
    <Paper sx={{ mt: 3, p: 2 }}>
      <Stack spacing={2}>
        <Alert severity="error">Could not connect to the Tasks API.</Alert>

        <Typography component="div" color="text.secondary">
          Please check your connection to the API using the provided address.
        </Typography>

        <Box>
          <Typography variant="body2" component="div">
            <strong>API URL:</strong> {apiBase}
          </Typography>

          {message && (
            <Typography
              variant="body2"
              component="div"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              <strong>Detail:</strong> {message}
            </Typography>
          )}
        </Box>

        <Button variant="contained" onClick={onRetry}>
          Try again
        </Button>
      </Stack>
    </Paper>
  );
}