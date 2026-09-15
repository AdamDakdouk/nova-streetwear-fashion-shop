import { useEffect } from "react";
import { Info } from "lucide-react";
import { LEGAL_DISCLAIMER, type LegalDocument } from "../lib/legalContent";

interface LegalPageProps {
  document: LegalDocument;
}

export function LegalPage({ document: doc }: LegalPageProps) {
  // These pages are reached from the footer, which means the click usually
  // happens at the bottom of a long page — without this you land on the new
  // page already scrolled past its own title.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [doc.title]);

  return (
    <div>
      <div className="bg-ink px-4 py-16 text-center sm:px-6 sm:py-20">
        <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">{doc.title}</h1>
        <p className="mt-2 text-sm text-white/60">Last updated {doc.updated}</p>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <p className="flex items-start gap-2 rounded-lg border border-border bg-accent-light/40 px-4 py-3 text-xs text-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          <span>{LEGAL_DISCLAIMER}</span>
        </p>

        <p className="mt-8 text-base leading-relaxed text-ink">{doc.intro}</p>

        <div className="mt-10 flex flex-col gap-10">
          {doc.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-heading text-lg font-semibold text-ink">{section.heading}</h2>

              {section.paragraphs?.map((paragraph, i) => (
                <p key={i} className="mt-3 text-sm leading-relaxed text-muted">
                  {paragraph}
                </p>
              ))}

              {section.bullets && (
                <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted marker:text-accent">
                  {section.bullets.map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
              )}

              {section.footnote && (
                <p className="mt-3 text-sm leading-relaxed text-muted">{section.footnote}</p>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
