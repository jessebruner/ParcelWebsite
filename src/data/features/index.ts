/**
 * The nine feature pages, in nav order.
 *
 * They still render through one template, because nine hand-written routes
 * would drift. They no longer share one file, because "give this page its own
 * shape" should not mean "edit the file every other page shares".
 */
import type { PageSpec } from "../content";
import { duesAndPayments } from "./dues-and-payments.ts";
import { collections } from "./collections.ts";
import { accountingAndBudgets } from "./accounting-and-budgets.ts";
import { rulesAndEnforcement } from "./rules-and-enforcement.ts";
import { meetingsAndVoting } from "./meetings-and-voting.ts";
import { documentsAndAnswers } from "./documents-and-answers.ts";
import { vendorsAndInsurance } from "./vendors-and-insurance.ts";
import { residentPortal } from "./resident-portal.ts";
import { recordsAndAudit } from "./records-and-audit.ts";

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
