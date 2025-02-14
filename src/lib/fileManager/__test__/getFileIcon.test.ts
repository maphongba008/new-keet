import { getFileIcon } from '../getFileIcon'

describe('getFileIcon', () => {
  it('should return "file" for null or empty type', () => {
    expect(getFileIcon(null as any)).toBe('file')
    expect(getFileIcon(undefined as any)).toBe('file')
    expect(getFileIcon('')).toBe('file')
  })

  it('should return "fileAudio" for audio mime types', () => {
    expect(getFileIcon('audio/mpeg')).toBe('fileAudio')
    expect(getFileIcon('audio/wav')).toBe('fileAudio')
    expect(getFileIcon('audio/ogg')).toBe('fileAudio')
  })

  it('should return "fileImage" for image mime types', () => {
    expect(getFileIcon('image/jpeg')).toBe('fileImage')
    expect(getFileIcon('image/png')).toBe('fileImage')
    expect(getFileIcon('image/gif')).toBe('fileImage')
    expect(getFileIcon('image/svg+xml')).toBe('fileImage')
  })

  it('should return "fileVideo" for video mime types', () => {
    expect(getFileIcon('video/mp4')).toBe('fileVideo')
    expect(getFileIcon('video/webm')).toBe('fileVideo')
    expect(getFileIcon('video/quicktime')).toBe('fileVideo')
  })

  it('should return "filePdf" for pdf mime type', () => {
    expect(getFileIcon('application/pdf')).toBe('filePdf')
  })

  it('should return "fileCode" for json mime type', () => {
    expect(getFileIcon('application/json')).toBe('fileCode')
  })

  it('should return "fileHtml" for html mime type', () => {
    expect(getFileIcon('text/html')).toBe('fileHtml')
  })

  it('should return "fileCsv" for csv mime type', () => {
    expect(getFileIcon('text/csv')).toBe('fileCsv')
  })

  it('should return "fileLines" for text mime types', () => {
    expect(getFileIcon('text/plain')).toBe('fileLines')
    expect(getFileIcon('text/xml')).toBe('fileLines')
  })

  it('should return "fileZip" for zip mime type', () => {
    expect(getFileIcon('application/zip')).toBe('fileZip')
  })

  it('should return "fileExcel" for excel mime types', () => {
    expect(getFileIcon('application/vnd.ms-excel')).toBe('fileExcel')
    expect(
      getFileIcon(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ),
    ).toBe('fileExcel') //xlsx
  })

  it('should return "fileWord" for word mime types', () => {
    expect(getFileIcon('application/msword')).toBe('fileWord')
    expect(
      getFileIcon(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ),
    ).toBe('fileWord') //docx
  })

  it('should return "filePowerpoint" for presentation mime types', () => {
    expect(getFileIcon('application/vnd.ms-powerpoint')).toBe('filePowerpoint')
    expect(
      getFileIcon(
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ),
    ).toBe('filePowerpoint') //pptx
  })

  it('should return "fileCertificate" for certificate mime types', () => {
    expect(getFileIcon('application/x-x509-cert')).toBe('fileCertificate')
    expect(getFileIcon('application/pkcs7-certificates')).toBe(
      'fileCertificate',
    )
  })

  it('should return "file" for unknown mime types', () => {
    expect(getFileIcon('application/unknown')).toBe('file')
    expect(getFileIcon('some/random/type')).toBe('file')
  })
})
