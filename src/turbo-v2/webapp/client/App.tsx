import React, { useEffect, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, Container, Typography, Box, Button } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "light",
  },
});

function App() {
  const [health, setHealth] = useState<any>(null);
  const [experiments, setExperiments] = useState<any[]>([]);

  useEffect(() => {
    // Test API connection
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch((err) => console.error("Health check failed:", err));

    // Load experiments
    fetch("/api/experiments")
      .then((res) => res.json())
      .then((data) => setExperiments(data.experiments || []))
      .catch((err) => console.error("Failed to load experiments:", err));
  }, []);

  const createTestExperiment = async () => {
    try {
      const response = await fetch("/api/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Experiment",
          preset: "fast",
          samples: ["tiny-qs"],
        }),
      });

      const data = await response.json();
      console.log("Created experiment:", data);

      // Reload experiments
      const listResponse = await fetch("/api/experiments");
      const listData = await listResponse.json();
      setExperiments(listData.experiments || []);
    } catch (error) {
      console.error("Failed to create experiment:", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Turbo-V2 Experiment Dashboard
          </Typography>

          <Typography variant="h5" sx={{ mt: 3 }}>
            Sprint 1: Backend API Test
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">
              <strong>Server Status:</strong>{" "}
              {health ? `OK (${health.timestamp})` : "Loading..."}
            </Typography>

            <Typography variant="body1" sx={{ mt: 1 }}>
              <strong>Experiments:</strong> {experiments.length}
            </Typography>

            <Button
              variant="contained"
              onClick={createTestExperiment}
              sx={{ mt: 2 }}
            >
              Create Test Experiment
            </Button>

            {experiments.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">Experiment List:</Typography>
                <pre>{JSON.stringify(experiments, null, 2)}</pre>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
