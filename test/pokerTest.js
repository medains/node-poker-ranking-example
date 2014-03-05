var assert = require('assert'),
    sinon = require('sinon'),
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
});
