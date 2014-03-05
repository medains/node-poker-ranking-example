var PokerGameHelper = require('./pokerGameHelper'),
    async = require('async');

function Poker() {
}

Poker.STRAIGHT_FLUSH  = 8;
Poker.FOUR_OF_A_KIND  = 7;
Poker.FULL_HOUSE      = 6;
Poker.FLUSH           = 5;
Poker.STRAIGHT        = 4;
Poker.THREE_OF_A_KIND = 3;
Poker.TWO_PAIR        = 2;
Poker.ONE_PAIR        = 1;
Poker.HIGH_CARD       = 0;

Poker.helper = PokerGameHelper;

function getName(v,cap){
    switch(v){
        case 13: return cap?'King':'king';
        case 12: return cap?'Queen':'queen';
        case 11: return cap?'Jack':'jack';
        case 10: return cap?'Ten':'ten';
        case 9: return cap?'Nine':'nine';
        case 8: return cap?'Eight':'eight';
        case 7: return cap?'Seven':'seven';
        case 6: return cap?'Six':'six';
        case 5: return cap?'Five':'five';
        case 4: return cap?'Four':'four';
        case 3: return cap?'Three':'three';
        case 2: return cap?'Two':'two';
        case 14:
        case 0: return cap?'Ace':'ace';
    }
}
Poker.evaluateHand = function(hand,callback){
    var result = {
        type: this.HIGH_CARD,
        value: 0,
        desc: 'Straight flush'
    };
    var cards = hand.split(/ /);
    var nums =  {'A':0,'K':13,'Q':12,'J':11,'T':10,'9':9,'8':8,'7':7,'6':6,'5':5,'4':4 ,'3':3,'2':2};
    var values = {'A':0,'K':0,'Q':0,'J':0,'T':0,'9':0,'8':0,'7':0,'6':0,'5':0,'4':0,'3':0,'2':0};
    var suits = {'C':0,'D':0,'H':0,'S':0};
    var most = 0;
    var mostValue = 0;
    var mostSuit = 0;
    var pairCount = 0;
    var lowest = 14;
    var highest = 0;
    var threeVal = 0;
    var pairVals = [];
    cards.forEach(function(card){
        var faceCard = card[0];
        var faceValue = nums[faceCard];
        var suit = card[1];
        if( faceValue ) {
            if( faceValue < lowest ) lowest = faceValue;
            if( faceValue > highest ) highest = faceValue;
        }
        values[faceCard]++;
        if( values[faceCard] > most) {
            most = values[faceCard];
            mostValue = faceValue;
        }
        if( values[faceCard] == 2 ) {
            pairVals.push( faceValue );
            pairCount++;
        }
        if( values[faceCard] == 3 ) {
            if( pairVals[0] == faceValue ) {
                pairVals.shift();
            } else {
                pairVals.pop();
            }
            threeVal = faceValue;
            pairCount--;
        }
        suits[suit]++;
        if( suits[suit] > mostSuit ) {
            mostSuit = suits[suit];
        }
    });
    var range = highest - lowest;
    var handValue = 0;
    nums['A']=14;
    ['A','K','Q','J','T','9','8','7','6','5','4','3','2'].forEach(function(key){
        handValue += values[key] * nums[key];
        if( values[key] > 0 ) {
            handValue *= 15;
        }
    });
    result.value = handValue;
    if( range == 4 && most == 1 && values['A'] == 0 ) {
        if( mostSuit == 5 ) {
            result.type = this.STRAIGHT_FLUSH;
            result.desc = getName(highest,true)+ ' high straight flush';
        } else {
            result.type = this.STRAIGHT;
            result.desc = getName(highest,true)+ ' high straight';
        }
    } else if( range == 3 && most == 1 && values['A'] == 1 && (values['2'] == 1 || values['K'] == 1 ) ) {
        if( mostSuit == 5 ) {
            result.type = this.STRAIGHT_FLUSH;
            if( values['K'] > 0 ) {
                result.desc = 'Royal flush';
            }
        } else {
            result.type = this.STRAIGHT;
            if( values['K'] > 0 ) {
                result.desc = 'Ace high straight';
            } else {
                result.desc = getName(highest,true) + ' high straight';
            }
        }
    } else if( mostSuit == 5 ) {
        result.type = this.FLUSH;
        result.desc = 'Flush';
    } else if( most == 4 ) {
        result.type = this.FOUR_OF_A_KIND;
        result.desc = 'Four ' + getName(mostValue,false) + 's';
    } else if( most == 3 ) {
        if( pairCount == 1 ) {
            result.type = this.FULL_HOUSE;
            result.desc = 'Full house, ' + getName(threeVal,false) + 's over ' +
                getName(pairVals[0],false) + 's';
        } else {
            result.type = this.THREE_OF_A_KIND;
            result.desc = 'Three ' + getName(mostValue,false) + 's';
        }
    } else if( pairCount == 2 ) {
        result.type = this.TWO_PAIR;
        pairVals.sort(function(a,b){
            if( b == 0 ) return 1;
            if( a == 0 ) return -1;
            return b-a;
        });
        result.desc = 'Two pairs, ' + getName(pairVals[0],false) + 's over ' +
            getName(pairVals[1],false) + 's';
    } else if( pairCount == 1 ) {
        result.type = this.ONE_PAIR;
        result.desc = 'Pair of ' + getName(pairVals[0],false) + 's';
    } else {
        if( values['A'] > 0 ) {
            result.desc = getName(0,true) + " high";
        } else {
            result.desc = getName(highest,true) + " high";
        }
    }
    callback( null, result );
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
                } else {
                    var last = result.players.pop();
                    str = "Players " + result.players.join(", ") + " and " + last + " win with " + result.out;
                }
                callback( null, str );
            });
        }
    );
}

module.exports = Poker;
