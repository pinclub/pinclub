var app = require('../../../app');
var request = require('supertest')(app);
var should = require('should');
var hammingdistance = require('hamming-distance');
var support = require('../../support/support');

describe('test/api/v2/image.test.js', function () {
    it('should generate similar hashes for similar images', function() {
        console.info(hammingdistance('1001010010110101010010100100111000010001011100010100101111110010', '1000010110010100001100101010011000010110010101010111001001111011'));
    });
});
