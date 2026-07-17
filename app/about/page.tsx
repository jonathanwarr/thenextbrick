import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Jon Warr and The Next Brick — helping customer success professionals develop AI fluency with Claude, one brick at a time.",
  alternates: { canonical: "/about" },
};

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-8 pt-page-top pb-12 flex flex-col">
        {/* Editorial rule eyebrow */}
        <div
          className="flex items-center gap-4 mb-5 shrink-0"
          style={{ animation: "fadeUp 0.5s ease both", animationDelay: "0ms" }}
        >
          <span
            className="text-[10px] font-bold tracking-wider uppercase whitespace-nowrap"
            style={{ color: "var(--color-text-muted)", letterSpacing: "0.18em" }}
          >
            Profile · The Person Behind The Bricks
          </span>
          <div
            className="h-px flex-1"
            style={{ backgroundColor: "var(--color-border)" }}
          />
        </div>

        {/* Masthead: intro + headshot */}
        <section className="flex flex-col md:flex-row md:justify-between md:items-start gap-8 shrink-0">
          {/* Intro column */}
          <div
            className="flex flex-col order-2 md:order-1 w-full max-w-2xl"
            style={{ animation: "fadeUp 0.5s ease both", animationDelay: "80ms" }}
          >
            <h1
              className="text-display-lg font-medium tracking-tight"
              style={{
                fontFamily: "var(--font-family-serif)",
                color: "var(--color-primary)",
              }}
            >
              Welcome.
            </h1>

            <div
              className="h-px w-12 mt-5 mb-4"
              style={{ backgroundColor: "var(--color-primary)" }}
            />
            <div
              className="space-y-3 text-base leading-relaxed"
              style={{
                fontFamily: "var(--font-family-serif)",
                color: "var(--color-text-primary)",
              }}
            >
              <p>
                I&apos;m <span style={{ color: "var(--color-primary)" }}>Jon</span>, and I have a
                goal to help customer success professionals develop AI fluency with Claude.
              </p>
              <p>
                A little over 10 years ago I shifted my career goals to work in B2B SaaS and
                I&apos;ve spent the entirety of that time working in the customer success function.
                Over my career I&apos;ve had the opportunity to see amazing shifts in technology and
                have felt the impact they&apos;ve had on the evolution of customer success.
              </p>
              <p>
                Today, we&apos;re working within arguably the most impactful technological
                advancement in history. AI is not only shaping the customer&apos;s experience,
                it&apos;s increasing the expected value they receive from products and services. At
                the same time, it&apos;s also advancing and changing at speeds that make it feel
                impossible to keep up.
              </p>
              <p>
                Don&apos;t worry. I&apos;m here to tell you to take a breath and tune out all of
                the noise. I assure you that you&apos;re well placed to not only feel caught up,
                but develop real AI fluency that will keep you ahead of the curve. The truth is,
                while it&apos;s overwhelming, AI is just another skill you learn. Like all other
                skills we&apos;ve learned in our careers, we obtain mastery by focusing on linear
                progression, practice and time.
              </p>
              <p>
                I&apos;ve spent over 3,000 hours working with Claude as my operating system over
                the past years. I&apos;ve built, shipped and scaled products like Vetpras, coached
                professionals across different business functions and consulted organizations on
                technology adoption and readiness.
              </p>
              <p>
                The articles, essays and playbooks that you&apos;ll find on this website are all
                built on the foundation of my decade of experience in customer success and
                dedicated work with AI over the past 3 years.
              </p>
            </div>

            <div className="flex items-center gap-4 mt-5 self-start">
              <a
                href="https://www.linkedin.com/in/jonathan-warr/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
                className="transition-opacity hover:opacity-70"
                style={{ color: "var(--color-primary)" }}
              >
                <LinkedInIcon />
              </a>
              <a
                href="mailto:jonathan@amwarr.com"
                aria-label="Email Jonathan"
                title="jonathan@amwarr.com"
                className="transition-opacity hover:opacity-70"
                style={{ color: "var(--color-primary)" }}
              >
                <MailIcon />
              </a>
              <a
                href="https://amwarr.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Personal website"
                title="amwarr.com"
                className="transition-opacity hover:opacity-70"
                style={{ color: "var(--color-primary)" }}
              >
                <GlobeIcon />
              </a>
            </div>
          </div>

          {/* Headshot column */}
          <div
            className="flex flex-col order-1 md:order-2 w-full max-w-[320px] mx-auto md:mx-0 md:mt-12"
            style={{ animation: "fadeUp 0.5s ease both", animationDelay: "80ms" }}
          >
            <div
              className="aspect-square w-full rounded-md overflow-hidden relative"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <Image
                src="/images/about/jonathan-headshot.png"
                alt="Jonathan Warr"
                fill
                sizes="320px"
                priority
                className="object-cover"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
