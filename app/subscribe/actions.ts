"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";

export async function subscribe(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const source = String(formData.get("source") ?? "site");

  if (!email || !email.includes("@")) {
    redirect("/subscribe?error=invalid-email");
  }

  const headerList = await headers();
  const origin =
    headerList.get("origin") ??
    (headerList.get("host")
      ? `${headerList.get("x-forwarded-proto") ?? "https"}://${headerList.get("host")}`
      : "");

  const supabase = createServiceClient();
  // confirmation_token is a uuid column; generate a real UUID, not hex.
  const token = randomUUID();

  const { data: existing } = await supabase
    .from("subscribers")
    .select("id, status")
    .eq("email", email)
    .maybeSingle();

  if (existing?.status === "confirmed") {
    redirect("/subscribe?already=1");
  }

  if (existing) {
    const { error } = await supabase
      .from("subscribers")
      .update({
        status: "pending",
        confirmation_token: token,
        confirmed_at: null,
        unsubscribed_at: null,
        source,
      })
      .eq("id", existing.id);
    if (error) {
      redirect(`/subscribe?error=${encodeURIComponent(error.message)}`);
    }
  } else {
    const { error } = await supabase.from("subscribers").insert({
      email,
      status: "pending",
      confirmation_token: token,
      source,
    });
    if (error) {
      redirect(`/subscribe?error=${encodeURIComponent(error.message)}`);
    }
  }

  const confirmUrl = `${origin}/subscribe/confirm/${token}`;
  await sendEmail({
    to: email,
    subject: "Confirm your subscription to The Next Brick",
    text: `Tap the link below to confirm your subscription:\n\n${confirmUrl}\n\nIf you didn't request this, you can ignore this email.`,
  });

  redirect("/subscribe?sent=1");
}
