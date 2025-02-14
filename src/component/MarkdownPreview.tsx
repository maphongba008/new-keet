// Textified Markdown Preview for RoomList
import Marked, { type ReactRenderer } from 'marked-react'
import React, {
  createContext,
  memo,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
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
import isEqual from 'react-fast-compare'

import { getEmojiData } from '@holepunchto/emojis'
// @ts-ignore
import { isMentionUrlDeprecated } from '@holepunchto/keet-store/store/chat'

import { DIRECTION_CODE } from 'lib/commonStyles'
import { getMemberByRoomId } from 'lib/hooks/useMember'
import { sanitizeURL } from 'lib/linking'
import { BREAK_LINE_TAG, processMarkdown } from 'lib/md'
import { isAndroid } from 'lib/platform'

import { useStrings } from 'i18n/strings'

import { EmojiRive } from './EmojiRive'
import { ListType, TProps } from './MarkDown'
import { createThemedStylesheet, useTheme } from './theme'

export interface MarkdownPreviewProps {
  ellipsizeMode?: 'clip' | 'head' | 'middle' | 'tail'
  numberOfLines?: number
  style: StyleProp<TextStyle>
  text: string
  isFocused?: boolean
  roomId?: string
}

interface MarkdownPreviewContextProps {
  ellipsizeMode?: 'clip' | 'head' | 'middle' | 'tail'
  numberOfLines?: number
  style: StyleProp<TextStyle>
  isContainRive: React.MutableRefObject<boolean>
  roomId?: string
}
const Context = createContext<MarkdownPreviewContextProps>(null as any)

// To resolve edge android bug https://app.asana.com/0/0/1207358061070174/1207477365086737/f
const ParentView = memo(
  ({
    children,
    style,
    isContainRive,
    isFocused = false,
  }: {
    children: any
    style: StyleProp<ViewStyle>
    isContainRive: React.MutableRefObject<boolean>
    isFocused?: boolean
  }) => {
    const styles = getStyles()
    const [isRefresh, setIsRefresh] = useState(false)

    useEffect(() => {
      if (isFocused) {
        setIsRefresh(true)
        const timeout = setTimeout(() => setIsRefresh(false), 0)
        return () => clearTimeout(timeout)
      }
    }, [isFocused])

    return (
      <View
        style={[
          style,
          styles.parentView,
          // Make change any style to force component redraw
          // eslint-disable-next-line react-native/no-inline-styles
          {
            borderRightWidth:
              isAndroid && isRefresh && isContainRive.current ? 1 : 0,
          },
        ]}
      >
        {children}
      </View>
    )
  },
  isEqual,
)

const T = (props: TProps) => {
  const theme = useTheme()
  const styles = getStyles()
  const strings = useStrings()

  const { style, numberOfLines, ellipsizeMode, isContainRive, roomId } =
    useContext(Context)
  const member = useSelector(
    getMemberByRoomId(roomId!, props.href?.split('/')[3]!),
  )
  const textProp = { numberOfLines, ellipsizeMode }

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

    return React.cloneElement(child, cprops)
  })

  // Intercept to render rive
  if (props.customEmoji) {
    const shortCode = props.children
    if (typeof shortCode === 'string') {
      const emoji = getEmojiData(shortCode.replaceAll(':', ''))
      if (emoji?.url) {
        isContainRive.current = true
        return (
          <View style={styles.riveContainer}>
            <EmojiRive
              shortCode={shortCode.replaceAll(':', '')}
              isDisableTouch
              style={styles.riveContainer}
            />
          </View>
        )
      }
    }
  }

  if (props.text === true) {
    const computedStyle: StyleProp<TextStyle> =
      props.strong === true && props.em === true
        ? [
            theme.text.bodyBoldItalic,
            style,
            { fontWeight: '700', fontStyle: 'italic' },
          ]
        : props.strong === true
          ? [theme.text.bodyBold, style, { fontWeight: '700' }]
          : props.em === true
            ? [theme.text.bodyItalic, style, { fontStyle: 'italic' }]
            : props.codespan === true
              ? [theme.text.codeBlock, style]
              : [theme.text.body, style]

    if (props.strike === true) {
      computedStyle.push({ textDecorationLine: 'line-through' })
    }
    if (props.codespan === true) {
      computedStyle.push({
        paddingHorizontal: theme.spacing.standard / 2,
        overflow: 'hidden',
        borderRadius: 4,
        backgroundColor: theme.color.bg3,
      })
    }
    if (props.link === true) {
      const role = props.href?.split('/').pop()
      const color =
        role === 'admin'
          ? theme.memberTypes.admin
          : role === 'moderator'
            ? theme.memberTypes.mod
            : theme.color.blue_400
      computedStyle.push({ color })
    }
    if (props.href !== undefined) {
      if (props.mention === true) {
        computedStyle.push({
          paddingHorizontal: 3,
          overflow: 'hidden',
          borderRadius: 4,
        })
      }
    }

    const nextChildren = React.Children.map(children, (child) => {
      if (typeof child === 'string') {
        return child.split('\n').join(' ')
      }
      return child
    })

    if (props.mention && member.blocked) {
      return (
        <Text style={computedStyle} {...textProp}>
          @{strings.chat.blockedUserName}
        </Text>
      )
    }

    return (
      <Text style={computedStyle} {...textProp}>
        {nextChildren}
      </Text>
    )
  }

  if (props.list !== undefined) {
    return (
      <Text style={style} {...textProp}>
        {children}
      </Text>
    )
  } else if (props.listItem === true) {
    if (props.inList === ListType.OL) {
      const index = (props.index ?? 0) + 1
      return (
        <Text style={style} {...textProp}>
          <Text style={[styles.listNumber, style]}>{` ${index}.`}</Text>
          {children}
        </Text>
      )
    }
    const depth = props.listDepth ?? 1
    const bullet = depth % 2 === 1 ? '●' : '○'
    return (
      <Text style={style} {...textProp}>
        <Text style={[styles.listBullet, style]}> {bullet}</Text>
        {children}
      </Text>
    )
  } else if (props.codeblock === true) {
    return (
      <Text style={[styles.codeBlock, style]} {...textProp}>
        {children}
      </Text>
    )
  } else if (props.p === true) {
    return (
      <Text style={[styles.p, style]} {...textProp}>
        {children}
      </Text>
    )
  } else if (props.q === true) {
    return (
      <Text style={[styles.q, style]} {...textProp}>
        {children}
      </Text>
    )
  }

  return (
    <Text style={style} {...textProp}>
      {children}
    </Text>
  )
}

const renderer: Partial<ReactRenderer> = {
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
    return <Text key={`${this.elementId}`}> </Text>
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
  code(code) {
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
      return <Text key={`${this.elementId}`}> </Text>
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

export const MarkdownPreview = memo(
  ({
    style,
    numberOfLines,
    ellipsizeMode,
    text,
    isFocused,
    roomId,
  }: MarkdownPreviewProps) => {
    const isContainRive = useRef(false)
    const value: MarkdownPreviewContextProps = useMemo(
      () => ({ style, numberOfLines, ellipsizeMode, isContainRive, roomId }),
      [ellipsizeMode, numberOfLines, roomId, style],
    )

    return (
      <Context.Provider value={value}>
        <ParentView
          style={style as ViewStyle}
          isContainRive={isContainRive}
          isFocused={isFocused}
        >
          <Marked
            gfm
            renderer={renderer}
            value={processMarkdown(text, BREAK_LINE_TAG)}
          />
        </ParentView>
      </Context.Provider>
    )
  },
  isEqual,
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    codeBlock: {
      ...theme.text.codeBlock,
      backgroundColor: theme.color.bg3,
      padding: theme.spacing.standard / 8,
      writingDirection: DIRECTION_CODE,
    },
    listBullet: {
      color: theme.text.body.color,
      fontSize: 8,
      marginRight: theme.spacing.standard / 2,
    },
    listNumber: {
      ...theme.text.body,
      marginLeft: -theme.spacing.standard,
      marginRight: theme.spacing.standard / 2,
    },
    p: {
      writingDirection: DIRECTION_CODE,
    },
    // https://app.asana.com/0/1204410109268389/1207547932183094/f
    parentView: {
      justifyContent: 'flex-end',
      minHeight: isAndroid ? 0 : 18,
    },
    q: {
      writingDirection: DIRECTION_CODE,
    },
    riveContainer: {
      height: 13,
      marginTop: isAndroid ? 2 : 0,
      width: 13,
    },
  })
  return styles
})
