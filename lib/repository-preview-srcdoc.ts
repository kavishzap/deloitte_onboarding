/**
 * Build `srcDoc` for a sandboxed preview iframe so agent HTML/CSS does not merge into the host document.
 * If the payload is already a full document, it is returned as-is (trimmed).
 */
export function toRepositoryPreviewSrcDoc(html: string): string {
  const t = html.trim()
  if (!t) {
    return "<!DOCTYPE html><html><head><meta charset=\"utf-8\"></head><body></body></html>"
  }
  const head = t.slice(0, 400).toLowerCase()
  if (head.includes("<!doctype") || head.includes("<html")) {
    return t
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><base target="_blank" rel="noopener noreferrer"></head><body>${t}</body></html>`
}
