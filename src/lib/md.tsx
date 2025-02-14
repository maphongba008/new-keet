import { useMemo } from 'react'
import { find as findLink, registerCustomProtocol } from 'linkifyjs'
import { marked, Renderer } from 'marked'

import { getEmojiData, unemojify } from '@holepunchto/emojis'
import { DISPLAY_TYPES } from '@holepunchto/keet-core-api'
import { isMentionUrlDeprecated } from '@holepunchto/keet-store/store/chat'

import { getTheme } from 'component/theme'

import { PEAR_PROTOCOL, QUOTE_NEST_LAYERS } from './constants'
import { EmojiToken, PearLinkToken } from './markdownTypes'

registerCustomProtocol(PEAR_PROTOCOL, false)
registerCustomProtocol('mention', false)

export const BREAK_LINE_SYMBOL = '⟶'
export const BREAK_LINE_TAG = '<br/>'
export const BREAK_LINE_STRING = '\n'
export const BLOCK_QUOTE_PATTERN = /\n(?<=(>+.*\n\n)+)/gm
export const BLOCK_QUOTE_REPLACEMENT_STRING = '&&quote&&'
export const NEW_LINE_CODE = '&nbsp;'
export const CODE_BLOCK_PATTERN = /[\n\s]*```[\n\s]*[\s\S]*?[\n\s]*```[\n\s]*/g
export const MAX_EMPTY_LIST_ITEMS_ALLOWED = 2
export const MENTION_DESTRUCTURE_PATTERN =
  /^\[@(.+?)?\]\(mention:\/\/(.+?)\/(.+?)(?:\/(.*?))?\)/
export const EMOJI_MATCHER = /:([a-zA-Z0-9_\-+]+):/g
const MARKDOWN_LINK_REGEX = /\[(.*?)\]\((.*?)\)/g
const NON_MARKDOWN_LINK_REGEX = /(?:\[[^\]]+\]\([^)]+\))|([^[\]]+)/g
const PEAR_REGEX = new RegExp('\\b' + PEAR_PROTOCOL + '://[^\\s]+', 'g')
export const ESCAPE_REPLACEMENT_CHAR = '\uFFFD'
export const ESCAPE_REPLACEMENT_REGEX = /\uFFFD/g

export const restoreLineBreaks = (str: string) => {
  return str.replaceAll(BREAK_LINE_SYMBOL, '\n')
}

export const formatMarkdownWithPattern = (
  mdText: string,
  replaceSymbol?: string,
) => {
  let processedText = mdText.replaceAll(
    BLOCK_QUOTE_PATTERN,
    () => `${BLOCK_QUOTE_REPLACEMENT_STRING}\n`,
  )

  const lines = processedText.split(/\n/gm).map((str, index) => {
    if (index === 0) return str
    if (str === '' || str === NEW_LINE_CODE)
      return replaceSymbol || BREAK_LINE_SYMBOL
    return (replaceSymbol || BREAK_LINE_STRING) + str
  })

  processedText = lines.join('')
  return processedText.replaceAll(
    BLOCK_QUOTE_REPLACEMENT_STRING,
    ` ${replaceSymbol || BREAK_LINE_STRING}`,
  )
}

// Support for multiple new line by converting \n to ⟶, and converting back to \n when render
// for example replaceLineBreaks('- 0\n\n\n- 1\n\n- 2') ==> '- 0⟶⟶\n1⟶\n2'
// Support quote feature which starts with > and ends with \n\n, > Quote 1 \n\n Text 1 \n \n Text 3
/**
 * Processes an array of markdown strings, replacing line breaks and formatting block quotes.
 * @param replaceSymbol Optional symbol to replace line breaks.
 * @param mdTextArray Array of markdown strings to process.
 * @returns Processed markdown string.
 */
export const replaceLineBreaks =
  (replaceSymbol?: string) =>
  (mdTextArray: string[]): string =>
    useMemo(() => {
      const processText = (mdText: string) => {
        if (mdText.match(CODE_BLOCK_PATTERN)) {
          return replaceSymbol ? mdText.replace(/\n/g, ' ') : mdText
        }

        return formatMarkdownWithPattern(mdText, replaceSymbol)
      }

      return mdTextArray.map(processText).join('')
    }, [mdTextArray])

export const escapeNameMd = (md: string) =>
  md.replace(/([\\`*_[\]{}()#+\-.!])/g, '\\$1')

export const escapeFormattingInMentions = (md: string) =>
  md.replace(
    /(?<=\[@)(.+?)]\((mention:\/\/user\/\w{52})\/?(\w+?)?\)/g,
    (match, char, uri) => {
      if (isMentionUrlDeprecated(uri)) {
        return match.replace(char, escapeNameMd(char))
      }
      return match
    },
  )

// unify list items to have correct markdown parsing
// "* start\n- minus\n+ plus" => "- start\n- minus\n- plus"
export const formatListItems = (md: string, replaceBreakSymbol?: string) => {
  let regex = /(^\s*)([*\-+])\s+([^\n]+)/gm
  let replaceString = '$1- $3'

  // List items that are preceded by a username are processed using this regex to replace them with a bullet point. This approach is temporary and can be updated in the future when the username is separated from the markdown content.
  // eg: "username: - List 1 \n - List 2" -> "username: ● List 1 \n ● List 2"
  if (replaceBreakSymbol) {
    regex = /(\n)+([*\-+])\s+([^\n]+)/gm
    replaceString = '$1● $3'
  }
  return md.replace(regex, replaceString).replace(/\t+/gm, ' ')
}

// Identify the code blocks to ignore formatting links and quote block
export const splitMdFromCodeBlock = (md: string): Array<string> => {
  if (!md) return []

  const splitStrings = []
  const mdMatchCodeBlockArray = Array.from(md.matchAll(CODE_BLOCK_PATTERN))
  let startIndex = 0

  for (const item of mdMatchCodeBlockArray) {
    const [matchedCodeBlock] = item
    const stringBeforeCodeBlock = md.slice(startIndex, item.index)

    if (stringBeforeCodeBlock) {
      splitStrings.push(stringBeforeCodeBlock)
    }

    splitStrings.push(matchedCodeBlock)
    startIndex = item.index + matchedCodeBlock.length
  }

  const remainingString = md.slice(startIndex)
  if (remainingString) {
    splitStrings.push(remainingString)
  }

  return splitStrings
}

export const linkify = (md: string[]) => {
  let res = md.map((mdSplitString) => {
    if (!mdSplitString.match(CODE_BLOCK_PATTERN)) {
      const links = findLink(mdSplitString)

      let start = 0
      for (const link of links) {
        // Mentions are always formatted as markdown links, so skip them to
        // avoid double/malformed formatting
        if (link.value.startsWith('mention://')) {
          continue
        }
        const formatted = `[${link.value}]('${link.href}')`
        mdSplitString =
          mdSplitString.slice(0, start) +
          mdSplitString
            .slice(start)
            .replace(link.value, formatted)
            .replaceAll('`', '')
        start += formatted.length
      }
      return mdSplitString
    }
    return mdSplitString
  })
  return res
}

export const escapeMentionsBeforeSending = (text: string) =>
  text.replace(
    /(?<=\[@)(.+?)]\((mention:\/\/user\/\w{52})\/?(\w+?)?\)/g,
    (match, sub, uri) => {
      if (isMentionUrlDeprecated(uri)) {
        return match.replace(sub, escapeMarkdown(sub))
      }
      return match
    },
  )

const preserveNewLine = (text: string) =>
  // Replace all linebreaks outside of codeblocks with new line tag
  text.replace(/(?<!`.*?)\n(?!.*?`)/gms, '<br>')

export const convertBackslashes = (text: string) =>
  // Replace escapes with empty string, replace REPLACEMENT_CHAR with backslashes
  text.replace(/\\/g, '').replace(ESCAPE_REPLACEMENT_REGEX, '\\')

export const processMarkdown = (md: string, replaceBreakSymbol?: string) =>
  [md]
    .map((_md) => enforceNestedBlockquoteLayers(_md, QUOTE_NEST_LAYERS))
    .map((_md) => formatListItems(_md, replaceBreakSymbol))
    .map(escapeFormattingInMentions)
    .map(splitMdFromCodeBlock)
    .map(linkify)
    .map(replaceLineBreaks(replaceBreakSymbol))
    .join('')

export const processChatInputString = (text: string) =>
  [text]
    .map(removeBlankSpaces)
    .map(formatCodeblock)
    .map(cleanMarkdownLinks)
    .map(enforceNestedBlockquoteLayers)
    .map(unemojifyNonMarkdownLinks)
    .map(escapeMentionsBeforeSending)
    .map(preserveNewLine)
    .join('')

class PlainTextRenderer extends Renderer {
  text(
    this: marked.Renderer<never> | marked.RendererThis,
    text: string,
  ): string {
    return text
  }

  strong(this: marked.Renderer<never> | marked.RendererThis): string {
    return ''
  }

  em(this: marked.Renderer<never> | marked.RendererThis): string {
    return ''
  }

  del(this: marked.Renderer<never> | marked.RendererThis): string {
    return ''
  }

  code(
    this: marked.Renderer<never> | marked.RendererThis,
    code: string,
  ): string {
    return code
  }

  link(
    this: marked.Renderer<never> | marked.RendererThis,
    href: string | null,
    title: string | null,
    text: string,
  ): string {
    return text ?? ''
  }
}

const plainTextRenderer = new PlainTextRenderer()

export const md2tx = (md: string) =>
  marked.parseInline(md, {
    gfm: true,
    renderer: plainTextRenderer,
    headerIds: false,
    mangle: false,
  })

export const stripMentions = (text: string) =>
  text.replace(/\[(@.+?)\]\(mention:[/:\w]+\)/g, '$1')

export const enforceNestedBlockquoteLayers = (
  input: string,
  maxLayers: number = 1,
): string => {
  // Build a regex pattern to match sequences of '>' characters (that might be separated by space or tab), starting at the beginning of line (that might be preceded by space or tab or new line)
  const regex = new RegExp(`^[ \t]*>([ \t]*>)+`, 'gm')

  // Replace matched sequences by keeping only the allowed number of layers
  return input.replace(regex, (match) => {
    // Split the matched sequence by '>' and any spaces after it
    let parts = match.split(/>\s*/)
    // Keep only the first maxLayers parts
    parts = parts.slice(0, maxLayers)
    // Join the parts back with '> ' to form the correct sequence of '>' characters
    return parts.join('>') + '>'
  })
}

// RegExp to match ordered list items with up to 3 leading spaces, a digit(s), a dot, and a space.
export const OrderedListRegExp = /^\s{0,3}(\d+)\.\s(.*)$/gm
// RegExp to match empty ordered list item
export const EmptyListItemRegex = /^\s*\d+\.\s+\s*$/

// Source https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
export const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export const escapeMarkdown = (string: string): string => {
  return string
    .replace(/\\/g, ESCAPE_REPLACEMENT_CHAR) // replace backslashes with REPLACEMENT_CHAR
    .replace(/(\\)?([[\]])/g, (_, escape, char) => {
      if (escape) {
        return ESCAPE_REPLACEMENT_CHAR + '\\' + char
      }
      return '\\' + char
    }) // escape brackets for markdown parser and prefix with REPLACEMENT_CHAR if needed
}

export const removeBlankSpaces = (text: string) => {
  // Remove spaces at the start of the line, we only support codeblocks formatted with backticks
  return text.replace(/^ +/gm, '')
}

export const getMentionsColorByMemberRole = ({
  canIndex,
  canModerate,
}: {
  canIndex?: boolean
  canModerate?: boolean
}) => {
  const theme = getTheme()
  if (canIndex) return theme.memberTypes.admin
  if (canModerate) return theme.memberTypes.mod
  return theme.color.blue_400
}

// https://github.com/holepunchto/keet-editor/blob/main/src/mentions.js#L15
export const checkIsMention = (text: string) => {
  const mentionMatch = text.match(MENTION_DESTRUCTURE_PATTERN)

  if (mentionMatch) {
    const label = mentionMatch[1] || '' // label is undefined when mention: [@](mention://user/u)
    const type = mentionMatch[2]
    const id = mentionMatch[3]
    const role = mentionMatch[4]

    return { label, type, id, role }
  }
  return false
}

/**
 * When user copy a text bubble, we try our best to convert shortCodes into emoji: :+1: to 👍️ . In the event of custom emoji, we remain the string :keet_music:
 * @param emoji if found emoji, return 👍️ else return shortCodes[0]
 * @param string shortCodes[0]
 * @returns
 */
export const emojifyHandleCustomEmoji = (emoji: string, string: string) => {
  // custom emoji, return the same value
  if (emoji === string) return `:${emoji}:`
  return emoji
}

/**
 * Traverse input string to detect emoji.shortCode[0] and replace it with corresponding emoji character, or if custom emoji replace with (" �� ") a constant length placeholder.
 *
 * For each emoji match, we store its data in array of {start, length, content}[]
 *
 * @param input ":keet_party:👍️:keet_party::qweqweqwe: 123"
 * @returns
 * Example output:
 * {
 *   "finalString": " �� 👍️ �� :qweqweqwe: 123",
 *   "found": [
 *     { "content": "keet_party", "length": 2, "start": 1 },
 *     { "content": "+1", "length": 2, "start": 4 },
 *     { "content": "keet_party", "length": 2, "start": 8 }
 *   ]
 * }
 */
export function replaceAndTrackEmojis(input: string, start: number) {
  let finalString = ''
  let found: EmojiToken[] = []
  let currentIndex = 0

  let match
  while ((match = EMOJI_MATCHER.exec(input)) !== null) {
    const fullMatch = match[0]
    const content = match[1]
    const _start = match.index

    // Append any text between matches directly to the final string
    finalString += input.slice(currentIndex, _start)

    const emojiData = getEmojiData(content)
    if (emojiData) {
      // Replace with " �� " if custom emoji
      if (emojiData.urlRiv) {
        found.push({
          type: DISPLAY_TYPES.EMOJI as DISPLAY_TYPES.EMOJI,
          start: start + finalString.length,
          length: content.length,
          content,
        })
        finalString += content
      } else {
        found.push({
          type: DISPLAY_TYPES.EMOJI as DISPLAY_TYPES.EMOJI,
          start: start + finalString.length,
          length: emojiData.emoji.length,
          content,
        })
        finalString += emojiData.emoji
      }
    } else {
      // Keep the original :string: if not found
      finalString += fullMatch
    }

    // Update the currentIndex to move past the matched text
    currentIndex = _start + fullMatch.length
  }

  // Append any remaining text after the last match
  finalString += input.slice(currentIndex)
  return { finalString, found }
}

export const trackPearLink = (input: string, start: number) => {
  let found: PearLinkToken[] = []
  let match

  while ((match = PEAR_REGEX.exec(input)) !== null) {
    found.push({
      type: DISPLAY_TYPES.PEAR_LINK as DISPLAY_TYPES.PEAR_LINK,
      start: start + match.index,
      length: match[0].length,
      content: match[0],
    })
  }

  return { finalString: input, found }
}

/**
 * We don't support nested markdown inside link text
 *
 * Here is a [**bold** link](https://example.com)
 * to
 * Here is a [bold link](https://example.com)
 */
const cleanMarkdownLinks = (text: string) =>
  text.replace(MARKDOWN_LINK_REGEX, (_match, linkText, url) => {
    const cleanLinkText = linkText
      .replace(/[*_`~]/g, '') // Removes *, _, `, and ~ from link text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Removes bold
      .replace(/\*(.*?)\*/g, '$1') // Removes italic
      .replace(/`([^`]+)`/g, '$1') // Removes inline code
    return `[${cleanLinkText}](${url})`
  })

const unemojifyNonMarkdownLinks = (text: string) =>
  text.replace(NON_MARKDOWN_LINK_REGEX, (markdownLink, nonMarkdownLink) => {
    if (nonMarkdownLink) {
      return unemojify(nonMarkdownLink)
    }
    return markdownLink
  })

export const trimNewLines = (text: string) => text.replace(/^\n+|\n+$/g, '')

// Ensure backticks are on their own line, so that parser doesn't eat any lines
const formatCodeblock = (text: string) =>
  text.replace(/(?<=```) *?\b/g, '\n').replace(/\b(?=```)/g, '\n')
