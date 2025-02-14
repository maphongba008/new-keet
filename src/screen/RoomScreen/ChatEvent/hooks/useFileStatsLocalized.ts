import { useMemo } from 'react'
import prettyBytes from 'pretty-bytes'

import { useLocale, useStrings } from 'i18n/strings'

import { useFileStats } from './useFileStats'
import { FileStatsParsed } from '../helpers/selectFileStats'

export const useFileStatsLocalized = (
  fileId: string,
): FileStatsParsed<true> => {
  const strings = useStrings()
  const locale = useLocale()
  const stats = useFileStats(fileId)

  return useMemo(
    (): FileStatsParsed<true> => ({
      ...stats,
      downloadSpeed: strings.chat.statsSpeed.replace(
        '$0',
        prettyBytes(stats.downloadSpeed, { locale }),
      ),
      uploadSpeed: strings.chat.statsSpeed.replace(
        '$0',
        prettyBytes(stats.uploadSpeed, { locale }),
      ),
      fileSize: prettyBytes(stats.fileSize, { locale }),
    }),
    [locale, stats, strings.chat.statsSpeed],
  )
}
