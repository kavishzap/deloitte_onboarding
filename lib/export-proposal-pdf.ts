import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

const UNSUPPORTED_COLOR_FN_RE = /\b(?:lab|lch|oklab|oklch|color-mix)\s*\(/i

const COPIED_LAYOUT_PROPS = [
  "display",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "z-index",
  "box-sizing",
  "width",
  "height",
  "min-width",
  "min-height",
  "max-width",
  "max-height",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "flex-direction",
  "flex-wrap",
  "flex-grow",
  "flex-shrink",
  "flex-basis",
  "justify-content",
  "align-items",
  "align-content",
  "align-self",
  "justify-self",
  "order",
  "gap",
  "row-gap",
  "column-gap",
  "grid-template-columns",
  "grid-template-rows",
  "grid-column",
  "grid-row",
  "place-items",
  "place-content",
  "place-self",
  "overflow",
  "overflow-x",
  "overflow-y",
  "opacity",
  "visibility",
  "transform",
  "transform-origin",
  "border-radius",
  "font-family",
  "font-size",
  "font-style",
  "font-weight",
  "line-height",
  "letter-spacing",
  "text-align",
  "text-transform",
  "white-space",
  "word-break",
  "overflow-wrap",
  "list-style-type",
  "list-style-position",
  "vertical-align",
  "object-fit",
  "object-position",
  "fill",
  "stroke",
] as const

type StylableElement = HTMLElement | SVGElement

function isStylableElement(el: Element): el is StylableElement {
  return el instanceof HTMLElement || el instanceof SVGElement
}

function defaultProposalFilename(): string {
  const d = new Date()
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  return `software-business-proposal-${stamp}.pdf`
}

/**
 * html2canvas cannot parse modern CSS color spaces (lab/oklch/color-mix) from stylesheets.
 * Copy resolved values from the live DOM onto the clone and strip stylesheet sources that
 * would otherwise be reparsed by html2canvas.
 */
function stripProblematicStylesheets(clonedDoc: Document): void {
  for (const link of Array.from(clonedDoc.querySelectorAll('link[rel="stylesheet"]'))) {
    link.remove()
  }

  for (const style of Array.from(clonedDoc.querySelectorAll("style"))) {
    const text = style.textContent ?? ""
    if (UNSUPPORTED_COLOR_FN_RE.test(text)) {
      style.remove()
    }
  }
}

function applyPdfSafeInlineStyles(sourceRoot: HTMLElement, cloneRoot: HTMLElement): void {
  const stack: [Element, Element][] = [[sourceRoot, cloneRoot]]

  while (stack.length > 0) {
    const [src, dst] = stack.pop()!

    if (src.nodeType !== Node.ELEMENT_NODE || dst.nodeType !== Node.ELEMENT_NODE) continue
    if (!isStylableElement(src) || !isStylableElement(dst)) continue

    const cs = window.getComputedStyle(src)

    for (const prop of COPIED_LAYOUT_PROPS) {
      const value = cs.getPropertyValue(prop)
      if (value) {
        dst.style.setProperty(prop, value)
      }
    }

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
      if (sc instanceof Element && dc instanceof Element) {
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
    onclone: (clonedDoc, clonedElement) => {
      if (!(clonedElement instanceof HTMLElement)) return
      stripProblematicStylesheets(clonedDoc)
      clonedDoc.body.style.backgroundColor = "#ffffff"
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
