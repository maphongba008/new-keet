import { call, put } from 'redux-saga/effects'

import { setShareContent } from 'reducers/application'
import { shareContentSaga } from 'sagas/appEventsSaga'

import { showInfoNotifier } from 'lib/hud'
import { resetShareContent } from 'lib/shareContent'

const FILE_ITEM = {
  mimeType: 'image/png',
  media: {
    uri: 'uri',
    name: 'test.png',
    width: 300,
    height: 300,
    byteLength: 1024,
  },
}

describe('ShareContent Saga', () => {
  it('show error if there are more than 10 files', () => {
    const iterator = shareContentSaga()
    iterator.next()
    iterator.next([
      FILE_ITEM,
      {
        maxShareSize: true,
      },
    ])
    iterator.next()
    expect(iterator.next().value).toEqual(
      call(showInfoNotifier, 'You can only share up to 10 files at a time.'),
    )
    iterator.next()
    iterator.next()
    iterator.next()
    expect(iterator.next().value).toEqual(put(setShareContent([FILE_ITEM])))
    expect(iterator.next().value).toEqual(call(resetShareContent))
  })
})
