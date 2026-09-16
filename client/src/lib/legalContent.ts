import { SUPPORT_EMAIL, WHATSAPP_DISPLAY } from "./siteContact";

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  footnote?: string;
}

export interface LegalDocument {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

/**
 * Sample copy for a demo storefront. These are not real legal documents, were
 * not written or reviewed by a lawyer, and are here so the footer links lead to
 * a realistic page rather than a dead end. 
 */
export const LEGAL_DISCLAIMER =
  "Sample content for a demo storefront. Not a real legal agreement and not legal advice.";

export const PRIVACY_POLICY: LegalDocument = {
  title: "Privacy Policy",
  updated: "September 2026",
  intro:
    "This policy explains what information NOVA collects when you browse or buy from this store, why we collect it, and what you can ask us to do with it.",
  sections: [
    {
      heading: "Information we collect",
      paragraphs: [
        "When you visit the store we automatically receive basic technical information from your browser — your IP address, device and browser type, time zone, and the pages you open. We use this to keep the site working and to understand which products people look at.",
      ],
      bullets: [
        "Account details you give us: your name and email address.",
        "Order details: the items, sizes and colours you bought, the order total, and the date of purchase.",
        "Things you save while signed in: your cart and your wishlist.",
        "Reviews you choose to write, which are shown publicly next to the product along with your display name.",
      ],
    },
    {
      heading: "How we use it",
      bullets: [
        "To create your account and confirm your email address.",
        "To process orders and show you your purchase history.",
        "To keep your cart and wishlist available the next time you sign in.",
        "To protect the store against fraud and abuse.",
      ],
      footnote:
        "We do not sell your personal information, and we do not send marketing email unless you have asked us to.",
    },
    {
      heading: "Payment information",
      paragraphs: [
        "Checkout in this demo build is simulated and no payment is taken. In a live store, card details would be handled by the payment provider and never stored on our own servers.",
      ],
    },
    {
      heading: "Cookies and local storage",
      paragraphs: [
        "We store your sign-in token in your browser so you stay signed in between visits, plus small preferences such as the last filter you used. Clearing your browser data removes these and signs you out.",
      ],
    },
    {
      heading: "Who else sees your data",
      paragraphs: [
        "We share information only with the services needed to run the store — our database host, our email provider for verification and password-reset codes, and our image hosting. Each of them only receives what their job requires. We may also disclose information if the law requires it.",
      ],
    },
    {
      heading: "How long we keep it",
      paragraphs: [
        "Account and order records are kept while your account is open, since your purchase history is part of the service. Ask us to close your account and we will delete your personal details, keeping only what we are legally required to retain.",
      ],
    },
    {
      heading: "Your choices",
      bullets: [
        "Ask for a copy of the personal information we hold about you.",
        "Ask us to correct anything that is wrong.",
        "Ask us to delete your account and the data attached to it.",
        "Edit or remove a review you posted at any time.",
      ],
    },
    {
      heading: "Children",
      paragraphs: [
        "This store is not intended for children under 16, and we do not knowingly collect their information.",
      ],
    },
    {
      heading: "Changes to this policy",
      paragraphs: [
        "We may update this policy as the store changes. The date at the top of this page shows when it was last revised, and continuing to use the store after a change means you accept the updated version.",
      ],
    },
    {
      heading: "Contact us",
      paragraphs: [
        `Questions about privacy can go to ${SUPPORT_EMAIL}, or reach us on WhatsApp at ${WHATSAPP_DISPLAY}.`,
      ],
    },
  ],
};

export const TERMS_AND_CONDITIONS: LegalDocument = {
  title: "Terms & Conditions",
  updated: "September 2026",
  intro:
    "These terms cover buying from NOVA — pricing, orders, delivery, and returns. Placing an order means you accept them.",
  sections: [
    {
      heading: "Products and availability",
      paragraphs: [
        "We try to show every item accurately, but colours vary between screens and a photograph is never an exact match for the garment. Stock is limited and an item can sell out between the moment you add it to your cart and the moment you check out — we confirm availability again when the order is placed.",
      ],
    },
    {
      heading: "Prices",
      bullets: [
        "All prices are shown in US dollars and include applicable taxes unless stated otherwise.",
        "Prices can change at any time before you place an order.",
        "If an item is listed at an obviously incorrect price, we may cancel the order and refund you in full rather than honour the mistake.",
      ],
    },
    {
      heading: "Placing an order",
      paragraphs: [
        "You need an account with a verified email address to check out. When you place an order we reserve the stock and show you a confirmation with an order number; that confirmation is our acceptance of your order.",
        "We may refuse or cancel an order where stock has run out, where we suspect fraud, or where the same item is being bought in quantities that look like resale.",
      ],
    },
    {
      heading: "Payment",
      paragraphs: [
        "Checkout in this demo build is simulated — no card is charged and no payment details are collected. A live store would take payment in full at checkout before the order is prepared.",
      ],
    },
    {
      heading: "Shipping and delivery",
      bullets: [
        "Orders over $75 ship free; below that a flat shipping fee applies at checkout.",
        "Orders are usually prepared within two business days.",
        "Delivery estimates are estimates, not guarantees — carrier delays and customs are outside our control.",
        "Any import duties for international orders are the customer's responsibility.",
      ],
    },
    {
      heading: "Returns and exchanges",
      paragraphs: [
        "Unworn items in their original condition can be returned within 30 days of delivery. Once we receive and check the item, the refund goes back to the original payment method.",
      ],
      bullets: [
        "Items must be unworn and unwashed, with tags still attached.",
        "Underwear, socks and pierced jewellery cannot be returned for hygiene reasons.",
        "Sale items marked final sale cannot be returned or exchanged.",
        "Return shipping is paid by the customer unless the item arrived faulty or we sent the wrong thing.",
      ],
    },
    {
      heading: "Faulty items",
      paragraphs: [
        "If something arrives damaged or defective, contact us within 14 days of delivery with your order number and a photo. We will replace it or refund it, including the shipping you paid.",
      ],
    },
    {
      heading: "Promotions",
      paragraphs: [
        "Discount codes cannot be combined unless we say so, have no cash value, and may be withdrawn at any time. One code per order.",
      ],
    },
    {
      heading: "Our liability",
      paragraphs: [
        "Nothing here limits rights you have under consumer law. Beyond those rights, our liability for any order is limited to the amount you paid for it.",
      ],
    },
    {
      heading: "Questions",
      paragraphs: [
        `Email ${SUPPORT_EMAIL} or message us on WhatsApp at ${WHATSAPP_DISPLAY} and we will get back to you.`,
      ],
    },
  ],
};

export const TERMS_OF_SERVICE: LegalDocument = {
  title: "Terms of Service",
  updated: "September 2026",
  intro:
    "These terms cover using the NOVA website itself — your account, what you post, and what we can change. Using the site means you agree to them.",
  sections: [
    {
      heading: "Using this site",
      paragraphs: [
        "You may browse the catalogue without an account. Signing in is required for a cart, a wishlist, reviews and checkout. You must be at least 16 to create an account.",
      ],
    },
    {
      heading: "Your account",
      bullets: [
        "Give accurate details when you register, and keep your email address current — we send verification and password-reset codes to it.",
        "Keep your password to yourself. Anything done through your account is treated as done by you.",
        "Tell us straight away if you think someone else has access to your account.",
        "One account per person. We may suspend duplicate or automated accounts.",
      ],
    },
    {
      heading: "Reviews and anything else you post",
      paragraphs: [
        "You keep ownership of the reviews you write, and you give us permission to display them on the product page alongside your display name. You are responsible for what you post, and it must be your own honest opinion.",
      ],
      bullets: [
        "No abusive, hateful, or harassing content.",
        "No other people's personal information.",
        "No advertising, spam, or links to other shops.",
        "No pretending to be someone else, and no reviews written in exchange for payment.",
      ],
    },
    {
      heading: "Things you must not do",
      bullets: [
        "Scrape, copy, or republish the catalogue or its photography.",
        "Interfere with the site, probe it for weaknesses, or try to reach data that is not yours.",
        "Use automated tools to buy limited stock.",
        "Resell anything bought here as if it were an official NOVA channel.",
      ],
    },
    {
      heading: "Our content",
      paragraphs: [
        "The NOVA name, the site design, and the product photography belong to us or our suppliers. You may not reuse them commercially without written permission. In this demo build the product imagery is placeholder material used for presentation only.",
      ],
    },
    {
      heading: "Availability and changes",
      paragraphs: [
        "We may add, change, or remove features at any time, and the site may be unavailable during maintenance or for reasons outside our control. We do not promise uninterrupted access.",
      ],
    },
    {
      heading: "Suspending an account",
      paragraphs: [
        "We can suspend or close an account that breaks these terms. You can close your own account at any time by contacting us; any orders already placed are still governed by the Terms & Conditions.",
      ],
    },
    {
      heading: "Disclaimer",
      paragraphs: [
        "The site is provided as it is. To the extent the law allows, we are not liable for indirect losses arising from using it. Nothing here removes rights you have under consumer law.",
      ],
    },
    {
      heading: "Getting in touch",
      paragraphs: [
        `Reach us at ${SUPPORT_EMAIL}, or on WhatsApp at ${WHATSAPP_DISPLAY}.`,
      ],
    },
  ],
};
