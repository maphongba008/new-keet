// https://github.com/holepunchto/keet-desktop/blob/main/src/components/icons/file.jsx
// decide from mime type
export const getFileIcon = (type: string) => {
  if (!type) return 'file'
  if (type.includes('audio')) return 'fileAudio'
  if (type.includes('image')) return 'fileImage'
  if (type.includes('video')) return 'fileVideo'
  if (type.includes('pdf')) return 'filePdf'
  if (type.includes('json')) return 'fileCode'
  if (type.includes('html')) return 'fileHtml' // text/html
  if (type.includes('csv')) return 'fileCsv' // text/csv
  if (type.includes('text')) return 'fileLines'
  if (type.includes('zip')) return 'fileZip'
  if (type.includes('spreadsheetml') || type.includes('excel'))
    return 'fileExcel'
  if (type.includes('word')) return 'fileWord'
  if (type.includes('presentationml') || type.includes('powerpoint'))
    return 'filePowerpoint'
  if (type.includes('cert')) return 'fileCertificate'
  if (type.includes('pkcs')) return 'fileCertificate'
  return 'file'
}
