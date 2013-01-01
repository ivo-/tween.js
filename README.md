# Tween class

Simple tween class. It just calculates tween progress, you decide what to do with it.

## Features

- Customisable
- Variety of use cases( see demos )
- Highly optimized
- Supports variety of easing equations
- Gives you full run-time control of your tween

## API

#### Create new tween object

```javascript
var style = document.getElementById('foo').style,

    tween = new Tween({
        easing: 'linear',   // linear, swing, cubic-in, bounce-past, so on ...
        duration: 'normal', // slow|normal|fast or milliseconds

        onFrame: function( p ){ // Frame function
            // Animate element`s left from 200 to 600 px
            //
            // "p" is tween progress which is number between 0 and 1,
            // in most of the cases you should multiply it to your delta
            // position(difference between start and end position).
            // 
            style.left = 200 + 400*p + 'px';
        }

        // More events
        //
        // SEE: events docs
        //
        // onEnd: function(){},
        // onBeforeEnd: function(){},
        // onFPSUpdate: function(){},
        // onStart: function(){},
        // onPause: function(){},
        // onResume: function(){},
        // onReverse: function(){},
    });

    
    // Equivalent syntax
    //
    tween = new Tween(function( p ){
            // Animate element`s left from 200 to 600 px
            //
            style.left = 200 + 400*p + 'px';
    }, {
        easing: 'linear',
        duration: 'normal'
    })
```

#### tween.start(delay);
Start the tween from beginning wtih optional delay.

#### tween.stop(clearQueue);
Stops current animation and optional clears animations queue.

#### tween.pause();
#### tween.resume();


#### tween.reverse();
Reverse animation in opposite direction.

#### tween.restart();
#### tween.finish();

## Properties
#### tween.reversed
#### tween.state
Current Tween state. It will be one of the following. You can check state with following: 
```javascript
if( tween.state === Tween.states.READY ){
    // do something
}
```

Complete list of states:

```javascript
states: {
    'READY':            READY,
    'TWEEN':            TWEEN,
    'DELAY':            DELAY,
    'PAUSED':           PAUSED,
    'STOPPING':         STOPPING
}
```

## Events
#### onFrame: function(p){}
Here you must write your animation code.

#### onEnd: function(){}
#### onBeforeEnd: function(){}
Why do we need this event? It allow you to do many interesting things. By returning false you will prevent animation end. This can be used in very creative ways: reverse/restart/ animation, play new one without ending current, play last frame may times so on ...

#### onStart: function(){}
#### onPause: function(){}
#### onResume: function(){}
#### onReverse: function(){}

## Static
#### Tween.round(num)
Super optimized round function. It is useful to prevent anti-aliasing when drawing on canvas.

#### Tween.useAnimationFrame()
Use requestAnimationFrame as timer.( this is default )

#### Tween.useSetTimeoutFrame()
Use setTimeout as timer.

#### Tween.setTimeoutFPS(fps)
Use target fps for setTimeout in case it is used. Default is 60fps. 

#### Tween.setFPSCounterListener(function(fps){ console.log(fps); });
You can use this event to make fps counter. This function will be called every second with detected fps count.

#### Tween.removeFPSCounterListener()
Remove FPSCounterListener if there is any.

## NOTES 
TODO: List supported easing equations.( you can view the source )

See demos in /demos folder.

## Licence
MIT

Copyright (C) 2012 Ivailo Hristov <http://ivailohristov.net/>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
