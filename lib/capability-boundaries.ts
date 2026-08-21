import type { CapabilityIssue, Candidate, ExtractedField } from "./types";

type ProductMatch = {
  family: string;
  snippet: string;
  start: number;
  end: number;
};

const productPatterns: Array<[string, RegExp]> = [
  ["scrub tops", /\bscrub tops?\b/gi],
  ["tote bags", /\btote bags?\b/gi],
  ["safety vests", /\bsafety vests?\b/gi],
  ["beanies", /\bbeanies?\b/gi],
  ["aprons", /\baprons?\b/gi],
  ["shirts", /\b(?:t-shirts?|tees?)\b/gi],
  ["shirts", /\bshirts?\b/gi],
  ["hoodies", /\bhoodies?\b/gi],
  ["sweatshirts", /\bsweatshirts?\b/gi],
  ["polos", /\bpolos?\b/gi],
  ["jackets", /\bjackets?\b/gi],
  ["caps", /\b(?:caps?|hats?)\b/gi],
  ["jerseys", /\bjerseys?\b/gi],
];

function productMatches(source: string) {
  const matches: ProductMatch[] = [];
  for (const [family, pattern] of productPatterns) {
    for (const match of source.matchAll(pattern)) {
      const start = match.index ?? -1;
      if (start < 0) continue;
      const overlaps = matches.some(
        (existing) => start < existing.end && start + match[0].length > existing.start,
      );
      if (!overlaps) {
        matches.push({ family, snippet: match[0], start, end: start + match[0].length });
      }
    }
  }
  return matches.sort((left, right) => left.start - right.start);
}

export function detectCapabilityIssues(source: string): CapabilityIssue[] {
  const products = productMatches(source);
  const families = [...new Set(products.map((product) => product.family))];
  const issues: CapabilityIssue[] = [];

  if (families.length > 1) {
    issues.push({
      code: "multi_product_order",
      severity: "quote_blocker",
      title: "Split this multi-product enquiry",
      message: `Briefvu V0 cannot safely map ${families.join(", ")} into one job spec. Create one job per product or handle this order manually.`,
      evidence: products.map((product) => product.snippet).join(", "),
    });
  }

  const designCount = source.match(/\b(?:[2-9]|two|three|four|five|six|seven|eight|nine)\s+(?:separate\s+|different\s+)?designs?\b/i);
  const colorCounts = Array.from(source.matchAll(/\b(\d+|one|two|three|four|five|six)\s*[- ]?colou?rs?\b/gi));
  const normalizedColorCounts = new Set(colorCounts.map((match) => match[1].toLowerCase()));
  if (designCount && normalizedColorCounts.size > 1) {
    issues.push({
      code: "design_spec_matrix",
      severity: "quote_blocker",
      title: "Design-specific print details need separate line items",
      message: "Briefvu V0 cannot safely map different color counts to multiple designs in one field. Review each design and location manually before quoting.",
      evidence: [designCount[0], ...colorCounts.map((match) => match[0])].join(", "),
    });
  }

  const personalization = source.match(
    /\b(?:each|every|individual|personalized?|personalised?|player(?:'s|’s|s')?)\b[^.\n]{0,80}\b(?:names?|numbers?|rosters?)\b|\b(?:names?|numbers?|rosters?)\b[^.\n]{0,80}\b(?:each|every|individual|player)\b/i,
  );
  const explicitlyNoPersonalization = /\b(?:no|without)\s+(?:(?:individual|player|employee|volunteer)(?:'s|’s|s')?\s+)?(?:names?|numbers?|personalization|personalisation)\b/i.test(source);
  if (personalization && !explicitlyNoPersonalization) {
    issues.push({
      code: "personalization_matrix",
      severity: "quote_blocker",
      title: "Personalization roster needs a separate workflow",
      message: "Briefvu V0 can capture the base garment and decoration, but it cannot validate per-person names, numbers, sizes or quantities. Review the roster manually before quoting.",
      evidence: personalization[0],
    });
  }

  return issues;
}

export function applyCapabilityFieldSafety(
  source: string,
  fields: ExtractedField[],
  issues: CapabilityIssue[],
) {
  const hasMultiProduct = issues.some((issue) => issue.code === "multi_product_order");
  const hasDesignMatrix = issues.some((issue) => issue.code === "design_spec_matrix");
  if (!hasMultiProduct && !hasDesignMatrix) return fields;
  if (hasDesignMatrix && !hasMultiProduct) return fields;
  const products = productMatches(source);
  const byFamily = new Map<string, ProductMatch>();
  products.forEach((product) => {
    if (!byFamily.has(product.family)) byFamily.set(product.family, product);
  });
  const candidates: Candidate[] = [...byFamily.values()].map((product) => ({
    value: product.family,
    evidence: {
      snippet: product.snippet,
      start: product.start,
      end: product.end,
    },
  }));
  const productDependentKeys = new Set([
    "garment_brand",
    "garment_style",
    "garment_color",
    "size_breakdown",
    "decoration_method",
    "print_locations",
    "print_colors",
    "number_of_designs",
    "notes",
  ]);
  return fields.map((field) => {
    if (field.key === "garment_type") {
      return {
          ...field,
          value: "",
          status: "Conflicting" as const,
          evidence: null,
          candidates,
          accepted: false,
          edited: false,
        };
    }
    if (productDependentKeys.has(field.key)) {
      return {
        ...field,
        value: "",
        status: "Ambiguous" as const,
        evidence: null,
        candidates: [],
        accepted: false,
        edited: false,
      };
    }
    return field;
  });
}
