var assert = require('assert'),
    sinon = require('sinon'),
    async = require('async'),
    util = require('util');
var poker = require('../src/poker');

describe('Poker', function(){
    describe('getWinnerString', function() {
        var helper;
        var game;
        var hands;
        function setupHands(_hands){
            hands = _hands;
        }
        beforeEach(function(done){
            helper = poker.helper;
            poker.helper = {
                fetchGame: sinon.stub()
            };
            game = {
                getPlayers : sinon.stub(),
                getHand    : sinon.spy(function(player,callback){
                    if( hands[player] ) {
                        return callback(null, hands[player]);
                    }
                    callback( null, "" );
                })
            };
            game.getPlayers.yields(null,[]);
            poker.helper.fetchGame.yields(null,game);
            sinon.stub(poker,'evaluateHand').yields(null,{type:0,value:0,desc:""});
            done();
        });
        afterEach(function(done){
            poker.helper = helper;
            poker.evaluateHand.restore();
            done();
        });
        it('returns string', function(done){
            poker.getWinnerString(1,function(err,st) {
                assert.ok( typeof(st) === 'string' );
                done();
            });
        });
        it('fetches the game data', function(done){
            poker.getWinnerString(1,function(err,st) {
                sinon.assert.calledOnce( poker.helper.fetchGame );
                done();
            });
        });
        it('fetches the players from the game', function(done) {
            poker.getWinnerString(1,function(err,st) {
                sinon.assert.calledOnce( game.getPlayers );
                done();
            });
        });
        it('fetches the hands for each player (no players)', function(done) {
            poker.getWinnerString(1,function(err,st) {
                sinon.assert.callCount( game.getHand, 0 );
                done();
            });
        });
        it('fetches the hands for each player (3 players)', function(done) {
            game.getPlayers.yields(null,[1,2,3]);
            setupHands({1:"",2:"",3:""});
            poker.getWinnerString(1,function(err,st) {
                sinon.assert.callCount( game.getHand, 3 );
                sinon.assert.calledWith( game.getHand, 1 );
                sinon.assert.calledWith( game.getHand, 2 );
                sinon.assert.calledWith( game.getHand, 3 );
                done();
            });
        });
        it('evaluates each hand', function(done) {
            game.getPlayers.yields(null,[1,2]);
            setupHands({1:"hand a",2:"hand b"});
            poker.getWinnerString(1,function(err,st) {
                sinon.assert.callCount( poker.evaluateHand, 2 );
                sinon.assert.calledWith( poker.evaluateHand, "hand a" );
                sinon.assert.calledWith( poker.evaluateHand, "hand b" );
                done();
            });
        });
        it('reduces evalulated hands to winner string', function(done) {
            game.getPlayers.yields(null,[1,2,3]);
            setupHands({1:"hand a",2:"hand b",3:"hand c"});
            poker.evaluateHand.reset();
            poker.evaluateHand.withArgs("hand c").yields(null,{type:1,value:1,desc:'Winning hand'});
            poker.evaluateHand.withArgs("hand b").yields(null,{type:0,value:0,desc:'Losing hand'});
            poker.evaluateHand.withArgs("hand a").yields(null,{type:1,value:0,desc:'Losing hand'});
            poker.getWinnerString(1,function(err,st) {
                assert.equal( st, "Player 3 wins with Winning hand" );
                done();
            });
        });
        it('reduces evalulated hands to winner string (joint winners)', function(done) {
            game.getPlayers.yields(null,[1,2,3]);
            setupHands({1:"hand a",2:"hand b",3:"hand c"});
            poker.evaluateHand.reset();
            poker.evaluateHand.withArgs("hand a").yields(null,{type:1,value:0,desc:'Winning hand'});
            poker.evaluateHand.withArgs("hand b").yields(null,{type:1,value:0,desc:'Winning hand'});
            poker.evaluateHand.withArgs("hand c").yields(null,{type:0,value:0,desc:'Losing hand'});
            poker.getWinnerString(1,function(err,st) {
                assert.equal( st, "Players 1 and 2 win with Winning hand" );
                done();
            });
        });
        it('reduces evalulated hands to winner string (three winners)', function(done) {
            game.getPlayers.yields(null,[1,2,3]);
            setupHands({1:"hand a",2:"hand b",3:"hand c"});
            poker.evaluateHand.reset();
            poker.evaluateHand.yields(null,{type:1,value:0,desc:'Winning hand'});
            poker.getWinnerString(1,function(err,st) {
                assert.equal( st, "Players 1, 2 and 3 win with Winning hand" );
                done();
            });
        });
    });
    describe('evaluateHand',function(){
        var results = {};
        var hands = [
    { key: 'Royal flush in diamonds', desc: 'Royal flush',
        cards: 'AD KD QD JD TD', type: poker.STRAIGHT_FLUSH,  },
    { key: 'King high Straight flush', desc: 'King high straight flush',
        cards: 'KD QD JD TD 9D', type: poker.STRAIGHT_FLUSH,  },
    { key: 'Royal flush in hearts', desc: 'Royal flush',
        cards: 'AH KH QH JH TH', type: poker.STRAIGHT_FLUSH,  },
    { key: 'Four aces', desc: 'Four aces',
        cards: 'AH AD AC AS TH', type: poker.FOUR_OF_A_KIND,  },
    { key: 'Full house', desc: 'Full house, aces over tens',
        cards: 'AD AH AC TS TD', type: poker.FULL_HOUSE,  },
    { key: 'Flush', desc: 'Flush',
        cards: '9D 6D 5D 4D 2D', type: poker.FLUSH,  },
    { key: 'Straight', desc: 'Ace high straight',
        cards: 'AC KD QD JD TD', type: poker.STRAIGHT,  },
    { key: 'Three of a kind', desc: 'Three aces',
        cards: 'AD AH AC 7S TD', type: poker.THREE_OF_A_KIND,  },
    { key: 'Two pair 8/7', desc: 'Two pairs, eights over sevens',
        cards: '8D 8H 7C 7S TD', type: poker.TWO_PAIR,  },
    { key: 'Two pair A/8', desc: 'Two pairs, aces over eights',
        cards: 'AD 8H AC 8S TD', type: poker.TWO_PAIR,  },
    { key: 'Pair of eights', desc: 'Pair of eights',
        cards: '8D 8H 3C 7S TD', type: poker.ONE_PAIR,  },
    { key: 'Seven High', desc: 'Seven high',
        cards: '7D 6H 5C 4S 2D', type: poker.HIGH_CARD,  },
    { key: 'Pair of twos', desc: 'Pair of twos',
        cards: '2D 2S 3S 4S 5D', type: poker.ONE_PAIR,  },
    { key: 'Ace High', desc: 'Ace high',
        cards: 'AH 6H 5D 4S 2H', type: poker.HIGH_CARD,  },
    { key: 'Ace High low kicker', desc: 'Ace high',
        cards: 'AD 6D 5H 4C 3H', type: poker.HIGH_CARD,  },
        ];
        var compare_types = [
            // Equal types of hands
            { first: 'Royal flush in diamonds', second: 'King high Straight flush', equal: true },
            { first: 'Royal flush in diamonds', second: 'Royal flush in hearts', equal: true },
            { first: 'Ace High', second: 'Seven High', equal: true },
            { first: 'Ace High', second: 'Ace High low kicker', equal: true },
            { first: 'Pair of twos', second: 'Pair of eights', equal: true },
            { first: 'Two pair A/8', second: 'Two pair 8/7', equal: true },
            // Ensure hand order is correct
            { first: 'King high Straight flush', second: 'Four aces', equal: false },
            { first: 'Four aces', second: 'Full house', equal: false },
            { first: 'Full house', second: 'Flush', equal: false },
            { first: 'Flush', second: 'Straight', equal: false },
            { first: 'Straight', second: 'Three of a kind', equal: false },
            { first: 'Three of a kind', second: 'Two pair A/8', equal: false },
            { first: 'Two pair 8/7', second: 'Pair of twos', equal: false },
            { first: 'Pair of twos', second: 'Ace High', equal: false },
        ];
        var compare_values = [
            // Some hands really are equal
            { first: 'Royal flush in diamonds', second: 'Royal flush in hearts', equal: true },
            // Differences within a type of hand
            { first: 'Royal flush in diamonds', second: 'King high Straight flush', equal: false },
            // highest card
            { first: 'Ace High', second: 'Seven High', equal: false },
            // two pair values
            { first: 'Two pair A/8', second: 'Two pair 8/7', equal: false },
            // Lowest card kicker
            { first: 'Ace High low kicker', second: 'Ace High', equal: false },
        ];
        before(function(done){
            async.each(hands,function(hand,next){
                poker.evaluateHand(hand.cards,function(err,result){
                    if(err) return next(err);
                    results[hand.key] = result;
                    next();
                });
            },function(err){
                if(err) throw err;
                done();
            });
        });
        hands.forEach(function(hand){
            it('identifies a ' + hand.key, function() {
                assert.equal( results[hand.key].type, hand.type );
                assert.equal( results[hand.key].desc, hand.desc );
            });
        });
        compare_types.forEach(function(data){
            it('returns ' + (data.equal?'the same':'a higher') + ' type for ' +
               data.first + ' in comparison to ' + data.second, function(){
               if( data.equal ) {
                   assert.equal( results[data.first].type, results[data.second].type );
               } else {
                   assert.ok( results[data.first].type > results[data.second].type );
               }
            });
        });
        compare_values.forEach(function(data){
            it('returns ' + (data.equal?'the same':'a higher') + ' value for ' +
               data.first + ' in comparison to ' + data.second, function(){
               if( data.equal ) {
                   assert.equal( results[data.first].value, results[data.second].value );
               } else {
                   assert.ok( results[data.first].value > results[data.second].value );
               }
            });
        });
    });
});
