import Link from "next/link";

const links = [
  { label: "Articles", href: "/bricks" },
  { label: "About", href: "/about" },
];

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 448 512" width="13" height="13" fill="currentColor" aria-hidden="true">
      <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer
      className="border-t"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          © {new Date().getFullYear()} The Next Brick
        </span>
        <nav className="flex items-center gap-4 sm:gap-6">
          {links.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-xs py-2 transition-opacity hover:opacity-70"
              style={{ color: "var(--color-text-muted)" }}
            >
              {label}
            </Link>
          ))}
          <a
            href="https://www.linkedin.com/in/jonathan-warr/"
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex items-center justify-center w-5 h-5 rounded transition-opacity hover:opacity-80 before:absolute before:-inset-2.5 before:content-['']"
            style={{ backgroundColor: "var(--color-dark)", color: "var(--color-tag-text)" }}
            aria-label="LinkedIn"
          >
            <LinkedInIcon />
          </a>
        </nav>
      </div>
    </footer>
  );
}
