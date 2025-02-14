import { call } from 'redux-saga/effects'

import { saveProfileStorage } from 'sagas/storageSaga'

import { setStorageMyProfile } from 'lib/localStorage'

describe('storageSaga tests', () => {
  it('saveProfileStorage test with avatarUrl from payload', () => {
    const payload = {
      payload: { name: 'New profile', avatar: '', avatarUrl: 'new_avatar.jpg' },
    }
    const currentProfile = {
      name: '',
      avatar: '',
      avatarUrl: 'old_avatar.jpg',
      needsName: true,
    }
    const generator = saveProfileStorage(payload)
    generator.next(currentProfile)
    expect(generator.next(currentProfile).value).toEqual(
      call(setStorageMyProfile, {
        name: 'New profile',
        avatar: 'new_avatar.jpg',
        needsName: true,
      }),
    )
  })

  it('saveProfileStorage test without avatarUrl from payload', () => {
    const payload = {
      payload: { name: 'New profile', avatar: '' },
    }
    const currentProfile = {
      name: '',
      avatar: '',
      avatarUrl: 'old_avatar.jpg',
      needsName: true,
    }
    const generator = saveProfileStorage(payload)
    generator.next(currentProfile)
    expect(generator.next(currentProfile).value).toEqual(
      call(setStorageMyProfile, {
        name: 'New profile',
        avatar: 'old_avatar.jpg',
        needsName: true,
      }),
    )
  })

  it('saveProfileStorage test without name and avatarUrl from payload', () => {
    const payload = {
      payload: { avatar: '' },
    }
    const currentProfile = {
      name: 'Old profile',
      avatar: '',
      avatarUrl: 'old_avatar.jpg',
      needsName: true,
    }
    const generator = saveProfileStorage(payload)
    generator.next(currentProfile)
    expect(generator.next(currentProfile).value).toEqual(
      call(setStorageMyProfile, {
        name: 'Old profile',
        avatar: 'old_avatar.jpg',
        needsName: true,
      }),
    )
  })
})
