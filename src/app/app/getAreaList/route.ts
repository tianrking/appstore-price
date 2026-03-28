import { AREAS } from "@/lib/areas";
import { ok } from "@/lib/response";

export const runtime = "nodejs";

export async function POST() {
  return ok(AREAS.map((area) => ({ code: area.code, name: area.name })));
}
