"use client";

import { useState } from "react";

type Tab = {
  id: string;
  label: string;
  content: React.ReactNode;
};

export default function AboutTabs({ tabs }: { tabs: Tab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? "");
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Tab strip */}
      <div
        role="tablist"
        aria-label="About sections"
        className="flex flex-wrap items-baseline justify-center gap-x-8 gap-y-3 pb-3 border-b shrink-0"
        style={{ borderColor: "var(--color-border)" }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => setActiveId(tab.id)}
              className="relative cursor-pointer text-lg pb-2 transition-colors"
              style={{
                fontFamily: "var(--font-family-serif)",
                color: isActive
                  ? "var(--color-primary)"
                  : "var(--color-text-secondary)",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {tab.label}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute left-0 right-0 -bottom-[13px] h-[2px]"
                  style={{ backgroundColor: "var(--color-primary)" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content panel — scrolls within remaining vertical space */}
      <div
        key={active.id}
        role="tabpanel"
        id={`panel-${active.id}`}
        aria-labelledby={`tab-${active.id}`}
        className="flex-1 min-h-0 overflow-y-auto pt-10 pb-2"
        style={{ animation: "fadeUp 0.35s ease both" }}
      >
        <div className="max-w-4xl mx-auto">{active.content}</div>
      </div>
    </div>
  );
}
