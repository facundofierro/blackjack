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

  private displayPlayerHand(
    name: string,
    player: Player,
    showStatus: boolean
  ): void {
    const splitAlert = player.canSplit ? ' (can split) ' : ''
    const playerHand = player.hand
      .map((hand: Card) => d2(hand.rank) + hand.suit)
      .join(' ')
    const isCurrent = player === this.currentPlayer ? '-> ' : '   '
    const points = d2(player.points)
    const credits =
      player.credit > 0 || player.bet > 0
        ? `(  ${d5(player.credit)} - ${d5(player.bet)}) - `
        : '                    '
    console.log(
      `${isCurrent}${credits}${name} - ${points} points: ${playerHand} ${splitAlert}`
    )
    player.splits.forEach((playerSplit: Player, index: number) => {
      const status = showStatus ? d5(playerSplit.status) + ' !!!' : ''
      this.displayPlayerHand(
        `Split${index}  ${status}`,
        playerSplit,
        showStatus
      )
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
  }

  private displayHands(showStatus: boolean): void {
    console.clear()
    const statusSpace = showStatus ? '         ' : ''
    console.log(
      `   ( CREDIT -  BET )   PLAYER  ${statusSpace}   POINTS      HAND`
    )
    this.game.players.forEach((player: Player, index: number) => {
      const status = showStatus ? d5(player.status) + ' !!!' : ''
      this.displayPlayerHand(`Player${index} ${status}`, player, showStatus)
    })
  }

  private handleActionInput(index: number, player: Player): PlayerAction {
    console.log(`\nTurn for ${player.isSplit ? 'split' : 'player'} ${index}`)
    console.log('1. Hit')
    console.log('2. Stand')
    if (player.canDoubleDown) console.log('3. Double Down')
    if (player.canSplit) console.log('4. Split !!!')
    console.log('\nChoose an option: ')

    const option = readlineSync.questionInt()
    console.log('\n')
    switch (option) {
      case 1:
        return PlayerAction.Hit
      case 2:
        return PlayerAction.Stand
      case 3:
        if (player.canDoubleDown) return PlayerAction.DoubleDown
      case 4:
        if (player.canSplit) return PlayerAction.Split
    }
    return PlayerAction.Stand
  }

  private handleContinue(): boolean {
    console.log(`\nContinue?`)
    console.log('1. Yes')
    console.log('2. No')
    console.log('\nChoose an option: ')

    const option = readlineSync.questionInt()
    console.log('\n')
    if (option === 1) return true
    return false
  }

  private playersPlay(players: Player[]): void {
    players.forEach((player: Player, index: number) => {
      if (player.status === PlayerStatus.NoCredit) return
      if (player.points === 21) return
      while (player.status === PlayerStatus.Playing) {
        this.currentPlayer = player
        this.displayHands(false)
        this.displayHiddenHand()
        this.game.playerPlay(player, this.handleActionInput(index, player))
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
      this.displayHands(true)
      this.displayPlayerHand('\nDealer  ', this.game.dealer, false)
      console.log('\n')

      if (!this.handleContinue()) break
    }
  }
}
