import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();

  if (!user) {
    return Response.json({ user: null }, { status: 401 });
  }

  return Response.json({ user });
}
