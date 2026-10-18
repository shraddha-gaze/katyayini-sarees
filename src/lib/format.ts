export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) || "https://katyayini.in";
export const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) || "919999999999";

export const whatsappTo = (number: string, text: string) =>
  `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

export const whatsappLink = (text: string) => whatsappTo(WHATSAPP_NUMBER, text);
