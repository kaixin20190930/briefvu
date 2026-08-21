const enquiryBands = new Set(["0-10", "11-30", "31-75", "76+"]);
const workflows = new Set(["email", "spreadsheets", "printavo", "yoprint", "other"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export interface PilotApplicationData {
  shopName: string;
  contactName: string;
  email: string;
  weeklyEnquiries: string;
  currentWorkflow: string;
  notes: string;
  website: string;
  consent: boolean;
}

export function parsePilotApplication(body: Record<string, unknown>):
  | { valid: true; data: PilotApplicationData }
  | { valid: false } {
  const data: PilotApplicationData = {
    shopName: clean(body.shopName, 120),
    contactName: clean(body.contactName, 100),
    email: clean(body.email, 254).toLowerCase(),
    weeklyEnquiries: clean(body.weeklyEnquiries, 20),
    currentWorkflow: clean(body.currentWorkflow, 30),
    notes: clean(body.notes, 500),
    website: clean(body.website, 200),
    consent: body.consent === true,
  };

  if (
    data.shopName.length < 2 ||
    data.contactName.length < 2 ||
    !emailPattern.test(data.email) ||
    !enquiryBands.has(data.weeklyEnquiries) ||
    !workflows.has(data.currentWorkflow) ||
    !data.consent
  ) {
    return { valid: false };
  }
  return { valid: true, data };
}
