import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AboutTabs from "@/components/about/AboutTabs";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Jonathan Warr and The Next Brick — AI enablement for operations professionals, one brick at a time.",
  alternates: { canonical: "/about" },
};

function AboutMeContent() {
  return (
    <div className="post-body">
      <p>
        12 years in SaaS and over 700 implementations has taught me something important about
        technology adoption. The people who have the most to gain are those who know the most about
        their craft.
      </p>

      <p>In the age of AI, this resonates more than ever.</p>

      <p>
        In my career I&apos;ve scaled operations through projects that span technology adoption,
        internal workflows, framework adoption, and playbook creation. Now, I use Claude to leverage
        that expertise to pursue mastery in AI enablement.
      </p>

      <p>
        To date, I&apos;ve invested over 3,000 hours in this pursuit. I&apos;ve built a veterinary
        marketplace platform as a non-engineer, have consulted on technology adoption and AI
        coaching, built a number of internal tools and workflows that I use daily.
      </p>

      <p>
        None of it came easy. None of it came from a &ldquo;Master Claude in 18 minutes&rdquo;
        tutorial. It came from staying in my lane and figuring out how Claude could extend what I
        already knew how to do.
      </p>

      <PullQuote>That&apos;s the whole idea behind The Next Brick.</PullQuote>

      <p>
        AI content has a real problem. It chases complexity. It manufactures urgency. It leaves
        professionals feeling like they&apos;re already behind, and that the only path forward is to
        move faster and absorb more.
      </p>

      <p>
        The Next Brick exists for professionals who already know their craft. One concept. One
        application. One brick at a time.
      </p>
    </div>
  );
}

function AboutTNBContent() {
  return (
    <div className="post-body">
      <h3 style={{ marginTop: 0 }}>What It Is</h3>
      <p>
        The Next Brick is an AI Enablement project to help professionals adopt Claude and build
        skills, one step at a time. It&apos;s a collection of practical articles for non-technical
        professionals to learn a concept and take away examples to help them build the skill in
        their work environment.
      </p>

      <h3>What It Isn&apos;t</h3>
      <p>
        It&apos;s not tips-and-tricks and it&apos;s not urgent. No &ldquo;five prompts every
        professional must know,&rdquo; no listicles, no urgency theatre, and no mastery in 18
        minutes. Every issue is one idea, taken seriously, and provided in context.
      </p>
      <p>
        It&apos;s not generic AI coverage and it&apos;s not punditry. I write about Claude,
        specifically, because spreading across five tools is how you stay a beginner in all of them.
        Every piece is anchored in something I&apos;ve built or taught.
      </p>

      <h3>Who It&apos;s For</h3>
      <p>
        The Next Brick exists for the professional who already has the craft. The CX manager that runs an
        excellent team. The operations lead who&apos;s building workflows. The project manager that
        delivers. These readers don&apos;t need AI to replace their judgment. They need it to apply
        their knowledge and make the tool useful.
      </p>
      <p>I&apos;m here to help that professional get started.</p>
    </div>
  );
}

function WhyClaudeContent() {
  return (
    <div className="post-body">
      <p>
        The question I get most: &ldquo;Why focus only on Claude? You&apos;re missing out on a huge
        market.&rdquo;
      </p>

      <p>
        I&apos;ve been using LLMs since early 2023. Started on ChatGPT. Dabbled with Claude 2.0. Ran
        both Pro accounts through 2024, chasing whichever model felt strongest that week. Claude
        for writing and professional communications, ChatGPT for everything else.
      </p>

      <p>
        By 2025, I&apos;d quietly stopped opening ChatGPT. The reason was simple: my baseline
        instructions. I work best when information comes incrementally, step-by-step. I&apos;d told
        both models the same thing, and even given them an analogy.
      </p>

      <PullQuote>
        When you build a brick wall, you don&apos;t put down five or six at a time. You build the
        wall, one brick at a time.
      </PullQuote>

      <p>
        Claude followed it. ChatGPT didn&apos;t. The only thing that kept me on both was memory
        &mdash; Claude didn&apos;t have it yet. In August 2025, that changed. I went Max-tier and
        never looked back.
      </p>

      <p>
        What&apos;s kept me there is direction. While ChatGPT chased Sora 2 and consumer-friendly
        features, Claude doubled down on Opus and tools built for professional work. That&apos;s the
        platform I want to teach on.
      </p>
    </div>
  );
}

function ResumeContent() {
  const eyebrowStyle = {
    fontFamily: "var(--font-family-sans)",
    color: "var(--color-text-muted)",
    letterSpacing: "0.18em",
  } as const;
  const muted = { color: "var(--color-text-secondary)" } as const;
  const body = { color: "var(--color-text-primary)" } as const;
  const linkStyle = { color: "var(--color-primary)" } as const;

  return (
    <div
      className="text-base"
      style={{
        fontFamily: "var(--font-family-serif)",
        color: "var(--color-text-primary)",
      }}
    >
      <p className="text-[10px] font-bold uppercase mb-3 mt-0" style={eyebrowStyle}>
        Summary
      </p>
      <p className="text-base leading-relaxed mb-5" style={body}>
        12 years across Finance, B2B SaaS, and Client Services. Working at the intersection of AI
        Enablement and Operations.
      </p>

      <p className="text-[10px] font-bold uppercase mb-3 mt-0" style={eyebrowStyle}>
        Experience
      </p>
      <div className="space-y-2.5">
        <div>
          <p>
            <strong>Amwarr Consulting</strong>
            <span style={muted}> — Partner, Strategy &amp; Operations · 2025–Present</span>
          </p>
          <p className="text-base leading-relaxed mt-1" style={body}>
            AI readiness assessments and 1:1 adoption coaching for non-technical teams.
          </p>
        </div>

        <div>
          <p>
            <strong>Sitewise Analytics</strong>
            <span style={muted}> — Senior Client Success Manager · 2023–2025</span>
          </p>
          <p className="text-base leading-relaxed mt-1" style={body}>
            Scaled onboarding operations 600% YoY. Stood up a champion network across four new
            platforms.
          </p>
        </div>

        <div>
          <p>
            <strong>Rise People</strong>
            <span style={muted}>
              {" "}
              — Team Lead, Onboarding → Director, Program Management · 2019–2022
            </span>
          </p>
          <p className="text-base leading-relaxed mt-1" style={body}>
            Oversaw a $40M Sun Life Financial partnership. Designed workflows that 5X&apos;d
            implementation capacity, onboarding 500+ clients in year one.
          </p>
        </div>

        <div>
          <p>
            <strong>Buyatab</strong>
            <span style={muted}> — Business Analyst → Client Success Manager · 2015–2018</span>
          </p>
          <p className="text-base leading-relaxed mt-1" style={body}>
            Managed a 20+ client portfolio with 20% average program growth. Started on the finance
            team building Tableau dashboards.
          </p>
        </div>
      </div>

      <p className="text-[10px] font-bold uppercase mb-3 mt-7" style={eyebrowStyle}>
        AI-Driven Projects
      </p>
      <div className="space-y-2.5">
        <div>
          <p>
            <strong>Vetpras</strong>
            <span style={body}>
              {" "}
              — A multi-agent AI search platform for veterinary clinics, built as a non-technical
              founder with Claude as the primary dev environment.
            </span>{" "}
            <a
              href="https://www.vetpras.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base underline underline-offset-2 transition-opacity hover:opacity-70"
              style={linkStyle}
            >
              vetpras.com
            </a>
          </p>
        </div>

        <div>
          <p>
            <strong>The Next Brick</strong>
            <span style={body}>
              {" "}
              — This publication. Articles for professionals working toward mastery with Claude,
              across four banks: Foundations, Builds, Observations, and Essays.
            </span>{" "}
            <a
              href="https://www.thenextbrick.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base underline underline-offset-2 transition-opacity hover:opacity-70"
              style={linkStyle}
            >
              thenextbrick.ai
            </a>
          </p>
        </div>
      </div>

      <p className="text-[10px] font-bold uppercase mb-3 mt-7" style={eyebrowStyle}>
        Core Competencies
      </p>
      <p className="text-sm leading-relaxed" style={body}>
        AI Enablement · Prompt Engineering · AI Workflow Design · Change Management · Champion
        Networks · Operational Strategy · Scalable Systems Design · Cross-Functional Program
        Leadership · Business Requirements Translation · Data-Informed Decision Making
      </p>
    </div>
  );
}

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

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <aside
      className="my-12 mx-auto max-w-3xl text-center"
      style={{ fontFamily: "var(--font-family-serif)" }}
    >
      <div
        className="h-px w-72 mx-auto mb-6"
        style={{ backgroundColor: "var(--color-primary)" }}
      />
      <p
        className="text-2xl md:text-3xl italic leading-snug"
        style={{ color: "var(--color-text-primary)" }}
      >
        {children}
      </p>
      <div
        className="h-px w-72 mx-auto mt-6"
        style={{ backgroundColor: "var(--color-primary)" }}
      />
    </aside>
  );
}

const tabs = [
  { id: "about-me", label: "About Me", content: <AboutMeContent /> },
  { id: "about-tnb", label: "About The Next Brick", content: <AboutTNBContent /> },
  { id: "why-claude", label: "Why Claude Focused", content: <WhyClaudeContent /> },
  { id: "resume", label: "My Resume", content: <ResumeContent /> },
];

export default function AboutPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-12 flex flex-col min-h-0">
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
              className="text-5xl md:text-[3.5rem] font-medium leading-[1.05] tracking-tight"
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
                I&apos;m{" "}
                <span style={{ color: "var(--color-primary)" }}>Jonathan Warr</span>
                , and my goal is to help operations professionals adopt Claude.
              </p>
              <p>
                My philosophy for AI Enablement is simple. It&apos;s just another
                skill you learn. Like all other skills we&apos;ve learned in our
                crafts, you obtain mastery with time, practice and dedication.
              </p>
              <p>
                It&apos;s taken me years of building, practical application, failures
                and success in order to develop the contents of this website. I hope
                you&apos;ll find it helpful. I hope it helps you cut through the
                noise. And I hope it removes any anxiety you might have about growing
                your skillset with AI.
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
            className="flex flex-col order-1 md:order-2 w-full max-w-[240px] mx-auto md:mx-0"
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
                sizes="240px"
                priority
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Divider */}
        <div
          className="border-t mt-6 mb-5 shrink-0"
          style={{
            borderColor: "var(--color-border)",
            animation: "fadeUp 0.5s ease both",
            animationDelay: "200ms",
          }}
        />

        {/* Tabs + content (fills remaining space, scrolls internally) */}
        <div
          className="flex-1 flex flex-col min-h-0"
          style={{ animation: "fadeUp 0.5s ease both", animationDelay: "240ms" }}
        >
          <AboutTabs tabs={tabs} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
