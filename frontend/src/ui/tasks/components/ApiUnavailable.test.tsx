import { describe, it, expect, vi } from "vitest";
import { renderWithMui } from "../../../test/TestUtils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiUnavailable } from "./ApiUnavailable";

describe("ApiUnavailable", () => {
  const base = "http://localhost:3000/api";
  const detail = "Network error";

  it("renders static texts and API URL", () => {
    renderWithMui(<ApiUnavailable apiBase={base} onRetry={vi.fn()} />);
    expect(screen.getByText(/could not connect/i)).toBeInTheDocument();
    expect(screen.getByText(/please check your connection/i)).toBeInTheDocument();
    expect(screen.getByText(/api url/i)).toBeInTheDocument();
    expect(screen.getByText(base)).toBeInTheDocument();
    expect(screen.getByText(/try again/i)).toBeInTheDocument();
  });

  it("shows detail message when provided", () => {
    renderWithMui(<ApiUnavailable apiBase={base} message={detail} onRetry={vi.fn()} />);
    expect(screen.getByText(/detail:/i)).toBeInTheDocument();
    expect(screen.getByText(detail)).toBeInTheDocument();
  });

  it("does not render detail when message is empty", () => {
    renderWithMui(<ApiUnavailable apiBase={base} message={""} onRetry={vi.fn()} />);
    expect(screen.queryByText(/detail:/i)).not.toBeInTheDocument();
  });

  it("calls onRetry when button is clicked", async () => {
    const onRetry = vi.fn();
    renderWithMui(<ApiUnavailable apiBase={base} onRetry={onRetry} />);
    await userEvent.click(screen.getByTestId("retry-btn"));
    expect(onRetry).toHaveBeenCalled();
  });
});
