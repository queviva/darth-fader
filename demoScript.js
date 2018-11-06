////////////////////////////////////////////////////////////
// queviva desliza
//
// demo script for continuous value survey sliders

(()=>{

    let Q = {};
    'faceFader boxPath mouthPath'.split(' ').forEach(obj => {
        
        Q[obj] = document.getElementById(obj);
    
    });

    Q.faceFader.addEventListener('valsChanged', e => {
        Q.boxPath.setAttributeNS(null, 'd', Q.faceFader.vals.facePaths);
        Q.boxPath.style.fill = Q.faceFader.vals.colors;
        Q.mouthPath.setAttributeNS(null, 'd', Q.faceFader.vals.mouthPaths);
        Q.faceFader.style.setProperty('--thumb-color',
         Q.faceFader.vals.colors);
    });

    
})();