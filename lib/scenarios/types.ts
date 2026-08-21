import type { FieldKey, FieldStatus, QuoteMode } from "../types";

export type CapabilityStatus = "supported" | "partial" | "unsupported";
export type SeoStatus = "internal" | "candidate" | "published";

export type ScenarioTaxonomy = {
  garments: string[];
  decorations: string[];
  industries: string[];
  orderShapes: Array<"single-product" | "multi-product">;
  intakeProblems: string[];
  workflowStages: string[];
  quoteModes: QuoteMode[];
};

export type FieldExpectation = {
  key: FieldKey;
  value: string;
  status?: FieldStatus;
};

export type ScenarioReply = {
  label: string;
  text: string;
  expectedChanges: FieldKey[];
};

export type ScenarioRecord = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  initialEnquiry: string;
  replies: ScenarioReply[];
  taxonomy: ScenarioTaxonomy;
  capability: {
    status: CapabilityStatus;
    notes: string;
  };
  expectations: FieldExpectation[];
  seo: {
    status: SeoStatus;
    pagePath?: string;
    primaryIntent?: string;
    publishedOn?: string;
    outcome?: string;
    lessons?: string[];
    relatedPagePaths?: string[];
  };
};
