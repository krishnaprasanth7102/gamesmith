
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { token } = await request.json();
  
  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set("session-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week (Note: Actual token expires in 1h, but this keeps the UI state)
    path: "/",
  });

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("session-token");
  return NextResponse.json({ success: true });
}
