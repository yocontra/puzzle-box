var box = require('../');
var should = require('should');
require('mocha');

describe('PuzzleBox', function() {
  describe('context()', function() {
    it('should set the context', function(done) {
      var puzzle = box.create();
      puzzle.context({test:'hello!'});
      should.exist(puzzle._context);
      done();
    });
  });

  describe('code()', function() {
    it('should set the code', function(done) {
      var puzzle = box.create();
      puzzle.code('test = 123;');
      should.exist(puzzle._code);
      done();
    });
  });

  describe('build()', function() {
    it('should create a sandbox from the context', function(done) {
      var puzzle = box.create();
      puzzle.context({test:'hello!'});
      puzzle.build();
      should.exist(puzzle._sandbox);
      should.exist(puzzle.sandbox().test);
      puzzle.sandbox().test.should.equal('hello!');
      done();
    });
  });

  describe('run()', function() {
    it('should execute the code and emit finished', function(done) {
      var puzzle = box.create();
      var run = false;

      puzzle.context({
        test: function(a){
          run = true;
          return a;
        }
      });
      puzzle.track('test');
      puzzle.code('test(123);finished();');
      puzzle.run();

      puzzle.on('finished', function(){
        run.should.equal(true);
        done();
      });
    });

    it('should execute the code and emit finished with arguments', function(done) {
      var puzzle = box.create();
      var run = false;

      puzzle.context({
        test: function(a){
          run = true;
          return a;
        }
      });
      puzzle.track('test');
      puzzle.code('finished(test(123));');
      puzzle.run();

      puzzle.on('finished', function(arg){
        run.should.equal(true);
        should.exist(arg);
        arg.should.equal(123);
        done();
      });
    });
  });

  describe('track()', function() {
    it('should track calls to functions as events', function(done) {
      var puzzle = box.create();
      puzzle.context({
        test: function(a){
          return a+100;
        }
      });
      puzzle.track('test');
      puzzle.code('test(123);');
      puzzle.on('call', function(call){
        should.exist(call);
        should.exist(call.fn);
        should.exist(call.args);
        should.exist(call.result);
        call.fn.should.equal('test');
        call.args.should.eql([123]);
        call.result.should.eql(223);
        done();
      });
      puzzle.run();
    });

    it('should track calls to functions in an array', function(done) {
      var puzzle = box.create();
      puzzle.context({
        test: function(a){
          return a+100;
        }
      });
      puzzle.track('test');
      puzzle.code('test(123);finished();');

      puzzle.on('finished', function(){
        var call = puzzle.calls()[0];
        should.exist(call);
        should.exist(call.fn);
        should.exist(call.args);
        should.exist(call.result);
        call.fn.should.equal('test');
        call.args.should.eql([123]);
        call.result.should.eql(223);
        done();
      });
      puzzle.run();
    });

    it('should track nested calls to functions', function(done) {
      var puzzle = box.create();
      puzzle.context({
        test: {
          add: function(a){
            return a+100;
          }
        }
      });
      puzzle.track('test.add');
      puzzle.code('test.add(123);finished();');

      puzzle.on('finished', function(){
        var call = puzzle.calls()[0];
        should.exist(call);
        should.exist(call.fn);
        should.exist(call.args);
        should.exist(call.result);
        call.fn.should.equal('test.add');
        call.args.should.eql([123]);
        call.result.should.eql(223);
        done();
      });
      puzzle.run();
    });
  });
  describe('dispose()', function() {
    it('should clear after running', function(done) {
      var puzzle = box.create();
      var run = false;
      puzzle.context({
        test: function(a){
          run = true;
          return a;
        }
      });
      puzzle.track('test');
      puzzle.code('test(123);finished();');
      puzzle.run();

      puzzle.on('finished', function(){
        run.should.equal(true);
        puzzle.dispose();
        should.not.exist(puzzle._sandbox);
        done();
      });
    });
  });
});
