import jsPDF from 'jspdf'
import { formatINR } from '../../lib/products'
import { format } from 'date-fns'

const ACS = {
  name: 'Advanced Computer System',
  address: 'Burdwan, West Bengal',
  phone: '+91 81700 18080',
  email: 'acsbdn@gmail.com',
  website: 'advancedcomputersystem.in',
  est: '1995',
}

export async function generateQuotePDF(quote) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210, H = 297
  const ml = 15, mr = W - 15
  let y = 15

  // ── Header band ────────────────────────────────────────────────────────────
  doc.setFillColor(10, 15, 26)
  doc.rect(0, 0, W, 38, 'F')

  // ACS badge circle
  doc.setFillColor(26, 42, 74)
  doc.circle(ml + 9, 19, 9, 'F')
  doc.setDrawColor(240, 102, 35)
  doc.setLineWidth(0.8)
  doc.circle(ml + 9, 19, 9, 'S')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(240, 102, 35)
  doc.text('ACS', ml + 9, 20, { align: 'center' })

  // Company details
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(232, 237, 244)
  doc.text(ACS.name, ml + 22, 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(143, 163, 188)
  doc.text(`${ACS.address}  ·  Est. ${ACS.est}`, ml + 22, 21)
  doc.text(`${ACS.phone}  ·  ${ACS.email}  ·  ${ACS.website}`, ml + 22, 26)

  // QUOTATION label
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(240, 102, 35)
  doc.text('QUOTATION', mr, 16, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(143, 163, 188)
  const qDate = format(new Date(), 'dd MMM yyyy')
  const validDate = quote.validity_date ? format(new Date(quote.validity_date), 'dd MMM yyyy') : format(new Date(Date.now() + 15*86400000), 'dd MMM yyyy')
  doc.text(`Date: ${qDate}`, mr, 21, { align: 'right' })
  doc.text(`Valid till: ${validDate}`, mr, 26, { align: 'right' })

  y = 44

  // ── Client block ───────────────────────────────────────────────────────────
  doc.setFillColor(21, 31, 46)
  doc.roundedRect(ml, y, mr - ml, 22, 2, 2, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(143, 163, 188)
  doc.text('TO', ml + 4, y + 5)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(232, 237, 244)
  doc.text(quote.client_name || 'Valued Client', ml + 4, y + 11)

  const details = []
  if (quote.business_type) details.push(quote.business_type)
  if (quote.users) details.push(`${quote.users} user${quote.users > 1 ? 's' : ''}`)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(143, 163, 188)
  doc.text(details.join(' · '), ml + 4, y + 17)

  y += 28

  // ── Items table ────────────────────────────────────────────────────────────
  const colX = { product: ml, plan: ml + 78, qty: ml + 118, disc: ml + 133, amount: mr }
  const colW = { product: 75, plan: 37, qty: 12, disc: 17, amount: 30 }

  // Table header
  doc.setFillColor(30, 45, 66)
  doc.rect(ml, y, mr - ml, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(143, 163, 188)
  doc.text('PRODUCT / SERVICE', colX.product + 2, y + 5.5)
  doc.text('PLAN / VARIANT', colX.plan, y + 5.5)
  doc.text('QTY', colX.qty + 4, y + 5.5, { align: 'center' })
  doc.text('DISC%', colX.disc + 6, y + 5.5, { align: 'center' })
  doc.text('AMOUNT', colX.amount, y + 5.5, { align: 'right' })

  y += 8
  let rowBg = false

  for (const item of (quote.items || [])) {
    const lineH = 9
    if (rowBg) {
      doc.setFillColor(16, 24, 37)
      doc.rect(ml, y, mr - ml, lineH, 'F')
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(232, 237, 244)
    doc.text(item.product_name || '', colX.product + 2, y + 6)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(143, 163, 188)
    doc.text(item.variant || '', colX.plan, y + 6)
    doc.text(String(item.quantity || 1), colX.qty + 4, y + 6, { align: 'center' })

    if (item.discount_pct > 0) {
      doc.setTextColor(240, 102, 35)
      doc.text(`${item.discount_pct}%`, colX.disc + 6, y + 6, { align: 'center' })
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(232, 237, 244)
    const lineTotal = item.eu_price * (item.quantity || 1) * (1 - (item.discount_pct || 0) / 100)
    doc.text(formatINR(lineTotal), colX.amount, y + 6, { align: 'right' })

    y += lineH
    rowBg = !rowBg

    // Page break
    if (y > H - 60) {
      doc.addPage()
      y = 20
    }
  }

  // Divider
  doc.setDrawColor(30, 45, 66)
  doc.setLineWidth(0.5)
  doc.line(ml, y, mr, y)
  y += 6

  // ── Totals ─────────────────────────────────────────────────────────────────
  const subtotal = (quote.items || []).reduce((s, it) =>
    s + it.eu_price * (it.quantity || 1) * (1 - (it.discount_pct || 0) / 100), 0)
  const gst = quote.gst_included ? subtotal * 0.18 : 0
  const total = subtotal + gst

  const totRow = (label, val, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(bold ? 9 : 8)
    doc.setTextColor(bold ? 232 : 143, bold ? 237 : 163, bold ? 244 : 188)
    doc.text(label, mr - 45, y)
    doc.setTextColor(bold ? 240 : 143, bold ? 102 : 163, bold ? 35 : 188)
    doc.text(formatINR(val), mr, y, { align: 'right' })
    y += 6
  }

  totRow('Subtotal (ex-GST)', subtotal)
  if (quote.gst_included) totRow('GST @ 18%', gst)

  doc.setFillColor(21, 31, 46)
  doc.roundedRect(mr - 65, y - 2, 65, 10, 2, 2, 'F')
  totRow('TOTAL', total, true)
  y += 4

  // ── Notes ─────────────────────────────────────────────────────────────────
  if (quote.notes) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(143, 163, 188)
    doc.text('Notes & Terms', ml, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(143, 163, 188)
    const lines = doc.splitTextToSize(quote.notes, mr - ml)
    doc.text(lines, ml, y)
    y += lines.length * 4 + 4
  }

  // Default terms
  const terms = 'Prices are in Indian Rupees (INR). Validity: 15 days from date of quotation. GST applicable as per prevailing rates. Subject to availability.'
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7)
  doc.setTextColor(74, 96, 128)
  const termLines = doc.splitTextToSize(terms, mr - ml)
  doc.text(termLines, ml, y)

  // ── Footer ─────────────────────────────────────────────────────────────────
  doc.setFillColor(16, 24, 37)
  doc.rect(0, H - 18, W, 18, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(74, 96, 128)
  doc.text(`${ACS.name} · ${ACS.address} · ${ACS.phone} · ${ACS.email} · ${ACS.website}`, W / 2, H - 8, { align: 'center' })

  const fname = `ACS-Quote-${(quote.client_name || 'Client').replace(/\s/g, '-')}-${format(new Date(), 'yyyyMMdd')}.pdf`
  doc.save(fname)
}
