# Tween class

Simple tween class. It just does the math.

## API

#### Create new tween object

```javascript
var style = document.getElementById('foo').style,

    tween = new Tween({
        easing: 'linear',   // linear, swing, cubic-in, bounce-past, so on ...
        duration: 'normal', // slow|normal|fast or milliseconds

        onFrame: function( p ){
            style.left = 200 + 400*p + 'px'; // "p" is number between 0 and 1,
        }

        // onEnd: function(){},
        // onBeforeEnd: function(){},
        // onFPSUpdate: function(){},
        // onStart: function(){},
        // onPause: function(){},
        // onResume: function(){},
        // onReverse: function(){},
    });


    // Equivalent syntax
    tween = new Tween(function( p ){
        style.left = 200 + 400*p + 'px';
    }, {
        easing: 'linear',
        duration: 'normal'
    })
```

#### tween.start();
#### tween.start(delay);
#### tween.stop();
#### tween.stop(clearQueue);
#### tween.pause();
#### tween.resume();
#### tween.reverse();
#### tween.restart();
#### tween.finish();

## Properties
#### tween.reversed
#### tween.state

```javascript
if( tween.state === Tween.states.READY ){
    // ...
}
```

```javascript
states: {
    'READY':    READY,
    'TWEEN':    TWEEN,
    'DELAY':    DELAY,
    'PAUSED':   PAUSED,
    'STOPPING': STOPPING
}
```

## Events
#### onFrame: function(p){}
#### onEnd: function(){}
#### onBeforeEnd: function(){}
#### onStart: function(){}
#### onPause: function(){}
#### onResume: function(){}
#### onReverse: function(){}

## More

```javascript
Tween.setFPSCounterListener(function(fps){
    console.log(fps);
});
```

## NOTES

See demos in /demos folder.

## Licence
MIT

Copyright (C) 2012 Ivailo Hristov

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
