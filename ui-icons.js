/* Shared 24-unit outline icons for HTML and canvas interfaces. */
(function () {
    const paths = {"mail": "M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z M3 7l9 6 9-6", "linkedin": "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z M7 10v7 M7 7h.01 M11 17v-7 M11 13a3 3 0 0 1 6 0v4", "document": "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z M14 3v6h6 M8 13h8 M8 17h6", "download": "M12 3v12 M7 10l5 5 5-5 M4 16v4h16v-4", "message": "M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-5 3V6a2 2 0 0 1 2-2Z M7 9h10 M7 13h6", "home": "M3 10l9-7 9 7 M5 9v12h14V9 M9 21v-7h6v7", "external": "M6 18 18 6 M6 6h12v12", "back": "M19 12H5 M11 6l-6 6 6 6", "lock": "M5 10h14v11H5Z M8 10V7a4 4 0 0 1 8 0v3", "close": "M6 6l12 12 M18 6 6 18", "components": "M12 2l4 4-4 4-4-4Z M6 8l4 4-4 4-4-4Z M18 8l4 4-4 4-4-4Z M12 14l4 4-4 4-4-4Z"};
    const cache = new Map();
    window.drawPortfolioIcon = function (ctx, name, x, y, size = 24, color = '#f4efe7') {
        if (!paths[name]) return;
        if (!cache.has(name)) cache.set(name, new Path2D(paths[name]));
        ctx.save(); ctx.translate(x,y); ctx.scale(size/24,size/24);
        ctx.strokeStyle=color; ctx.lineWidth=2; ctx.lineCap='round'; ctx.lineJoin='round';
        ctx.stroke(cache.get(name)); ctx.restore();
    };
    const symbols = {'↗':'external','←':'back','↓':'download','🔒':'lock','×':'close','❖':'components'};
    window.drawPortfolioText = function (ctx, value, x, y) {
        const text = String(value);
        const parts = text.split(/(↗|←|↓|🔒|×|❖)/u).filter(Boolean);
        if (!parts.some(part => symbols[part])) { ctx.fillText(text,x,y); return; }
        const size = Number((ctx.font.match(/([\d.]+)px/) || [0,16])[1]);
        const widths = parts.map(part => symbols[part] ? size : ctx.measureText(part).width);
        const width = widths.reduce((a,b)=>a+b,0);
        let left = x - (ctx.textAlign === 'center' ? width/2 : ['right','end'].includes(ctx.textAlign) ? width : 0);
        ctx.save(); ctx.textAlign='left';
        parts.forEach((part,index)=>{
            if(symbols[part]) drawPortfolioIcon(ctx,symbols[part],left,y-size*.82,size,ctx.fillStyle);
            else ctx.fillText(part,left,y);
            left+=widths[index];
        });
        ctx.restore();
    };
})();
