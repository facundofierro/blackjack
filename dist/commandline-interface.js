"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blackjack_game_1 = __importDefault(require("./blackjack-game"));
const readline_sync_1 = __importDefault(require("readline-sync"));
const player_1 = require("./player");
const d2 = (str) => {
    return String(str).padStart(2, ' ');
};
const d5 = (str) => {
    return String(str).padStart(5, ' ');
};
class CommandLineInterface {
    game;
    currentPlayer;
    constructor() {
        this.game = new blackjack_game_1.default();
    }
    displayPlayerHand(name, player) {
        const playerHand = player.hand
            .map((hand) => d2(hand.rank) + hand.suit)
            .join(' ');
        const isCurrent = player === this.currentPlayer ? '-> ' : '   ';
        const points = d2(player.points);
        const credits = player.credit > 0 || player.bet > 0
            ? `(${d5(player.credit)} - ${d5(player.bet)}) - `
            : '';
        console.log(`${isCurrent}${credits}${name} has ${points} points: ${playerHand}`);
        player.splits.forEach((playerSplit, index) => {
            this.displayPlayerHand(`Split  ${index}`, playerSplit);
        });
    }
    displayHiddenHand() {
        const playerHand = this.game.dealer.hand
            .map((hand, index) => {
            if (index === 0)
                return '??';
            return d2(hand.rank) + hand.suit;
        })
            .join(' ');
        console.log(`\nDealer has ** points: ${playerHand}`);
        this.game.dealer.splits.forEach((playerSplit, index) => {
            this.displayPlayerHand(`Split  ${index}`, playerSplit);
        });
    }
    displayHands() {
        console.clear();
        this.game.players.forEach((player, index) => {
            this.displayPlayerHand(`Player ${index}`, player);
        });
    }
    handleActionInput(index, isSplit, canSplit) {
        console.log(`\nTurn for ${isSplit ? 'split' : 'player'} ${index}`);
        console.log('1. Hit');
        console.log('2. Stand');
        console.log('3. Double Down');
        if (canSplit)
            console.log('4. Split');
        console.log('Choose an option: ');
        const option = readline_sync_1.default.questionInt();
        console.log('\n');
        switch (option) {
            case 1:
                return player_1.PlayerAction.Hit;
            case 2:
                return player_1.PlayerAction.Stand;
            case 3:
                return player_1.PlayerAction.DoubleDown;
            case 4:
                if (canSplit)
                    return player_1.PlayerAction.Split;
        }
        return player_1.PlayerAction.Stand;
    }
    handleContinue() {
        console.log(`\nContinue?`);
        console.log('1. Yes');
        console.log('2. No');
        console.log('Choose an option: ');
        const option = readline_sync_1.default.questionInt();
        console.log('\n');
        if (option === 1)
            return true;
        return false;
    }
    showResults(players) {
        players.forEach((player, index) => {
            if (player.isSplit)
                console.log(`Split  ${index} - ${player.status}`);
            else
                console.log(`Player ${index} - ${player.status}`);
            this.showResults(player.splits);
        });
    }
    playersPlay(players) {
        players.forEach((player, index) => {
            if (player.status === player_1.PlayerStatus.NoCredit)
                return;
            while (player.status === player_1.PlayerStatus.Playing) {
                this.currentPlayer = player;
                this.displayHands();
                this.displayHiddenHand();
                this.game.playerPlay(player, this.handleActionInput(index, player.isSplit, player.canSplit));
            }
            this.playersPlay(player.splits);
        });
    }
    playGame() {
        console.log('Number of players: ');
        const playersQuantity = readline_sync_1.default.questionInt();
        console.log('\n');
        this.game.startGame(playersQuantity);
        while (this.game.isGameNotFinished()) {
            this.game.startRound();
            this.playersPlay(this.game.players);
            this.game.dealerPlay();
            this.displayHands();
            this.displayPlayerHand('\nDealer  ', this.game.dealer);
            console.log('\n');
            this.showResults(this.game.players);
            if (!this.handleContinue())
                break;
        }
    }
}
exports.default = CommandLineInterface;
