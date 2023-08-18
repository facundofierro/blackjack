"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHandPoints = exports.getValueForRank = exports.generateDeck = exports.Suit = exports.Rank = void 0;
var Rank;
(function (Rank) {
    Rank["Two"] = "2";
    Rank["Three"] = "3";
    Rank["Four"] = "4";
    Rank["Five"] = "5";
    Rank["Six"] = "6";
    Rank["Seven"] = "7";
    Rank["Eight"] = "8";
    Rank["Nine"] = "9";
    Rank["Ten"] = "10";
    Rank["Jack"] = "J";
    Rank["Queen"] = "Q";
    Rank["King"] = "K";
    Rank["Ace"] = "A";
})(Rank || (exports.Rank = Rank = {}));
var Suit;
(function (Suit) {
    Suit["Hearts"] = "\u2665\uFE0F";
    Suit["Diamonds"] = "\u2666\uFE0F";
    Suit["Clubs"] = "\u2663\uFE0F";
    Suit["Spades"] = "\u2660\uFE0F";
})(Suit || (exports.Suit = Suit = {}));
const generateDeck = () => {
    const suits = Object.values(Suit);
    const ranks = Object.values(Rank);
    const deck = suits.reduce((acc, suit) => [
        ...acc,
        ...ranks.map((rank) => ({
            suit,
            rank,
            value: (0, exports.getValueForRank)(rank),
        })),
    ], []);
    const shuffledDeck = deck.reduce((acc, card) => {
        const randomIndex = Math.floor(Math.random() * (acc.length + 1));
        acc.splice(randomIndex, 0, card);
        return acc;
    }, []);
    return shuffledDeck;
};
exports.generateDeck = generateDeck;
const getValueForRank = (rank) => {
    if (rank === Rank.Ace)
        return 11; // Ace can be 1 or 11, handled during gameplay
    if (rank === Rank.Jack || rank === Rank.Queen || rank === Rank.King)
        return 10;
    return parseInt(rank);
};
exports.getValueForRank = getValueForRank;
const getHandPoints = (hand) => {
    let points = hand.reduce((sum, card) => sum + card.value, 0);
    // Check for Aces and adjust their value if needed
    const aces = hand.filter((card) => card.rank === Rank.Ace);
    aces.forEach(() => {
        if (points > 21) {
            points -= 10; // Change Ace value from 11 to 1
        }
    });
    return points;
};
exports.getHandPoints = getHandPoints;
