import { DEFAULT_SVG_DIMENSIONS } from 'lib/constants'

export const getSvgDimensions = async (uri: string) => {
  try {
    const svgXml = (await fetch(uri).then((res) => res.text())) || ''
    const svgTagMatch = svgXml.match(/<svg[^>]*>/)

    if (!svgTagMatch) return DEFAULT_SVG_DIMENSIONS

    const svgTag = svgTagMatch[0]

    // Extract width and height from the <svg> tag
    const widthMatch = svgTag.match(/width="([\d.]+)"/)
    const heightMatch = svgTag.match(/height="([\d.]+)"/)

    return {
      height: heightMatch
        ? parseFloat(heightMatch[1])
        : DEFAULT_SVG_DIMENSIONS.height,
      width: widthMatch
        ? parseFloat(widthMatch[1])
        : DEFAULT_SVG_DIMENSIONS.width,
    }
  } catch (error) {
    return DEFAULT_SVG_DIMENSIONS
  }
}
