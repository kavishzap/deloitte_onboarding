import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

function defaultProposalFilename(): string {
  const d = new Date()
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  return `software-business-proposal-${stamp}.pdf`
}

/**
 * html2canvas cannot parse modern CSS color spaces (lab/oklch/color-mix) from stylesheets.
 * Copy resolved rgb/rgba values from the live DOM onto the clone so rasterisation succeeds.
 */
function applyPdfSafeInlineStyles(sourceRoot: HTMLElement, cloneRoot: HTMLElement): void {
  const stack: [HTMLElement, HTMLElement][] = [[sourceRoot, cloneRoot]]

  while (stack.length > 0) {
    const [src, dst] = stack.pop()!

    if (src.nodeType !== Node.ELEMENT_NODE || dst.nodeType !== Node.ELEMENT_NODE) continue
    if (!(src instanceof HTMLElement) || !(dst instanceof HTMLElement)) continue

    const cs = window.getComputedStyle(src)

    dst.style.color = cs.color
    if ("webkitTextFillColor" in cs && typeof (cs as CSSStyleDeclaration & { webkitTextFillColor?: string }).webkitTextFillColor === "string") {
      dst.style.webkitTextFillColor =
        (cs as CSSStyleDeclaration & { webkitTextFillColor?: string }).webkitTextFillColor || cs.color
    }

    const bgImage = cs.backgroundImage
    if (bgImage && bgImage !== "none") {
      dst.style.backgroundImage = "none"
      dst.style.backgroundColor = "#f8fafc"
    } else {
      dst.style.backgroundImage = "none"
      dst.style.backgroundColor = cs.backgroundColor
    }

    dst.style.borderTopColor = cs.borderTopColor
    dst.style.borderRightColor = cs.borderRightColor
    dst.style.borderBottomColor = cs.borderBottomColor
    dst.style.borderLeftColor = cs.borderLeftColor
    dst.style.borderTopWidth = cs.borderTopWidth
    dst.style.borderRightWidth = cs.borderRightWidth
    dst.style.borderBottomWidth = cs.borderBottomWidth
    dst.style.borderLeftWidth = cs.borderLeftWidth
    dst.style.borderTopStyle = cs.borderTopStyle
    dst.style.borderRightStyle = cs.borderRightStyle
    dst.style.borderBottomStyle = cs.borderBottomStyle
    dst.style.borderLeftStyle = cs.borderLeftStyle

    dst.style.boxShadow = "none"
    dst.style.outline = "none"
    dst.style.textDecorationColor = cs.textDecorationColor
    dst.style.caretColor = cs.caretColor

    const srcKids = src.children
    const dstKids = dst.children
    const n = Math.min(srcKids.length, dstKids.length)
    for (let i = 0; i < n; i++) {
      const sc = srcKids[i]
      const dc = dstKids[i]
      if (sc instanceof HTMLElement && dc instanceof HTMLElement) {
        stack.push([sc, dc])
      }
    }
  }
}

/**
 * Rasterises the proposal DOM to JPEG slices and builds a multi-page A4 PDF.
 * Runs only in the browser (call from client components / event handlers).
 */
export async function exportProposalToPdf(
  element: HTMLElement,
  filename: string = defaultProposalFilename()
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    logging: false,
    backgroundColor: "#ffffff",
    scrollX: 0,
    scrollY: -window.scrollY,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    onclone: (_clonedDoc, clonedElement) => {
      if (!(clonedElement instanceof HTMLElement)) return
      applyPdfSafeInlineStyles(element, clonedElement)
    },
  })

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const margin = 12
  const printableWidth = pdf.internal.pageSize.getWidth() - margin * 2
  const printableHeight = pdf.internal.pageSize.getHeight() - margin * 2

  const mmPerPx = printableWidth / canvas.width
  const pageContentHeightPx = Math.floor(printableHeight / mmPerPx)

  let offsetY = 0
  let page = 0

  while (offsetY < canvas.height) {
    const sliceHeightPx = Math.min(canvas.height - offsetY, pageContentHeightPx)

    const slice = document.createElement("canvas")
    slice.width = canvas.width
    slice.height = sliceHeightPx
    const ctx = slice.getContext("2d")
    if (!ctx) throw new Error("Could not create canvas context for PDF export")
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, slice.width, slice.height)
    ctx.drawImage(canvas, 0, offsetY, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx)

    const sliceData = slice.toDataURL("image/jpeg", 0.92)
    const sliceHeightMm = sliceHeightPx * mmPerPx

    if (page > 0) pdf.addPage()
    pdf.addImage(sliceData, "JPEG", margin, margin, printableWidth, sliceHeightMm)

    offsetY += sliceHeightPx
    page += 1
  }

  pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`)
}
