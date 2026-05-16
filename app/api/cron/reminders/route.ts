import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { resend } from "@/lib/email/resend";
import { subDays } from "date-fns";

// Vercel cron: add `"crons": [{"path": "/api/cron/reminders", "schedule": "0 9 * * *"}]` to vercel.json
export async function GET(req: NextRequest) {
  // Validate cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const thirtyDaysAgo = subDays(new Date(), 30);

  // Find items paused for > 30 days with a user that has notifications enabled
  const pausedItems = await prisma.item.findMany({
    where: {
      status: "paused",
      updatedAt: { lt: thirtyDaysAgo },
      user: {
        settings: {
          emailPausedReminder: true,
        },
      },
    },
    include: {
      user: {
        select: { email: true, name: true },
      },
    },
    take: 100,
  });

  if (pausedItems.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  // Group by user
  const byUser = new Map<string, typeof pausedItems>();
  for (const item of pausedItems) {
    const email = item.user.email;
    if (!email) continue;
    const arr = byUser.get(email) ?? [];
    arr.push(item);
    byUser.set(email, arr);
  }

  let sent = 0;
  for (const [email, items] of byUser) {
    const firstName = items[0]?.user.name?.split(" ")[0] ?? "there";
    const itemList = items
      .slice(0, 5)
      .map((i) => `• ${i.title} (${i.type})`)
      .join("\n");

    try {
      await resend?.emails.send({
        from: "Chronicle <no-reply@chronicle.app>",
        to: email,
        subject: `You have ${items.length} paused item${items.length > 1 ? "s" : ""} waiting`,
        text: `Hi ${firstName},\n\nYou have items that have been paused for over 30 days:\n\n${itemList}\n\nHead back to Chronicle to pick up where you left off!\n\nhttps://chronicle.app/items\n\n— Chronicle`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Resume your paused items</h2>
            <p>Hi ${firstName},</p>
            <p>You have <strong>${items.length}</strong> item${items.length > 1 ? "s" : ""} that have been paused for over 30 days:</p>
            <ul style="padding-left: 1.5em; color: #334155;">
              ${items.slice(0, 5).map((i) => `<li><strong>${i.title}</strong> (${i.type})</li>`).join("")}
            </ul>
            <p>Head back to Chronicle to pick up where you left off!</p>
            <a href="https://chronicle.app/items" style="display:inline-block;background:#7c3aed;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">View my library</a>
          </div>
        `,
      });
      sent++;
    } catch (err) {
      console.error(`Failed to send reminder to ${email}:`, err);
    }
  }

  return NextResponse.json({ sent });
}
