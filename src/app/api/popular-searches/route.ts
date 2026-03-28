import { getPopularWords } from "@/lib/popular-search";
import { ok } from "@/lib/response";

export const runtime = "nodejs";

export async function GET() {
  return ok(await getPopularWords());
}
