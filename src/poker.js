var PokerGameHelper = require('./pokerGameHelper');

function Poker() {
}

Poker.helper = PokerGameHelper;

Poker.getWinnerString = function(gameid,callback) {
    this.helper.fetchGame(gameid,function(err,game){
        callback(null,'');
    });
}

module.exports = Poker;
