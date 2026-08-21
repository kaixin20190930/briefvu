import { FIELD_DEFINITIONS, type ExtractedField, type FieldStatus } from "./types";
import { evidenceFor, ensureAllFields, verifyEvidence } from "./rules";

const APPROXIMATE = /\b(around|about|roughly|approximately|maybe|probably)\b/i;

function field(
  source: string,
  key: ExtractedField["key"],
  value: string,
  snippet: string,
  status: FieldStatus = "Confirmed",
): ExtractedField {
  const definition = FIELD_DEFINITIONS.find((item) => item.key === key)!;
  return {
    ...definition,
    value,
    status,
    evidence: evidenceFor(source, snippet),
    candidates: [],
    accepted: false,
    edited: false,
  };
}

function allMatches(source: string, pattern: RegExp): RegExpMatchArray[] {
  return Array.from(source.matchAll(pattern));
}

export function parseEnquiryLocally(source: string) {
  const fields: ExtractedField[] = [];
  const quantityMatches = allMatches(
    source,
    /(?:around\s+|about\s+|roughly\s+|approximately\s+|maybe\s+|probably\s+)?\b(\d{1,5})\b(?:\s+(?:black|white|navy|red|royal blue|blue|green|gr[ae]y|orange|purple|yellow|cream|natural))?\s*(?:shirts?|tees?|t-shirts?|hoodies?|sweatshirts?|polos?|jackets?|hats?|caps?|jerseys?|tote bags?|beanies?|aprons?|safety vests?|pieces?|pcs?|garments?)\b/gi,
  );
  const standaloneQuantity = source.match(
    /(?:let(?:'s| us) do|make it|change (?:it )?to|final quantity(?: is)?|quantity(?: is)?|we(?:'ll| will) need)\s+(\d{1,5})\b|\b(\d{1,5})\s+exactly\b/i,
  );
  if (!quantityMatches.length && standaloneQuantity) {
    const value = standaloneQuantity[1] ?? standaloneQuantity[2];
    quantityMatches.push(
      Object.assign([standaloneQuantity[0], value], {
        index: standaloneQuantity.index,
        input: source,
        groups: undefined,
      }) as RegExpMatchArray,
    );
  }
  const uniqueQuantities = [...new Set(quantityMatches.map((match) => match[1]))];
  if (uniqueQuantities.length > 1) {
    const definition = FIELD_DEFINITIONS.find((item) => item.key === "quantity")!;
    fields.push({
      ...definition,
      value: "",
      status: "Conflicting",
      evidence: null,
      candidates: quantityMatches.map((match) => ({
        value: match[1],
        evidence: evidenceFor(source, match[0])!,
      })),
      accepted: false,
      edited: false,
    });
  } else if (quantityMatches[0]) {
    const match = quantityMatches[0];
    fields.push(
      field(
        source,
        "quantity",
        match[1],
        match[0],
        APPROXIMATE.test(match[0]) ? "Approximate" : "Confirmed",
      ),
    );
  }

  const garment = source.match(/\b(shirts?|t-?shirts?|tees?|hoodies?|sweatshirts?|polos?|jackets?|hats?|caps?|jerseys?|tote bags?|beanies?|aprons?|safety vests?)\b/i);
  if (garment) fields.push(field(source, "garment_type", garment[1], garment[0]));

  const brands = [
    "Gildan", "Bella+Canvas", "Bella Canvas", "Comfort Colors", "Next Level",
    "Hanes", "Champion", "Port Authority", "CornerStone", "Cherokee",
  ];
  const brand = brands.find((item) => source.toLowerCase().includes(item.toLowerCase()));
  if (brand) {
    const matched = source.slice(
      source.toLowerCase().indexOf(brand.toLowerCase()),
      source.toLowerCase().indexOf(brand.toLowerCase()) + brand.length,
    );
    fields.push(field(source, "garment_brand", brand, matched));
  }
  const style = source.match(
    /\b(?:Gildan|Bella\+?Canvas|Comfort Colors|Next Level|Hanes|Champion|Port Authority|CornerStone|Cherokee)\s+([A-Z]{0,4}\d{3,5}[A-Z]{0,3})\b/i,
  );
  if (style) fields.push(field(source, "garment_style", style[1], style[0]));

  const color = source.match(/\b(black|white|navy|red|royal blue|blue|green|gray|grey|orange|purple|yellow|cream|natural)\b(?:\s+(?:shirts?|tees?|hoodies?|sweatshirts?|polos?|jackets?|hats?|caps?|jerseys?|tote bags?|beanies?|aprons?|safety vests?|garments?))?/i);
  if (color) fields.push(field(source, "garment_color", color[1], color[0]));

  const method = source.match(/\b(screen print(?:ed|ing)?|embroid(?:er|ered|ery)|DTG|DTF|heat transfer|sublimation)\b/i);
  if (method) fields.push(field(source, "decoration_method", method[1], method[0]));

  const locationMatches = allMatches(
    source,
    /\b(left chest|right chest|full front|front|full back|back|sleeve|pocket)\b/gi,
  );
  if (locationMatches.length) {
    const values = [...new Set(locationMatches.map((m) => m[1].toLowerCase()))];
    const frontOnly = values.length === 1 && values[0] === "front";
    const first = locationMatches[0];
    const last = locationMatches[locationMatches.length - 1];
    const evidenceStart = first.index ?? 0;
    const evidenceEnd = (last.index ?? evidenceStart) + last[0].length;
    const locationEvidence = source.slice(evidenceStart, evidenceEnd);
    fields.push(
      field(
        source,
        "print_locations",
        values.join(", "),
        locationEvidence,
        frontOnly ? "Ambiguous" : "Confirmed",
      ),
    );
  }

  const colorWords: Record<string, string> = {
    one: "1", two: "2", three: "3", four: "4", five: "5", six: "6",
  };
  const colorMatches = allMatches(
    source,
    /\b(\d+|one|two|three|four|five|six)\s*[- ]?colou?rs?\b/gi,
  );
  const colorValues = colorMatches.map(
    (match) => colorWords[match[1].toLowerCase()] ?? match[1],
  );
  if (new Set(colorValues).size > 1) {
    const definition = FIELD_DEFINITIONS.find((item) => item.key === "print_colors")!;
    fields.push({
      ...definition,
      value: "",
      status: "Conflicting",
      evidence: null,
      candidates: colorMatches.map((match, index) => ({
        value: colorValues[index],
        evidence: evidenceFor(source, match[0])!,
      })),
      accepted: false,
      edited: false,
    });
  } else if (colorMatches[0]) {
    fields.push(field(source, "print_colors", colorValues[0], colorMatches[0][0]));
  }

  const sizes = source.match(/\b(?:sizes?|size breakdown)\s*[:\-]?\s*([^\n.]{3,80})/i);
  if (sizes) fields.push(field(source, "size_breakdown", sizes[1].trim(), sizes[0]));

  const designs = source.match(/\b(\d+|one|two|three|four|five|six)\s+(?:separate\s+|different\s+)?designs?\b/i);
  if (designs) {
    const designWords: Record<string, string> = {
      one: "1", two: "2", three: "3", four: "4", five: "5", six: "6",
    };
    fields.push(field(source, "number_of_designs", designWords[designs[1].toLowerCase()] ?? designs[1], designs[0]));
  }

  const artwork = source.match(/\b(artwork|art|logo|design|vector)\b/i);
  if (artwork) fields.push(field(source, "artwork_mentioned", "Yes", artwork[0]));
  const attachment = source.match(/\b(I(?:'ve| have)? attached|attached (?:is|our|the)|see (?:the )?attachment)\b/i);
  if (attachment) fields.push(field(source, "attachment_claimed", "Yes", attachment[0]));

  const deadlineMatches = allMatches(
    source,
    /\b(?:by|before|deadline(?: is|:)?|need (?:them|it) by|event(?: date)? is|(?:event|deadline) (?:moved|changed) to)\s+([A-Z][a-z]+\s+\d{1,2}(?:st|nd|rd|th)?|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\b/gi,
  );
  const uniqueDeadlines = [...new Set(deadlineMatches.map((match) => match[1].toLowerCase()))];
  if (uniqueDeadlines.length > 1) {
    const definition = FIELD_DEFINITIONS.find((item) => item.key === "deadline")!;
    fields.push({
      ...definition,
      value: "",
      status: "Conflicting",
      evidence: null,
      candidates: deadlineMatches.map((match) => ({
        value: match[1],
        evidence: evidenceFor(source, match[0])!,
      })),
      accepted: false,
      edited: false,
    });
  } else if (deadlineMatches[0]) {
    fields.push(field(source, "deadline", deadlineMatches[0][1], deadlineMatches[0][0]));
  }

  const rush = source.match(/\b(rush|asap|urgent|no rush)\b/i);
  if (rush) fields.push(field(source, "rush_requirement", /no rush/i.test(rush[0]) ? "No" : "Yes", rush[0]));

  const fulfilment = source.match(/\b(ship(?:ping|ped)?|delivery|deliver(?:ed|y)?|pick\s?up|collect)\b/i);
  if (fulfilment) fields.push(field(source, "shipping_pickup", fulfilment[1], fulfilment[0]));

  const supplied = source.match(/\b(?:we(?:'ll| will) (?:bring|supply)[^.\n]{0,50}(?:own|shirts?|garments?|blanks?|tees?)|our own (?:shirts?|garments?|blanks?|tees?)|customer[- ]supplied (?:shirts?|garments?|blanks?|tees?))\b/i);
  if (supplied) fields.push(field(source, "customer_supplied_garments", "Yes", supplied[0]));

  fields.push({
    ...FIELD_DEFINITIONS.find((item) => item.key === "file_received")!,
    value: "Unknown",
    status: "Needs Review",
    evidence: null,
    candidates: [],
    accepted: false,
    edited: false,
  });
  fields.push({
    ...FIELD_DEFINITIONS.find((item) => item.key === "artwork_readiness")!,
    value: "Unknown",
    status: "Needs Review",
    evidence: null,
    candidates: [],
    accepted: false,
    edited: false,
  });

  return verifyEvidence(source, ensureAllFields(fields));
}
