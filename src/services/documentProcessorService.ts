import type {
  DocumentImportResult,
  TxtImportResult,
  MarkdownImportResult,
  DocxImportResult,
  PdfImportResult,
} from '../types/files'

/* ─── TXT Processor ─── */

export async function processTxt(file: File): Promise<TxtImportResult> {
  const text = await file.text()
  return {
    format: 'txt',
    text,
    lineCount: text.split('\n').length,
  }
}

/* ─── Markdown Processor ─── */

export async function processMd(file: File): Promise<MarkdownImportResult> {
  const text = await file.text()

  // Extract headings
  const headings: string[] = []
  for (const match of text.matchAll(/^#{1,3}\s+(.+)/gm)) {
    headings.push(match[1].trim())
  }

  // Render HTML with marked (dynamic import)
  let html = ''
  try {
    const { marked } = await import('marked')
    html = await marked(text)
  } catch {
    // marked not available — return raw text
  }

  return {
    format: 'md',
    text,
    html,
    headings,
  }
}

/* ─── DOCX Processor ─── */

export async function processDocx(file: File): Promise<DocxImportResult> {
  try {
    const mammoth = await import('mammoth')
    const buffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer: buffer })
    const warnings = result.messages
      .filter((m: { type: string }) => m.type === 'warning')
      .map((m: { message: string }) => m.message)

    return {
      format: 'docx',
      text: result.value,
      warnings,
    }
  } catch (err) {
    if (import.meta.env.DEV) console.error('[documentProcessor] DOCX processing failed:', err)
    return {
      format: 'docx',
      text: '',
      warnings: ['Could not extract text from this document.'],
    }
  }
}

/* ─── PDF Processor ─── */

export async function processPdf(file: File): Promise<PdfImportResult> {
  try {
    const pdfjsLib = await import('pdfjs-dist')

    // Disable worker for simpler Vite bundling
    pdfjsLib.GlobalWorkerOptions.workerSrc = ''

    const buffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: buffer } as any).promise

    const pageCount = pdf.numPages
    const textParts: string[] = []

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = (content.items as any[])
        .filter((item: any) => typeof item.str === 'string')
        .map((item: any) => item.str as string)
        .join(' ')
      if (pageText.trim()) textParts.push(pageText)
    }

    const text = textParts.join('\n\n')
    const extractionQuality: PdfImportResult['extractionQuality'] =
      text.trim().length === 0 ? 'failed' :
      text.trim().length < 50 ? 'partial' : 'full'

    return {
      format: 'pdf',
      text,
      pageCount,
      extractionQuality,
    }
  } catch (err) {
    if (import.meta.env.DEV) console.error('[documentProcessor] PDF processing failed:', err)
    return {
      format: 'pdf',
      text: '',
      pageCount: 0,
      extractionQuality: 'failed',
    }
  }
}

/* ─── Dispatcher ─── */

export async function processDocument(file: File): Promise<DocumentImportResult> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const mime = file.type

  if (ext === 'txt' || mime === 'text/plain') return processTxt(file)
  if (ext === 'md' || mime === 'text/markdown') return processMd(file)
  if (ext === 'docx' || mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return processDocx(file)
  if (ext === 'pdf' || mime === 'application/pdf') return processPdf(file)

  // Fallback: treat as plain text
  return processTxt(file)
}
