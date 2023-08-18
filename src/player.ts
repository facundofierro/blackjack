import { Card, Rank, getHandPoints } from './deck'

export enum PlayerAction {
  Hit = 'hit',
  Stand = 'stand',
  DoubleDown = 'doubleDown',
  Split = 'split',
}

export enum PlayerStatus {
  BlackJack = 'BlackJack',
  Win = 'Win',
  Lose = 'Lose',
  Tie = 'Tie',
  Playing = 'Playing',
  Waiting = 'Waiting',
  NoCredit = 'No credit',
}

export default class Player {
  public hand: Card[] = []
  public points: number = 0
  public status: PlayerStatus = PlayerStatus.Playing
  public splits: Player[] = []
  public isSplit: boolean = false
  public credit: number = 0
  public bet: number = 0
  public parentPlayer: Player | undefined
  public canSplit = false

  constructor() {}

  public addBet(bet: number): number {
    if (this.parentPlayer?.credit) {
      if (bet > this.parentPlayer?.credit) return -1
      this.bet += bet
      this.parentPlayer.credit -= bet
      return bet
    }
    if (bet > this.credit) return -1
    this.bet += bet
    this.credit -= bet
    return bet
  }

  public addCard(card: Card): void {
    this.hand.push(card)
    this.points = getHandPoints(this.hand)
  }

  public removeCard(): Card {
    const card = this.hand.pop()!
    this.points = getHandPoints(this.hand)
    return card
  }

  public hit(card: Card): void {
    this.addCard(card)
    if (this.points === 21 && this.hand.length === 2)
      this.status = PlayerStatus.BlackJack
    else if (this.points > 21) {
      if (this.canSplit) this.split()
      this.status = PlayerStatus.Lose
    } else if (this.points === 21) {
      this.status = PlayerStatus.Waiting
    }
  }

  public split(): void {
    this.canSplit = false
    const splitPlayer = new Player()
    splitPlayer.addCard(this.removeCard())
    splitPlayer.isSplit = true
    splitPlayer.parentPlayer = this.parentPlayer || this
    splitPlayer.addBet(this.bet)
    this.splits.push(splitPlayer)
  }

  doubleDown(card: Card): void {
    this.addBet(this.bet)
    this.addCard(card)
    if (this.points > 21) {
      this.status = PlayerStatus.Lose
    } else this.status = PlayerStatus.Waiting
  }

  public makePayments() {
    this.credit += this.playerPayment(this)
    this.credit += this.paySplits(this)
    this.bet = 0
  }

  private paySplits(player: Player): number {
    let payout = 0
    player.splits.forEach((split: Player) => {
      payout += this.playerPayment(split)
      payout += this.paySplits(split)
      split.bet = 0
    })
    return payout
  }

  private playerPayment(player: Player) {
    if (player.status === PlayerStatus.Tie) return this.bet
    if (player.status === PlayerStatus.Win) return this.bet * 2
    return 0
  }
}
