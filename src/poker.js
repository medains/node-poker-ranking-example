var PokerGameHelper = require('./pokerGameHelper'),
    async = require('async');

function Poker() {
}

Poker.helper = PokerGameHelper;

Poker.getWinnerString = function(gameid,callback) {
    var _game, _players;
    var self = this;
    function fetchGame(next) {
        self.helper.fetchGame(gameid,function(err,game){
            if( err ) return next(err);
            _game = game;
            next();
        });
    }
    function fetchPlayers(next) {
        _game.getPlayers(function(err,players){
            if( err ) return next(err);
            _players = players;
            next();
        });
    }
    async.series({
        getGame: fetchGame,
        getPlayers: fetchPlayers
        },
        function(err,results) {
            if(err) return callback(err);
            callback( null, '' );
        }
    );
}

module.exports = Poker;
