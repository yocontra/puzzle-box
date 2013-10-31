var puzzleBox = require('../');

var test = puzzleBox.create();

// set a global context for the sandbox
test.context({
  add: function(a, b){
    return a+b;
  }
});

// specify the code to execute
// a global function called finished will be created
// in the sandbox. call this when you are done
test.code('add(1,2); var hi = 123; finished();');

// track calls to a function in the context
test.track('add');

// execute the code in the sandbox
test.run();

test.on('finished', function(){
  // you can get a list of function calls
  // in order with name, arguments, and return value
  console.log(test.calls()); // logs [ { fn: 'add', args: [ 1, 2 ], result: 3 } ]

  // you can access the sandbox context
  // this means you can check if values have been
  // modified, created, or removed
  // in the process of running the code
  console.log(test.sandbox().hi); // logs 123

  // free the memory when we are done
  test.dispose();
});