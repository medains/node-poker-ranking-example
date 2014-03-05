var PokerGameHelper = require('./pokerGameHelper'),
    async = require('async');

function Poker() {
}

Poker.helper = PokerGameHelper;

Poker.evaluateHand = function(hand,callback){
}

Poker.getWinnerString = function(gameid,callback) {
    var _game, _players, _hands, _handvalues;
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
    function fetchHands(next) {
        async.map(_players,_game.getHand,function(err,hands){
            if( err ) return next(err);
            _hands = hands;
            next();
        });
    }
    function fetchHandValues(next) {
        async.map(_hands,self.evaluateHand,function(err,handvalues){
            if( err ) return next(err);
            _handvalues = handvalues;
            next();
        });
    }
    async.series({
        getGame: fetchGame,
        getPlayers: fetchPlayers,
        getHands: fetchHands,
        evalHands: fetchHandValues
        },
        function(err,results) {
            if(err) return callback(err);
            callback( null, '' );
        }
    );
}

module.exports = Poker;
