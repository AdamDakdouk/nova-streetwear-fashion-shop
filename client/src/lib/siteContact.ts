/**
 * Storefront contact details, kept in one place so they can be swapped without
 * hunting through components.
 *
 * NOTE: the email and social links are placeholders for this demo build. The
 * address uses the reserved `.example` TLD so it can never reach a real inbox
 * by accident, and the social links point at the platforms rather than at a
 * guessed handle that might belong to someone else. 
 */
export const SUPPORT_EMAIL = "support@nova.example";

/** Digits only, international format — what wa.me expects. */
export const WHATSAPP_NUMBER = "96170795881";
export const WHATSAPP_DISPLAY = "+961 70 795 881";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export const INSTAGRAM_URL = "https://www.instagram.com/";
export const TIKTOK_URL = "https://www.tiktok.com/";

export const MAILTO_URL = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("NOVA customer support")}`;
