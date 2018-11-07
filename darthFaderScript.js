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
                        
                        // set with a fix or not
                        curDif[i] = fix ? tmp.toFixed(fix) : tmp;
                    }
                        
                });
                
                return curDif.join('');
        
    };
    
    // loop through all darth-fader objects and set them up
    document.querySelectorAll('.darth-fader').forEach((obj) => {
    
        // for exposing all the values
        obj.vals = {};
    
        // get all the fade list data from the html
        let fadeList = obj.dataset.fades ?
            JSON.parse(obj.dataset.fades) :
            {
                levels : ["-100", 0, "100", 1],
                colors : [
                    "rgb(238,170,0)", 0,
                    "rgb(255,255,255)", 0.5,
                    "rgb(200, 0, 200)", 1
                ]
            };
            
        // parse the fades data
        for (let fade in fadeList){
            
            // go through every element
            for(let i = 0, j = fadeList[fade].length; i < j; i += 2){
                
                // split it up on the numbers saving delimiters
                fadeList[fade][i] = fadeList[fade][i].split(/(-?\d*\.{0,1}\d+)/);
                
                // force the numbers to actually be numbers
                fadeList[fade][i].forEach((v,k)=>{
                    fadeList[fade][i][k] = isNaN(parseFloat(v)) ? v : Number(v);
                });
                
            }
            
        }

        // configure the input
        obj.type = 'range';
        obj.min = 0;
        obj.max = 1;
        obj.step = 0.001;
        obj.fix = obj.dataset.fix ? JSON.parse(obj.dataset.fix) : null;
        
        // if there is a snap option set a datalist
        if (
            obj.dataset.snap 
            &&
            fadeList[obj.dataset.snap]
        ) {
            
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
        
        // if there is a colors option set
        if (obj.dataset.thumb) {
            
            // add a listener
            obj.addEventListener('valsChanged', e => {
                
                // force the color back on itself
                obj.style.setProperty('--thumb-color', obj.vals[obj.dataset.thumb]);
                
            });
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
                
                let curFade = fadeList[fade];
                
                // set the low end value and stop
                let cnt = 0;
                
                while(
                    curFade[(1+cnt*2)] <= slyVal
                    &&
                    curFade[(1+cnt*2)] != 1
                ) {
                    
                    curFade.lowStop = curFade[1 + cnt * 2];
                    curFade.lowEnd = curFade[cnt * 2];
                    cnt++;
                
                }
                
                // set the top
                curFade.topStop = curFade[1 + 2*cnt];
                curFade.topEnd = curFade[2*cnt];
                
                // finally create the vals for this fade
                obj.vals[fade] = calcFade(curFade, slyVal, obj.fix);
        
            }
            
            // let any listeners know
            obj.dispatchEvent(new CustomEvent('valsChanged'));
            
        });
        
        // trigger an input on load
        obj.dispatchEvent(new Event('input'));
         
    });
    
})();