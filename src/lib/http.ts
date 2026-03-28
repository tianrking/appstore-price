import type { ZodSchema } from "zod";

export async function parseJson<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  const raw = await request.json();
  return schema.parse(raw);
}
