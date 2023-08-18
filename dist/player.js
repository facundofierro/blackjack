"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerStatus = exports.PlayerAction = void 0;
const deck_1 = require("./deck");
var PlayerAction;
(function (PlayerAction) {
    PlayerAction["Hit"] = "hit";
    PlayerAction["Stand"] = "stand";
    PlayerAction["DoubleDown"] = "doubleDown";
    PlayerAction["Split"] = "split";
})(PlayerAction || (exports.PlayerAction = PlayerAction = {}));
var PlayerStatus;
(function (PlayerStatus) {
    PlayerStatus["BlackJack"] = "BlackJack";
    PlayerStatus["Win"] = "Win";
    PlayerStatus["Lose"] = "Lose";
    PlayerStatus["Tie"] = "Tie";
    PlayerStatus["Playing"] = "Playing";
    PlayerStatus["Waiting"] = "Waiting";
    PlayerStatus["NoCredit"] = "No credit";
})(PlayerStatus || (exports.PlayerStatus = PlayerStatus = {}));
class Player {
    hand = [];
    points = 0;
    status = PlayerStatus.Playing;
    splits = [];
    isSplit = false;
    credit = 0;
    bet = 0;
    parentPlayer;
    canSplit = false;
    constructor() { }
    addBet(bet) {
        if (this.parentPlayer?.credit) {
            if (bet > this.parentPlayer?.credit)
                return -1;
            this.bet += bet;
            this.parentPlayer.credit -= bet;
            return bet;
        }
        if (bet > this.credit)
            return -1;
        this.bet += bet;
        this.credit -= bet;
        return bet;
    }
    addCard(card) {
        this.hand.push(card);
        this.points = (0, deck_1.getHandPoints)(this.hand);
    }
    removeCard() {
        const card = this.hand.pop();
        this.points = (0, deck_1.getHandPoints)(this.hand);
        return card;
    }
    hit(card) {
        this.canSplit = this.hand.some((handCard) => handCard.rank === card.rank);
        this.addCard(card);
        if (this.points === 21 && this.hand.length === 2)
            this.status = PlayerStatus.BlackJack;
        else if (this.points > 21) {
            this.status = PlayerStatus.Lose;
        }
        else if (this.points === 21) {
            this.status = PlayerStatus.Waiting;
        }
    }
    split() {
        const splitPlayer = new Player();
        splitPlayer.addCard(this.removeCard());
        splitPlayer.isSplit = true;
        splitPlayer.parentPlayer = this.parentPlayer || this;
        splitPlayer.addBet(this.bet);
        this.splits.push(splitPlayer);
    }
    doubleDown(card) {
        this.addBet(this.bet);
        this.addCard(card);
        if (this.points > 21) {
            this.status = PlayerStatus.Lose;
        }
        else
            this.status = PlayerStatus.Waiting;
    }
    makePayments() {
        this.credit += this.playerPayment(this);
        this.credit += this.paySplits(this);
        this.bet = 0;
    }
    paySplits(player) {
        let payout = 0;
        player.splits.forEach((split) => {
            payout += this.playerPayment(split);
            payout += this.paySplits(split);
            split.bet = 0;
        });
        return payout;
    }
    playerPayment(player) {
        if (player.status === PlayerStatus.Tie)
            return this.bet;
        if (player.status === PlayerStatus.Win)
            return this.bet * 2;
        return 0;
    }
}
exports.default = Player;
