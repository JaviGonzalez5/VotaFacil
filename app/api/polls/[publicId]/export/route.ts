import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'

type Params = { params: { publicId: string } }

export async function GET(request: NextRequest, { params }: Params) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  const poll = await prisma.poll.findUnique({
    where: { publicId: params.publicId },
    include: {
      options: { orderBy: { order: 'asc' } },
      participants: { orderBy: { createdAt: 'asc' } },
      votes: true,
    },
  })

  if (!poll) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
  if (token && poll.adminToken !== token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const wb = new ExcelJS.Workbook()
  wb.creator = 'VotaFácil'
  const ws = wb.addWorksheet('Votación')

  // ── Colors ──────────────────────────────────────────────
  const INDIGO  = '4F46E5'
  const WHITE   = 'FFFFFF'
  const GREEN   = 'D1FAE5'
  const GREEN_T = '065F46'
  const YELLOW  = 'FEF3C7'
  const YELLOW_T= '92400E'
  const RED     = 'FEE2E2'
  const RED_T   = '991B1B'
  const GRAY_H  = 'F3F4F6'
  const GRAY_T  = '374151'
  const DASH_T  = '9CA3AF'

  // ── Row 1: Title ─────────────────────────────────────────
  ws.mergeCells(1, 1, 1, poll.options.length + 1)
  const titleCell = ws.getCell('A1')
  titleCell.value = poll.title
  titleCell.font = { bold: true, size: 16, color: { argb: WHITE } }
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: INDIGO } }
  titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  ws.getRow(1).height = 36

  // ── Row 2: Subtitle ──────────────────────────────────────
  ws.mergeCells(2, 1, 2, poll.options.length + 1)
  const subCell = ws.getCell('A2')
  subCell.value = `${poll.participants.length} participante${poll.participants.length !== 1 ? 's' : ''} · Exportado el ${new Date().toLocaleDateString('es-ES')}${poll.creatorName ? ` · Creado por ${poll.creatorName}` : ''}`
  subCell.font = { size: 10, color: { argb: 'A5B4FC' } }
  subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: INDIGO } }
  subCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  ws.getRow(2).height = 20

  // ── Row 3: blank ─────────────────────────────────────────
  ws.getRow(3).height = 8

  // ── Row 4: Header ────────────────────────────────────────
  const headerRow = ws.getRow(4)
  headerRow.height = 40
  const headerValues = ['Participante', ...poll.options.map((o) => o.label)]
  headerValues.forEach((val, i) => {
    const cell = headerRow.getCell(i + 1)
    cell.value = val
    cell.font = { bold: true, size: 11, color: { argb: WHITE } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GRAY_T } }
    cell.alignment = { vertical: 'middle', horizontal: i === 0 ? 'left' : 'center', wrapText: true, indent: i === 0 ? 1 : 0 }
    cell.border = { bottom: { style: 'medium', color: { argb: INDIGO } } }
  })

  // ── Rows 5+: Participants ─────────────────────────────────
  poll.participants.forEach((p, pIdx) => {
    const row = ws.getRow(5 + pIdx)
    row.height = 28
    const nameCell = row.getCell(1)
    nameCell.value = p.name
    nameCell.font = { bold: true, size: 11, color: { argb: GRAY_T } }
    nameCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: pIdx % 2 === 0 ? WHITE : GRAY_H } }
    nameCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
    nameCell.border = { right: { style: 'thin', color: { argb: 'E5E7EB' } } }

    poll.options.forEach((o, oIdx) => {
      const vote = poll.votes.find((v) => v.participantId === p.id && v.optionId === o.id)
      const cell = row.getCell(oIdx + 2)
      cell.alignment = { vertical: 'middle', horizontal: 'center' }

      if (!vote) {
        cell.value = '—'
        cell.font = { size: 12, color: { argb: DASH_T } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: pIdx % 2 === 0 ? WHITE : GRAY_H } }
      } else if (vote.value === 'YES') {
        cell.value = '✓ Sí'
        cell.font = { bold: true, size: 11, color: { argb: GREEN_T } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN } }
      } else if (vote.value === 'NO') {
        cell.value = '✗ No'
        cell.font = { bold: true, size: 11, color: { argb: RED_T } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: RED } }
      } else {
        cell.value = '? Quizás'
        cell.font = { bold: true, size: 11, color: { argb: YELLOW_T } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: YELLOW } }
      }
    })
  })

  // ── Blank row ────────────────────────────────────────────
  const blankRow = 5 + poll.participants.length
  ws.getRow(blankRow).height = 12

  // ── Summary rows ─────────────────────────────────────────
  const summaryLabels = [
    { label: '✓ Total Sí',     key: 'YES',   bg: GREEN,  fg: GREEN_T  },
    { label: '? Total Quizás', key: 'MAYBE',  bg: YELLOW, fg: YELLOW_T },
    { label: '✗ Total No',     key: 'NO',    bg: RED,    fg: RED_T    },
  ] as const

  summaryLabels.forEach(({ label, key, bg, fg }, si) => {
    const row = ws.getRow(blankRow + 1 + si)
    row.height = 26
    const labelCell = row.getCell(1)
    labelCell.value = label
    labelCell.font = { bold: true, size: 11, color: { argb: fg } }
    labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
    labelCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
    labelCell.border = { right: { style: 'thin', color: { argb: 'E5E7EB' } } }

    poll.options.forEach((o, oIdx) => {
      const count = poll.votes.filter((v) => v.optionId === o.id && v.value === key).length
      const cell = row.getCell(oIdx + 2)
      cell.value = count
      cell.font = { bold: true, size: 13, color: { argb: fg } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
    })
  })

  // ── Column widths ─────────────────────────────────────────
  ws.getColumn(1).width = 22
  poll.options.forEach((_, i) => {
    ws.getColumn(i + 2).width = Math.max(14, Math.min(30, poll.options[i].label.length * 1.1))
  })

  // ── Generate buffer ───────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer()

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${poll.title.replace(/[^a-z0-9]/gi, '_')}_votacion.xlsx"`,
    },
  })
}
