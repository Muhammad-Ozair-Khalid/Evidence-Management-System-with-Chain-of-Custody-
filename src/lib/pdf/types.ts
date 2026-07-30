export type CustodyReportEvent = {
  timestamp: string;
  eventType: string;
  fromName: string;
  toName: string;
  location: string;
  reason: string;
  hashAtEvent: string;
  hashMatch: boolean | null;
};

export type CustodyReportItem = {
  evidenceId: string;
  caseNumber: string;
  title: string;
  description: string;
  evidenceType: string;
  status: string;
  originalHash: string;
  currentHash: string;
  intakeDate: string;
  intakeLocation: string;
  submittedByName: string;
  currentCustodianName: string;
  returnedTo: string | null;
  events: CustodyReportEvent[];
};

export type CustodyReportPayload = {
  organisationName: string;
  generatedAt: string;
  generatedByName: string;
  generatedByEmail: string;
  reportKind: "single" | "case";
  caseNumber?: string;
  items: CustodyReportItem[];
};
