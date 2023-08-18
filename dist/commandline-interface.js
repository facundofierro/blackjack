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
    displayPlayerHand(name, player, showStatus) {
        const splitAlert = player.canSplit ? ' (can split) ' : '';
        const playerHand = player.hand
            .map((hand) => d2(hand.rank) + hand.suit)
            .join(' ');
        const isCurrent = player === this.currentPlayer ? '-> ' : '   ';
        const points = d2(player.points);
        const credits = player.credit > 0 || player.bet > 0
            ? `(  ${d5(player.credit)} - ${d5(player.bet)}) - `
            : '                    ';
        console.log(`${isCurrent}${credits}${name} - ${points} points: ${playerHand} ${splitAlert}`);
        player.splits.forEach((playerSplit, index) => {
            const status = showStatus ? d5(playerSplit.status) + ' !!!' : '';
            this.displayPlayerHand(`Split${index}  ${status}`, playerSplit, showStatus);
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
    }
    displayHands(showStatus) {
        console.clear();
        const statusSpace = showStatus ? '         ' : '';
        console.log(`   ( CREDIT -  BET )   PLAYER  ${statusSpace}   POINTS      HAND`);
        this.game.players.forEach((player, index) => {
            const status = showStatus ? d5(player.status) + ' !!!' : '';
            this.displayPlayerHand(`Player${index} ${status}`, player, showStatus);
        });
    }
    handleActionInput(index, isSplit, canSplit) {
        console.log(`\nTurn for ${isSplit ? 'split' : 'player'} ${index}`);
        console.log('1. Hit');
        console.log('2. Stand');
        console.log('3. Double Down');
        if (canSplit)
            console.log('4. Split !!!');
        console.log('\nChoose an option: ');
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
        console.log('\nChoose an option: ');
        const option = readline_sync_1.default.questionInt();
        console.log('\n');
        if (option === 1)
            return true;
        return false;
    }
    playersPlay(players) {
        players.forEach((player, index) => {
            if (player.status === player_1.PlayerStatus.NoCredit)
                return;
            if (player.points === 21)
                return;
            while (player.status === player_1.PlayerStatus.Playing) {
                this.currentPlayer = player;
                this.displayHands(false);
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
            this.displayHands(true);
            this.displayPlayerHand('\nDealer  ', this.game.dealer, false);
            console.log('\n');
            if (!this.handleContinue())
                break;
        }
    }
}
exports.default = CommandLineInterface;
