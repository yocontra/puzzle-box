const EventEmitter = require('events').EventEmitter;
const util = require('util');
const { NodeVM } = require('vm2');
const fondue = require('fondue');
const mpath = require('mpath');

const defaultRequirePolicy = {
  external: false,
  builtin: [ '*' ]
}
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
  this._code = fondue.instrument(code, {nodejs: true}).toString();
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
    const args = arguments;
    process.nextTick(function(){
      that._finish.apply(that, args);
    });
  };
  const req = this._context.require || defaultRequirePolicy;
  this._context.console = this._context.console || console;
  this._sandbox = new NodeVM({
    require: req,
    sandbox: this._context
  });
  return this;
};

// get the sandbox data
PuzzleBox.prototype.sandbox = function(){
  return this._context;
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
  process.nextTick(() => {
    try {
      this._sandbox.run(this._code, 'vm.js');
    } catch (e) {
      this._tracer = this.sandbox().__tracer;
      this.emit('error', e);
    }
  })
  return this;
};

// fn called by the internal vm to emit the event
PuzzleBox.prototype._finish = function() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift('finished');
  this.emit.call(this, args);
}
// clear the memory
PuzzleBox.prototype.dispose = function(){
  if (this._sandbox) {
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