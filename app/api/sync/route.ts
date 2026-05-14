import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

import { syncUser } from "@/lib/user/sync-user";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  if (!email) return NextResponse.json({ error: "No email available" }, { status: 400 });

  try {
    const user = await syncUser({ externalId: userId, email, name: clerkUser?.fullName ?? null, image: clerkUser?.imageUrl ?? null });
    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json({ error: (e instanceof Error ? e.message : String(e)) }, { status: 500 });
  }
}
