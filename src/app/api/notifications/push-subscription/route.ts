import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { withApiErrorHandler } from "@/lib/errors";

const subscriptionSchema = z.object({
  endpoint: z.string().url().max(2048),
  keys: z.object({
    p256dh: z.string().min(1).max(512),
    auth: z.string().min(1).max(512),
  }),
});

const deleteSchema = z.object({
  endpoint: z.string().url().max(2048),
});

async function handleSaveSubscription(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile?.id || !profile.school_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as unknown;
  const parsed = subscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid push subscription payload" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: profile.id,
      school_id: profile.school_id,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
      user_agent: request.headers.get("user-agent")?.slice(0, 255) ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" },
  );

  if (error) {
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

async function handleDeleteSubscription(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as unknown;
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", profile.id)
    .eq("endpoint", parsed.data.endpoint);

  return NextResponse.json({ success: true });
}

export const POST = withApiErrorHandler(handleSaveSubscription);
export const DELETE = withApiErrorHandler(handleDeleteSubscription);
