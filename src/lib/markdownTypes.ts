import { DISPLAY_TYPES } from '@holepunchto/keet-core-api'

// List of marked's markdown type https://github.com/markedjs/marked/blob/master/src/Tokenizer.ts
export type MarkedTokenType =
  | 'strong'
  | 'code'
  | 'codespan'
  | 'em'
  | 'link'
  | 'del'
  | 'heading'
  | 'paragraph'
  | 'text'
  | 'blockquote'
  | 'list'
  | 'list_item'
  | 'def'
  | 'image'
  | 'hr'
  | 'table'
  | 'html'
  | 'space'
  | 'br'
  | 'escape'

// The tokens returned from marked.lexer()
export interface MarkdownToken {
  type: MarkedTokenType
  raw: string // Raw markdown syntax as it appears in the text
  text?: string // Text content without markdown syntax
  tokens?: MarkdownToken[] // Nested tokens if the token has children
  href?: string // only for link type
}

// Our own keet format
export interface MentionToken {
  type: DISPLAY_TYPES.MENTION
  start: number
  length: number
  memberId: string
}

export interface LinkToken {
  type: DISPLAY_TYPES.HTTP_LINK
  start: number
  length: number
  content: string
}
export interface EmojiToken {
  type: DISPLAY_TYPES.EMOJI
  start: number
  length: number
  content: string
}
export interface PearLinkToken {
  type: DISPLAY_TYPES.PEAR_LINK
  start: number
  length: number
  content: string
}

export interface GenericToken {
  type: DISPLAY_TYPES
  start: number
  length: number
}

export type MdToken =
  | MentionToken
  | LinkToken
  | EmojiToken
  | PearLinkToken
  | GenericToken
