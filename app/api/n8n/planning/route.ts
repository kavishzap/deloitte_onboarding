import { NextResponse } from "next/server"

const DEFAULT_PLANNING_WEBHOOK =
  "https://kavishmk.app.n8n.cloud/webhook-test/9326d4ca-ca95-4338-8122-5520111c94b7"

export async function POST(request: Request) {
  const webhookUrl = process.env.N8N_PLANNING_WEBHOOK_URL?.trim() || DEFAULT_PLANNING_WEBHOOK

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

  return NextResponse.json(payload, { status })
}
