////////////////////////////////////////////////////////////
// pizzaface - MCMLXXXVIII
////////////////////////////////////////////////////////////

// content loaded new func closure

/*
((dset = document.currentScript.dataset) =>

document.addEventListener('DOMContentLoaded', () => new (function () {

    console.log(dset);

    // list of default preferences
    const default_Prefs = {
        appName: 'darth-fader',
        selector: 'darth',
        loadedEventName: 'darthloaded',
        inputEventName: 'darthfaded',
        fix: false,
        snap: false,
        thumb: false,
        value: 0.5,
        fades: {
            levels: [
                "-100", 0,
                "0", 0.5,
                "100", 1
            ]
        },

        able: true
    };

    // grab prefs set in the data-parameter of the script-tag
    const param_prefs = JSON.parse(Object.values(dset)[0] || '{}');

    // grab any stored prefs
    const stored_prefs = JSON.parse( localStorage[
            param_prefs.appname || default_prefs.appname
    ] || '{}');
    
    // assemble prefs by overwriting eachother
    const prefs = Object.assign({}, default_prefs, param_prefs, stored_prefs);
    
    // correct any typos
    // DEBUGG - might impliment this
    //defPrefs.faderClassName.replace(/[^a-z-]/gi, '');

    // method to parse a JSON formated fade
    const parseFade = fade => {

        // go through every other element
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

    };

    // method for returning a faded array
    const calcFade = (curFade, slyVal, fix) => {

        // holder for the current diff
        let curDif = [];

        // loop through the lower array
        curFade.lowEnd.forEach((v, i) => {

            // if the value is a string
            if (typeof v === 'string') {

                // just set it
                curDif[i] = v;

            }
            else { // other wise

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

    };

    // the darth fader object
    const DarthFader = function(obj) {

        // expose preferences for this obj
        this.prefs = {};

        // parse any prefs included in the input tag's data-params
        let dataPrefs = obj.dataset.darthfader ? JSON.parse(obj.dataset.darthfader) : {};

        // if any valid prefs were given, set them
        for (let p in defPrefs) {
            this.prefs[p] = dataPrefs[p] !== undefined ? dataPrefs[p] : defPrefs[p];
        }

        // reference to the html element
        this.obj = obj;

        // for exposing all the values
        this.vals = {};

        // get all the fade list data from the html
        let fadeList = this.prefs.fades;

        // parse the fades data
        for (let fade in fadeList) {

            // send it through the parser
            fadeList[fade] = parseFade(fadeList[fade]);

            // create a hidden input for this fade
            let iPut = document.createElement('input');
            iPut.type = 'hidden';

            // give the input a name and id
            iPut.id = iPut.name = `${obj.id}_${fade}`;

            // add it to the fader and hidden inputs list
            //obj.appendChild(this.hiddenInputs[fade] = iPut);
            obj.appendChild(iPut);

        }

        // check if snap option set in datalist
        if (this.prefs.snap && fadeList[this.prefs.snap]) {

            // create a shorthand
            let fad = fadeList[this.prefs.snap],

                // create a list
                tmpL = document.createElement('datalist');

            // loop over the specified fade
            for (let i = 0, j = fad.length; i < j; i += 2) {

                // add an option for this point
                let tmpO = document.createElement('option');
                tmpO.value = fad[i + 1];
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
        if (this.prefs.thumb) {

            // check if the specified fade exists
            if (fadeList[this.prefs.thumb]) {

                // add a listener
                obj.addEventListener(this.prefs.inputEventName, e => {

                    // force the color back on itself
                    obj.style.setProperty('--thumb-color',
                        this.vals[this.prefs.thumb]);

                });

            }
            else { // other wize need to create colors

                // send them through the parser
                let privateVarnish = parseFade(
                    [
                        'rgb(200,0,200)', 0,
                        'rgb(255,255,255)', 0.5,
                        'rgb(238,170,0)', 1
                    ]
                );

                // listen for values changed
                obj.addEventListener(this.prefs.inputEventName, e => {

                    let tmp = {},
                        objV = parseFloat(obj.value);

                    // figure out who's on top
                    if (objV < 0.5) {
                        tmp.lowEnd = privateVarnish[0];
                        tmp.lowStop = 0;
                        tmp.topEnd = privateVarnish[2];
                        tmp.topStop = 0.5;
                    }
                    else {
                        tmp.lowEnd = privateVarnish[2];
                        tmp.lowStop = 0.5;
                        tmp.topEnd = privateVarnish[4];
                        tmp.topStop = 1;
                    }

                    // expose this val to others
                    this.vals[this.prefs.thumb] = calcFade(tmp, objV, '0');

                    // set the thumb color from the calculated val
                    obj.style.setProperty('--thumb-color', calcFade(tmp, objV, '0'));

                });
            }
        }

        // set an initial value
        obj.value = this.prefs.value;

        // listen for inputs to the slider
        obj.addEventListener('input', e => {
            this.inputHandler(this, fadeList);
        });

    };

    // proto to trigger load and input events on load, passes reference
    DarthFader.prototype.loadComplete = function() {
        this.obj.dispatchEvent(
            new CustomEvent(this.prefs.loadedEventName, {
                detail: {
                    ref: this
                },
                input: this.obj.dispatchEvent(new Event('input')),
            }));
    };

    // method to handle the input event from the slider
    DarthFader.prototype.inputHandler = function(DF, fadeList) {

        // create a float number of the current value
        let slyVal = parseFloat(DF.obj.value);

        // loop through all of the fades in the list
        for (let fade in fadeList) {

            // abbreviate the current fade
            let curFade = fadeList[fade];

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

            // finally create the vals for this fade
            DF.vals[fade] =

                // by calling the calc
                calcFade(curFade, slyVal, DF.prefs.fix);

        }

        // let any listeners know
        DF.obj.dispatchEvent(new CustomEvent(
            DF.prefs.inputEventName, {
                detail: { vals: DF.vals }
            }
        ));

    };

    // exposed ability to set value
    DarthFader.prototype.setValue = function(v) {
        this.obj.value = v;
        this.inputHandler(this, this.prefs.fades);
    };

    // get reference to every DarthFader obj from selector
    const allDarths = {};

    // fill the allDarths reference
    document.querySelectorAll(
        `input[data-${ defPrefs.selector.replace(/[^a-z]/gi,'') }]`
    ).forEach(obj => {

        // configure the input element
        obj.type = 'range';
        obj.min = 0;
        obj.max = 1;
        obj.step = 0.001;

        // set the classname
        obj.classList.add(defPrefs.faderClassName)

        obj.style.setProperty(
            '--thumb-height',
            window.getComputedStyle(obj).height
        );

        allDarths[obj.id] = new DarthFader(obj);

    });

    // add the styles needed for the inputs
    (document.body.appendChild((document.createElement('style')))).innerText = //{
        `
    .${defPrefs.faderClassName} {
        --greyed-out: #888;
        --faded-out: #ccc;
        --thumb-color: #888;
        --thumb-radius: calc(var(--thumb-height) / 2);
        --thumb-border: calc(0.1 * var(--thumb-height)) solid #666;
        --max-width: 440px;
    }
    
    input.${defPrefs.faderClassName}[type=range] {
        -webkit-appearance: none;
        -moz-appearance: none;
        display: inline-block;
        margin: 0;
        width: 100%;
        max-width: var(--max-width);
        border-radius: var(--thumb-radius);
        background-color: var(--faded-out);
    }
    
    input.${defPrefs.faderClassName}[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        background-color: var(--thumb-color);
        height: var(--thumb-height);
        width: var(--thumb-height);
        border: var(--thumb-border);
        border-radius: var(--thumb-radius);
    }
    
    input.${defPrefs.faderClassName}[type=range]:focus { outline: none; }
    
} `;
    //}

    // set the thumb height on resize
    window.addEventListener('resize', e => {

        for (let D in allDarths) {

            allDarths[D].obj.style.setProperty(
                '--thumb-height',
                window.getComputedStyle(allDarths[D].obj).height
            );

        }

    });

    // let any listeners know this is loaded
    document.dispatchEvent(new Event('DarthFaderLoaded'));

    // loop through and trigger the individual DarthFader loads
    for (let obj in allDarths) {
        allDarths[obj].loadComplete();
    }

})()
    
))();

*/