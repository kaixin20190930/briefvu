import type { ContentPageData } from "@/components/ContentPage";

export const productPage: ContentPageData = {
  eyebrow: "Custom apparel intake software",
  title: "Turn apparel enquiries into a quote-ready job spec",
  intro: "Briefvu helps screen-printing and embroidery shops extract order details, trace every answer to the customer’s words, and ask only for what is still missing.",
  path: "/custom-apparel-intake-software",
  sections: [
    { heading: "Start with the message you already received", body: "Paste a customer email or enquiry instead of copying details into another long form. Briefvu identifies quantity, garment, decoration, artwork, timing and fulfilment facts while preserving the original evidence.", bullets: ["Works with informal, incomplete customer language", "Separates confirmed, approximate, conflicting and missing details", "Keeps the source snippet beside every extracted value"] },
    { heading: "Keep changes reviewable across replies", body: "When a customer changes the quantity, blank, print location or deadline, the existing job is not silently overwritten. The proposed replacement is shown alongside the old value so a shop user can accept, edit or ignore it.", bullets: ["Tracks the source message for each accepted value", "Surfaces contradictions instead of guessing", "Generates a follow-up that contains only unresolved questions"] },
    { heading: "Know the current V0 boundary", body: "Briefvu is designed for one decorated apparel product per enquiry. It covers common T-shirts, hoodies, polos, jackets, caps, jerseys and tote bags. Mixed-product uniforms, per-player personalization matrices and production scheduling require a later workflow or manual handling.", bullets: ["Ballpark and formal-quote readiness use different requirements", "Artwork claims never prove that a file was actually received", "A human approves the final job specification"] },
  ],
  callout: { heading: "A faster intake step—not an autonomous quote engine", body: "Briefvu prepares clearer inputs for your existing quote desk. Pricing, production feasibility and the final customer commitment remain with your shop." },
};

export const screenPrintingPage: ContentPageData = {
  eyebrow: "Screen printing use case",
  title: "Catch the details that change a screen-printing quote",
  intro: "A usable screen-print enquiry needs more than a shirt count. Briefvu organizes the facts that affect blanks, setup, ink, labor, artwork and delivery before they reach the quote desk.",
  path: "/use-cases/screen-printing-enquiries",
  sections: [
    { heading: "Separate quantity from uncertainty", body: "Customers often begin with an estimate and revise it later. Quantity breaks can change unit price, so Briefvu labels ‘around 50’ as approximate and keeps ‘50 or 75’ unresolved until a reviewer selects or confirms a value.", bullets: ["Quantity and garment type", "Blank brand, style and color", "Customer-supplied versus shop-supplied garments"] },
    { heading: "Capture each print variable", body: "The tool extracts the requested decoration method, print locations, number of ink colors and number of designs as separate fields. That distinction prevents a two-location request from becoming a vague note.", bullets: ["Front, back, chest, sleeve and pocket locations", "One-color, two-color and other stated ink counts", "Artwork mention and customer attachment claims"] },
    { heading: "Ask only for quote-relevant gaps", body: "A ballpark estimate may proceed without a complete size breakdown, while a formal quote may need more precision. The clarification draft follows the selected quote mode and leaves production-later questions out of an early pricing conversation." },
  ],
  callout: { heading: "Preserve the evidence behind every print detail", body: "If a customer later changes the back print or event date, the reply loop shows exactly what would be replaced before it updates the working spec." },
};

export const embroideryPage: ContentPageData = {
  eyebrow: "Embroidery use case",
  title: "Make embroidery enquiries easier to price and review",
  intro: "Embroidery requests often sound simple—‘put our logo on polos’—but garment construction, placement and artwork readiness still need to be clear. Briefvu turns those statements into reviewable fields.",
  path: "/use-cases/embroidery-enquiries",
  sections: [
    { heading: "Identify the blank before pricing", body: "Garment category, brand, style, color and quantity determine the starting point. If the customer names only polos or caps, the missing blank choice remains visible instead of being silently assumed.", bullets: ["Polos, jackets and caps are supported single-product scenarios", "Approximate quantities remain visibly approximate", "Brand and style can be completed in a later reply"] },
    { heading: "Keep placement distinct from artwork", body: "A left-chest request confirms a location, not stitch count, digitizing quality or sewability. Briefvu records the location and the fact that a logo was mentioned while leaving file receipt and production readiness for a human check.", bullets: ["Attachment claimed is not the same as file received", "Artwork readiness stays unknown without review", "Shop users can edit or remove an extracted detail"] },
    { heading: "Handle later changes without losing history", body: "If a customer changes from polos to jackets or moves the deadline, the new reply becomes a proposed replacement. The old value, new value and source text remain available during review." },
  ],
  callout: { heading: "Use AI for organization, not production assumptions", body: "The V0 intake step does not calculate stitches or promise machine compatibility. It gives the embroidery team a cleaner, evidence-backed request to evaluate." },
};

export const checklistPage: ContentPageData = {
  eyebrow: "Quote intake guide",
  title: "Custom apparel quote intake checklist",
  intro: "Use this checklist to turn an incomplete customer message into the minimum information your shop needs for a ballpark estimate or a formal quote.",
  path: "/guides/custom-apparel-quote-intake-checklist",
  sections: [
    { heading: "Order and blank", body: "Confirm what is being decorated and how many pieces are involved. Treat ranges and words such as ‘about’ as estimates until the customer confirms them.", bullets: ["Exact or approximate quantity", "Garment category, brand and style", "Garment color", "Size breakdown when the quote requires it"] },
    { heading: "Decoration and artwork", body: "Record each production-relevant statement separately. A logo attachment should trigger a file check; it should never automatically become print-ready artwork.", bullets: ["Decoration method", "Every print or embroidery location", "Ink colors or other stated design complexity", "Number of designs", "Artwork mentioned, attachment claimed, file received and readiness"] },
    { heading: "Timing, fulfilment and exceptions", body: "Dates and delivery arrangements can change feasibility and price. Use an explicit deadline, flag rush language and record whether the customer wants pickup or shipping.", bullets: ["In-hands deadline or event date", "Rush requirement", "Pickup, delivery or shipping", "Customer-supplied garments", "Personalization or mixed-product exceptions"] },
    { heading: "Review before the quote desk", body: "Resolve contradictions first, then quote blockers, then price-affecting gaps. Keep production-later questions out of a ballpark reply unless they are genuinely required by your shop." },
  ],
  callout: { heading: "Turn the checklist into a customer-ready reply", body: "Briefvu applies this structure to the enquiry, links facts to evidence and drafts the smallest useful clarification message." },
};
