import { SCREEN_USER_PROFILE } from 'lib/navigation'

export type AppStackParams = {
  [SCREEN_USER_PROFILE]: {
    memberId: string
    roomId: string
  }
}
