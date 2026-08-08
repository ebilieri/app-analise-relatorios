export type ApiError = {
  status: "failed" | "blocked";
  message: string;
};

export type ApiSuccess<T> = T & {
  status?: "success";
};

export function success<T extends Record<string, unknown>>(payload: T): ApiSuccess<T> {
  return payload;
}

export function failed(message: string): ApiError {
  return { status: "failed", message };
}

export function blocked(message: string): ApiError {
  return { status: "blocked", message };
}
