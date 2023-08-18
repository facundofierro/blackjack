import BlackjackGame from './blackjack-game'
import readlineSync from 'readline-sync'
import { Card } from './deck'
import Player, { PlayerAction, PlayerStatus } from './player'

const d2 = (str: string | number): string => {
  return String(str).padStart(2, ' ')
}

const d5 = (str: string | number): string => {
  return String(str).padStart(5, ' ')
}

export default class CommandLineInterface {
  private game: BlackjackGame

  public currentPlayer: Player | undefined

  constructor() {
    this.game = new BlackjackGame()
  }

  private displayPlayerHand(name: string, player: Player): void {
    const playerHand = player.hand
      .map((hand: Card) => d2(hand.rank) + hand.suit)
      .join(' ')
    const isCurrent = player === this.currentPlayer ? '-> ' : '   '
    const points = d2(player.points)
    const credits =
      player.credit > 0 || player.bet > 0
        ? `(${d5(player.credit)} - ${d5(player.bet)}) - `
        : ''
    console.log(
      `${isCurrent}${credits}${name} has ${points} points: ${playerHand}`
    )
    player.splits.forEach((playerSplit: Player, index: number) => {
      this.displayPlayerHand(`Split  ${index}`, playerSplit)
    })
  }

  private displayHiddenHand(): void {
    const playerHand = this.game.dealer.hand
      .map((hand: Card, index: number) => {
        if (index === 0) return '??'
        return d2(hand.rank) + hand.suit
      })
      .join(' ')
    console.log(`\nDealer has ** points: ${playerHand}`)
    this.game.dealer.splits.forEach((playerSplit: Player, index: number) => {
      this.displayPlayerHand(`Split  ${index}`, playerSplit)
    })
  }

  private displayHands(): void {
    console.clear()
    this.game.players.forEach((player: Player, index: number) => {
      this.displayPlayerHand(`Player ${index}`, player)
    })
  }

  private handleActionInput(
    index: number,
    isSplit: boolean,
    canSplit: boolean
  ): PlayerAction {
    console.log(`\nTurn for ${isSplit ? 'split' : 'player'} ${index}`)
    console.log('1. Hit')
    console.log('2. Stand')
    console.log('3. Double Down')
    if (canSplit) console.log('4. Split')
    console.log('Choose an option: ')

    const option = readlineSync.questionInt()
    console.log('\n')
    switch (option) {
      case 1:
        return PlayerAction.Hit
      case 2:
        return PlayerAction.Stand
      case 3:
        return PlayerAction.DoubleDown
      case 4:
        if (canSplit) return PlayerAction.Split
    }
    return PlayerAction.Stand
  }

  private handleContinue(): boolean {
    console.log(`\nContinue?`)
    console.log('1. Yes')
    console.log('2. No')
    console.log('Choose an option: ')

    const option = readlineSync.questionInt()
    console.log('\n')
    if (option === 1) return true
    return false
  }

  private showResults(players: Player[]): void {
    players.forEach((player: Player, index: number) => {
      if (player.isSplit) console.log(`Split  ${index} - ${player.status}`)
      else console.log(`Player ${index} - ${player.status}`)
      this.showResults(player.splits)
    })
  }

  private playersPlay(players: Player[]): void {
    players.forEach((player: Player, index: number) => {
      if (player.status === PlayerStatus.NoCredit) return
      while (player.status === PlayerStatus.Playing) {
        this.currentPlayer = player
        this.displayHands()
        this.displayHiddenHand()
        this.game.playerPlay(
          player,
          this.handleActionInput(index, player.isSplit, player.canSplit)
        )
      }
      this.playersPlay(player.splits)
    })
  }

  playGame(): void {
    console.log('Number of players: ')
    const playersQuantity = readlineSync.questionInt()
    console.log('\n')
    this.game.startGame(playersQuantity)

    while (this.game.isGameNotFinished()) {
      this.game.startRound()
      this.playersPlay(this.game.players)

      this.game.dealerPlay()
      this.displayHands()
      this.displayPlayerHand('\nDealer  ', this.game.dealer)
      console.log('\n')

      this.showResults(this.game.players)

      if (!this.handleContinue()) break
    }
  }
}
