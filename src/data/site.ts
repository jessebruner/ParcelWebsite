/** Public destinations and product facts shared by the marketing site. */
export const APP_URL = "https://app.commonparcel.com";
export const CONTACT_EMAIL = "jesse@commonparcel.com";
export const HOME_FAQS: [string, string][] = [
  ["What is Common Parcel?", "Common Parcel is HOA software for volunteer boards that manage their own association. It brings dues, financial records, governing documents, meetings, and resident access into one place."],
  ["What can residents do?", "Residents can check their balance and payment history, read shared association documents, and submit architectural requests. They can pay online when the association connects its payment account. The board reviews requests and decides what information to share."],
  ["How much does it cost?", "A four-unit association pays $10 per month for all software features. Pricing increases with the number of lots or units: 50 units cost $69 per month, and 100 units cost $103. The monthly minimum is $10. Postal mail is separate, and payment processing may carry separate fees."],
  ["What do we need to get started?", "Start with your governing documents and a list of lots and owners. The board reviews the information used to set up the association. You can add financial records and invite residents as you get organized."],
];
export function faqSchema(items: [string, string][]) {
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) };
}
