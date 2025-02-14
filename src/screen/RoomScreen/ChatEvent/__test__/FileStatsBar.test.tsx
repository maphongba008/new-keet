import React from 'react'
import { render, screen } from '@testing-library/react-native'

import { useTheme } from 'component/theme'

import { useStrings } from 'i18n/strings'

import { FileStatsBar } from '../FileStatsBar'
import { useFileStatsLocalized } from '../hooks/useFileStatsLocalized'

jest.mock('../hooks/useFileStatsLocalized', () => ({
  useFileStatsLocalized: jest.fn(),
}))
jest.mock('component/theme', () => ({
  ...jest.requireActual('component/theme'),
  useTheme: jest.fn(),
}))
jest.mock('i18n/strings', () => ({
  useStrings: jest.fn(),
}))

describe('FileStatsBar', () => {
  const mockUseFileStatsLocalized = useFileStatsLocalized as jest.Mock
  const mockUseTheme = useTheme as jest.Mock
  const mockUseStrings = useStrings as jest.Mock

  beforeEach(() => {
    mockUseFileStatsLocalized.mockReturnValue({
      downloadSpeed: '500 KB/s',
      uploadSpeed: '200 KB/s',
      peersCount: 5,
      isDownloading: true,
    })

    mockUseTheme.mockReturnValue({
      color: {
        blue_400: 'blue',
        grey_000: 'white',
      },
    })

    mockUseStrings.mockReturnValue({
      chat: {
        streaming: 'Streaming',
      },
    })
  })

  it('renders correctly with streaming label', () => {
    render(<FileStatsBar fileId="123" isWithStreamingLabel={true} />)

    expect(screen.getByText('Streaming')).toBeTruthy()
    expect(screen.getByText('500 KB/s')).toBeTruthy()
    expect(screen.getByText('200 KB/s')).toBeTruthy()
    expect(screen.getByText('5')).toBeTruthy()
    expect(screen.toJSON()).toMatchSnapshot()
  })

  it('renders correctly without streaming label', () => {
    mockUseFileStatsLocalized.mockReturnValueOnce({
      downloadSpeed: '70 KB/s',
      uploadSpeed: '4 MB/s',
      peersCount: 77,
      isDownloading: false,
    })

    render(<FileStatsBar fileId="123" isWithStreamingLabel={true} />)

    expect(screen.queryByText('Streaming')).toBeNull()
    expect(screen.getByText('70 KB/s')).toBeTruthy()
    expect(screen.getByText('4 MB/s')).toBeTruthy()
    expect(screen.getByText('77')).toBeTruthy()
    expect(screen.toJSON()).toMatchSnapshot()
  })

  it('renders correctly without streaming label prop', () => {
    render(<FileStatsBar fileId="123" />)

    expect(screen.queryByText('Streaming')).toBeNull()
    expect(screen.getByText('500 KB/s')).toBeTruthy()
    expect(screen.getByText('200 KB/s')).toBeTruthy()
    expect(screen.getByText('5')).toBeTruthy()
    expect(screen.toJSON()).toMatchSnapshot()
  })
})
