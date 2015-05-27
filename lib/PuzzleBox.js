var EventEmitter = require('events').EventEmitter;
var util = require('util');
var contextify = require('contextify');
var fondue = require('fondue');
var mpath = require('mpath');

function PuzzleBox(opt) {
  EventEmitter.call(this);
  this.options = opt;
  this._code = '';
  this._calls = [];
  this._context = {};
  this._tracers = null;
}

util.inherits(PuzzleBox, EventEmitter);

// set the code
PuzzleBox.prototype.code = function(code) {
  require('fs').writeFileSync('/Users/contra/Desktop/fondue.js', fondue.instrument(code).toString());
  this._code = code;//fondue.instrument(code).toString();
  return this;
};

// set the context object
PuzzleBox.prototype.context = function(context) {
  this.dispose();
  this._context = context;
  return this;
};

// spy on things in the context
// TODO: field accesses and sets
PuzzleBox.prototype.track = function(key, cb) {
  var newFn = this.createReplacement(key, mpath.get(key, this._context));
  mpath.set(key, newFn, this._context);
  return this;
};

// create the sandbox
PuzzleBox.prototype.build = function() {
  // create a global callback
  var that = this;
  this._context.__tracer = undefined;
  this._context.finished = function(){
    var args = Array.prototype.slice.call(arguments);
    args.unshift('finished');
    process.nextTick(function(){
      that.emit.apply(that, args);
    });
  };

  this._sandbox = contextify(this._context);
  return this;
};

// get the sandbox data
PuzzleBox.prototype.sandbox = function(){
  return this._sandbox.getGlobal();
};

// get the call data
PuzzleBox.prototype.calls = function(){
  return this._calls;
};

// return the fondue tracer
PuzzleBox.prototype.tracer = function(){
  return this._tracer;
};

// build and execute the code
PuzzleBox.prototype.run = function() {
  this.build();
  this.emit('started');
  this._sandbox.run(this._code);
  this._tracer = this.sandbox().__tracer;
  return this;
};

// clear the memory
PuzzleBox.prototype.dispose = function(){
  if (this._sandbox) {
    this._sandbox.dispose();
    delete this._sandbox;
  }
  return this;
};

// wrap a function
// TODO: also wrap this in a puzzle-box
PuzzleBox.prototype.createReplacement = function(name, fn) {
  var that = this;
  var outFn = function(){
    var args = Array.prototype.slice.call(arguments);
    var scope = this;
    var result = fn.apply(scope, arguments);
    var call = {
      fn: name,
      args: args,
      result: result,
      context: scope
    };
    that._calls.push(call);
    that.emit('call', call);
    return call.result;
  };
  return outFn;
};

module.exports = PuzzleBox;