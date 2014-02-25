var assert = require('assert'),
    sinon = require('sinon'),
    util = require('util');
var poker = require('../src/poker');

describe('Poker', function(){
    describe('getWinnerString', function() {
        it('returns string', function(){
            assert.ok( typeof poker.getWinnerString(1) === 'String' );
        });
    });
});
