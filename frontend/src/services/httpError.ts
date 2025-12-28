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
        const msg = flat.length > 0 ? flat.join(" ") : data.detail ?? data.title ?? fallback;
        return new Error(msg);
      }

      if (isProblemDetails(data)) {
        const msg = data.detail ?? data.title ?? fallback;
        return new Error(msg);
      }
    }

    const txt = await res.text();
    if (txt) return new Error(txt);

    return new Error(fallback);
  } catch {
    return new Error(fallback);
  }
}
