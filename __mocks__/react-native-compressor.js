export const Image = {
  compress: (uri) => Promise.resolve(uri),
}

export const getImageMetaData = (uri) => ({
  ImageHeight: 100,
  ImageWidth: 100,
})
