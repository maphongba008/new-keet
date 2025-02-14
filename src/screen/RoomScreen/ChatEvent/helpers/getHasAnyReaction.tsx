import { ReactionsType } from 'lib/types'

export function getHasAnyReaction(reactions: ReactionsType) {
  return reactions.mine.length > 0 || reactions.reactions.length > 0
}
