import { ZodError } from "zod";

export class AppError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function normalizeError(error: unknown): { message: string; status: number } {
  if (error instanceof AppError) {
    return { message: error.message, status: error.status };
  }

  if (error instanceof ZodError) {
    const issue = error.issues[0];
    return { message: issue?.message ?? "参数不正确", status: 400 };
  }

  if (error instanceof Error) {
    return { message: error.message || "系统异常", status: 500 };
  }

  return { message: "系统异常", status: 500 };
}
