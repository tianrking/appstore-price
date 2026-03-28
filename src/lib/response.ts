import { NextResponse } from "next/server";

export function ok<T>(data: T, message = "成功") {
  return NextResponse.json({ code: 0, message, data });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ code: 1, message, data: null }, { status });
}
