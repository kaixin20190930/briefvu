import type { ScenarioRecord } from "./types";

export function validateScenarioRegistry(registry: ScenarioRecord[]) {
  const errors: string[] = [];
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const paths = new Set<string>();

  for (const [index, scenario] of registry.entries()) {
    if (!/^M\d{2}$/.test(scenario.id)) errors.push(`${scenario.id}: invalid id`);
    const expectedId = `M${String(index + 1).padStart(2, "0")}`;
    if (scenario.id !== expectedId) errors.push(`${scenario.id}: expected sequential id ${expectedId}`);
    if (ids.has(scenario.id)) errors.push(`${scenario.id}: duplicate id`);
    ids.add(scenario.id);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(scenario.slug)) errors.push(`${scenario.id}: invalid slug`);
    if (slugs.has(scenario.slug)) errors.push(`${scenario.id}: duplicate slug`);
    slugs.add(scenario.slug);
    if (!scenario.title.trim() || !scenario.summary.trim() || !scenario.initialEnquiry.trim()) errors.push(`${scenario.id}: missing content`);
    for (const [axis, values] of Object.entries(scenario.taxonomy)) {
      if (!values.length) errors.push(`${scenario.id}: empty taxonomy ${axis}`);
    }
    if (scenario.capability.status === "supported" && scenario.expectations.length < 3) {
      errors.push(`${scenario.id}: supported scenario needs at least three field expectations`);
    }
    const expectationKeys = new Set<string>();
    for (const expectation of scenario.expectations) {
      if (expectationKeys.has(expectation.key)) errors.push(`${scenario.id}: duplicate expectation ${expectation.key}`);
      expectationKeys.add(expectation.key);
    }
    for (const reply of scenario.replies) {
      if (!reply.text.trim() || !reply.expectedChanges.length) errors.push(`${scenario.id}: reply needs text and expected changes`);
    }
    if (/\bhttps?:\/\/|\bwww\.|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\+?\d[\d\s().-]{8,}\d/i.test(scenario.initialEnquiry)) {
      errors.push(`${scenario.id}: mock enquiry may contain personal contact data`);
    }
    if (scenario.seo.status === "candidate") {
      if (scenario.capability.status !== "supported") errors.push(`${scenario.id}: candidate scenario must be supported`);
      if (!scenario.seo.primaryIntent?.trim()) errors.push(`${scenario.id}: candidate scenario needs primary intent`);
    }
    if (
      scenario.capability.status !== "supported" &&
      scenario.seo.status !== "internal"
    ) {
      errors.push(`${scenario.id}: partial or unsupported scenario must stay internal`);
    }
    if (scenario.seo.status === "published") {
      if (scenario.capability.status !== "supported") errors.push(`${scenario.id}: published scenario must be supported`);
      if (!scenario.seo.pagePath?.startsWith("/examples/")) errors.push(`${scenario.id}: published scenario needs an example path`);
      if (!scenario.seo.primaryIntent?.trim()) errors.push(`${scenario.id}: published scenario needs primary intent`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(scenario.seo.publishedOn ?? "")) errors.push(`${scenario.id}: published scenario needs a publication date`);
      if (!scenario.seo.outcome?.trim()) errors.push(`${scenario.id}: published scenario needs a unique outcome`);
      if ((scenario.seo.lessons?.length ?? 0) < 2) errors.push(`${scenario.id}: published scenario needs at least two lessons`);
      if ((scenario.seo.relatedPagePaths?.length ?? 0) < 1) errors.push(`${scenario.id}: published scenario needs related internal links`);
      if (scenario.expectations.length < 3) errors.push(`${scenario.id}: published scenario needs at least three field expectations`);
      for (const path of scenario.seo.relatedPagePaths ?? []) {
        if (!path.startsWith("/") || path.startsWith("//")) errors.push(`${scenario.id}: invalid related page path`);
      }
    }
    if (scenario.seo.pagePath) {
      if (paths.has(scenario.seo.pagePath)) errors.push(`${scenario.id}: duplicate page path`);
      paths.add(scenario.seo.pagePath);
    }
  }
  return errors;
}

export function summarizeScenarioCoverage(registry: ScenarioRecord[]) {
  const count = (values: string[]) => values.reduce<Record<string, number>>((result, value) => {
    result[value] = (result[value] ?? 0) + 1;
    return result;
  }, {});
  return {
    total: registry.length,
    capability: count(registry.map((scenario) => scenario.capability.status)),
    seo: count(registry.map((scenario) => scenario.seo.status)),
    garments: count(registry.flatMap((scenario) => scenario.taxonomy.garments)),
    decorations: count(registry.flatMap((scenario) => scenario.taxonomy.decorations)),
    industries: count(registry.flatMap((scenario) => scenario.taxonomy.industries)),
  };
}
