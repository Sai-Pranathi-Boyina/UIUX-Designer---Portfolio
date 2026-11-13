// macOS desktop surrounding the portfolio's interactive Figma workspace.
const monitorApp = { progress: 0, tween: null };
const figmaPreview = { x: 1110, y: 520, w: 640, h: 400 };

function desktopFigmaIcon(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 30, size / 30);
    [['#f24e1e',5,0,[5,0,0,5]],['#ff7262',15,0,[0,5,5,0]],['#a259ff',5,10,[5,0,0,5]],['#1abcfe',15,10,5],['#0acf83',5,20,[0,0,5,5]]].forEach(([color,a,b,radius]) => {
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.roundRect(a,b,10,10,radius); ctx.fill();
    });
    ctx.restore();
}

function monitorDesktopTarget(x, y) {
    return (x >= figmaPreview.x && x <= figmaPreview.x + figmaPreview.w && y >= figmaPreview.y && y <= figmaPreview.y + figmaPreview.h)
        || (x >= 1298 && x <= 1348 && y >= 1014 && y <= 1066);
}

function setMonitorApp(open, immediate = false) {
    if (monitorApp.tween) monitorApp.tween.stop();
    monitorApp.tween = null;
    const finish = () => { monitorApp.tween = null; drawMonitorScreen(false); };
    if (immediate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        monitorApp.progress = open ? 1 : 0;
        finish();
        return;
    }
    monitorApp.tween = new TWEEN.Tween(monitorApp)
        .to({ progress: open ? 1 : 0 }, 850)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onUpdate(() => drawMonitorScreen(false))
        .onComplete(finish).start();
    drawMonitorScreen(false);
}

function drawMonitorScreen(rebuild = true) {
    if (!monitorCtx || !monitorWorkspaceCtx) return;
    if (rebuild) drawProjectWorkspace();
    const ctx = monitorCtx;
    const p = monitorApp.progress;
    ctx.save(); ctx.setTransform(2,0,0,2,0,0);
    ctx.fillStyle = '#326653'; ctx.fillRect(0,0,1920,1080);
    if (monitorWallpaper.complete && monitorWallpaper.naturalWidth) {
        const scale = Math.max(1920 / monitorWallpaper.naturalWidth,1080 / monitorWallpaper.naturalHeight);
        const w = monitorWallpaper.naturalWidth * scale, h = monitorWallpaper.naturalHeight * scale;
        ctx.drawImage(monitorWallpaper,(1920-w)/2,(1080-h)/2,w,h);
    }
    // The supplied image already contains the complete desktop chrome.
    // Replace one dock tile with a live Figma launcher, aligned to the screenshot.
    ctx.fillStyle = '#25262a';
    ctx.beginPath(); ctx.roundRect(1298,1016,50,48,11); ctx.fill();
    desktopFigmaIcon(ctx,1307,1021,36);
    // Restore the small Figma window into its full-size interactive workspace.
    const x = figmaPreview.x * (1-p), y = figmaPreview.y * (1-p);
    const w = figmaPreview.w + (1920-figmaPreview.w)*p;
    const h = figmaPreview.h + (1080-figmaPreview.h)*p;
    const titleHeight = 40*(1-p), radius = 14*(1-p);
    ctx.save();
    ctx.shadowColor='rgba(0,12,26,.4)';ctx.shadowBlur=38*(1-p);ctx.shadowOffsetY=16*(1-p);
    ctx.fillStyle='#24252b';ctx.beginPath();ctx.roundRect(x,y,w,h,radius);ctx.fill();
    ctx.shadowColor='transparent';ctx.clip();
    ctx.drawImage(monitorWorkspaceCanvas,x,y+titleHeight,w,h-titleHeight);
    if (p < 1) {
        ctx.fillStyle='#292a30';ctx.fillRect(x,y,w,titleHeight);
        ctx.globalAlpha=1-p;
        ['#ff6058','#ffbd2e','#28c840'].forEach((c,i)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x+20+i*20,y+20,5,0,Math.PI*2);ctx.fill();});
        desktopFigmaIcon(ctx,x+90,y+9,22);
        ctx.fillStyle='#eee';ctx.font='500 15px -apple-system, sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
        ctx.fillText('Figma — Pranathi’s projects',x+121,y+20);
        ctx.textAlign='right';ctx.fillStyle='#bfc5cd';ctx.fillText('Click to open',x+w-18,y+20);
    }
    ctx.restore();
    if (p === 1) {
        ctx.fillStyle='#25252f';ctx.beginPath();ctx.roundRect(1828,16,64,64,16);ctx.fill();
        ctx.strokeStyle='#ffbd2e';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(1848,48);ctx.lineTo(1872,48);ctx.stroke();
    }
    ctx.restore();
    if (monitorTexture) monitorTexture.needsUpdate=true;
}

const BEHANCE_PROFILE_URL = "https://www.behance.net/saipraboyina2";
// Shared measured layout for rendering, hover, and selection.
let projectTabLayout = { items: [], contentTop: 94 };
function layoutProjectTabs(ctx, rightEdge = 1808) {
    const tabs = [
        ['', 'All projects'], ['mental-health', 'Mental health'], ['campus-connect', 'Campus Connect'],
        ['cms-websites', 'CMS websites'], ['ultramind', 'UltraMind'],
        ['svelty-website', 'Svelty website'], ['svelty-crm', 'Svelty CRM']
    ];
    const gap = 12, padding = 40;
    const available = rightEdge - 28;
    ctx.font = '600 28px "Montserrat", sans-serif';
    const textWidth = tabs.reduce((sum, [,label]) => sum + ctx.measureText(label).width, 0);
    const fontSize = Math.min(28, 28 * (available - tabs.length*padding - (tabs.length-1)*gap - tabs.length) / textWidth);
    ctx.font = `600 ${fontSize}px "Montserrat", sans-serif`;
    let x = 28;
    const items = tabs.map(([id, label]) => {
        const width = Math.ceil(ctx.measureText(label).width) + padding;
        const item = { id, label, x, y: 16, width, height: 64 };
        x += width + gap;
        return item;
    });
    return { items, contentTop: 94 };
}

function projectTabAt(x, y) {
    return projectTabLayout.items.find(t => x >= t.x && x <= t.x+t.width && y >= t.y && y <= t.y+t.height);
}
function projectBodyY(y) {
    if (y < projectTabLayout.contentTop) return -1;
    return 78 + (y-projectTabLayout.contentTop)*(1080-78)/(1080-projectTabLayout.contentTop);
}
function drawProjectTabs(ctx) {
    projectTabLayout = layoutProjectTabs(ctx);
    ctx.save();
    ctx.fillStyle = '#101017';
    ctx.beginPath();ctx.roundRect(16,8,1888,projectTabLayout.contentTop-12,18);ctx.fill();
    ctx.textAlign='center';ctx.textBaseline='middle';
    projectTabLayout.items.forEach(t => {
        const selected = activeProjectSlug === t.id;
        ctx.fillStyle = selected ? '#f5c0bc' : '#292936';
        ctx.strokeStyle = selected ? '#ffdbd4' : '#50505f';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.roundRect(t.x,t.y,t.width,t.height,16);ctx.fill();ctx.stroke();
        ctx.fillStyle=selected ? '#201b24' : '#f4f0f8';
        ctx.fillText(t.label,t.x+t.width/2,t.y+t.height/2);
    });
    ctx.restore();
}
