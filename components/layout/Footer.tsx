import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedinIn } from "@fortawesome/free-brands-svg-icons";

const links = [
  { label: "Articles", href: "/bricks" },
  { label: "About", href: "/about" },
  { label: "Privacy", href: "/privacy" },
];

export default function Footer() {
  return (
    <footer
      className="border-t"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          © {new Date().getFullYear()} The Next Brick
        </span>
        <nav className="flex items-center gap-6">
          {links.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-xs transition-opacity hover:opacity-70"
              style={{ color: "var(--color-text-muted)" }}
            >
              {label}
            </Link>
          ))}
          <a
            href="https://www.linkedin.com/in/jonathan-warr/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-5 h-5 rounded transition-opacity hover:opacity-80"
            style={{ backgroundColor: "var(--color-dark)", color: "var(--color-bg)" }}
            aria-label="LinkedIn"
          >
            <FontAwesomeIcon icon={faLinkedinIn} style={{ width: "12px", height: "12px" }} />
          </a>
        </nav>
      </div>
    </footer>
  );
}
