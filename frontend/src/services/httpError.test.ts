import { describe, expect, test } from "vitest";
import { toUserFriendlyError } from "./httpError";

function makeJsonResponse(
  status: number,
  body: unknown,
  contentType = "application/json; charset=utf-8"
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": contentType },
  });
}

function makeTextResponse(status: number, text: string, contentType = "text/plain") {
  return new Response(text, {
    status,
    headers: { "content-type": contentType },
  });
}

describe("toUserFriendlyError", () => {
  test("maps ValidationProblemDetails to a flat message", async () => {
    const res = makeJsonResponse(400, {
      title: "Validation failed",
      status: 400,
      errors: {
        Description: ["Description is required.", "Max 30 chars."],
        Status: ["Invalid status value."],
      },
    });

    const err = await toUserFriendlyError(res);

    expect(err).toBeInstanceOf(Error);
    expect(err.message).toContain("Description is required.");
    expect(err.message).toContain("Max 30 chars.");
    expect(err.message).toContain("Invalid status value.");
  });

  test("ValidationProblemDetails falls back to detail/title when errors are empty", async () => {
    const res = makeJsonResponse(400, {
      title: "Validation failed",
      detail: "Some validation detail",
      status: 400,
      errors: {},
    });

    const err = await toUserFriendlyError(res);
    expect(err.message).toBe("Some validation detail");
  });

  test("maps ProblemDetails detail/title", async () => {
    const res = makeJsonResponse(409, {
      title: "Task.InvalidTransition",
      detail: "Status cannot transition from Pending to Finished.",
      status: 409,
    });

    const err = await toUserFriendlyError(res);
    expect(err.message).toBe("Status cannot transition from Pending to Finished.");
  });

  test("falls back to plain text when not JSON", async () => {
    const res = makeTextResponse(500, "Something blew up");
    const err = await toUserFriendlyError(res);
    expect(err.message).toBe("Something blew up");
  });

  test.each([
    [null, 503, "Request failed (503)", { "content-type": "text/plain" }],
    ["{not-json", 400, "Request failed (400)", { "content-type": "application/json" }],
    ["", 418, "Request failed (418)", { "content-type": "text/plain" }],
    ["{not-json", 200, "Request failed (200)", { "content-type": "application/json" }],
  ])("fallback message for body=%p status=%p", async (body, status, expected, headers) => {
    const res = new Response(body, { status, headers });
    const err = await toUserFriendlyError(res);
    expect(err.message).toBe(expected);
  });

  test("fallback message when response has no content-type header", async () => {
    const res = new Response(null, { status: 404 });
    const err = await toUserFriendlyError(res);
    expect(err.message).toBe("Request failed (404)");
  });
});