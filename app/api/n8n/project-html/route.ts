import { NextResponse } from "next/server"
import { extractHtmlFromAgentResponse } from "@/lib/project-html-agent"

/** Same pattern as `planning/route.ts` — n8n Cloud test webhook. Override with `N8N_PROJECT_HTML_WEBHOOK_URL`. */
const DEFAULT_PROJECT_HTML_WEBHOOK =
  "https://kavishmk.app.n8n.cloud/webhook-test/33d2582d-e5d4-4982-bac3-9f27e0ab9ba7"

export async function POST(request: Request) {
  const webhookUrl = process.env.N8N_PROJECT_HTML_WEBHOOK_URL?.trim() || DEFAULT_PROJECT_HTML_WEBHOOK

  let body: string
  try {
    body = await request.text()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const upstream = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })

  const contentType = upstream.headers.get("content-type") ?? ""
  const status = upstream.status
  const text = await upstream.text()

  let payload: unknown = text
  if (contentType.includes("application/json") && text.trim()) {
    try {
      payload = JSON.parse(text) as unknown
    } catch {
      payload = text
    }
  }

  // Mirror planning: pass n8n errors straight through (same status + body).
  if (!upstream.ok) {
    return NextResponse.json(payload, { status })
  }

  const html = extractHtmlFromAgentResponse(payload)
  if (!html?.trim()) {
    return NextResponse.json(
      {
        error: "HTML agent returned no usable HTML fragment",
        detail: typeof payload === "string" ? payload.slice(0, 800) : payload,
      },
      { status: 502 }
    )
  }

  return NextResponse.json({ html })
}
