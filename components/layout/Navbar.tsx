"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

function BrickIcon() {
  return (
    <div className="flex flex-col gap-[3px] w-14 h-10 shrink-0">
      <div className="flex gap-[3px] flex-1">
        <div className="flex-[2] rounded-[2px]" style={{ backgroundColor: "var(--color-primary)" }} />
        <div className="flex-[1] rounded-[2px]" style={{ backgroundColor: "var(--color-secondary)" }} />
      </div>
      <div className="flex gap-[3px] flex-1">
        <div className="flex-[1] rounded-[2px]" style={{ backgroundColor: "var(--color-secondary)" }} />
        <div className="flex-[2] rounded-[2px]" style={{ backgroundColor: "var(--color-primary)" }} />
      </div>
    </div>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {open ? (
        <>
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </>
      ) : (
        <>
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </>
      )}
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/bricks", label: "Library" },
  { href: "/about", label: "About" },
  { href: "/connect", label: "Let's Connect" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = saved === "dark" || (!saved && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.classList.toggle("light", !dark);
  }, []);

  // Close the mobile menu on navigation.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function toggleTheme() {
    const next = !isDark;
    document.documentElement.classList.add("theme-transitioning");
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.classList.toggle("light", !next);
    localStorage.setItem("theme", next ? "dark" : "light");
    window.setTimeout(() => document.documentElement.classList.remove("theme-transitioning"), 700);
  }

  return (
    <header
      className="sticky top-0 z-50 w-full border-b"
      style={{
        backgroundColor: "var(--color-bg)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <BrickIcon />
          <span
            className="h-10 flex flex-col justify-between leading-none"
            style={{ fontFamily: "var(--font-family-serif)" }}
          >
            <span
              className="text-xs font-semibold tracking-wide"
              style={{ color: "var(--color-text-secondary)" }}
            >
              The Next
            </span>
            <span
              className="text-xl font-bold"
              style={{ color: "var(--color-primary)" }}
            >
              Brick
            </span>
          </span>
        </Link>

        {/* Right group: nav + theme toggle, aligned right */}
        <div className="flex items-center gap-6">
          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(({ href, label }) => {
              const isActive =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className="text-[15px] font-semibold transition-colors"
                  style={{
                    fontFamily: "var(--font-family-serif)",
                    color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)",
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="relative flex items-center w-12 h-6 rounded-full border transition-colors duration-300 cursor-pointer before:absolute before:-inset-2.5 before:content-['']"
            style={{
              backgroundColor: isDark ? "var(--color-dark)" : "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}
            aria-label="Toggle theme"
          >
            <span
              className="absolute w-5 h-5 rounded-full shadow-sm"
              style={{
                left: isDark ? "calc(100% - 22px)" : "2px",
                backgroundColor: "var(--color-surface-raised)",
                color: "var(--color-text-secondary)",
                transition: "left 300ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {/* Sun icon — visible in light mode */}
              <span
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  opacity: isDark ? 0 : 1,
                  transition: "opacity 200ms ease",
                }}
              >
                <SunIcon />
              </span>
              {/* Moon icon — visible in dark mode */}
              <span
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  opacity: isDark ? 1 : 0,
                  transition: "opacity 200ms ease",
                }}
              >
                <MoonIcon />
              </span>
            </span>
          </button>

          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden flex items-center justify-center w-11 h-11 rounded-lg cursor-pointer transition-opacity hover:opacity-70"
            style={{ color: "var(--color-text-secondary)" }}
            aria-label="Menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      {menuOpen && (
        <nav
          id="mobile-nav"
          className="md:hidden border-t px-6 py-2"
          style={{ borderColor: "var(--color-border)" }}
        >
          {navLinks.map(({ href, label }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="block py-3 text-lg font-semibold transition-colors"
                style={{
                  fontFamily: "var(--font-family-serif)",
                  color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)",
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
