import { getSvgDimensions } from 'lib/fileManager'
import { UploadFile } from 'lib/uploads'

import { getIsValidDimensions } from './getIsValidDimensions'

type SvgMetaData = Pick<UploadFile, 'dimensions'>

export const getSvgMetaData = async (
  uri: string,
  file: UploadFile,
): Promise<SvgMetaData> => {
  const dimensions = getIsValidDimensions(file.dimensions)
    ? file.dimensions
    : await getSvgDimensions(uri)

  return { dimensions }
}
