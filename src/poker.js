var PokerGameHelper = require('./pokerGameHelper'),
    async = require('async');

function Poker() {
}

Poker.helper = PokerGameHelper;

Poker.evaluateHand = function(hand,callback){
}

Poker.getWinnerString = function(gameid,callback) {
    var _game, _players=[], _hands=[], _handvalues=[];
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
    function zip(arrays) {
        return Array.apply(null,Array(arrays[0].length)).map(function(_,i){
            return arrays.map(function(array){return array[i]})
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
            var r = zip( [_players, _handvalues] );
            async.reduce( r, {type:-1, value:-1, out:'', players:[]}, function(memo,item,next) {
                if( item[1].type > memo.type ) {
                    // new winner, better hand
                    memo.players = [ item[0] ];
                    memo.out = item[1].desc;
                    memo.type = item[1].type;
                    memo.value = item[1].value;
                } else if( item[1].type == memo.type ) {
                    if( item[1].value > memo.value ) {
                        // new winner, same hand, but better value
                        memo.players = [ item[0] ];
                        memo.out = item[1].desc;
                        memo.type = item[1].type;
                        memo.value = item[1].value;
                    } else {
                        if( item[1].value == memo.value ) {
                            // joint winner
                            memo.players.push( item[0] );
                        }
                    }
                }
                next(null, memo);
            },function(err,result){
                if( err ) return callback(err);
                if( !result.players || result.players.length == 0 ) {
                    return callback( null, 'No winner' );
                }
                var str = '';
                if( result.players.length == 1 ) {
                    str = "Player " + result.players[0] + " wins with " + result.out;
                }
                callback( null, str );
            });
        }
    );
}

module.exports = Poker;
