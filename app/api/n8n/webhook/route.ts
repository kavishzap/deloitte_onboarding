import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (!webhookUrl) {
    return NextResponse.json(
      { error: "Missing N8N_WEBHOOK_URL in environment (see .env)." },
      { status: 500 }
    )
  }

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
