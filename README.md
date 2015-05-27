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
<td>>= 0.4</td>
</tr>
</table>

## Usage

This was made to be used by blackboard.

```javascript
var puzzleBox = require('../');

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

## LICENSE

(MIT License)

Copyright (c) 2013 Fractal <contact@wearefractal.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
