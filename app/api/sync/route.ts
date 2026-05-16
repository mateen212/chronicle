import { NextResponse } from "next/server"
import { syncUser } from "@/lib/user/sync-user"

export async function POST() {
  try {
    await syncUser()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}
