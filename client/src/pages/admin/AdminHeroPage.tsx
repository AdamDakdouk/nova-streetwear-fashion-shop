import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAdminHero, useUpdateHero } from "../../hooks/useHero";
import { ImageUploader } from "../../components/admin/ImageUploader";
import { HeroBanner } from "../../components/product/HeroBanner";
import { Button } from "../../components/ui/Button";
import { PageSpinner } from "../../components/ui/Spinner";
import { useToast } from "../../components/ui/Toast";
import { extractErrorMessage, extractFieldErrors } from "../../api/client";

const MAX_IMAGES = 4;

export function AdminHeroPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data: existing, isLoading } = useAdminHero();
  const updateHero = useUpdateHero();

  const [eyebrow, setEyebrow] = useState("");
  const [heading, setHeading] = useState("");
  const [subcopy, setSubcopy] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existing) {
      setEyebrow(existing.eyebrow);
      setHeading(existing.heading);
      setSubcopy(existing.subcopy);
      setCtaLabel(existing.ctaLabel);
      setImages(existing.images);
    }
  }, [existing]);

  if (isLoading) return <PageSpinner />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    try {
      await updateHero.mutateAsync({ eyebrow, heading, subcopy, ctaLabel, images });
      showToast("Homepage hero updated");
      navigate("/admin");
    } catch (err) {
      const perField = extractFieldErrors(err);
      if (Object.keys(perField).length > 0) {
        setFieldErrors(perField);
      } else {
        setError(extractErrorMessage(err, "Could not save the hero."));
      }
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        to="/admin"
        className="focus-ring mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Dashboard
      </Link>

      <h1 className="font-heading text-2xl font-bold text-ink">Homepage Hero</h1>
      <p className="mt-1 text-sm text-muted">The banner at the top of the storefront homepage.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5" noValidate>
        <div>
          <label htmlFor="eyebrow" className="mb-1 block text-sm font-medium text-ink">
            Eyebrow
          </label>
          <input
            id="eyebrow"
            value={eyebrow}
            onChange={(e) => setEyebrow(e.target.value)}
            maxLength={40}
            className="focus-ring h-11 w-full rounded-md border border-border px-3 text-sm"
          />
          <p className="mt-1 text-xs text-muted">Small label above the headline, shown in uppercase.</p>
          {fieldErrors.eyebrow && <p className="mt-1 text-xs text-danger">{fieldErrors.eyebrow}</p>}
        </div>

        <div>
          <label htmlFor="heading" className="mb-1 block text-sm font-medium text-ink">
            Headline
          </label>
          <textarea
            id="heading"
            rows={2}
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            maxLength={120}
            className="focus-ring w-full rounded-md border border-border px-3 py-2 font-heading text-sm"
          />
          <p className="mt-1 text-xs text-muted">Press Enter to control where the headline breaks onto a new line.</p>
          {fieldErrors.heading && <p className="mt-1 text-xs text-danger">{fieldErrors.heading}</p>}
        </div>

        <div>
          <label htmlFor="subcopy" className="mb-1 block text-sm font-medium text-ink">
            Supporting Text
          </label>
          <textarea
            id="subcopy"
            rows={3}
            value={subcopy}
            onChange={(e) => setSubcopy(e.target.value)}
            maxLength={240}
            className="focus-ring w-full rounded-md border border-border px-3 py-2 text-sm"
          />
          {fieldErrors.subcopy && <p className="mt-1 text-xs text-danger">{fieldErrors.subcopy}</p>}
        </div>

        <div className="max-w-xs">
          <label htmlFor="ctaLabel" className="mb-1 block text-sm font-medium text-ink">
            Button Label
          </label>
          <input
            id="ctaLabel"
            value={ctaLabel}
            onChange={(e) => setCtaLabel(e.target.value)}
            maxLength={40}
            className="focus-ring h-11 w-full rounded-md border border-border px-3 text-sm"
          />
          {fieldErrors.ctaLabel && <p className="mt-1 text-xs text-danger">{fieldErrors.ctaLabel}</p>}
        </div>

        <div>
          <ImageUploader label="Hero Images" images={images} onChange={setImages} max={MAX_IMAGES} />
          <p className="mt-2 text-xs text-muted">
            One image fills the banner on its own. Add up to {MAX_IMAGES} and they arrange into a collage — with three,
            the first one becomes the large feature image.
          </p>
          {fieldErrors.images && <p className="mt-1 text-xs text-danger">{fieldErrors.images}</p>}
        </div>

        <div className="border-t border-border pt-5">
          <p className="mb-3 text-sm font-medium text-ink">Preview</p>
          <div className="rounded-xl border border-border bg-background p-3">
            <HeroBanner
              hero={{ eyebrow, heading, subcopy, ctaLabel, images }}
              onShopClick={() => {}}
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 border-t border-border pt-5">
          <Button type="submit" size="lg" isLoading={updateHero.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
