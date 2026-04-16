/**
 * Lightweight keyword inference from the user's free-text challenge so n8n
 * receives structured hints without a second LLM round-trip.
 * First matching rule wins within each category (order matters).
 */

export type InferredWebhookContext = {
  industry: string
  businessFunction: string
  objective: string
  urgency: string
  chosenPlatform: string
  chosenLLM: string
}

type Rule = { test: RegExp; value: string }

const INDUSTRY_RULES: Rule[] = [
  { test: /\b(bank|banking|lender|mortgage|credit union|fintech|wealth management|payments?)\b/i, value: "Financial Services" },
  { test: /\b(insurance|underwrit|claims adjust)\b/i, value: "Insurance" },
  { test: /\b(hospital|health ?care|clinical|patient|pharma|HIPAA|medical device)\b/i, value: "Healthcare" },
  { test: /\b(manufactur|factory|plant|production line|OEM)\b/i, value: "Manufacturing" },
  { test: /\b(energy|utility|power grid|oil and gas|renewable)\b/i, value: "Energy & Utilities" },
  { test: /\b(telecom|telco|carrier|5g|network operator)\b/i, value: "Telecommunications" },
  { test: /\b(government|public sector|agency|federal|municipal)\b/i, value: "Public Sector" },
  { test: /\b(retail|merchant|store front|e-?commerce|inventory|SKU|POS)\b/i, value: "Retail" },
  { test: /\b(logistics|freight|shipping|3pl|warehouse|fulfillment)\b/i, value: "Logistics" },
  { test: /\b(hotel|hospitality|restaurant|food service)\b/i, value: "Hospitality" },
  { test: /\b(university|school district|education|campus|LMS)\b/i, value: "Education" },
  { test: /\b(software|SaaS|tech company|startup|cloud provider|ISV)\b/i, value: "Technology" },
]

const FUNCTION_RULES: Rule[] = [
  { test: /\b(compliance|regulatory|AML|KYC|audit|risk management|SOX)\b/i, value: "Risk & Compliance" },
  { test: /\b(finance|accounting|FP&A|CFO|budget|ledger|tax)\b/i, value: "Finance" },
  { test: /\b(IT department|information technology|enterprise IT|infrastructure|cybersecurity|DevOps|cloud migration)\b/i, value: "IT" },
  { test: /\b(HR|human resources|talent|payroll|recruit|workforce)\b/i, value: "Human Resources" },
  { test: /\b(sales|marketing|brand|campaign|CRM|lead gen|customer acquisition)\b/i, value: "Sales & Marketing" },
  { test: /\b(customer service|call center|support desk|contact center|helpdesk)\b/i, value: "Customer Service" },
  { test: /\b(legal|contracts?|counsel)\b/i, value: "Legal" },
  { test: /\b(operations|operational|supply chain|procurement|process improvement|efficiency)\b/i, value: "Operations" },
]

const OBJECTIVE_RULES: Rule[] = [
  { test: /\b(cost|reduce spend|cut cost|cheaper|budget|opex|capex savings|margin pressure)\b/i, value: "Cost reduction" },
  { test: /\b(revenue|growth|market share|upsell|cross-sell|top line)\b/i, value: "Revenue growth" },
  { test: /\b(automat|workflow|RPA|eliminate manual|digitize|streamline process)\b/i, value: "Automation & efficiency" },
  { test: /\b(customer experience|CX|NPS|satisfaction|loyalty|retention)\b/i, value: "Customer experience" },
  { test: /\b(reporting|report automation|dashboard|data quality|analytics)\b/i, value: "Reporting & insights" },
  { test: /\b(innovation|digital transformation|AI adoption|modernize|future-ready)\b/i, value: "Innovation & transformation" },
  { test: /\b(time to market|accelerate|speed|faster delivery|agility)\b/i, value: "Speed & agility" },
]

function firstMatch(text: string, rules: Rule[], fallback: string): string {
  const t = text.trim()
  if (!t) return fallback
  for (const { test, value } of rules) {
    if (test.test(t)) return value
  }
  return fallback
}

function inferUrgency(text: string): string {
  const t = text.trim()
  if (!t) return "Medium"
  if (/\b(urgent|asap|immediately|critical|emergency|right away|this week|board meeting|deadline)\b/i.test(t)) {
    return "High"
  }
  if (/\b(long[- ]term|explor|research phase|roadmap|eventually|future|no rush|low priority)\b/i.test(t)) {
    return "Low"
  }
  return "Medium"
}

function inferPlatform(text: string): string {
  if (/\bn8n\b/i.test(text)) return "n8n"
  if (/\bzapier\b/i.test(text)) return "Zapier"
  if (/\bmake\.com|integromat\b/i.test(text)) return "Make"
  return "n8n"
}

function inferLlm(text: string): string {
  if (/\b(claude|anthropic)\b/i.test(text)) return "Anthropic"
  if (/\b(gemini|google ai)\b/i.test(text)) return "Google"
  if (/\b(mistral)\b/i.test(text)) return "Mistral"
  if (/\b(llama|meta ai)\b/i.test(text)) return "Meta Llama"
  if (/\b(openai|gpt-?4|gpt-?5|chatgpt)\b/i.test(text)) return "OpenAI"
  return "OpenAI"
}

export function inferChatWebhookContext(prompt: string): InferredWebhookContext {
  const industry = firstMatch(prompt, INDUSTRY_RULES, "General / cross-industry")
  const businessFunction = firstMatch(prompt, FUNCTION_RULES, "Strategy & transformation")
  const objective = firstMatch(prompt, OBJECTIVE_RULES, "Business transformation")
  return {
    industry,
    businessFunction,
    objective,
    urgency: inferUrgency(prompt),
    chosenPlatform: inferPlatform(prompt),
    chosenLLM: inferLlm(prompt),
  }
}
