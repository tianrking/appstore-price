import { getAppInfoComparison } from "@/lib/apple";
import { normalizeError } from "@/lib/app-error";
import { parseJson } from "@/lib/http";
import { fail, ok } from "@/lib/response";
import { appInfoReqSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await parseJson(request, appInfoReqSchema);
    const data = await getAppInfoComparison(body.appId);
    return ok(data);
  } catch (error) {
    const normalized = normalizeError(error);
    return fail(normalized.message, normalized.status);
  }
}
