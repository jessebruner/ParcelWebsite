/**
 * Blog post schema and data store.
 *
 * Designed for authoritative, primary-sourced HOA operational and statutory guides.
 * Post bodies carry structured citations with source, section, and retrieval date.
 * Content is authored and reviewed with primary source verification.
 */

export interface Citation {
  source: string;
  section: string;
  title: string;
  retrievedAt: string; // ISO YYYY-MM-DD
  url?: string;
  note?: string;
}

export interface BlogCallout {
  type: "statutory" | "note" | "warning";
  title?: string;
  text: string;
}

export interface BlogSection {
  heading?: string;
  paragraphs: string[];
  callout?: BlogCallout;
  list?: {
    title?: string;
    items: string[];
  };
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string; // ISO YYYY-MM-DD
  author: {
    name: string;
    role: string;
  };
  category: "Statutory Guidance" | "Operations" | "Board Governance" | "Financial Controls";
  readTime: string;
  artSeed: number;
  artScene?: "dusk" | "dawn";
  lede: string;
  sections: BlogSection[];
  citations: Citation[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "board-transition-records-retention-checklist",
    title: "A Volunteer Board Transition and Records Organization Guide",
    description: "Operational principles for handing off association books, vendor contracts, architectural records, and meeting minutes between outgoing and incoming board officers.",
    publishedAt: "2026-08-22",
    author: {
      name: "Common Parcel Editorial",
      role: "Operations and Governance",
    },
    category: "Board Governance",
    readTime: "4 min read",
    artSeed: 101,
    artScene: "dusk",
    lede: "When board members rotate off an association board, institutional knowledge and administrative access often disappear with them. Here is a procedural guide to maintaining clean continuity across leadership transitions.",
    sections: [
      {
        heading: "Keep association records in one place",
        paragraphs: [
          "In many self-managed communities, records end up scattered across personal email accounts, private laptops, and physical boxes stored in past presidents' basements.",
          "Establishing a single, shared association repository ensures that incoming officers inherit complete documentation without relying on ad-hoc personal file transfers.",
        ],
        callout: {
          type: "note",
          title: "Custody Principle",
          text: "Association records belong to the non-profit entity, not to individual directors or officers. Official records should always reside in an association-owned workspace with distinct administrative roles.",
        },
      },
      {
        heading: "Essential categories for annual turnover",
        paragraphs: [
          "An orderly handover checklist organizes documents by operational function. This allows the incoming treasurer, secretary, and president to inspect their respective functional areas immediately upon election.",
          "Document repositories should preserve dated records alongside audit histories for all vendor quotes, architectural decisions, and financial reconciliations.",
        ],
        list: {
          title: "Core records turnover categories",
          items: [
            "Financial ledgers, approved annual budgets, and year-end balance sheets",
            "Executed vendor contracts, certificates of insurance, and active warranties",
            "Approved architectural review submissions, approvals, and denial notices",
            "Signed board meeting minutes, notice certificates, and annual meeting records",
          ],
        },
      },
    ],
    citations: [
      {
        source: "Common Parcel Governance Standards",
        section: "Section 1.2",
        title: "Records Retention and Administrative Transition Guidelines",
        retrievedAt: "2026-08-22",
        note: "Operational governance reference for self-managed community associations.",
      },
    ],
  },
];

export function getAllPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => (b.publishedAt > a.publishedAt ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
