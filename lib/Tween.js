/**
 * JavaScript Tween Class
 *
 * Copyright (c) 2012 Ivailo Hristov( http://ivailohristov.net/ )
 *
 * MIT Licensed
 *
 */

(function( exports, undefined ){
    'use strict';

    var
    // Timeout stepper target fps
    //
    //	NOTE: for rAF target is 60fps
    //
        noAnimationTargetFPS = 1000/60,

    // Listener that will be called on each fps detect
        fpsCounterListener = null,

    // Simple timeout stepper
    //
        requestFrame = function( callback ){
            setTimeout( callback, noAnimationTargetFPS );
        },

    // Shim by Paul Irish
    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    //
        requestAnimationFrame =
            exports.requestAnimationFrame       ||
                    webkitRequestAnimationFrame ||
                    mozRequestAnimationFrame    ||
                    oRequestAnimationFrame      ||
                    msRequestAnimationFrame     ||

            requestFrame
        ,

    // Set rAF as default stepper
        requestNextFrame = requestAnimationFrame;

    if( !Array.prototype.forEach ){
        Array.prototype.forEach = function(fn, scope) {
            for(var i = 0, len = this.length; i < len; ++i) {
                fn.call(scope || this, this[i], i, this);
            }
        }
    }

    if( !String.prototype.trim ){
        var lTrim = /^\s\s*/;
        var rTrim = /\s\s*$/;

        String.prototype.trim = function(){
            return this.replace( lTrim, '' ).replace( rTrim, '' );
        };
    }

    if( !Array.isArray ){
        Array.isArray = function( vArg ){
            return Object.prototype.toString.call(vArg) === "[object Array]";
        };
    }

    // State constants
    //
    var TWEEN           = 'tween',
        READY           = 'ready',
        DELAY           = 'delay',
        PAUSED          = 'paused',
        REVERSE         = 'reverse',
        STOPPING        = 'stopping';

    // Class
    //
    var Tween = exports.Tween = function( frame, opts ){
        if( opts === undefined && frame === undefined ){
            throw 'Tween constructor requires one or two parameters, but no parameters are passed.';
        }

        // If one parameter is passed, it
        //  should be options parameter
        if( frame && !opts ){
            opts = frame;
        } else {
            opts.onFrame = frame;
        }

        // Queue for all waiting actions
        // NOTE: this property is here because it should
        //  not be reset like any other prop
        this.queue = [];

        this.reset( opts );
    };

    Tween.fn = Tween.prototype = {};
    Tween.extend = Tween.fn.extend = function( destination, props ){
        if( props === undefined ){
            props = destination;

            // Set current context to be default destination
            // NOTE: this can be executed from different contexts, so use this
            destination = this;
        }

        for( var prop in props ){
            if( props.hasOwnProperty( prop ) ){
                destination[ prop ] = props[ prop ];
            }
        }

        return destination;
    };

    Tween.extend({
        // Change timer functions
        //
        useAnimationFrame: function(){
            requestNextFrame = requestAnimationFrame;
        },
        useSetTimeoutFrame: function(){
            requestNextFrame = requestFrame;
        },

        // Set no-animation timer target fps
        //
        setTimeoutFPS: function( fps ){
            noAnimationTargetFPS = 1000/fps;
        },

        // FPS listener methods
        //
        setFPSCounterListener: function( listener ){
            fpsCounterListener = listener;
        },
        removeFPSCounterListener: function(){
            fpsCounterListener = null;
        },

        // ForEach working with both arrays and objects
        //
        forEach: function( arr, func, thisArg ){
            if( Array.isArray( arr ) ){
                arr.forEach.apply( arr, arguments );
            } else {
                for( var name in arr ){
                    if( arr.hasOwnProperty(name) ){
                        func.call( thisArg, arr[name], name );
                    }
                }
            }
        },

        // Fastest is function implementation
        // http://jsperf.com/alternative-isfunction-implementations
        //
        isFunction: function( object ){
            return !!(object && object.constructor && object.call && object.apply);
        },

        defaults: {
            // Public
            //
            easing: 'linear',
            duration: 'normal',

            // Events
            //
            onFrame: function(){}
            // onEnd: function(){},
            // onBeforeEnd: function(){},
            // onStart: function(){},
            // onPause: function(){},
            // onResume: function(){},
            // onReverse: function(){},
        },

        // SEE: at the bottom
        easing: {},

        states: {
            'READY':            READY,
            'TWEEN':            TWEEN,
            'DELAY':            DELAY,
            'PAUSED':           PAUSED,
            'STOPPING':         STOPPING
        },

        durations: {
            "slow": 900,
            "normal": 500,
            "fast": 300
        },

        // Steps functionality
        //
        steps: [],

        addStep: function( step ){
            Tween.steps.push( step );

            if( Tween.steps.length === 1 ){
                this.startStepLoop();
            }
        },

        removeStep: function( step ){
            for( var i=-1, steps = Tween.steps, current; current = steps[++i]; ){
                if( current === step ){
                    steps.splice( i, 1 );
                    return true;
                }
            }

            return false;
        },

        startStepLoop: function stepLoop(){
            var i=-1, steps = Tween.steps, current;

            // Update fps counter
            if( fpsCounterListener ){
                Tween.precessFPS();
            }

            // If there are not callbacks left,
            //  terminate step loop
            //
            if( steps.length === 0 ){
                return;
            } else {
                requestNextFrame(stepLoop);
            }

            for( ;current = steps[++i]; ){
                if( current() === false ){
                    Tween.removeStep( current );
                    i--;
                }
            }
        },

        // FPS counter
        //
        precessFPS: (function(){
            var fps = 0,
                fpsStartTime = 0,
                fpsShowInterval = 1000;

            return function(){
                var now = +(new Date);

                if( (now - fpsStartTime ) >= fpsShowInterval ){
                    // Save last fps value to Tween.fps
                    //
                    if( fpsCounterListener ){
                        fpsCounterListener( fps );
                    }

                    fps = 0;
                    fpsStartTime = now;
                }

                fps++;
            };
        })(),

        // Utils
        //
        round: function( p ){
            return (0.5 + p) << 0;
        },

        now: function(){
            return +(new Date);
        }
    });

    Tween.fn.extend({
        // Queue functions
        //
        dequeue: function( async ){
            if( async ){
                var t = this;
                setTimeout(function(){
                    t.dequeue();
                }, 0);
            } else {
                if( this.isQueued() ){
                    this.queue.splice(0, 1)[0]();
                }
            }
        },
        clearQueue: function(){
            if( this.isQueued() ){
                delete this.queue;
                this.queue = [];
            }
        },
        isQueued: function(){
            return !!this.queue.length;
        },

        // Start tween
        //
        start: function( delay ){
            var $t = this,
                p = 0,
                now = Tween.now(),
                frame = this.onFrame,
                easing = this.easing;

            if( this.state !== READY ){
                this.queue.push(function(){
                    $t.start(delay);
                });
                return;
            }

            if( delay > 0 ){
                this.state = DELAY;
                this.delayTimer = setTimeout(function(){
                    $t.state = READY;
                    $t.start();
                }, delay );
                return;
            }

            // Reset before each start
            this.reset();

            // Set times
            this.startTime = this.currentTime = now;
            this.endTime = this.startTime + this.duration;

            // Set TWEEN state
            this.state = TWEEN;

            this.step = function(){
                if( $t.state !== TWEEN ){
                    if( $t.state === PAUSED ){
                        Tween.removeStep( $t.step );
                        if( $t.onPause ) $t.onPause();
                        return;
                    } else if( $t.state === STOPPING ){
                        $t.state = READY;
                        Tween.removeStep( $t.step );
                        if( $t.onStop ) $t.onStop();
                        $t.dequeue();
                        return;
                    } else if( $t.state === REVERSE ){
                        $t.state = TWEEN;
                        easing = easing._reversed || easing._straight;
                        if( $t.onReverse ) $t.onReverse();
                    }
                }

                p = 1 - ($t.endTime - ($t.currentTime = Tween.now()))/$t.duration;

                if( p >= 1 ){
                    frame( easing(1) );

                    if( $t.onBeforeEnd ){
                        // NOTE: If onBeforeEnd returns false animation  will continue
                        //  to run last frame.
                        // This is useful for reversing, restarting, change and start new animation
                        //  at the end of other one.
                        if( $t.onBeforeEnd() === false ){
                            return;
                        }
                    }

                    $t.state = READY;
                    Tween.removeStep( $t.step );
                    if( $t.onEnd ) $t.onEnd();
                    $t.dequeue();
                } else {
                    frame( easing(p) );
                }
            };

            // Save context in step function( just in case )
            this.step.context = this;

            // Add step to steps buffer.
            // Each step will be called util false is returned.
            //
            Tween.addStep( this.step );
        },
        stop: function( clearQueue ){
            if( this.state === TWEEN ){
                this.state = STOPPING;
            } else if( this.state === DELAY ){
                clearTimeout(this.delayTimer);
                this.reset();
            } else {
                this.reset();
            }

            if( clearQueue ){
                this.clearQueue();
            }
        },
        finish: function(){
            if( this.state === TWEEN ){
                this.endTime = Tween.now();
            }
        },

        pause: function(){
            if( this.state === TWEEN ){
                this.state = PAUSED;
            }
        },
        resume: function(){
            if( this.state === PAUSED ){
                var elapsedTime = this.currentTime - this.startTime,
                    now = Tween.now();

                this.currentTime = now;
                this.startTime = now - elapsedTime;
                this.endTime = this.startTime + this.duration;

                this.state = TWEEN;

                if( this.onResume ) this.onResume();

                Tween.addStep( this.step );
            }
        },

        reverse: function(){
            if( this.state === TWEEN ){
                var elapsedTime = this.currentTime - this.startTime,
                    now = Tween.now();

                this.currentTime = now;
                this.startTime = now - (this.duration - elapsedTime);
                this.endTime = this.startTime + this.duration;

                this.reversed = !this.reversed;

                this.state = REVERSE;
            }
        },

        restart: function(){
            if( this.state === TWEEN ){
                this.endTime = Tween.now() + this.duration;
            } else if( this.state === READY ){
                this.start();
            } else {
                this.stop();
                this.start();
            }
        },
        reset: function( opts ){
            // Reset general options
            //
            if( opts ){
                this.extend( Tween.defaults );
                this.extend( opts );

                if( Tween.durations[this.duration] !== undefined ){
                    this.duration = Tween.durations[this.duration];
                }

                if( !Tween.isFunction(this.easing) ){
                    if( Tween.easing[this.easing] !== undefined ){
                        this.easing = Tween.easing[this.easing];
                    } else {
                        throw 'Wrong or not supported easing "' + this.easing + '"';
                    }
                }
            }

            // Reset internals
            //
            this.extend({
                endTime: 0,
                startTime: 0,
                currentTime: 0,

                step: null,
                state: READY,

                reversed: false,

                delayTimer: null
            });
        }
    });

    /*!
     * This is a copy of script.aculo.us adaptation.
     *
     * Copyright (c) 2005-2010 Thomas Fuchs
     * http://script.aculo.us/thomas
     *
     * Permission is hereby granted, free of charge, to any person obtaining
     * a copy of this software and associated documentation files (the
     * "Software"), to deal in the Software without restriction, including
     * without limitation the rights to use, copy, modify, merge, publish,
     * distribute, sublicense, and/or sell copies of the Software, and to
     * permit persons to whom the Software is furnished to do so, subject to
     * the following conditions:
     *
     * The above copyright notice and this permission notice shall be
     * included in all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
     * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
     * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
     * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
     * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
     * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
     * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
     *
     * TERMS OF USE - EASING EQUATIONS
     * Open source under the BSD License.
     * Easing Equations (c) 2003 Robert Penner, all rights reserved.
     *
     */
    Tween.extend( Tween.easing, {
        linear: function(pos){
            return pos;
        },

        'easeInQuad': function(pos){
            return Math.pow(pos, 2);
        },
        'easeOutQuad': function(pos){
            return -(Math.pow((pos-1), 2) -1);
        },
        'easeInOutQuad': function(pos){
            if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,2);
            return -0.5 * ((pos-=2)*pos - 2);
        },

        'easeInCubic': function(pos){
            return Math.pow(pos, 3);
        },
        'easeOutCubic': function(pos){
            return (Math.pow((pos-1), 3) +1);
        },
        'easeInOutCubic': function(pos){
            if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,3);
            return 0.5 * (Math.pow((pos-2),3) + 2);
        },

        'easeInQuart': function(pos){
            return Math.pow(pos, 4);
        },
        'easeOutQuart': function(pos){
            return -(Math.pow((pos-1), 4) -1)
        },
        'easeInOutQuart': function(pos){
            if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,4);
            return -0.5 * ((pos-=2)*Math.pow(pos,3) - 2);
        },

        'easeInQuint': function(pos){
            return Math.pow(pos, 5);
        },
        'easeOutQuint': function(pos){
            return (Math.pow((pos-1), 5) +1);
        },
        'easeInOutQuint': function(pos){
            if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,5);
            return 0.5 * (Math.pow((pos-2),5) + 2);
        },

        'easeInSine': function(pos){
            return -Math.cos(pos * (Math.PI/2)) + 1;
        },
        'easeOutSine': function(pos){
            return Math.sin(pos * (Math.PI/2));
        },
        'easeInOutSine': function(pos){
            return (-.5 * (Math.cos(Math.PI*pos) -1));
        },

        'easeInExpo': function(pos){
            return (pos==0) ? 0 : Math.pow(2, 10 * (pos - 1));
        },
        'outExpo': function(pos){
            return (pos==1) ? 1 : -Math.pow(2, -10 * pos) + 1;
        },
        'easeInOutExpo': function(pos){
            if(pos==0) return 0;
            if(pos==1) return 1;
            if((pos/=0.5) < 1) return 0.5 * Math.pow(2,10 * (pos-1));
            return 0.5 * (-Math.pow(2, -10 * --pos) + 2);
        },

        'easeInCirc': function(pos){
            return -(Math.sqrt(1 - (pos*pos)) - 1);
        },
        'easeOutCirc': function(pos){
            return Math.sqrt(1 - Math.pow((pos-1), 2))
        },
        'easeInOutCirc': function(pos){
            if((pos/=0.5) < 1) return -0.5 * (Math.sqrt(1 - pos*pos) - 1);
            return 0.5 * (Math.sqrt(1 - (pos-=2)*pos) + 1);
        },

        'easeInBack': function(pos){
            var s = 1.70158;
            return (pos)*pos*((s+1)*pos - s);
        },
        'easeOutBack': function(pos){
            var s = 1.70158;
            return (pos=pos-1)*pos*((s+1)*pos + s) + 1;
        },
        'easeInOutBack': function(pos){
            var s = 1.70158;
            if((pos/=0.5) < 1) return 0.5*(pos*pos*(((s*=(1.525))+1)*pos -s));
            return 0.5*((pos-=2)*pos*(((s*=(1.525))+1)*pos +s) +2);
        },

        'swingFromTo': function(pos) {
            var s = 1.70158;
            return ((pos/=0.5) < 1) ? 0.5*(pos*pos*(((s*=(1.525))+1)*pos - s)) :
                0.5*((pos-=2)*pos*(((s*=(1.525))+1)*pos + s) + 2);
        },
        'swingFrom': function(pos) {
            var s = 1.70158;
            return pos*pos*((s+1)*pos - s);
        },
        'swingTo': function(pos) {
            var s = 1.70158;
            return (pos-=1)*pos*((s+1)*pos + s) + 1;
        },

        'bounce': function(pos){
            if ((pos) < (1/2.75)) {
                return (7.5625*pos*pos);
            } else if (pos < (2/2.75)) {
                return (7.5625*(pos-=(1.5/2.75))*pos + .75);
            } else if (pos < (2.5/2.75)) {
                return (7.5625*(pos-=(2.25/2.75))*pos + .9375);
            } else {
                return (7.5625*(pos-=(2.625/2.75))*pos + .984375);
            }
        },
        'bouncePast': function(pos) {
            if (pos < (1/2.75)) {
                return (7.5625*pos*pos);
            } else if (pos < (2/2.75)) {
                return 2 - (7.5625*(pos-=(1.5/2.75))*pos + .75);
            } else if (pos < (2.5/2.75)) {
                return 2 - (7.5625*(pos-=(2.25/2.75))*pos + .9375);
            } else {
                return 2 - (7.5625*(pos-=(2.625/2.75))*pos + .984375);
            }
        },

        elastic: function(pos) {
            return -1 * Math.pow(4,-8*pos) * Math.sin((pos*6-1)*(2*Math.PI)/2) + 1;
        }
    });

    // Add reversed easing to each of the equations
    //
    (function(){
        Tween.forEach( Tween.easing, function( equation, name ){
            equation._reversed = function( p ){
                return equation(1 - p);
            };
            equation._reversed._straight = equation;
        });
    })();
})( typeof window !== "undefined" ? window : exports );