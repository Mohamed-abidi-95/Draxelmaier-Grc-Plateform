// PROTOTYPE DATA — NOT CONNECTED TO BACKEND
// The following mock data is preserved to maintain the visual fidelity of prototype pages 
// (Dashboard, Compliance, Audits) whose backend functionality is not yet implemented.

export const RISK_DATA = [
  { id: "RSK-1042", name: "Third-party vendor data breach", category: "Cybersecurity", owner: "Sarah Jenkins", prob: "High", impact: "Critical", score: 85, status: "Open" },
  { id: "RSK-1045", name: "Unpatched external-facing systems", category: "Infrastructure", owner: "Michael Chen", prob: "Medium", impact: "High", score: 65, status: "Mitigating" },
  { id: "RSK-1051", name: "Insider threat - unauthorized access", category: "Access Control", owner: "Elena Rostova", prob: "Low", impact: "Critical", score: 55, status: "Open" },
  { id: "RSK-1088", name: "Cloud misconfiguration (AWS S3)", category: "Cloud Security", owner: "David Kim", prob: "High", impact: "High", score: 75, status: "Review" },
  { id: "RSK-1092", name: "Phishing campaign success rate > 5%", category: "Human Risk", owner: "Sarah Jenkins", prob: "Medium", impact: "Medium", score: 45, status: "Mitigating" },
];

export const COMPLIANCE_DATA = [
  { name: 'ISO 27001', value: 92, fill: 'var(--color-chart-1)' },
  { name: 'SOC 2 Type II', value: 85, fill: 'var(--color-chart-2)' },
  { name: 'GDPR', value: 78, fill: 'var(--color-chart-3)' },
  { name: 'NIST CSF', value: 64, fill: 'var(--color-chart-4)' },
];

export const RISK_DISTRIBUTION = [
  { name: 'Critical', value: 12, fill: 'var(--color-destructive)' },
  { name: 'High', value: 34, fill: 'var(--color-chart-3)' },
  { name: 'Medium', value: 85, fill: 'var(--color-chart-1)' },
  { name: 'Low', value: 142, fill: 'var(--color-chart-2)' },
];

export const ACTIVITY_FEED = [
  { id: 1, action: "Control CTRL-892 updated", user: "Michael Chen", time: "10m ago" },
  { id: 2, action: "New evidence uploaded for GDPR-Art32", user: "Elena Rostova", time: "1h ago" },
  { id: 3, action: "Risk RSK-1045 status changed to Mitigating", user: "David Kim", time: "2h ago" },
  { id: 4, action: "Audit Q3 Internal Security completed", user: "System", time: "5h ago" },
];

export const AUDITS = [
  { id: "AUD-24-01", name: "ISO 27001 Surveillance Audit", status: "In Progress", progress: 65, findings: 3, date: "Oct 15 - Nov 1" },
  { id: "AUD-24-02", name: "Q3 Internal Vulnerability Assessment", status: "Completed", progress: 100, findings: 12, date: "Sep 1 - Sep 30" },
  { id: "AUD-24-03", name: "Vendor Compliance Review", status: "Planned", progress: 0, findings: 0, date: "Dec 1 - Dec 15" },
];
