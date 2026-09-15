import { Schema, model, Document } from "mongoose";

/**
 * Editable storefront content, keyed by section. Today there is exactly one
 * section ("hero"), but keying it this way means a second editable block
 * (a promo strip, a footer blurb) is a new document rather than a new model.
 */
export interface ISiteContent extends Document {
  key: string;
  eyebrow: string;
  heading: string;
  subcopy: string;
  ctaLabel: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const HERO_KEY = "hero";

/** Max images the hero layout is designed to arrange neatly. */
export const HERO_MAX_IMAGES = 4;

const siteContentSchema = new Schema<ISiteContent>(
  {
    key: { type: String, required: true, unique: true },
    eyebrow: { type: String, required: true, trim: true, maxlength: 40 },
    // Newlines are meaningful: the storefront renders each line as its own
    // line in the headline, so the admin controls where it breaks.
    heading: { type: String, required: true, trim: true, maxlength: 120 },
    subcopy: { type: String, required: true, trim: true, maxlength: 240 },
    ctaLabel: { type: String, required: true, trim: true, maxlength: 40 },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length >= 1 && v.length <= HERO_MAX_IMAGES,
        message: `Provide between 1 and ${HERO_MAX_IMAGES} images`,
      },
    },
  },
  { timestamps: true }
);

export const SiteContent = model<ISiteContent>("SiteContent", siteContentSchema);
