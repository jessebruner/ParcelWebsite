/** Public destinations and product facts shared by the marketing site. */
export const APP_URL = "https://app.commonparcel.com";
export const CONTACT_EMAIL = "jesse@commonparcel.com";
export const HOME_FAQS: [string, string][] = [
  ["What is Common Parcel?", "Common Parcel is HOA software for volunteer boards that manage their own association. It brings dues, financial records, governing documents, meetings, and resident access into one place."],
  ["Does Common Parcel replace our board?", "No. Your board makes the decisions. Common Parcel helps organize the information and the work around them. Your association still needs people to approve spending, handle disputes, and look after the property."],
  ["How much does it cost?", "Pricing depends on your lot count, with a $10 monthly minimum. A 50-lot association pays $69 per month for the software; a 100-lot association pays $103. Postal mail is separate, and payment processing may carry separate fees."],
  ["What do we need to get started?", "Start with your governing documents and a list of lots and owners. The board reviews the information used to set up the association. You can add financial records and invite residents as you get organized."],
];
export function faqSchema(items: [string, string][]) {
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) };
}
