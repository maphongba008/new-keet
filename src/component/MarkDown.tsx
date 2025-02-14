import Marked, { type ReactRenderer } from 'marked-react'
import React, { createContext, useCallback, useContext, useMemo } from 'react'
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  type TextStyle,
} from 'react-native'
import { useSelector } from 'react-redux'
// @ts-ignore
import { unescape as htmlUnescape } from 'html-escaper'
import { find as findLink } from 'linkifyjs'

import { getEmojiData } from '@holepunchto/emojis'
// @ts-ignore
import { isMentionUrlDeprecated } from '@holepunchto/keet-store/store/chat'

import { DIRECTION_CODE, UI_SIZE_4 } from 'lib/commonStyles'
import { getMemberByRoomId } from 'lib/hooks/useMember'
import { sanitizeURL } from 'lib/linking'
import {
  getMentionsColorByMemberRole,
  processMarkdown,
  restoreLineBreaks,
} from 'lib/md'
import { isAndroid } from 'lib/platform'

import { useStrings } from 'i18n/strings'

import { EmojiRive } from './EmojiRive'
import { colors, createThemedStylesheet, useTheme } from './theme'

export interface MarkDownProps {
  md: string
  style?: StyleProp<TextStyle>
  roomId?: string
  renderer?: () => Partial<ReactRenderer>
  onPress?: (url: string) => void
  onLongPress?: () => void
  processMd?: boolean
}

const Context = createContext<
  Pick<MarkDownProps, 'roomId' | 'onPress' | 'onLongPress'>
>(null as any)

export enum ListType {
  OL,
  UL,
}

export interface TProps {
  strong?: boolean
  em?: boolean
  strike?: boolean
  mention?: boolean
  list?: ListType
  listItem?: boolean
  inList?: ListType
  listDepth?: number
  codespan?: boolean
  codeblock?: boolean
  p?: boolean
  q?: boolean
  text?: boolean
  link?: boolean
  href?: string
  index?: number
  children?: React.ReactNode
  style?: any
  customEmoji?: boolean
}

export const T = (props: TProps) => {
  const theme = useTheme()
  const _styles = getStyles()
  const styles = {
    ..._styles,
    ...props.style,
  }
  const strings = useStrings()

  const textStyles = theme.text
  const { roomId, onPress, onLongPress } = useContext(Context)
  const onComponentPress = useCallback(() => {
    onPress?.(props.href!)
  }, [onPress, props.href])
  const member = useSelector(
    getMemberByRoomId(roomId!, props.href?.split('/')[3]!),
  )

  const handleLongPress = useCallback(() => {
    onLongPress?.()
  }, [onLongPress])

  const children = React.Children.map(props.children, (c, index) => {
    if (!c) {
      return <Text />
    } else if (typeof c === 'string') {
      return c
    }

    const child = c as React.ReactElement<TProps>
    const cprops = { ...child.props }
    cprops.strong = cprops.strong ?? props.strong
    cprops.em = cprops.em ?? props.em
    cprops.strike = cprops.strike ?? props.strike
    cprops.mention = cprops.mention ?? props.mention
    cprops.link = cprops.link ?? props.link
    cprops.href = cprops.href ?? props.href
    if (props.list !== undefined) {
      cprops.listDepth = cprops.listDepth ?? props.listDepth ?? 0
      cprops.listDepth += 1
      cprops.inList = props.list
    } else if (cprops.listItem) {
      cprops.inList = props.list
    }
    cprops.listDepth = cprops.listDepth ?? props.listDepth
    cprops.index = index
    cprops.customEmoji = cprops.customEmoji ?? props.customEmoji

    return React.cloneElement(child, cprops)
  })

  // Intercept to render rive
  if (props.customEmoji) {
    const shortCode = props.children
    if (typeof shortCode === 'string') {
      const emoji = getEmojiData(shortCode.replaceAll(':', ''))
      if (emoji?.url) {
        return (
          <View style={styles.riveContainer}>
            <EmojiRive
              shortCode={shortCode.replaceAll(':', '')}
              isDisableTouch
              style={styles.riveImage}
            />
          </View>
        )
      }
    }
  }

  if (props.text === true) {
    const style =
      props.strong === true && props.em === true
        ? { ...textStyles.bodyBoldItalic }
        : props.strong === true
          ? { ...textStyles.bodyBold }
          : props.em === true
            ? { ...textStyles.bodyItalic }
            : props.codespan === true
              ? { ...textStyles.inlineCode }
              : { ...textStyles.body }

    if (props.strike === true) {
      style.textDecorationLine = 'line-through'
    }
    if (props.codespan === true) {
      style.paddingHorizontal = theme.spacing.standard / 2
      style.overflow = 'hidden'
      style.borderRadius = 4
      style.backgroundColor = styles.codeBlock.backgroundColor
    }
    if (props.link === true) {
      style.color = getMentionsColorByMemberRole(member)
    }
    if (props.href !== undefined) {
      if (props.mention === true) {
        style.paddingHorizontal = 3
        style.overflow = 'hidden'
        style.borderRadius = 4
      }
    }

    const nextChildren = React.Children.map(children, (child) => {
      if (typeof child === 'string') {
        return restoreLineBreaks(child)
      }
      return child
    })

    if (props.href !== undefined) {
      if (props.mention && member.blocked) {
        return <Text style={style}>@{strings.chat.blockedUserName}</Text>
      }
      return (
        <Text
          style={style}
          onPress={onComponentPress}
          onLongPress={handleLongPress}
        >
          <>{nextChildren}</>
        </Text>
      )
    }

    return <Text style={style}>{nextChildren}</Text>
  }

  if (props.list !== undefined) {
    return <View style={styles.list}>{children}</View>
  } else if (props.listItem === true) {
    if (props.inList === ListType.OL) {
      const index = (props.index ?? 0) + 1
      return (
        <View style={styles.inline}>
          <Text style={styles.listNumber}>{`${index}.`}</Text>
          <View style={styles.olText}>{children}</View>
        </View>
      )
    }
    const depth = props.listDepth ?? 1
    const bullet = depth % 2 === 1 ? '●' : '○'
    return (
      <View style={styles.inline}>
        <Text style={styles.listBullet}>{bullet}</Text>
        <View style={styles.ulText}>{children}</View>
      </View>
    )
  } else if (props.codeblock === true) {
    return <Text style={styles.codeBlock}>{children}</Text>
  } else if (props.p === true) {
    return <Text style={styles.p}>{children}</Text>
  } else if (props.q === true) {
    return <View style={styles.q}>{children}</View>
  }

  return <View style={styles.inline}>{children}</View>
}

export const mdRenderer: Partial<ReactRenderer> = {
  text(text) {
    return (
      <T text key={`${this.elementId}`}>
        {htmlUnescape(text)}
      </T>
    )
  },
  strong(children) {
    return (
      <T text strong key={`${this.elementId}`}>
        {children}
      </T>
    )
  },
  em(children) {
    return (
      <T text em key={`${this.elementId}`}>
        {children}
      </T>
    )
  },
  del(children) {
    return (
      <T text strike key={`${this.elementId}`}>
        {children}
      </T>
    )
  },
  codespan(code, _lang) {
    return (
      <T text codespan key={`${this.elementId}`}>
        {code}
      </T>
    )
  },
  br() {
    return <Text key={`${this.elementId}`}>{'\n'}</Text>
  },
  link(url, text) {
    if (getEmojiData(url?.replaceAll(':', ''))) {
      return (
        <T text customEmoji key={`${this.elementId}`}>
          {url}
        </T>
      )
    }

    const linkData = findLink(url)
    const href = linkData[0]?.href ?? url
    const _href = sanitizeURL(href)
    if (!_href) {
      return (
        <T text key={`${this.elementId}`}>
          {text}
        </T>
      )
    }

    return (
      <T
        text
        link
        key={`${this.elementId}`}
        href={_href}
        mention={isMentionUrlDeprecated(href)}
      >
        {text}
      </T>
    )
  },
  // block
  list(children, ordered) {
    return (
      <T list={ordered ? ListType.OL : ListType.UL} key={`${this.elementId}`}>
        {children}
      </T>
    )
  },
  listItem(children) {
    return (
      <T listItem key={`${this.elementId}`}>
        {children}
      </T>
    )
  },
  code(code, _lang) {
    return (
      <T codeblock key={`${this.elementId}`}>
        {code}
      </T>
    )
  },
  paragraph(children) {
    return (
      <T p key={`${this.elementId}`}>
        {children}
      </T>
    )
  },
  heading(children, _level) {
    return (
      <T p key={`${this.elementId}`}>
        {children}
      </T>
    )
  },
  blockquote(children) {
    return (
      <T q key={`${this.elementId}`}>
        {children}
      </T>
    )
  },
  html(html) {
    if (html === '<br/>') {
      return (
        <T p key={`${this.elementId}`}>
          {'\n'}
        </T>
      )
    }
    return (
      <T text key={`${this.elementId}`}>
        {html}
      </T>
    )
  },
  image(_src, _alt, _title) {
    return <React.Fragment key={`${this.elementId}`} />
  },
  checkbox(_checked) {
    return <React.Fragment key={`${this.elementId}`} />
  },
  table(_children) {
    return <React.Fragment key={`${this.elementId}`} />
  },
  tableBody(_children) {
    return <React.Fragment key={`${this.elementId}`} />
  },
  tableCell(_children, _flags) {
    return <React.Fragment key={`${this.elementId}`} />
  },
  tableHeader(_children) {
    return <React.Fragment key={`${this.elementId}`} />
  },
  tableRow(_children) {
    return <React.Fragment key={`${this.elementId}`} />
  },
  hr() {
    return <React.Fragment key={`${this.elementId}`} />
  },
}

export const MarkDown = React.memo(
  ({
    md,
    style,
    roomId,
    renderer,
    onPress,
    onLongPress,
    processMd = true,
  }: MarkDownProps) => {
    const styles = getStyles()

    const getRenderer = () => {
      return typeof renderer === 'function' ? renderer() : mdRenderer
    }

    const value = useMemo(
      () => ({ roomId, onPress, onLongPress }),
      [onLongPress, onPress, roomId],
    )
    return (
      <Context.Provider value={value}>
        <View style={[style as ViewStyle, styles.root]}>
          <Marked
            gfm
            breaks
            renderer={getRenderer()}
            value={processMd ? processMarkdown(md) : md}
          />
        </View>
      </Context.Provider>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.md === nextProps.md &&
      prevProps.onLongPress === nextProps.onLongPress &&
      prevProps.onPress === nextProps.onPress &&
      prevProps.renderer === nextProps.renderer
    )
  },
)

const getStyles = createThemedStylesheet((theme) => {
  const padding = theme.spacing.standard / 2
  const styles = StyleSheet.create({
    codeBlock: {
      ...theme.text.codeBlock,
      backgroundColor: theme.color.bg3,
      flexBasis: '100%',
      flexGrow: 1,
      padding: theme.spacing.standard / 2,
      writingDirection: DIRECTION_CODE,
    },
    inline: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    list: {
      flexDirection: 'column',
    },
    listBullet: {
      color: theme.text.body.color,
      fontSize: 8,
      lineHeight: 8,
      position: 'absolute',
      top: 8,
    },
    listNumber: {
      ...theme.text.body,
      position: 'relative',
    },
    olText: {
      marginLeft: theme.spacing.standard / 4,
      marginRight: theme.spacing.standard / 2,
    },
    p: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      flexWrap: 'wrap',
      fontSize: 15,
      // some Android devices can cause missing text
      // https://app.asana.com/0/1204361817407975/1206494428758633/f
      letterSpacing: isAndroid ? undefined : -0.3,
      rowGap: theme.spacing.standard,
      writingDirection: DIRECTION_CODE,
    },
    q: {
      alignItems: 'flex-start',
      alignSelf: 'stretch',
      backgroundColor: colors.keet_purple_2,
      borderLeftColor: theme.color.indigo_400,
      borderLeftWidth: UI_SIZE_4,
      flexWrap: 'wrap',
      fontSize: 15,
      marginVertical: UI_SIZE_4,
      padding: padding,
      rowGap: theme.spacing.standard,
      writingDirection: DIRECTION_CODE,
    },
    riveContainer: {
      transform: isAndroid ? [{ translateY: 3 }] : [],
      width: 20,
    },
    riveImage: {
      height: 20,
      width: 20,
    },
    root: {
      alignItems: 'flex-start',
      rowGap: theme.spacing.standard / 2,
    },
    ulText: {
      marginLeft: theme.spacing.standard,
    },
  })
  return styles
})
