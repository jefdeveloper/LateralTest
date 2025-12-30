import React from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";


// MUI theme for consistent testing (no ripple, etc)
const testTheme = createTheme({
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
});


/**
 * Renders a component with MUI Theme and CssBaseline for consistent testing.
 * Optionally accepts a custom wrapper for additional providers.
 */
export function renderWithMui(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "queries"> & { wrapper?: React.ComponentType }
) {
  const Wrapper = options?.wrapper ?? React.Fragment;
  return render(
    <ThemeProvider theme={testTheme}>
      <CssBaseline />
      <Wrapper>{ui}</Wrapper>
    </ThemeProvider>,
    options
  );
}
