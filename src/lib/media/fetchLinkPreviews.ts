import getLinkPreview from '@holepunchto/keet-link-preview'

import { getMimeTypeAsync } from '../KeetVideoUtilsModule'
import { normalizeUrlCase } from '../previewLink'
import { LinkPreviewObjectType } from '../uploads'

export interface LinkPreviewFilesType {
  [key: string]: string
}

export const fetchLinkPreviews = async (links: string[]) => {
  try {
    const linkPreviews: LinkPreviewObjectType = {}
    let fileNames: LinkPreviewFilesType = {}

    // Process each link and fetch the preview
    for (const link of links) {
      // Fetch the link preview

      const updatedLink = normalizeUrlCase(link)
      const preview = await getLinkPreview(updatedLink, {
        noBuffer: true,
        userAgent: 'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
      })

      // Destructure and map data into the desired format
      const { url, title, description, file, favicon } = preview

      const image = file?.src
      const mimeType = await getMimeTypeAsync(url)

      // Add to the result object
      if (!!title || !!description) {
        linkPreviews[link] = {
          url,
          title,
          description,
          mimeType,
          image: image,
          icon: favicon,
        }

        fileNames[link] = image
      }
    }
    return { linkPreviews, fileNames }
  } catch (error) {
    return {}
  }
}
