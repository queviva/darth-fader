////////////////////////////////////////////////////////////
// queviva desliza
//
// the master of all faders

/*global Event CustomEvent*/

(() => { // anonymouse closure

    //method for setting value directly and triggering an input
    const setValue = (fader, val) => {
        
        fader.value = val;
        fader.dispatchEvent(new Event('input'));
        
    };
    
    // method to parse a JSON formated fade
    const parseFade = (fade) => {
        
        // go through every other element
        for(let i = 0, j = fade.length; i < j; i += 2){
                
            // split it up on the numbers saving delimiters
            fade[i] = fade[i].split(/(-?\d*\.{0,1}\d+)/);
                
            // force the numbers to actually be numbers
            fade[i].forEach((v,k)=>{
                fade[i][k] = isNaN(parseFloat(v)) ? v : Number(v);
            });
                
        }
        
        // pass back the altered fade
        return fade;
        
    };
    
    // method for returning a faded array
    const calcFade = (curFade, slyVal, fix) => {
                     
        // holder for the current diff
        let curDif = [];

        // loop through the lower array
        curFade.lowEnd.forEach((v,i) => {
                    
            // if the value is a string
            if (typeof v === 'string') {
                        
                // just set it
                curDif[i] = v;
                        
            } else { // other wise
                        
                // calc a tmp of the faded value
                let tmp =
                        
                    // the low-end value plus ...
                    v +
                        
                    // the delta times ...
                    (curFade.topEnd[i] - v) *
                        
                    // the fraction of the way between stops
                    ((slyVal - curFade.lowStop)
                                /
                    (curFade.topStop - curFade.lowStop));
                        
                // set with apropos fix
                curDif[i] = fix ? tmp.toFixed(fix) : tmp;
                
            }
                        
        });
                
        // spit out that faded arrary with some joinery
        return curDif.join('');
        
    };
    
    // loop through all darth-fader objects and set them up
    document.querySelectorAll('.darth-fader').forEach((obj) => {
    
        // for exposing all the values
        obj.vals = {};
        obj.hiddenInputs = {};
    
        // get all the fade list data from the html
        let fadeList = obj.dataset.fades ?
            JSON.parse(obj.dataset.fades) :
            {
                levels : [
                    "-100", 0,
                    "0", 0.5,
                    "100", 1
                ]
            };
            
        // parse the fades data
        for (let fade in fadeList){
            
            // send it through the parser
            fadeList[fade] = parseFade(fadeList[fade]);
            
            // create a hidden input for this fade
            let iPut = document.createElement('input');
            iPut.type = 'hidden';
            
            // give the input a name and id
            iPut.id = iPut.name = `${obj.id}_${fade}`;
            
            // add it to the fader and hidden inputs list
            obj.appendChild(obj.hiddenInputs[fade] = iPut);
            
        }

        // configure the input
        obj.type = 'range';
        obj.min = 0;
        obj.max = 1;
        obj.step = 0.001;
        obj.fix = obj.dataset.fix ? JSON.parse(obj.dataset.fix) : null;
        
        // check if snap option set in datalist
        if (obj.dataset.snap  && fadeList[obj.dataset.snap]) {
            
            // create a shorthand
            let fad = fadeList[obj.dataset.snap],
            
            // create a list
            tmpL = document.createElement('datalist');
            
            // loop over the specified fade
            for (let i = 0, j = fad.length; i < j; i += 2) {
            
                // add an option for this point
                let tmpO = document.createElement('option');
                tmpO.value = fad[i + 1];
                tmpL.appendChild(tmpO);
                
            }
            
            // add the list to the obj
            obj.appendChild(tmpL);
            
            // give this obj the right list
            // ALERT ::: has to be by _ID_!
            tmpL.id = `${obj.id}_datalist`;
            obj.setAttribute('list', tmpL.id);
            
        }
        
        // check if color-the-thumb option set
        if (obj.dataset.thumb) {
            
            // check if the specified fade exists
            if (fadeList[obj.dataset.thumb]) {
                
                // add a listener
                obj.addEventListener('valsChanged', e => {
                        
                        // force the color back on itself
                        obj.style.setProperty('--thumb-color', obj.vals[obj.dataset.thumb]);
                
                });
                
            } else { // other wize need to create colors
            
                // send them through the parser
                let privateVarnish = parseFade(
                    [
                        'rgb(200,0,200)', 0,
                        'rgb(255,255,255)', 0.5,
                        'rgb(238,170,0)', 1
                    ]
                );
                
                // listen for values changed
                obj.addEventListener('valsChanged', e => {
                        
                    let tmp = {}, objV = parseFloat(obj.value);
                       
                       
                    // figure out who's on top
                    if ( objV < 0.5 ) {
                        tmp.lowEnd = privateVarnish[0];
                        tmp.lowStop = 0;
                        tmp.topEnd = privateVarnish[2];
                        tmp.topStop = 0.5;
                    } else {
                        tmp.lowEnd = privateVarnish[2];
                        tmp.lowStop = 0.5;
                        tmp.topEnd = privateVarnish[4];
                        tmp.topStop = 1;
                    }
                        
                    // expose this val to others, NOT in hidden inputs
                    obj.vals[obj.dataset.thumb] = calcFade(tmp, objV, '0');
                    
                    // set the thumb color from the calculated val
                    obj.style.setProperty('--thumb-color', calcFade(tmp, objV, '0'));
                        
                });
            }
        }
        
        // check if an initial value was set in options
        obj.value = obj.dataset.value ? parseFloat(obj.dataset.value) : 0.5;
        
        // expose a method of setting value directly
        obj.setValue = val => setValue(obj,val);
   
        // listen for changes to the slider
        obj.addEventListener('input', e => {
            
            // create a float number of the current value
            let slyVal = parseFloat(obj.value);
            
            // loop through all of the fades in the list
            for (let fade in fadeList) {
                
                // abbreviate the current fade
                let curFade = fadeList[fade];
                
                // needs a counter
                let cnt = 0;
                
                // compute the low end array and its stop
                while(
                    
                    // if this fade's stop is less than the value
                    curFade[(1+cnt*2)] <= slyVal
                    &&
                    // and not the 100% stop
                    curFade[(1+cnt*2)] != 1
                ) {
                    
                    // set the low end array and its stop
                    curFade.lowStop = curFade[1 + cnt * 2];
                    curFade.lowEnd = curFade[cnt * 2];
                    cnt++;
                
                }
                
                // set the top end array and its stop
                curFade.topStop = curFade[1 + 2*cnt];
                curFade.topEnd = curFade[2*cnt];
                
                // finally create the vals for this fade
                obj.vals[fade] =
                
                // and copy them to the hidden inputs
                obj.hiddenInputs[fade].value =
                
                // by calling the calc
                calcFade(curFade, slyVal, obj.fix);
        
            }
            
            // let any listeners know
            obj.dispatchEvent(new CustomEvent('valsChanged'));
            
        });
        
        // trigger an input on load
        obj.dispatchEvent(new Event('input'));
         
    });
    
})();