import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { siteConfig } from "@/lib/site";
import {
  LinkedInIcon,
  MailIcon,
  GlobeIcon,
  CalendarIcon,
} from "@/components/ui/ContactIcons";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Jon Warr and The Next Brick — helping customer success professionals develop AI fluency with Claude, one brick at a time.",
  alternates: { canonical: "/about" },
};

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
                href={siteConfig.author.linkedin}
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
                href={`mailto:${siteConfig.author.email}`}
                aria-label="Email Jonathan"
                title={siteConfig.author.email}
                className="transition-opacity hover:opacity-70"
                style={{ color: "var(--color-primary)" }}
              >
                <MailIcon />
              </a>
              <a
                href={siteConfig.author.website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Personal website"
                title="amwarr.com"
                className="transition-opacity hover:opacity-70"
                style={{ color: "var(--color-primary)" }}
              >
                <GlobeIcon />
              </a>
              <a
                href={siteConfig.author.calendly}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Book a 15-minute coffee and connect"
                title="Book a 15-minute coffee & connect"
                className="transition-opacity hover:opacity-70"
                style={{ color: "var(--color-primary)" }}
              >
                <CalendarIcon />
              </a>
            </div>
          </div>

          {/* Headshot column. On md+ the top margin drops the photo past the
              "Welcome." headline and its divider so it tops out level with the
              opening "I'm Jon…" line: headline height (display-lg × 1.05
              line-height) + divider block (mt-5 + 1px + mb-4 ≈ 2.3rem). */}
          <div
            className="flex flex-col order-1 md:order-2 w-full max-w-[300px] lg:max-w-[340px] mx-auto md:mx-0 md:mt-[calc(var(--text-display-lg)*1.05_+_2.3rem)]"
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
                sizes="(min-width: 1024px) 340px, 300px"
                preload
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
