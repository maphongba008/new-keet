import React from 'react'
import { Text, TextStyle } from 'react-native'

import { Fragment, StyledFragments } from 'lib/types'

import DisplayTypeContent from '../DisplayTypeContent'

export const getTextMessageDisplayStyle = (
  fragments: StyledFragments,
  finalText: string,
  theme: any,
  textStyle: TextStyle | TextStyle[] | undefined,
  messageId: string,
) => {
  return (
    fragments
      // When a message is truncated, don't apply styles that go past the end of truncated message
      .filter((fragment: Fragment) => fragment.start < finalText.length)
      .map((fragment: Fragment) => {
        let content = finalText.slice(fragment.start, fragment.end) || (
          <React.Fragment />
        )

        for (const style of fragment.styles) {
          content = (
            <DisplayTypeContent
              style={style}
              content={content}
              fragment={fragment}
            />
          )
        }

        return (
          <Text
            style={[theme.text.body, textStyle]}
            key={fragment.start + messageId + fragment.end}
          >
            {content}
          </Text>
        )
      })
  )
}
