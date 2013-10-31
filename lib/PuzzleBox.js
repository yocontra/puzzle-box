var EventEmitter = require('events').EventEmitter;
var util = require('util');

var contextify = require('contextify');

function PuzzleBox() {
  EventEmitter.call(this);
  this._code = "";
  this._calls = [];
}

util.inherits(PuzzleBox, EventEmitter);

// set the code
PuzzleBox.prototype.code = function(code) {
  this._code = code;
  return this;
};

// set the context object
PuzzleBox.prototype.context = function(context) {
  this.dispose();
  this._context = context;
  return this;
};

// spy on things in the context
// TODO: nested values
// TODO: field accesses and sets
PuzzleBox.prototype.track = function(key, cb) {
  this._context[key] = this.createReplacement(key, this._context[key]);
  return this;
};

// create the sandbox
PuzzleBox.prototype.build = function() {
  // create a global callback
  var that = this;
  this._context.finished = function(){
    process.nextTick(function(){
      that.emit('finished');
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

// build and execute the code
PuzzleBox.prototype.run = function() {
  this.build();
  this.emit('started');
  this._sandbox.run(this._code);
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
PuzzleBox.prototype.createReplacement = function(name, fn) {
  var that = this;
  var outFn = function(){
    var args = Array.prototype.slice.call(arguments);
    var scope = this;
    var result = fn.apply(scope, arguments);
    var call = {
      fn: name,
      args: args,
      result: result
    };
    that._calls.push(call);
    that.emit('call', call);
    return call.result;
  };
  return outFn;
};

module.exports = PuzzleBox;