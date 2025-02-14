declare module '@holepunchto/keet-link-preview' {
  export default function getLinkPreview(
    updatedLink: string,
    { noBuffer: boolean, userAgent: string },
  ): Promise<{
    url: string
    name: string
    description: string
    title: string
    file: { src: string }
    favicon: string
  }>
}
