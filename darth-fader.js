////////////////////////////////////////////////////////////
// pizzaface -  MCMLXXXVIII                               /{
//
// DEBUGG {
//  'use strict';
//  'use strong';
//  localStorage.clear();
//  console.log('I am the ratmaster');
// }
///////////////////////////////////////////////////////////}

// expiration check {

// check if now is before the expiration date
new Date() < new Date('2023-10-13') &&

// pass in the script-tag dataset, preserved for contentloaded
((dset = document.currentScript.dataset) =>

    // do not run anything until content loaded [weird 'new' is necessary]
    document.addEventListener('DOMContentLoaded', () => new (function (
        
//}

        // prefs {
        
        // default object preferences
        default_prefs = {
            appName     : 'darth-fader',
            selector    : 'fade',
            eventName   : 'fade',
            thumb       : false,
            snap        : false,
            steps       : false,
            fix         : false,
            ignore      : false,
            passive     : true
        },

        // grab prefs set in the data-parameter of the script-tag
        param_prefs = JSON.parse(Object.values(dset)[0] || '{}'),

        // assemble prefs by overwriting eachother
        prefs = Object.assign({}, default_prefs, param_prefs),
    
        //}
            
        // global vars {
        nicknames = {},
        //}
            
        // global methods {
        
        // method to parse a JSON formated fade
        parseFade = fade => {
        
            // loop through every fade
            for (let i = 0, j = fade.length; i < j; i += 2) {
        
                // split it up on the numbers saving delimiters
                fade[i] = fade[i].split(/(-?\d*\.{0,1}\d+)/);
        
                // force the numbers to actually be numbers
                fade[i].forEach((v, k) =>
                    fade[i][k] = isNaN(parseFloat(v)) ? v : Number(v)
                );
        
            }
        
            // pass back the altered fade
            return fade;
        
        },
            
        // method for returning a faded array
        calcFade = (curFade, slyVal, fix) => {
        
            // holder for the current diff
            let curDif = [];
            
            curFade.lowEnd.forEach((v, i) => {
                
                // if the value is not a number ...
                if (typeof v !== 'number') {
        
                    // just set it
                    curDif[i] = v;
        
                }
                else { // other wise ...
        
                    // calc a tmp of the faded value
                    let tmp =
        
                    // the low-end value plus ...
                    v +
        
                    // the delta times ...
                    (curFade.topEnd[i] - v) *
        
                    // the fraction of the way between stops
                    ((slyVal - curFade.lowStop) /
                     (curFade.topStop - curFade.lowStop));
        
                    // set with apropos fix
                    curDif[i] = fix ? tmp.toFixed(fix) : tmp;
        
                }
        
            });
            
            // spit out that faded arrary with some joinery
            return curDif.join('');
        
        },

        inputHandler = DF => {
        
            // create a float number of the current value
            const slyVal = (parseFloat(DF.obj.value) - DF.min) / DF.dif;
                
            // object for the return value
            let retVal = {}
        
            // loop through all of the fades in the list
            for (let fade in DF.fades) {
                
                // abbreviate the current fade
                let curFade = DF.fades[fade];
                
                // needs a counter
                let cnt = 0;
        
                // compute the low end array and its stop
                while (
        
                    // if this fade's stop is less than the value
                    curFade[(1 + cnt * 2)] <= slyVal &&
                    // and not the 100% stop
                    curFade[(1 + cnt * 2)] != 1
        
                ) {
        
                    // set the low end array and its stop
                    curFade.lowStop = curFade[1 + cnt * 2];
                    curFade.lowEnd = curFade[cnt * 2];
                    cnt++;
        
                }
        
                // set the top end array and its stop
                curFade.topStop = curFade[1 + 2 * cnt];
                curFade.topEnd = curFade[2 * cnt];
        
                // calc the vals for this fade
                retVal[fade] = calcFade(curFade, slyVal, DF.fix);
                
            }
            
            // update hidden form values
            for (let fade in DF.hiddenInputs) {
                DF.hiddenInputs[fade].value = retVal[fade];
            }
            
            // let any listeners know
            DF.obj.dispatchEvent(new CustomEvent(
                DF.eventName, { detail: retVal }
            ));
        
        }

        //}

    ) {
    
        // add the styles needed for darth faders
        (document.body.appendChild((document.createElement('style'))))
        .innerText = //{
        `
input[data-${prefs.selector}] {
    --thumbH : 40px;
    --thumb-color: rgb(255,255,255);
    --thumb-border: var(--holder-back);
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    display: inline-block;
    padding: 0;
    margin: 0;
    height: var(--thumbH);
    width: 100%;
    border-radius: calc(var(--thumbH) / 2);
    background-color: var(--main-color);
}

input[data-${prefs.selector}]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    background-color: var(--thumb-color);
    height: var(--thumbH);
    margin-bottom: 0px;
    width: var(--thumbH);
    border: calc(0.1 * var(--thumbH)) solid;
    border-color: var(--thumb-border);
    border-radius: calc(var(--thumbH) / 2);
}

input[data-${prefs.selector}]:focus {
    outline: none;
}

        `;
        //}

        document.querySelectorAll(
    
            `[data-${prefs.selector}]:not(script)
            ,[data-${prefs.selector}-opts]:not(script)`
    
        ).forEach((obj, i) => this[i] = new(function() {
        
            // set object prefs {
            for (let [k, v] of Object.entries(Object.assign({},
        
                prefs,
    
                JSON.parse('{"fades":{' +
                    (obj.dataset[prefs.selector] || '')
                    .replace(/\'/g, '"')
                    .replace(/\s*([a-zA-Z-]+)\s*:/g, '"$1":') +
                    '}}'),
    
                JSON.parse('{' +
                    (obj.dataset[prefs.selector + 'Opts'] || '')
                    .replace(/\s/g, '')
                    .replace(/\'/g, '"')
                    .replace(/([a-zA-Z-]+):/g, '"$1":') +
                    '}'),
    
                {
                    obj: obj,
                    id: obj.id,
                    min: obj.min || 0,
                    max: obj.max || 100,
                    hiddenInputs: [],
                    PV: parseFade([
                        'rgb(200,0,200)', 0,
                        'rgb(255,255,255)', 0.5,
                        'rgb(238,170,0)', 1
                    ])
                }
    
            ))) { this[k] = v; }
            //}
        
            // calculate the range delta
            this.dif = this.max - this.min;
            
            // set the apropos height
            obj.style.setProperty('--thumbH', obj.offsetHeight + 'px');
            
            // check if there are gignores
            if (this.ignore) {
                this.ignore = JSON.parse('{'+
                    this.ignore
                    .replace(/\s*([a-zA-Z-]+)\s*/g,'"$1":true')
                    .replace(/,$/,'')
                +'}');
            }
            
            // parse the fades data
            for (let fade in this.fades) {
        
                // send it through the parser
                this.fades[fade] = parseFade(this.fades[fade]);
        
                // if this is NOT a gignored fade ...
                if (!this.ignore[fade]) {
                    
                    // create a hidden input for this fade
                    let iPut = document.createElement('input');
                    iPut.type = 'hidden';
        
                    // give the input a name and id
                    iPut.id = iPut.name = `${obj.id}_${fade}`;
        
                    // add it to the fader obj and hidden inputs list
                    obj.appendChild(this.hiddenInputs[fade] = iPut);
                }
        
            }
        
            // check if steps option set
            if (this.steps) { obj.setAttribute('step', this.dif / (
                (typeof this.steps === 'number' ? this.steps:
                (this.fades[this.steps].length / 2)) -1
            ))}
            
            // check if snap option set
            if (this.snap && this.fades[this.snap]) {
        
                // create a shorthand
                let fad = this.fades[this.snap];
        
                // create a list
                let tmpL = document.createElement('datalist');
        
                // loop over the specified fade
                for (let i = 0, j = fad.length; i < j; i += 2) {
        
                    // add an option for this point
                    let tmpO = document.createElement('option');
                    tmpO.innerHTML = parseInt(this.min, 10) + fad[i + 1] * this.dif;
                    tmpL.appendChild(tmpO);
                    
                }
        
                // add the list to the input element
                obj.appendChild(tmpL);
        
                // give this obj the right list
                // ALERT ::: has to be by _ID_!
                tmpL.id = `${obj.id}_datalist`;
                obj.setAttribute('list', tmpL.id);
        
            }
        
            // check if color-the-thumb option set
            if (this.thumb) {
        
                // check if the specified fade exists
                if (this.fades[this.thumb]) {
        
                    // add a listener
                    obj.addEventListener(this.eventName, e => {
        
                        // force the color back on itself
                        obj.style.setProperty(
                            '--thumb-color', e.detail[this.thumb]
                        );
                        
                    });
        
                }
                else { // other wize need to create colors
        
                    // listen for values changed
                    obj.addEventListener(this.eventName, e => {
        
                        // set the thumb color
                        obj.style.setProperty(
                            '--thumb-color',
                            e.detail.PV
                        );
        
                    });
                }
            }
        
            // listen for inputs to the slider
            obj.addEventListener('input', e => inputHandler(this));
        
            // add this obj to the nicknames
            nicknames[obj.id || prefs.selector + i] =
            nicknames[prefs.selector + i] = i;
        
        })());
    
        // app listeners {
        for (let [a, b, c = { passive: true }] of [
            
            // deliver the entire app if get-requested {
            ['get-' + prefs.selector, e => {
                window.dispatchEvent(new CustomEvent(
                    'catch-' + prefs.selector, {
                        detail: new Proxy(this, {
                            get(target, prop) {
                                return target[nicknames[prop]] || target[prop] || '';
                            }
                        })
                    }));
            }]
            //}

        ]) {
            window.addEventListener(a, b, c);
        }
        //}
        
    })()
    
))()

=== undefined || (console.log('eXp!red'));
