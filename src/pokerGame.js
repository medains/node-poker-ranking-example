function PokerGame() {
}

PokerGame.getPlayers = function(callback) {
    callback(new Error( "Accessing model data" ));
}

PokerGame.getHand = function(player,callback) {
    callback(new Error( "Accessing model data" ));
}

module.exports = PokerGame;
