import React from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const testTheme = createTheme({
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
});

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
