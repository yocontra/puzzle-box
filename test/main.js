var box = require('../');
var should = require('should');
require('mocha');

describe('puzzle-box', function() {
  
  describe('create()', function() {
    it('should create a new box', function(done) {
      var puzzle = box.create();
      should.exist(puzzle);
      done();
    });
  });

});
