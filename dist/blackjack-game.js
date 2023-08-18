"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const deck_1 = require("./deck");
const player_1 = __importStar(require("./player"));
class BlackjackGame {
    deck = [];
    players = [];
    dealer = new player_1.default();
    constructor() { }
    startGame(playersQuantity) {
        for (let i = 0; i < playersQuantity; i++) {
            const newPlayer = new player_1.default();
            newPlayer.credit = 5000;
            this.players.push(newPlayer);
        }
    }
    startRound() {
        this.deck = (0, deck_1.generateDeck)();
        this.players.forEach((player) => {
            player.status = player_1.PlayerStatus.Playing;
            player.hand = [];
            player.points = 0;
            player.splits = [];
            player.addBet(1000);
            if (player.bet === 0) {
                player.status = player_1.PlayerStatus.NoCredit;
                return;
            }
            player.checkDoubleDown();
            //player hand
            const firstCard = this.deck.pop();
            player.addCard(firstCard);
            const secondCard = this.deck.pop();
            player.hit(secondCard);
            player.canSplit = firstCard.rank === secondCard.rank;
        });
        //dealer hand
        this.dealer.hand = [];
        this.dealer.points = 0;
        this.dealer.addCard(this.deck.pop());
        this.dealer.addCard(this.deck.pop());
    }
    isGameNotFinished() {
        return this.players.some((player) => player.credit > 0);
    }
    dealerPlay() {
        while (this.dealer.points < 17) {
            this.dealer.addCard(this.deck.pop());
        }
        this.players.forEach((player) => {
            if (player.status === player_1.PlayerStatus.NoCredit)
                return;
            this.setPlayResult(player);
            player.makePayments();
        });
    }
    setPlayResult(player) {
        player.status = this.playResult(player.points, this.dealer.points, player.status);
        player.splits.forEach((split) => this.setPlayResult(split));
    }
    playResult(playerPoints, dealerPoints, playerStatus) {
        const { Lose, Tie, Win, BlackJack } = player_1.PlayerStatus;
        if (playerPoints > 21)
            return Lose;
        if (playerPoints === dealerPoints)
            return Tie;
        if (playerPoints > dealerPoints || this.dealer.points > 21)
            return Win;
        return Lose;
    }
    playerPlay(player, action) {
        switch (action) {
            case player_1.PlayerAction.Hit:
                player.hit(this.deck.pop());
                break;
            case player_1.PlayerAction.Stand:
                player.status = player_1.PlayerStatus.Waiting;
                break;
            case player_1.PlayerAction.DoubleDown:
                player.doubleDown(this.deck.pop());
                break;
            case player_1.PlayerAction.Split:
                player.split();
                break;
            default:
            // Handle invalid action
        }
        player.canSplit = false;
    }
}
exports.default = BlackjackGame;
