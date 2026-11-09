/* Badge artwork is drawn from text and shapes, not reference screenshots. */
(function () {
    const W = 1000, H = 1450;
    const purple = '#550cc5', ink = '#21103f', muted = '#61517f';
    const bodyFont = 'Montserrat, sans-serif';
    const monoFont = '"JetBrains Mono", monospace';

    function rounded(ctx, x, y, w, h, radius, fill) {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, radius);
        ctx.fillStyle = fill;
        ctx.fill();
    }

    function label(ctx, text, x, y, size, weight = 500, color = ink, align = 'left', font = bodyFont) {
        ctx.font = `${weight} ${size}px ${font}`;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.fillText(text, x, y);
    }

    function wrap(ctx, text, x, y, width, size = 31, lineHeight = 46, weight = 500) {
        ctx.font = `${weight} ${size}px ${bodyFont}`;
        ctx.fillStyle = ink;
        ctx.textAlign = 'left';
        let line = '';
        for (const word of text.split(/\s+/)) {
            const next = line ? `${line} ${word}` : word;
            if (line && ctx.measureText(next).width > width) {
                ctx.fillText(line, x, y);
                y += lineHeight;
                line = word;
            } else line = next;
        }
        if (line) ctx.fillText(line, x, y);
        return y + lineHeight;
    }

    function base(ctx) {
        ctx.clearRect(0, 0, W, H);
        const paper = ctx.createLinearGradient(0, 0, W, H);
        paper.addColorStop(0, '#fcfaff');
        paper.addColorStop(1, '#ede7f7');
        // Full-bleed artwork: the shared 3D silhouette clips the rounded edges.
        ctx.fillStyle = paper;
        ctx.fillRect(0, 0, W, H);
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, W, H);
        ctx.clip();
    }

    function front(ctx, portrait, data) {
        base(ctx);
        const gradient = ctx.createLinearGradient(0, 0, W, 450);
        gradient.addColorStop(0, data.colors[0]);
        gradient.addColorStop(1, data.colors[1]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, 450);
        label(ctx, data.name, 500, data.subtitle ? 285 : 315, 108, 800, '#ffffff', 'center');
        if (data.subtitle) label(ctx, data.subtitle, 500, 360, 27, 600, '#ffffff', 'center', monoFont);
        ctx.save();
        ctx.beginPath();
        ctx.arc(500, 665, 150, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = '#ded5ed';
        ctx.fillRect(350, 515, 300, 300);
        if (portrait) {
            const side = Math.min(portrait.naturalWidth, portrait.naturalHeight);
            ctx.drawImage(portrait, (portrait.naturalWidth - side) / 2, (portrait.naturalHeight - side) / 2,
                side, side, 350, 515, 300, 300);
        } else label(ctx, 'SP', 500, 700, 96, 700, muted, 'center');
        ctx.restore();
        label(ctx, 'Boyina Sai Pranathi', 500, 900, 70, 800, ink, 'center');
        label(ctx, data.role, 500, 975, data.subtitle ? 43 : 54, 600, muted, 'center');
        label(ctx, data.dates, 500, 1085, 40, 500, muted, 'center', monoFont);
        // Decorative barcode with deterministic widths; no personal data encoded.
        let x = 205;
        for (let i = 0; i < 48; i++) {
            const width = [4, 9, 5, 12, 3, 7][i % 6];
            ctx.fillStyle = '#201637';
            ctx.fillRect(x, 1150, width, 91);
            x += width + 5;
        }
        label(ctx, 'VIEW RESPONSIBILITIES', 500, 1355, 30, 500, muted, 'center', monoFont);
        ctx.restore();
    }

    function back(ctx, data, links) {
        links.length = 0;
        base(ctx);
        label(ctx, data.name, 70, 231, 86, 800, data.colors[0]);
        label(ctx, data.role, 70, 305, data.subtitle ? 43 : 56, 800);
        label(ctx, data.dates, 70, 366, 30, 500, muted, 'left', monoFont);
        rounded(ctx, 72, 402, 150, 10, 2, data.colors[0]);
        let y = 481;
        for (const [heading, detail] of data.points) {
            rounded(ctx, 74, y - 25, 15, 15, 2, data.colors[0]);
            y = wrap(ctx, heading, 112, y, 810, 36, 46, 750);
            y = wrap(ctx, detail, 112, y + 3, 810, 34, 44, 500) + 22;
        }
        if (data.website) {
            const text = `Visit ${new URL(data.website).hostname} ↗`;
            label(ctx, text, 112, 1322, 33, 700, data.colors[0]);
            const linkWidth = ctx.measureText(text).width;
            ctx.fillStyle = data.colors[0];
            ctx.fillRect(112, 1330, linkWidth, 2);
            links.push({ x: 96, y: 1285, width: linkWidth + 32, height: 58, url: data.website });
        }
        label(ctx, 'VIEW ID CARD', 500, 1385, 28, 500, muted, 'center', monoFont);
        ctx.restore();
    }

    const companies = {
        ultramind: {
            name: 'UltraMind', role: 'Product Designer', dates: 'APR 2024 — OCT 2026',
            colors: ['#6229b6', '#42039a'], website: 'https://ultramind.life',
            points: [
            ['Designed the iOS product from the ground up', 'User flows, UI, widgets, and interactive prototypes.'],
            ['Led design discussions with CTOs and CEOs', 'Aligned product direction and priorities.'],
            ['Owned design quality', 'Improved usability, clarity, and consistency with engineering.'],
            ['Designed the official website', 'ultramind.life · Figma, Figma AI, Claude Design, and Adobe tools.'],
            ['Built automation workflows', 'Streamlined repetitive design and research tasks.']
        ]
        },
        svelty: {
            name: 'Svelty', subtitle: 'MARKETING AGENCY',
            role: 'Product Designer & Manager', dates: 'PRESENT',
            colors: ['#df681c', '#a63d0c'], website: 'https://svelty.in',
            points: [
                ['Graphic design', 'Create visual assets and marketing creatives tailored to clients’ brands.'],
                ['UI/UX design', 'Design intuitive websites and CRM tools for client products.'],
                ['Design & development', 'Designed and developed svelty.in and crm.svelty.in.'],
                ['Team & client coordination', 'Manage the team, coordinate internal communication, and liaise with clients to align priorities and delivery.']
            ]
        }
    };

    window.createExperienceBadgeTextures = function (THREE, renderer, company = 'ultramind') {
        const data = companies[company];
        const frontCanvas = document.createElement('canvas');
        const backCanvas = document.createElement('canvas');
        for (const canvas of [frontCanvas, backCanvas]) {
            canvas.width = W;
            canvas.height = H;
        }
        const frontCtx = frontCanvas.getContext('2d');
        const backCtx = backCanvas.getContext('2d');
        const frontTexture = new THREE.CanvasTexture(frontCanvas);
        const backTexture = new THREE.CanvasTexture(backCanvas);
        for (const texture of [frontTexture, backTexture]) {
            // The existing renderer uses linear output; retain the artwork's CSS colors.
            texture.encoding = THREE.LinearEncoding;
            // The imported office hierarchy mirrors the card's local X axis.
            texture.repeat.x = -1;
            texture.offset.x = 1;
            texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        }
        const links = [];
        let portrait = null;
        function redraw() {
            front(frontCtx, portrait, data);
            back(backCtx, data, links);
            frontTexture.needsUpdate = backTexture.needsUpdate = true;
        }
        redraw();
        const photo = new Image();
        photo.onload = () => { portrait = photo; redraw(); };
        photo.src = 'pranathi_portrait.png';
        if (document.fonts) document.fonts.ready.then(redraw);
        return { frontTexture, backTexture, links, website: data.website, description: `${data.name}, ${data.role}, ${data.dates}.`, details: data.points.map(point => point.join('. ')).join(' ') };
    };
})();
