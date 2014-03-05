var assert = require('assert'),
    sinon = require('sinon'),
    util = require('util');
var poker = require('../src/poker');

describe('Poker', function(){
    describe('getWinnerString', function() {
        it('returns string', function(done){
            poker.getWinnerString(1,function(err,st) {
                assert.ok( typeof(st) === 'string' );
                done();
            });
        });
    });
});
