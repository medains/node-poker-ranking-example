function PokerGameHelper() {
}

PokerGameHelper.fetchGame = function(gameid,callback) {
    callback( new Error( "Accessing MYSQL, DOH!" ) );
}

module.exports = PokerGameHelper;
