import { MarkdownToken } from 'lib/markdownTypes'

declare module 'marked' {
  export interface Tokenizer {
    heading?: (src: string) => Token | undefined
    list?: (src: string) => Token | undefined
    [key: string]: ((src: string) => Token | undefined) | undefined
  }

  export interface Options {
    tokenizer?: Tokenizer
    [key: string]: any
  }

  export interface Marked {
    lexer: (src: string, options?: Options) => MarkdownToken[]
    parse: (src: string, options?: Options) => string
    use: (options: Options) => void
  }

  export const marked: Marked
}
