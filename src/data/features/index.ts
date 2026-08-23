/**
 * The nine feature pages, in nav order.
 *
 * They still render through one template, because nine hand-written routes
 * would drift. They no longer share one file, because "give this page its own
 * shape" should not mean "edit the file every other page shares".
 */
import type { PageSpec } from "../content";
import { duesAndPayments } from "./dues-and-payments";
import { collections } from "./collections";
import { accountingAndBudgets } from "./accounting-and-budgets";
import { rulesAndEnforcement } from "./rules-and-enforcement";
import { meetingsAndVoting } from "./meetings-and-voting";
import { documentsAndAnswers } from "./documents-and-answers";
import { vendorsAndInsurance } from "./vendors-and-insurance";
import { residentPortal } from "./resident-portal";
import { recordsAndAudit } from "./records-and-audit";

export const FEATURES: PageSpec[] = [
  duesAndPayments,
  collections,
  accountingAndBudgets,
  rulesAndEnforcement,
  meetingsAndVoting,
  documentsAndAnswers,
  vendorsAndInsurance,
  residentPortal,
  recordsAndAudit,
];
