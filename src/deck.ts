export enum Rank {
  Two = '2',
  Three = '3',
  Four = '4',
  Five = '5',
  Six = '6',
  Seven = '7',
  Eight = '8',
  Nine = '9',
  Ten = '10',
  Jack = 'J',
  Queen = 'Q',
  King = 'K',
  Ace = 'A',
}

export enum Suit {
  Hearts = '♥️',
  Diamonds = '♦️',
  Clubs = '♣️',
  Spades = '♠️',
}

export type Card = {
  suit: Suit
  rank: Rank
  value: number
}

export const generateDeck = (): Card[] => {
  const suits: Suit[] = Object.values(Suit)
  const ranks: Rank[] = Object.values(Rank)

  const deck: Card[] = suits.reduce(
    (acc: Card[], suit: Suit) => [
      ...acc,
      ...ranks.map((rank: Rank) => ({
        suit,
        rank,
        value: getValueForRank(rank),
      })),
    ],
    []
  )

  const shuffledDeck: Card[] = deck.reduce((acc: Card[], card: Card) => {
    const randomIndex = Math.floor(Math.random() * (acc.length + 1))
    acc.splice(randomIndex, 0, card)
    return acc
  }, [])

  return shuffledDeck
}

export const getValueForRank = (rank: Rank): number => {
  if (rank === Rank.Ace) return 11 // Ace can be 1 or 11, handled during gameplay
  if (rank === Rank.Jack || rank === Rank.Queen || rank === Rank.King) return 10
  return parseInt(rank)
}

export const getHandPoints = (hand: Card[]): number => {
  let points = hand.reduce((sum, card) => sum + card.value, 0)

  // Check for Aces and adjust their value if needed
  const aces = hand.filter((card) => card.rank === Rank.Ace)
  aces.forEach(() => {
    if (points > 21) {
      points -= 10 // Change Ace value from 11 to 1
    }
  })

  return points
}
