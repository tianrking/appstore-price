import { getAppInfoComparison } from "@/lib/apple";
import { normalizeError } from "@/lib/app-error";
import { fail, ok } from "@/lib/response";

export const runtime = "nodejs";

export async function GET(_: Request, context: { params: Promise<{ appId: string }> }) {
  try {
    const { appId } = await context.params;
    const data = await getAppInfoComparison(appId);
    return ok(data);
  } catch (error) {
    const normalized = normalizeError(error);
    return fail(normalized.message, normalized.status);
  }
}
