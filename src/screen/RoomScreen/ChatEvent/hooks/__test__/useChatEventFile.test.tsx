import { renderHook } from '@testing-library/react-native'

import { useChatFileComponent } from '../useChatEventFile'

jest.mock('lib/platform', () => ({
  isIOS: false,
  platformVersion: 18, // Assume a default value for platform version
}))

describe('useChatFileComponent', () => {
  const mediaTypeResultBase = {
    isImage: false,
    isSVG: false,
    isVideo: false,
    isAudio: false,
    isSupportedFileType: true,
    hasPreview: false,
  }

  it('should return ChatEventFileAny when no media type matches', () => {
    const { result } = renderHook(() =>
      useChatFileComponent(mediaTypeResultBase),
    )
    expect((result.current as React.FC<unknown>).displayName).toBe(
      'ChatEventFileAny',
    )
  })

  it('should return ChatEventFileSVGLazy for SVG files on iOS with platform version > 17', () => {
    require('lib/platform').isIOS = true

    const { result } = renderHook(() =>
      useChatFileComponent({ ...mediaTypeResultBase, isSVG: true }),
    )
    expect((result.current as React.FC<unknown>).displayName).toBe(
      'ChatEventFileSVGLazy',
    )
  })

  it('should return ChatEventFileAny for SVG files on iOS with platform version <= 17', () => {
    require('lib/platform').isIOS = true
    require('lib/platform').platformVersion = 16

    const { result } = renderHook(() =>
      useChatFileComponent({ ...mediaTypeResultBase, isSVG: true }),
    )

    expect((result.current as React.FC<unknown>).displayName).toBe(
      'ChatEventFileAny',
    )
  })

  it('should return ChatEventFileImage for image files', () => {
    const { result } = renderHook(() =>
      useChatFileComponent({ ...mediaTypeResultBase, isImage: true }),
    )
    expect((result.current as React.FC<unknown>).displayName).toBe(
      'ChatEventFileImage',
    )
  })

  it('should return ChatEventFileVideoLazy with preview for video files when hasPreview is true', () => {
    const { result } = renderHook(() =>
      useChatFileComponent({
        ...mediaTypeResultBase,
        isVideo: true,
        hasPreview: true,
      }),
    )
    expect((result.current as React.FC<unknown>).displayName).toBe(
      'ChatEventFileVideoLazy',
    )
  })

  it('should return ChatEventFileAny for video files when hasPreview is false', () => {
    const { result } = renderHook(() =>
      useChatFileComponent({
        ...mediaTypeResultBase,
        isVideo: true,
        hasPreview: false,
      }),
    )
    expect((result.current as React.FC<unknown>).displayName).toBe(
      'ChatEventFileAny',
    )
  })

  it('should return ChatEventFileAudioLazy for audio files', () => {
    const { result } = renderHook(() =>
      useChatFileComponent({ ...mediaTypeResultBase, isAudio: true }),
    )
    expect((result.current as React.FC<unknown>).displayName).toBe(
      'ChatEventFileAudioLazy',
    )
  })

  it('should return ChatEventFileAny when file type is not supported', () => {
    const { result } = renderHook(() =>
      useChatFileComponent({
        ...mediaTypeResultBase,
        isSupportedFileType: false,
      }),
    )
    expect((result.current as React.FC<unknown>).displayName).toBe(
      'ChatEventFileAny',
    )
  })
})
