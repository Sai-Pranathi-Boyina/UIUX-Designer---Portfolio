/* Original canvas artwork for the portfolio laptop; coordinates are in 1024 × 700 units. */
(function () {
    const categories = [
        { id: 'figma', title: 'Interface & design systems', short: 'UI & systems', color: '#b7d5bf',
          description: 'Consistent interfaces that scale across screens and products.',
          skills: ['Auto Layout & responsive UI', 'Components & variants', 'Variables & design libraries', 'Interactive prototypes', 'Developer handoff'],
          tools: 'Figma · Figma AI', outcome: 'From early layouts to reusable, implementation-ready systems.' },
        { id: 'ux', title: 'UX methods', short: 'UX methods', color: '#d5c9ee',
          description: 'Clear journeys built around user needs and product goals.',
          skills: ['User flows', 'Information architecture', 'Wireframing', 'Usability testing', 'Research & ideation'],
          tools: 'Figma · Research synthesis', outcome: 'Turn complex requirements into clear, usable experiences.' },
        { id: 'spatial', title: 'Visual design & motion', short: 'Visual & motion', color: '#ecc9a6',
          description: 'Brand-led visuals, client creatives and expressive motion.',
          skills: ['Graphic design & client creatives', 'Brand & visual design', '3D modeling & animation', 'Motion & visual effects', 'Interactive 3D scenes'],
          tools: 'Adobe Creative Suite · Blender · Spline · Rive · Lottie', outcome: 'Bring a consistent visual identity to campaigns and products.' },
        { id: 'tools', title: 'Development & tools', short: 'Build & tools', color: '#b1d7e2',
          description: 'Bring designs to life and simplify the delivery workflow.',
          skills: ['Website design & development', 'CRM interface design', 'No-code & CMS workflows', 'HTML & CSS', 'AI-assisted workflow automation'],
          tools: 'Webflow · WordPress · FlutterFlow · Claude', outcome: 'Connect design, development and day-to-day team workflows.' }
    ];
    window.skillsCategories = categories;
    window.getSkillsTarget = function (x, y, active = 'all') {
        const tabs = [{ id: 'all', x: 24, w: 160 }, { id: 'figma', x: 194, w: 190 },
            { id: 'ux', x: 394, w: 175 }, { id: 'spatial', x: 579, w: 175 }, { id: 'tools', x: 764, w: 160 }];
        if (y >= 62 && y <= 106) {
            const tab = tabs.find(tab => x >= tab.x && x < tab.x + tab.w);
            return tab ? tab.id : null;
        }
        if (active !== 'all') return null;
        const cards = [{ id: 'figma', x: 28, y: 118 }, { id: 'ux', x: 524, y: 118 },
            { id: 'spatial', x: 28, y: 402 }, { id: 'tools', x: 524, y: 402 }];
        const card = cards.find(card => x >= card.x && x <= card.x + 472 && y >= card.y && y <= card.y + 270);
        return card ? card.id : null;
    };

        window.drawSkillsArtwork = function (ctx, activeSkillTab = 'all') {
            ctx.save();
            ctx.setTransform(2, 0, 0, 2, 0, 0);
            const w = 1024;
            const h = 700;

            // Deep High-Contrast Obsidian Dark Canvas for maximum readability
            const bgGrad = ctx.createLinearGradient(0, 0, w, h);
            bgGrad.addColorStop(0, '#06070a');
            bgGrad.addColorStop(1, '#0b0d13');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, w, h);

            // Subtle Deep Grid
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
            ctx.lineWidth = 1;
            for (let x = 0; x < w; x += 36) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
            }
            for (let y = 0; y < h; y += 36) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
            }

            // Top Header Bar
            ctx.fillStyle = '#0e1118';
            ctx.fillRect(0, 0, w, 52);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
            ctx.beginPath(); ctx.moveTo(0, 52); ctx.lineTo(w, 52); ctx.stroke();

            // macOS Window Dots
            ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(26, 26, 7, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(50, 26, 7, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(74, 26, 7, 0, Math.PI * 2); ctx.fill();

            // Figma / Workspace Title (Enlarged)
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 19.5px "Montserrat", sans-serif';
            ctx.textAlign = 'left';
            drawPortfolioText(ctx, '❖ Sai_Pranathi_Design_System.fig', 106, 33);

            ctx.fillStyle = '#10b981';
            ctx.beginPath(); ctx.arc(840, 26, 5.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#34d399';
            ctx.font = 'bold 15px "Montserrat", sans-serif';
            drawPortfolioText(ctx, 'Design workspace', 855, 32);

            // Category Filter Tabs Row
            const tabs = [
                { id: 'all', label: 'Overview', x: 24, w: 160 },
                { id: 'figma', label: 'UI & systems', x: 194, w: 190 },
                { id: 'ux', label: 'UX methods', x: 394, w: 175 },
                { id: 'spatial', label: 'Visual & motion', x: 579, w: 175 },
                { id: 'tools', label: 'Build & tools', x: 764, w: 160 }
            ];

            tabs.forEach(t => {
                const isActive = activeSkillTab === t.id;
                ctx.fillStyle = isActive ? '#1a3b2b' : '#11141d';
                ctx.beginPath(); ctx.roundRect(t.x, 62, t.w, 44, 12); ctx.fill();
                ctx.strokeStyle = isActive ? '#4ade80' : 'rgba(255, 255, 255, 0.12)';
                ctx.lineWidth = isActive ? 2 : 1;
                ctx.stroke();

                ctx.fillStyle = isActive ? '#ffffff' : '#cbd5e1';
                ctx.font = isActive ? 'bold 15.5px "Montserrat", sans-serif' : '600 14.5px "Montserrat", sans-serif';
                ctx.textAlign = 'center';
                drawPortfolioText(ctx, t.label, t.x + t.w / 2, 89);
            });

            // Helper to draw clean skill badge pills (Enlarged text & high-contrast background)
            function drawSkillChips(skills, startX, startY, maxW, isFeatured) {
                let curX = startX;
                let curY = startY;
                const pillH = isFeatured ? 42 : 34;
                const pillPaddingX = isFeatured ? 18 : 13;
                ctx.font = isFeatured ? '600 16px "Montserrat", sans-serif' : '600 16px "Montserrat", sans-serif';

                skills.forEach(skill => {
                    const textW = ctx.measureText(skill).width;
                    const pillW = textW + pillPaddingX * 2;

                    if (curX + pillW > startX + maxW) {
                        curX = startX;
                        curY += pillH + (isFeatured ? 9 : 8);
                    }

                    // Background
                    ctx.fillStyle = isFeatured ? 'rgba(26, 59, 43, 0.75)' : '#161a24';
                    ctx.beginPath();
                    ctx.roundRect(curX, curY, pillW, pillH, isFeatured ? 10 : 8);
                    ctx.fill();

                    // Border
                    ctx.strokeStyle = isFeatured ? '#4ade80' : 'rgba(255, 255, 255, 0.18)';
                    ctx.lineWidth = isFeatured ? 1.5 : 1;
                    ctx.stroke();

                    // Text
                    ctx.fillStyle = '#ffffff';
                    ctx.textAlign = 'left';
                    drawPortfolioText(ctx, skill, curX + pillPaddingX, curY + pillH - (isFeatured ? 14 : 11));

                    curX += pillW + (isFeatured ? 10 : 8);
                });
            }

            // Authentic Resume Skills Data - Curated for optimal readability & zero overflow
            const figmaSkillsAll = categories[0].skills;
            const aiUxSkillsAll = categories[1].skills;
            const creativeSkillsAll = categories[2].skills;
            const noCodeSkillsAll = categories[3].skills;
            const figmaSkillsFull = figmaSkillsAll;
            const aiUxSkillsFull = aiUxSkillsAll;
            const creativeSkillsFull = creativeSkillsAll;
            const noCodeSkillsFull = noCodeSkillsAll;

            // Render content based on activeSkillTab
            if (activeSkillTab === 'all') {
                // 2x2 Grid of Solid Dark High-Contrast Skill Cards
                // Card 1: Figma (Top Left)
                ctx.fillStyle = '#0f121a';
                ctx.beginPath(); ctx.roundRect(28, 118, 472, 270, 14); ctx.fill();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)'; ctx.lineWidth = 1.5; ctx.stroke();
                ctx.fillStyle = '#A8B49A'; ctx.font = 'bold 18.5px "Montserrat", sans-serif'; ctx.textAlign = 'left';
                drawPortfolioText(ctx, '❖ UI & DESIGN SYSTEMS', 48, 148);
                ctx.fillStyle = '#94a3b8'; ctx.font = '500 13.5px "Montserrat", sans-serif';
                drawPortfolioText(ctx, 'Reusable components and responsive interfaces', 48, 168);
                drawSkillChips(figmaSkillsAll, 46, 184, 436, false);

                // Card 2: AI & Research (Top Right)
                ctx.fillStyle = '#0f121a';
                ctx.beginPath(); ctx.roundRect(524, 118, 472, 270, 14); ctx.fill();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)'; ctx.lineWidth = 1.5; ctx.stroke();
                ctx.fillStyle = '#34d399'; ctx.font = 'bold 18.5px "Montserrat", sans-serif'; ctx.textAlign = 'left';
                drawPortfolioText(ctx, 'UX METHODS & RESEARCH', 544, 148);
                ctx.fillStyle = '#94a3b8'; ctx.font = '500 13.5px "Montserrat", sans-serif';
                drawPortfolioText(ctx, 'User journeys, structure and usability', 544, 168);
                drawSkillChips(aiUxSkillsAll, 542, 184, 436, false);

                // Card 3: Creative & 3D (Bottom Left)
                ctx.fillStyle = '#0f121a';
                ctx.beginPath(); ctx.roundRect(28, 402, 472, 270, 14); ctx.fill();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)'; ctx.lineWidth = 1.5; ctx.stroke();
                ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 18.5px "Montserrat", sans-serif'; ctx.textAlign = 'left';
                drawPortfolioText(ctx, 'VISUAL DESIGN & MOTION', 48, 432);
                ctx.fillStyle = '#94a3b8'; ctx.font = '500 13.5px "Montserrat", sans-serif';
                drawPortfolioText(ctx, 'Client creatives, visual identity and 3D', 48, 452);
                drawSkillChips(creativeSkillsAll, 46, 468, 436, false);

                // Card 4: No-Code & CMS (Bottom Right)
                ctx.fillStyle = '#0f121a';
                ctx.beginPath(); ctx.roundRect(524, 402, 472, 270, 14); ctx.fill();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)'; ctx.lineWidth = 1.5; ctx.stroke();
                ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 18.5px "Montserrat", sans-serif'; ctx.textAlign = 'left';
                drawPortfolioText(ctx, 'DEVELOPMENT & TOOLS', 544, 432);
                ctx.fillStyle = '#94a3b8'; ctx.font = '500 13.5px "Montserrat", sans-serif';
                drawPortfolioText(ctx, 'Websites, CRM tools and delivery workflows', 544, 452);
                drawSkillChips(noCodeSkillsAll, 542, 468, 436, false);
                ctx.fillStyle = '#b7c4b9';
                ctx.font = '600 22px "Montserrat", sans-serif';
                ctx.textAlign = 'right';
                [[478,148],[974,148],[478,432],[974,432]].forEach(([x,y]) => drawPortfolioText(ctx, '↗',x,y));
                ctx.textAlign = 'left';
            } else {
                // Expanded Single Domain View
                const cx = 32;
                const cy = 118;
                const cw = 960;
                const ch = 550;

                ctx.fillStyle = '#0f121a';
                ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 16); ctx.fill();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'; ctx.lineWidth = 1.5; ctx.stroke();

                let activeTitle = '';
                let activeSub = '';
                let activeItems = [];
                let activeColor = '#A8B49A';

                if (activeSkillTab === 'figma') {
                    activeTitle = '❖ UI & DESIGN SYSTEMS';
                    activeSub = 'Build consistent interfaces with reusable components, variables and responsive prototypes.';
                    activeItems = figmaSkillsFull;
                    activeColor = '#A8B49A';
                } else if (activeSkillTab === 'ux') {
                    activeTitle = 'UX METHODS & RESEARCH';
                    activeSub = 'Translate user needs into clear flows, information architecture and usable interfaces.';
                    activeItems = aiUxSkillsFull;
                    activeColor = '#34d399';
                } else if (activeSkillTab === 'spatial') {
                    activeTitle = 'VISUAL DESIGN & MOTION';
                    activeSub = 'Create client creatives, expressive motion and interactive 3D experiences.';
                    activeItems = creativeSkillsFull;
                    activeColor = '#38bdf8';
                } else if (activeSkillTab === 'tools') {
                    activeTitle = 'DEVELOPMENT & TOOLS';
                    activeSub = 'Bring websites and CRM interfaces to life with development tools and team collaboration.';
                    activeItems = noCodeSkillsFull;
                    activeColor = '#fbbf24';
                }

                ctx.fillStyle = activeColor; ctx.font = 'bold 24px "Montserrat", sans-serif'; ctx.textAlign = 'left';
                drawPortfolioText(ctx, activeTitle, cx + 32, cy + 46);

                ctx.fillStyle = '#cbd5e1'; ctx.font = '500 16px "Montserrat", sans-serif';
                drawPortfolioText(ctx, activeSub, cx + 32, cy + 78);

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)'; ctx.beginPath();
                ctx.moveTo(cx + 32, cy + 102); ctx.lineTo(cx + cw - 32, cy + 102); ctx.stroke();

                ctx.fillStyle = '#ffffff'; ctx.font = 'bold 16.5px "Montserrat", sans-serif';
                drawPortfolioText(ctx, 'METHODS & TOOLS', cx + 32, cy + 134);

                activeItems.forEach((skill, index) => {
                    const rowY = cy + 180 + index * 62;
                    ctx.fillStyle = activeColor;
                    ctx.font = '600 15px "JetBrains Mono", monospace';
                    drawPortfolioText(ctx, String(index + 1).padStart(2, '0'), cx + 32, rowY);
                    ctx.fillStyle = '#f0f3f7';
                    ctx.font = '600 23px "Montserrat", sans-serif';
                    drawPortfolioText(ctx, skill, cx + 80, rowY);
                    if (index < activeItems.length - 1) {
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
                        ctx.beginPath();
                        ctx.moveTo(cx + 80, rowY + 23);
                        ctx.lineTo(cx + cw - 32, rowY + 23);
                        ctx.stroke();
                    }
                });
            }

            ctx.restore();
        }

})();
