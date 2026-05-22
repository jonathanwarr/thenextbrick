"use client";

import Link from "next/link";
import { useState } from "react";

interface NewsletterFormProps {
  layout?: "vertical" | "horizontal";
}

export default function NewsletterForm({ layout = "vertical" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const isHorizontal = layout === "horizontal";

  return (
    <div className={isHorizontal ? "flex gap-2" : "flex flex-col gap-2"}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className={`rounded-lg px-3 py-2.5 text-sm outline-none border ${isHorizontal ? "flex-1" : "w-full"}`}
        style={{
          backgroundColor: "var(--color-surface-raised)",
          color: "var(--color-text-primary)",
          borderColor: "var(--color-border)",
        }}
      />
      <Link
        href={`/subscribe${email ? `?email=${encodeURIComponent(email)}` : ""}`}
        className={`text-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 ${isHorizontal ? "shrink-0 whitespace-nowrap" : "w-full"}`}
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-dark)",
        }}
      >
        Subscribe
      </Link>
    </div>
  );
}
