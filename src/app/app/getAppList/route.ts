import { getAppList } from "@/lib/apple";
import { normalizeError } from "@/lib/app-error";
import { parseJson } from "@/lib/http";
import { fail, ok } from "@/lib/response";
import { appListReqSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await parseJson(request, appListReqSchema);
    const data = await getAppList(body.areaCode, body.appName);
    return ok(data);
  } catch (error) {
    const normalized = normalizeError(error);
    return fail(normalized.message, normalized.status);
  }
}
