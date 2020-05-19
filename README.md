[![Build Status](https://travis-ci.org/wearefractal/puzzle-box.png?branch=master)](https://travis-ci.org/wearefractal/puzzle-box)

[![NPM version](https://badge.fury.io/js/puzzle-box.png)](http://badge.fury.io/js/puzzle-box)

## Information

<table>
<tr>
<td>Package</td><td>puzzle-box</td>
</tr>
<tr>
<td>Description</td>
<td>Sandboxing with call tracing and more</td>
</tr>
<tr>
<td>Node Version</td>
<td>>= 10</td>
</tr>
</table>

## Usage

This was made to be used by blackboard.

```javascript
var puzzleBox = require('puzzle-box');

var test = puzzleBox.create();

// set a global context for the sandbox
test.context({
  math: {
    add: function(a, b){
      return a+b;
    }
  }
});

// specify the code to execute
// a global function called finished will be created
// in the sandbox. call this when you are done
test.code('add(1,2); var hi = 123; finished();');

// track calls to a function in the context
test.track('math.add');

// execute the code in the sandbox
test.run();

test.on('finished', function(){
  // you can get a list of function calls
  // in order with name, arguments, and return value
  console.log(test.calls()); // logs [ { fn: 'math.add', args: [ 1, 2 ], result: 3 } ]

  // you can access the sandbox context
  // this means you can check if values have been
  // modified, created, or removed
  // in the process of running the code
  console.log(test.sandbox().hi); // logs 123

  // free the memory when we are done
  test.dispose();
});
```

## Examples

You can view more examples in the [example folder.](https://github.com/wearefractal/puzzle-box/tree/master/examples)