import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders heading", () => {
    render(<App />);
    const heading = screen.getByRole("heading", { name: /^Tasks$/i });

    expect(heading).toBeTruthy();
    expect(heading.textContent).toBe("Tasks");
  });
});
