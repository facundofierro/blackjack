import { Card, generateDeck, getValueForRank, Rank, Suit } from './deck'
import Player, { PlayerAction, PlayerStatus } from './player'

export default class BlackjackGame {
  private deck: Card[] = []

  public players: Player[] = []
  public dealer: Player = new Player()

  constructor() {}

  public startGame(playersQuantity: number) {
    for (let i = 0; i < playersQuantity; i++) {
      const newPlayer = new Player()
      newPlayer.credit = 5000
      this.players.push(newPlayer)
    }
  }

  public startRound() {
    this.deck = generateDeck()
    this.players.forEach((player: Player) => {
      player.status = PlayerStatus.Playing
      player.hand = []
      player.points = 0
      player.splits = []
      player.addBet(1000)
      if (player.bet === 0) {
        player.status = PlayerStatus.NoCredit
        return
      }
      player.addCard(this.deck.pop()!)
      player.addCard(this.deck.pop()!)
    })
    this.dealer.hand = []
    this.dealer.points = 0
    this.dealer.addCard(this.deck.pop()!)
    this.dealer.addCard(this.deck.pop()!)
  }

  public isGameNotFinished() {
    return this.players.some((player: Player) => player.credit > 0)
  }

  dealerPlay(): void {
    while (this.dealer.points < 17) {
      this.dealer.addCard(this.deck.pop()!)
    }
    this.players.forEach((player: Player) => {
      if (player.status === PlayerStatus.NoCredit) return
      this.setPlayResult(player)
      player.makePayments()
    })
  }

  private setPlayResult(player: Player) {
    player.status = this.playResult(
      player.points,
      this.dealer.points,
      player.status
    )
    player.splits.forEach((split: Player) => this.setPlayResult(split))
  }

  playResult(
    playerPoints: number,
    dealerPoints: number,
    playerStatus: PlayerStatus
  ): PlayerStatus {
    const { Lose, Tie, Win, BlackJack } = PlayerStatus
    if (playerStatus === BlackJack) return Win
    if (playerPoints > 21) return Lose
    if (playerPoints === dealerPoints) return Tie
    if (playerPoints > dealerPoints || this.dealer.points > 21) return Win
    return Lose
  }

  playerPlay(player: Player, action: PlayerAction): void {
    switch (action) {
      case PlayerAction.Hit:
        player.hit(this.deck.pop()!)
        break
      case PlayerAction.Stand:
        player.status = PlayerStatus.Waiting
        break
      case PlayerAction.DoubleDown:
        player.doubleDown(this.deck.pop()!)
        break
      case PlayerAction.Split:
        player.split()
        break
      default:
      // Handle invalid action
    }
  }
}
