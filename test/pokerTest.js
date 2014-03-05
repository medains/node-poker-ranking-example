var assert = require('assert'),
    sinon = require('sinon'),
    util = require('util');
var poker = require('../src/poker');

describe('Poker', function(){
    describe('getWinnerString', function() {
        var helper;
        var game;
        function setupHands(hands){
            Object.keys(hands).forEach(function(player){
                game.getHand.withArgs(player).yields(null, hands[player]);
            });
        }
        beforeEach(function(done){
            helper = poker.helper;
            poker.helper = {
                fetchGame: sinon.stub()
            };
            game = {
                getPlayers : sinon.stub(),
                getHand    : sinon.stub()
            };
            game.getPlayers.yields(null,[]);
            game.getHand.yields(null,"");
            poker.helper.fetchGame.yields(null,game);
            done();
        });
        afterEach(function(done){
            poker.helper = helper;
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
                done();
            });
        });
    });
});
