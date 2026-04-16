import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import UploadModal from './UploadModal'

const panel = {
  id: 'panel-1',
  number: 1,
  shot: '',
  description: '',
  content: [],
  pageId: 'page-1',
  pageNumber: 3,
}

describe('UploadModal', () => {
  it('uses draft-artwork-specific copy in both empty and preview states', () => {
    const emptyMarkup = renderToStaticMarkup(createElement(UploadModal, {
      dragOver: false,
      uploadPreview: null,
      uploading: false,
      selectedPanelId: '',
      allPanels: [panel],
      isSupabaseConfigured: true,
      onDragOver: () => {},
      onDragLeave: () => {},
      onDrop: () => {},
      onSelectPanel: () => {},
      onAttachUpload: () => {},
      onCancel: () => {},
      onClickSelect: () => {},
    }))

    const previewMarkup = renderToStaticMarkup(createElement(UploadModal, {
      dragOver: false,
      uploadPreview: 'data:image/png;base64,abc',
      uploading: false,
      selectedPanelId: '',
      allPanels: [panel],
      isSupabaseConfigured: true,
      onDragOver: () => {},
      onDragLeave: () => {},
      onDrop: () => {},
      onSelectPanel: () => {},
      onAttachUpload: () => {},
      onCancel: () => {},
      onClickSelect: () => {},
    }))

    expect(emptyMarkup).toContain('Drop draft artwork here or click to select')
    expect(previewMarkup).toContain('Link draft to panel...')
    expect(previewMarkup).toContain('Send Draft Artwork')
  })
})
