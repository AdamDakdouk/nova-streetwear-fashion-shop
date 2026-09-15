import { Link } from "react-router-dom";
import { Instagram, Mail, MessageCircle, Music2 } from "lucide-react";
import {
  INSTAGRAM_URL,
  MAILTO_URL,
  SUPPORT_EMAIL,
  TIKTOK_URL,
  WHATSAPP_DISPLAY,
  WHATSAPP_URL,
} from "../../lib/siteContact";
import { CATEGORY_BUCKETS } from "../../lib/categories";

const linkClass = "focus-ring rounded-md text-sm text-muted transition-colors hover:text-ink";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-heading text-xl font-bold tracking-tight text-ink">NOVA</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
              Everyday streetwear essentials — built for the street, not the runway.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="NOVA on Instagram"
                className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink transition-colors hover:bg-black/5"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={TIKTOK_URL}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="NOVA on TikTok"
                className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink transition-colors hover:bg-black/5"
              >
                <Music2 className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div>
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink">Shop</h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li>
                <Link to="/" className={linkClass}>
                  All Products
                </Link>
              </li>
              {CATEGORY_BUCKETS.map((bucket) => (
                <li key={bucket.value}>
                  <Link to={`/?category=${bucket.value}`} className={linkClass}>
                    {bucket.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink">Contact</h2>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <a href={MAILTO_URL} className="focus-ring group flex items-start gap-2 rounded-md">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                  <span className="text-sm">
                    <span className="block text-muted transition-colors group-hover:text-ink">
                      Customer service
                    </span>
                    <span className="block text-xs text-muted/80">{SUPPORT_EMAIL}</span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="focus-ring group flex items-start gap-2 rounded-md"
                >
                  <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                  <span className="text-sm">
                    <span className="block text-muted transition-colors group-hover:text-ink">WhatsApp</span>
                    <span className="block text-xs text-muted/80">{WHATSAPP_DISPLAY}</span>
                  </span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink">Legal</h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li>
                <Link to="/privacy-policy" className={linkClass}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className={linkClass}>
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className={linkClass}>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} NOVA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
