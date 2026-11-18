/* Bound GPU cost on slower devices; ?perf=1 adds a local diagnostic readout. */
window.createRoomPerformance = function(renderer, setQuality) {
    const diagnostics=new URLSearchParams(location.search).get('perf')==='1';
    let panel;
    if(diagnostics) {
        panel=document.createElement('output');
        panel.id='room-performance';
        panel.style.cssText='position:fixed;left:12px;bottom:12px;z-index:200;padding:10px 14px;border-radius:12px;background:#101820ed;color:#fff;font:12px/1.6 monospace;white-space:pre;pointer-events:none';
        document.body.append(panel);
    }
    const times=[], qualityTimes=[];
    let previous=0,lastReport=0,readyAt=0,lastQualityCheck=0,quality=1;
    document.addEventListener('visibilitychange',()=>{
        previous=0;qualityTimes.length=0;times.length=0;readyAt=0;
    });
    return {sample(now, ready=true, adapt=true) {
        if(!ready || document.hidden) {previous=0;return;}
        if(!readyAt) readyAt=now;
        if(!adapt) {qualityTimes.length=0;readyAt=now;}
        const interval=previous?now-previous:0;
        previous=now;
        if(interval>0 && interval<250) {
            if(panel) {times.push(interval);if(times.length>180)times.shift();}
            if(adapt && now-readyAt>4000) qualityTimes.push(interval);
        }
        // A sustained slow window lowers only the 3D framebuffer. HTML UI stays sharp.
        // Never react to loading, shader compilation, or a background-tab pause.
        if(setQuality && qualityTimes.length>=60 && now-lastQualityCheck>3000) {
            const sorted=qualityTimes.slice().sort((a,b)=>a-b);
            if(sorted[Math.floor(sorted.length*.75)]>32 && quality>.65) {
                quality=Math.max(.65,quality*.85);
                setQuality(quality);
            }
            qualityTimes.length=0;lastQualityCheck=now;
        }
        if(!panel || now-lastReport<1000 || !times.length) return;
        lastReport=now;
        const sorted=times.slice().sort((a,b)=>a-b);
        const average=times.reduce((a,b)=>a+b,0)/times.length;
        panel.textContent=`${(1000/average).toFixed(0)} fps · p95 ${sorted[Math.floor(sorted.length*.95)].toFixed(1)} ms\n${renderer.info.render.calls} draws · ${renderer.info.render.triangles.toLocaleString()} triangles\n${renderer.domElement.width} × ${renderer.domElement.height} · DPR ${renderer.getPixelRatio().toFixed(2)}`;
    }};
};
