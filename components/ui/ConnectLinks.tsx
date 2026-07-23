"use client";

import { siteConfig } from "@/lib/site";
import { trackEvent } from "@/lib/metrics";
import {
  LinkedInIcon,
  MailIcon,
  GlobeIcon,
  CalendarIcon,
} from "@/components/ui/ContactIcons";

type Channel = {
  key: string;
  title: string;
  description: string;
  href: string;
  external: boolean;
  icon: React.ReactNode;
};

const channels: Channel[] = [
  {
    key: "calendly",
    title: "Coffee & Connect",
    description: "Book a 15-minute virtual coffee to talk AI, Claude, or coaching.",
    href: siteConfig.author.calendly,
    external: true,
    icon: <CalendarIcon size={20} />,
  },
  {
    key: "linkedin",
    title: "LinkedIn",
    description: "Connect and follow along as new bricks land.",
    href: siteConfig.author.linkedin,
    external: true,
    icon: <LinkedInIcon size={20} />,
  },
  {
    key: "email",
    title: "Email",
    description: `${siteConfig.author.email} — a direct line, no forms.`,
    href: `mailto:${siteConfig.author.email}`,
    external: false,
    icon: <MailIcon size={20} />,
  },
  {
    key: "website",
    title: "amwarr.com",
    description: "Coaching and consulting on my personal site.",
    href: siteConfig.author.website,
    external: true,
    icon: <GlobeIcon size={20} />,
  },
];

/**
 * The Let's Connect page's channel cards. Client component only so each
 * click can be recorded in site metrics.
 */
export default function ConnectLinks() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
      {channels.map((channel) => (
        <a
          key={channel.key}
          href={channel.href}
          {...(channel.external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          onClick={() => trackEvent("connect_click", { channel: channel.key })}
          className="group flex items-center gap-4 rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <span
            className="flex items-center justify-center w-11 h-11 rounded-lg shrink-0"
            style={{
              backgroundColor: "var(--color-bg)",
              color: "var(--color-primary)",
            }}
          >
            {channel.icon}
          </span>
          <span className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {channel.title}
            </span>
            <span
              className="text-sm leading-relaxed"
              style={{
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-family-serif)",
              }}
            >
              {channel.description}
            </span>
          </span>
          <span
            className="ml-auto shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
            style={{ color: "var(--color-text-muted)" }}
            aria-hidden="true"
          >
            →
          </span>
        </a>
      ))}
    </div>
  );
}
