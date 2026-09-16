# Frontend Architecture & Technical Decisions

## Overview

I built the frontend as a single-page app with React, TypeScript, and Vite. The main thing I cared about here was keeping three things separate: data that comes from the server, data that only lives in the browser, and the actual UI. On top of that, I wanted the site to work well on phones and to behave predictably whether you're a customer browsing products or an admin managing them.

## How the Code is Organized

I organized the code by feature/domain instead of by file type, so related things stay close together:

- pages/: one file per route — these map directly to the URLs people visit.
- components/<domain>/: components are tied to a specific feature, like the product variant picker or cart line items.
- components/ui/: these are small, reusable building blocks, things like the Button, EmptyState, Spinner, etc..
- components/layout/: the main structural pieces such as nav, footer, page wrappers, etc..
- hooks/: these are custom hooks for shared logic.
- api/: theese are the functions that actually talk to the backend.
- lib/: these are small helper functions and formatting logic.

## What Pages Exist

**Customer-facing:** Login, Verify Email, Forgot/Reset Password, Product Listing, Product Detail, Cart, Wishlist, Checkout, Order Confirmation, Account, Privacy Policy, Terms & Conditions, Terms of Service, and a 404 page.

**Admin-facing:** product CRUD, variant management, image uploads, and homepage hero editing. I kept the admin section outside the main site layout on purpose,this way it's not linked from anywhere in the public nav, so it stays visually and structurally separate from the customer experience.

## Routing & Access Control

I handled routing by React Router, with a couple of guard components wrapped around certain routes like:

- **ProtectedRoute:** this stops you from reaching things like Cart, Wishlist, Checkout, or Account unless you're logged in.
- **AdminRoute:** this hides the admin pages from anyone who isn't an admin.

To be honest, both of these guards only control what shows in the browser. They're a UX convenience, not security. The real access control happens on the backend, which checks every request independently, the frontend guards just stop a regular user from accidentally landing on a page they shouldn't see.

## Forms & Validation

I skipped form libraries and schema validators like Zod on purpose, to keep things lightweight and keep the validation logic easy to follow.
Validation is only for UX and not security. For example, in the checkout form, I run a Luhn check on card numbers to check the card length to match the card brand, validate the cvv and reject expired dates. But the backend does not trust any of it, everything gets re-validated server-side anyway. The frontend checks are there to give users fast feedback.

## Styling & Mobile Design

Styling runs on Tailwind, using custom design tokens (colors like ink, background, and an accent orange, `#C2410C`) plus Sora and Inter for the fonts.

- **Mobile-first layout:** the grid goes from 1 column up to 4 as the screen gets wider. Below the `md` breakpoint, the main nav collapses into a slide-in drawer instead.
- **iOS zoom fix:** iOS Safari zooms in automatically if you tap an input with a font size under 16px, so on small screens all inputs are forced to 16px to stop that from happening.

## Product Images

I wanted image handling to work the same way regardless of where the image came from:

I used a one-rendering path strat, so whether it's a seeded product image served locally or something an admin uploaded to R2, both go through the same `<img>` component, no special-casing.

Also, i re-encoded images at 80% quality, which took the total media size from about 59mb to about 6mb. As for caching, assets get a 30-day cache header set in 'vercel.json'

## Admin Area & Live Preview

Admins get full CRUD over products, variants, and image uploads, plus the ability to edit the homepage hero (copy, buttons, and up to 4 banner images).

The hero editor reuses the exact same component that renders on the real homepage, so what you see while editing is exactly what customers will see, no separate preview-only component to keep in sync.
Also, when you pick an image file, it uploads immediately instead of waiting for the whole form to be submitted. That way if the upload fails, you find out right then instead of after filling out the rest of the form.

## Build & Deployment

Vite builds the production bundle, and it deploys on Vercel. VITE_API_URL=/api is set at build time, and since the frontend and API are served from the same origin, there's no CORS overhead to deal with at all.