node-poker-ranking
==================

This repository contains base files to perform the expanded "Poker hand ranking"
code kata.

## Instructions for the Kata

#### Problem:
Your job is to compare sets of poker hands and to indicate which, if any, has a higher rank.

The helper classes `PokerGame` and `PokerGameHelper` must be used - but not implemented - as part of this kata.  Stubs have been provided.

The PokerGameHelper is used to get a PokerGame from a data store of some kind, from the provided "game Id".  The PokerGame class will provide an array of player id's, and each player id can be used to get the players hand.

The hand is represented at this point by a string containing cards separated by white space, like so: `"AH KH QD JS TH"`.  Each card has a single character indicating face value and another indicating suit.

Ultimately a call to "getWinnerString" on the Poker class should return a string such as "Player N wins with HAND", where N is the player id and HAND describes the hand, e.g. "Player 2 wins with 2 pair Aces over Eights".   If two players tie, that should be indicated, e.g. "Player 3 and 4 tie with 8 high straight".

#### Comments:
The PokerGame and PokerGameHelper class exist mostly in order to provide some practice in dependency injection.

#### Setting up:

```
npm install
node_module/.bin/mocha -w
```

A failing test has already been written in test/pokerTest.js as a starting point.
