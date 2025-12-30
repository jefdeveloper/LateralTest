type ValidationProblemDetails = {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
};

type ProblemDetails = {
  title?: string;
  detail?: string;
  status?: number;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isValidationProblem(v: unknown): v is ValidationProblemDetails {
  return isObject(v) && isObject((v as any).errors);
}

function isProblemDetails(v: unknown): v is ProblemDetails {
  return isObject(v) && ("detail" in v || "title" in v || "status" in v);
}

export async function toUserFriendlyError(res: Response): Promise<Error> {
  const contentType = res.headers.get("content-type") ?? "";
  const fallback = `Request failed (${res.status})`;

  try {
    if (contentType.includes("application/json")) {
      const data: unknown = await res.json();

      if (isValidationProblem(data)) {
        const flat = Object.values(data.errors ?? {}).flat().filter(Boolean);
        if (flat.length > 0) return new Error(flat.join(" "));
        if (data.detail) return new Error(data.detail);
        if (data.title) return new Error(data.title);
        return new Error(fallback);
      }

      if (isProblemDetails(data)) {
        if (data.detail) return new Error(data.detail);
        if (data.title) return new Error(data.title);
        return new Error(fallback);
      }
    } else {
      const txt = await res.text();
      if (txt) return new Error(txt);
    }
  } catch {
    // ignore and fall through to fallback
  }
  return new Error(fallback);
}
