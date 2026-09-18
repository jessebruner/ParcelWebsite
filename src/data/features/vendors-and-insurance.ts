import type { PageSpec } from "../content";

export const vendorsAndInsurance: PageSpec = {
  "slug": "vendors-and-insurance",
  "title": "HOA vendor and insurance records",
  "description": "See the agreements, insurance policies, and renewal dates your board needs. Review the terms before a contract renews or a bill is approved.",
  "h1": "Keep track of contracts and insurance renewals.",
  "lede": "See the agreements, insurance policies, and renewal dates your board needs. Review the terms before a contract renews or a bill is approved.",
  "bands": [
    {
      "title": "See which contracts are coming up for renewal",
      "layout": "rail",
      "field": false,
      "body": [
        {
          "p": "Store contract terms and renewal dates together. Your board can review the agreement, ask questions, and request new quotes before deciding whether to renew."
        }
      ]
    },
    {
      "title": "Check the bill against the contract",
      "layout": "rail",
      "field": true,
      "body": [
        {
          "p": "Keep vendor invoices with the contract and approval record. Review what was agreed, what work was completed, and what is being charged before authorizing payment."
        }
      ]
    },
    {
      "title": "Find policy details when you need them",
      "layout": "rail",
      "field": false,
      "body": [
        {
          "p": "Store policy documents and vendor certificates with the relevant records. Confirm coverage, deductibles, and renewal terms with your insurance professional."
        }
      ]
    }
  ],
  "faqs": [
    [
      "Will Common Parcel negotiate vendor contracts?",
      "No. Your board chooses vendors and approves agreements. The software helps keep documents, dates, and decisions organized."
    ],
    [
      "Can we store vendor insurance certificates?",
      "Yes. Keep certificates of insurance with vendor records so the board can review the documents when needed."
    ],
    [
      "Does it tell us how much insurance to buy?",
      "No. Keep policy details in Common Parcel, and work with an insurance professional to assess coverage for your association."
    ]
  ]
};
