/* Native, scrollable counterparts to the room's screens on compact viewports. */
(() => {
    const media = window.matchMedia('(max-width: 900px)');
    const sheet = document.createElement('section');
    sheet.id = 'mobile-content'; sheet.hidden = true; sheet.setAttribute('aria-label', 'Section details');
    const pager = document.createElement('nav');
    pager.id = 'mobile-section-controls'; pager.setAttribute('aria-label', 'Section navigation');
    let previousSection = -1;
    let revealTimer = 0;
    let revealAnimation = null;
    document.body.append(sheet, pager);
    const order = [1,3,2,4,5];
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    // Keep physical badges and the phone interactive. Dense screen content gets
    // a readable native surface after the camera arrives at its object.
    function screenBounds(section) {
        const mesh = section===1 ? laptopScreenMesh : section===3 ? monitorScreenMesh : null;
        if(!mesh) return null;
        mesh.updateWorldMatrix(true, false);
        mesh.geometry.computeBoundingBox();
        const box=mesh.geometry.boundingBox;
        const points=[];
        for(const x of [box.min.x,box.max.x]) for(const y of [box.min.y,box.max.y]) for(const z of [box.min.z,box.max.z]) {
            const p=new THREE.Vector3(x,y,z).applyMatrix4(mesh.matrixWorld).project(parallaxCamera);
            points.push({x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2});
        }
        const left=Math.min(...points.map(p=>p.x)), top=Math.min(...points.map(p=>p.y));
        return {left,top,width:Math.max(...points.map(p=>p.x))-left,height:Math.max(...points.map(p=>p.y))-top};
    }
    function revealReadableSurface(section) {
        if(!media.matches || currentSection!==section || ![1,3,4].includes(section)) return;
        const source=screenBounds(section);
        // Approximately 12px minimum for the screens' smallest useful text.
        const readableWidth=section===1?680:760;
        if(section!==4 && source && source.width>=readableWidth) return;
        document.body.dataset.mobileDetails='true';
        sheet.hidden=false;
        const target=sheet.getBoundingClientRect();
        if(!reducedMotion.matches) {
            const from=source ? {
                transform:`translate(${source.left+source.width/2-target.left-target.width/2}px, ${source.top+source.height/2-target.top-target.height/2}px) scale(${Math.min(1,source.width/target.width)}, ${Math.min(1,source.height/target.height)})`, opacity:0
            } : {transform:'translateY(24px)',opacity:0};
            revealAnimation=sheet.animate([from,{transform:'none',opacity:1}],{duration:340,easing:'cubic-bezier(.2,.8,.2,1)'});
        }
    }
    const icons = {
        1:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M2 21h20M9 17v4m6-4v4"/>',
        3:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 9v12"/>',
        2:'<rect x="5" y="4" width="14" height="18" rx="3"/><path d="M9 4V2h6v2M9 16h6M9 12h6"/>',
        4:'<path d="m2 9 10-5 10 5-10 5-10-5Zm4 2v7c4 3 8 3 12 0v-7m4-2v7"/>',
        5:'<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 5h4m-3 14h2"/>'
    };
    const icon = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[n]}</svg>`;
    const chrome = title => `<div class="mobile-window-bar"><span aria-hidden="true"><i></i><i></i><i></i></span><span>${title}</span><span aria-hidden="true">↗</span></div>`;
    const names = ['Home','Skills','Experience','Projects','Education','Contact'];
    const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const link = (url, label) => `<a class="mobile-action" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;
    const list = values => `<ul>${values.map(v=>`<li>${esc(v)}</li>`).join('')}</ul>`;
    function projectCard(p, detail=false) {
        const cover = monitorImages[p.id === 'cms-websites' ? 'vibrantvista' : p.id].getAttribute('src');
        const inner = `<img class="mobile-cover" src="${esc(cover)}" alt="${esc(p.title)} preview" loading="lazy"><h3>${esc(p.title)}</h3><p class="mobile-muted">${esc(p.subtitle)}</p>`;
        if (!detail) return `<button class="mobile-card mobile-project" data-project="${esc(p.id)}">${inner}<span class="mobile-action">Explore project</span></button>`;
        return `<article class="mobile-card">${inner}<p>${esc(p.desc)}</p>${list(p.highlights)}<p class="mobile-muted">${esc(p.tools.join(' · '))}</p>${link(p.link,p.ctaText)}${p.id==='cms-websites' ? '<p>'+link('https://dityajewellery.great-site.net','Visit Ditya Jewellery ↗')+'</p>' : ''}</article>`;
    }
    window.syncMobilePortfolio = function(reset = true) {
        if (!media.matches) {
            clearTimeout(revealTimer); revealAnimation?.cancel(); sheet.hidden=true;
            previousSection=-1;
            delete document.body.dataset.mobileSection; delete document.body.dataset.mobileDetails; return;
        }
        const changed=previousSection!==currentSection;
        if(changed) {
            clearTimeout(revealTimer); revealAnimation?.cancel();
            previousSection=currentSection; sheet.hidden=true;
            document.body.dataset.mobileDetails='false';
            const section=currentSection;
            revealTimer=setTimeout(()=>revealReadableSurface(section), reducedMotion.matches?0:1150);
        }
        document.body.dataset.mobileSection = currentSection;
        pager.innerHTML = order.map(n=>`<button data-section="${n}" aria-label="${names[n]}" ${n===currentSection?'aria-current="page"':''}>${icon(n)}<span>${names[n]}</span></button>`).join('');
        sheet.setAttribute('aria-label', names[currentSection]);
        let html = [1,3].includes(currentSection) ? chrome(currentSection===1?'Skills · Design workspace':'Projects · Figma') : '';
        html+=`<h2>${names[currentSection]}</h2>`;
        if (currentSection===1) {
            html+='<div class="mobile-skill-origin">Design → Build → Deliver</div>';
            if(activeSkillTab!=='all') html+='<button class="mobile-action" data-skill="all">← Skills overview</button>';
            html+='<div class="mobile-skill-tree">'+skillsCategories.filter(c=>activeSkillTab==='all'||c.id===activeSkillTab).map(c=>`<article class="mobile-card mobile-skill" style="--skill-color:${c.color}"><button data-skill="${c.id}">${esc(c.title)} ↗</button><p>${esc(c.description)}</p>${activeSkillTab==='all'?'':list(c.skills)+`<p class="mobile-muted">${esc(c.tools)}</p><p>${esc(c.outcome)}</p>`}</article>`).join('')+'</div>';
        } else if(currentSection===3) {
            const p=projectsData.find(p=>p.id===activeProjectSlug);
            html+=p?'<button class="mobile-action" data-project="">← All projects</button>'+projectCard(p,true):projectsData.map(p=>projectCard(p)).join('');
        } else if(currentSection===4) {
            html+=Array.from(document.querySelectorAll('#edu-cards-col .edu-callout-card')).map(card=>`<article class="mobile-card"><h3>${esc(card.querySelector('.edu-card-title').textContent)}</h3><p class="mobile-muted">${esc(card.querySelector('.edu-card-badge').textContent)}</p><p>${esc(card.querySelector('.edu-card-inst').textContent)}</p><p>${esc(card.querySelector('.edu-card-grade').textContent)}</p></article>`).join('');
        }

        sheet.innerHTML=html;
        if(reset) sheet.scrollTop=0;
        const active=document.querySelector('.nav-link.active');
        if(active) active.scrollIntoView({block:'nearest',inline:'nearest',behavior:'auto'});
    };
    sheet.addEventListener('click',event=>{
        const project=event.target.closest('[data-project]');
        const skill=event.target.closest('[data-skill]');
        if(project) { showProject(project.dataset.project); sheet.querySelector('button, a')?.focus({preventScroll:true}); }
        if(skill) { setSkillTab(skill.dataset.skill); sheet.querySelector('button')?.focus({preventScroll:true}); }
    });
    pager.addEventListener('click',event=>{
        const button=event.target.closest('[data-section]');
        if(button) goToSection(Number(button.dataset.section));
    });
    document.querySelectorAll('.nav-link').forEach(a=>{
        a.setAttribute('role','button');a.tabIndex=0;
        a.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();a.click();}});
    });
    media.addEventListener('change',()=>{syncMobilePortfolio();goToSection(currentSection);});
    let resizeTimer;
    addEventListener('resize',()=>{
        clearTimeout(resizeTimer);
        resizeTimer=setTimeout(()=>{
            if(!media.matches) return;
            revealAnimation?.cancel(); sheet.hidden=true;
            document.body.dataset.mobileDetails='false';
            revealReadableSurface(currentSection);
        },180);
    });
    syncMobilePortfolio();
})();
