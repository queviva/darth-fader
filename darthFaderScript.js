////////////////////////////////////////////////////////////
// queviva desliza
//
// the master of all faders

/*global Event CustomEvent*/

(() => { // anonymouse closure
    //method for setting value directly and triggering and input
    const setValue = (fader, val) => {
        
        fader.value = val;
        fader.dispatchEvent(new Event('input'));
        
    };
    
    // method for returning a faded array
    const calcFade = (curFade, slyVal) => {
                     
                let curDif = [];
                
                // loop through the lower array
                curFade.lowEnd.forEach((v,i) => {
                    
                    // if the value is a string
                    curDif[i] = (typeof v === 'string') ?
                        
                        //just return it
                        v
                        
                        // otherwise ...
                        :
                        
                        // take the low value and add ...
                        v +
                        
                        // the delta times ...
                        (curFade.topEnd[i] - v) *
                        
                        // the fraction of the way between stops
                        ((slyVal - curFade.lowStop) / (curFade.topStop - curFade.lowStop));
                        
                });
                
                return curDif.join('');
        
    };
    
    // loop through all darth-fader objects and set them up
    document.querySelectorAll('input[type=range].darth-fader').forEach((obj) => {
    
        // for exposing all the values
        obj.vals = {};
    
        // get all the fade data from the html
        let fadeList = obj.dataset.fades ?
            JSON.parse(obj.dataset.fades) :
            {rating : ["-100", 0, "100", 1]};
            
        // parse the data
        for (let fade in fadeList){
            
            // go through every elements
            for(let i = 0, j = fadeList[fade].length; i < j; i += 2){
                
                // split it up on the numbers saving delimiters
                fadeList[fade][i] = fadeList[fade][i].split(/(-?\d*\.{0,1}\d+)/);
                
                // force the numbers to actually be numbers
                fadeList[fade][i].forEach((v,k)=>{
                    fadeList[fade][i][k] = isNaN(parseFloat(v)) ? v : Number(v);
                });
                
            }
            
        }

        // configure the range input
        obj.min = 0;
        obj.max = 1;
        obj.step = 0.001;
        
        // check if a value was set in options
        obj.value = obj.dataset.value ? parseFloat(obj.dataset.value) : 0.5;
        
        // allow a method of setting value directly
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
                obj.vals[fade] = calcFade(curFade, slyVal);
        
            }
            
            // let any listeners know
            obj.dispatchEvent(new CustomEvent('valsChanged'));
        
            
        });
        
        // trigger an input on load
        obj.dispatchEvent(new Event('input'));
         
    });
    
})();