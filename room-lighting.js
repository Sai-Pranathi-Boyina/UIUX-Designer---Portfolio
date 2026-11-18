/* Warm practical lights, cream plaster and a lighter honey-oak night palette. */
window.createRoomLighting = function ({scene, renderer, ambientLight, keyLight, fillLight, findNode}) {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const group = new THREE.Group();
    group.name = 'Studio lighting fixtures';
    scene.add(group);
    const sources = [], emitters = [];
    const cabinetSources = [];
    const washes = [];
    const palette = [], screenMaterials = [], woodMix = {value:0};
    const noticeboardMaterials = new Set();
    for (const name of ['cork noticeboard', 'ContinuousNoticeboardFrame']) {
        findNode(name)?.traverse(node=>{
            if (!node.isMesh) return;
            const materials=(Array.isArray(node.material)?node.material:[node.material]).map(material=>{
                // The imported board shares its oak with the desk and cupboard.
                const copy=material.clone();noticeboardMaterials.add(copy);return copy;
            });
            node.material=Array.isArray(node.material)?materials:materials[0];
        });
    }
    const treatedMaterials = new Set();
    scene.traverse(node => {
        if (!node.isMesh) return;
        for (const material of (Array.isArray(node.material) ? node.material : [node.material])) {
            if (treatedMaterials.has(material)) continue;
            treatedMaterials.add(material);
            // Screen and badge canvases already contain finished UI colors.
            // Collect them before adding the room's glow textures below.
            if (material.isMeshBasicMaterial && material.map?.isCanvasTexture && material.toneMapped === false) {
                screenMaterials.push(material);
            }
            if (/Office (plaster|cabinet.*cream doors|skirting)/i.test(material.name)) {
                palette.push({material, day:material.color.clone(), night:new THREE.Color(.57,.53,.44)});
            } else if (/Office (oak|floor.*oak)/i.test(material.name)) {
                // Lift and soften the existing grain rather than replacing its texture.
                const isNoticeboard=noticeboardMaterials.has(material);
                const oakFinish=isNoticeboard
                    ? 'mix(vec3(oakLuma), diffuseColor.rgb, .55) * 1.25 + vec3(.16, .105, .045)'
                    : 'mix(vec3(oakLuma), diffuseColor.rgb, .70) * 1.15 + vec3(.045, .030, .012)';
                const previousCompile = material.onBeforeCompile;
                material.onBeforeCompile = function(shader, renderer) {
                    previousCompile.call(this, shader, renderer);
                    shader.uniforms.roomWoodMix = woodMix;
                    shader.fragmentShader = 'uniform float roomWoodMix;\n' + shader.fragmentShader;
                    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
                        #include <map_fragment>
                        float oakLuma = dot(diffuseColor.rgb, vec3(.2126, .7152, .0722));
                        vec3 honeyOak = ${oakFinish};
                        diffuseColor.rgb = mix(diffuseColor.rgb, honeyOak, roomWoodMix);
                    `);
                };
                material.customProgramCacheKey = () => isNoticeboard?'room-noticeboard-honey-v1':'room-honey-oak-v1';
                material.needsUpdate = true;
            }
        }
    });
    // The second plaster material has a different imported name.
    const sidePlaster=findNode('right warm wall');
    sidePlaster?.traverse(node=>{
        if(!node.isMesh) return;
        for(const material of (Array.isArray(node.material)?node.material:[node.material])) {
            if(!palette.some(entry=>entry.material===material))
                palette.push({material,day:material.color.clone(),night:new THREE.Color(.57,.53,.44)});
        }
    });
    const leftDoor=findNode('cabinet left door hinge');
    const rightDoor=findNode('cabinet right door hinge');
    const warm = 0xffbe78;
    const brass = new THREE.MeshStandardMaterial({color:0x756249, metalness:.65, roughness:.38});
    const enamel = new THREE.MeshStandardMaterial({color:0xe8ddc8, metalness:.15, roughness:.5});
    function mesh(geometry, material, position, parent=group) {
        const object=new THREE.Mesh(geometry,material);
        object.position.copy(position); object.castShadow=true; object.receiveShadow=true;
        parent.add(object); return object;
    }
    function diffuser() {
        const material=new THREE.MeshStandardMaterial({color:0xffedcf,emissive:warm,emissiveIntensity:0,roughness:.6});
        emitters.push(material); return material;
    }
    function point(position, intensity, distance, color=warm) {
        const light=new THREE.PointLight(color,0,distance,2);
        light.position.copy(position); group.add(light); sources.push({light,intensity}); return light;
    }
    function bounds(name) {
        const object=findNode(name);
        if(!object) return null;
        object.updateWorldMatrix(true,true);
        return new THREE.Box3().setFromObject(object);
    }
    const desk=bounds('solid oak desktop');
    if(desk) {
        const lamp=new THREE.Group(); lamp.name='Warm desk lamp'; group.add(lamp);
        // Place the lamp at the back corner, leaving the laptop and phone untouched.
        lamp.position.set(desk.max.x-.27,desk.max.y+.015,desk.max.z-.26);
        // Rounded ceramic base and softly curved opal shade, compact enough for the desk.
        const baseProfile=[[0,0],[.09,0],[.105,.025],[.10,.065],[.075,.115],[.055,.14],[0,.14]];
        mesh(new THREE.LatheGeometry(baseProfile.map(([r,y])=>new THREE.Vector2(r,y)),40),enamel,new THREE.Vector3(),lamp);
        mesh(new THREE.CylinderGeometry(.028,.035,.065,24),brass,new THREE.Vector3(0,.16,0),lamp);
        const shadeProfile=[[0,.405],[.06,.402],[.095,.387],[.115,.36],[.13,.31],[.15,.235],[.157,.205],[.153,.19],[.14,.185],[0,.185]];
        const shade=mesh(new THREE.LatheGeometry(shadeProfile.slice().reverse().map(([r,y])=>new THREE.Vector2(r,y)),48),diffuser(),new THREE.Vector3(),lamp);
        shade.name='Rounded opal lamp shade'; shade.castShadow=false;
        // The shade lights its immediate surroundings; the downward beam lights the desk.
        point(lamp.position.clone().add(new THREE.Vector3(0,.29,0)),2.3,3.0);
        // A low-energy bounce gives the wall a broad halo instead of a hard spotlight.
        point(lamp.position.clone().add(new THREE.Vector3(0,.55,-.18)),.38,3.0);
        const task=new THREE.SpotLight(warm,0,2.2,Math.PI/2.6,1,2);
        task.position.copy(lamp.position).add(new THREE.Vector3(0,.20,0));
        task.target.position.copy(lamp.position).add(new THREE.Vector3(-.2,-.1,-.18));
        group.add(task,task.target); sources.push({light:task,intensity:2.8});
    }
    const shelf=bounds('floating shelf');
    if(shelf) {
        const size=shelf.getSize(new THREE.Vector3()), center=shelf.getCenter(new THREE.Vector3());
        const alongX=size.x>size.z;
        const strip=mesh(new THREE.BoxGeometry(alongX?size.x*.8:.025,.018,alongX?.025:size.z*.8),diffuser(),new THREE.Vector3(center.x,shelf.min.y-.016,center.z));
        strip.name='Under-shelf warm diffuser'; strip.castShadow=false;
        // Several overlapping, low-power sources approximate the length of the diffuser.
        for (const fraction of [-.33,0,.33]) {
            const position=strip.position.clone().add(new THREE.Vector3(0,-.12,-.06));
            position[alongX?'x':'z']+=(alongX?size.x:size.z)*fraction;
            point(position,.36,2.1);
        }
    }
    // Low skirting light runs all the way to both wall boundaries.
    const backWall=bounds('back cream wall'), sideWall=bounds('right warm wall');
    if(backWall && sideWall && desk && shelf) {
        const xStart=sideWall.max.x+.035, zEnd=backWall.min.z-.035;
        const xEnd=backWall.max.x-.035;
        const zStart=sideWall.min.z+.035;
        // A continuous soft wall wash approximates bounced strip light without
        // introducing dozens of point lights or scalloped hot spots.
        const glowCanvas=document.createElement('canvas');
        glowCanvas.width=16;glowCanvas.height=128;
        const ctx=glowCanvas.getContext('2d');
        const gradient=ctx.createLinearGradient(0,0,0,128);
        gradient.addColorStop(0,'rgba(255,192,109,0)');
        gradient.addColorStop(.55,'rgba(255,192,109,.10)');
        gradient.addColorStop(.85,'rgba(255,192,109,.40)');
        gradient.addColorStop(1,'rgba(255,215,145,.72)');
        ctx.fillStyle=gradient;ctx.fillRect(0,0,16,128);
        const glowTexture=new THREE.CanvasTexture(glowCanvas);
        function rail(alongX,start,end,fixed) {
            const length=end-start;
            if(length<=0) return;
            const position=new THREE.Vector3(alongX?(start+end)/2:fixed,.32,alongX?fixed:(start+end)/2);
            const strip=mesh(new THREE.BoxGeometry(alongX?length:.025,.028,alongX?.025:length),diffuser(),position);
            strip.name='Warm skirting diffuser';strip.castShadow=false;
            const glowHeight=.75;
            const material=new THREE.MeshBasicMaterial({map:glowTexture,transparent:true,opacity:0,
                blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false});
            const glow=new THREE.Mesh(new THREE.PlaneGeometry(length,glowHeight),material);
            glow.position.copy(position);glow.position.y+=glowHeight/2;
            if(alongX) {glow.position.z+=.008;glow.rotation.y=Math.PI;}
            else {glow.position.x-=.008;glow.rotation.y=Math.PI/2;}
            group.add(glow);washes.push(material);
            const source=position.clone();
            // Keep the light source near the furniture even though the diffuser
            // continues to the wall boundary, beyond the home camera's view.
            source[alongX?'x':'z']=alongX?(xStart+desk.max.x)/2:(desk.min.z+zEnd)/2;
            source[alongX?'z':'x']+=alongX?-.28:.28;source.y+=.18;
            point(source,.32,3.0,0xffd29e);
        }
        rail(true,xStart,xEnd,zEnd);
        rail(false,zStart,zEnd,xStart);
    }
    if(desk) {
        const size=desk.getSize(new THREE.Vector3()), center=desk.getCenter(new THREE.Vector3());
        // Recessed just under the front and end edges, following the actual desk.
        const lightMaterial=diffuser();
        const front=mesh(new THREE.BoxGeometry(size.x-.06,.018,.022),lightMaterial,
            new THREE.Vector3(center.x,desk.min.y-.015,desk.min.z+.025));
        front.name='Desk front-edge warm light';front.castShadow=false;
        for(const x of [desk.min.x+.025,desk.max.x-.025]) {
            const side=mesh(new THREE.BoxGeometry(.022,.018,size.z-.06),lightMaterial,
                new THREE.Vector3(x,desk.min.y-.015,center.z));
            side.name='Desk side-edge warm light';side.castShadow=false;
        }
        for(const fraction of [-.28,.28]) {
            point(new THREE.Vector3(center.x+size.x*fraction,desk.min.y-.18,desk.min.z+.16),.75,2.6);
        }
        // Broad bounced light across the work surface keeps the oak and keyboard legible.
        point(new THREE.Vector3(center.x,desk.max.y+.65,center.z),.65,3.1,0xffdfb3);
    }
    const cabinet=findNode('cabinet interior light diffuser');
    if(cabinet) {
        cabinet.traverse(node=>{
            if(!node.isMesh) return;
            const materials=(Array.isArray(node.material)?node.material:[node.material]).map(material=>{
                const copy=material.clone();
                if(copy.emissive) {copy.emissive.setHex(warm);emitters.push(copy);}
                return copy;
            });
            node.material=Array.isArray(node.material)?materials:materials[0];
        });
        // Mount inside the cabinet's own coordinate system: the imported assembly
        // is rotated and mirrored, so world-axis offsets put lights outside it.
        const assembly=findNode('cabinet functional assembly');
        if(assembly) {
            const interior=new THREE.Group();
            interior.name='Cupboard warm interior lighting';
            assembly.add(interior);
            // Flush inlays on the inner side-panel faces, not free-standing light bars.
            // The imported cabinet inner faces are x=-.65 and x=.65 in assembly space.
            const channelMaterial=new THREE.MeshStandardMaterial({color:0x574330,roughness:.8});
            for(const [wallX,inward] of [[-.65,1],[.65,-1]]) {
                const channel=mesh(new THREE.PlaneGeometry(.052,2.30),channelMaterial,
                    new THREE.Vector3(wallX+inward*.0008,2.70,-.36),interior);
                channel.rotation.y=inward*Math.PI/2;channel.castShadow=false;
                const strip=mesh(new THREE.PlaneGeometry(.026,2.25),diffuser(),
                    new THREE.Vector3(wallX+inward*.0015,2.70,-.36),interior);
                strip.rotation.y=inward*Math.PI/2;
                strip.name='Flush cupboard side-panel light inlay';
                strip.castShadow=false;
            }
            // Side sources light the fronts of the clothes; the top light fills the rail.
            for(const [x,y,z,intensity,distance] of [
                [-.46,2.85,-.43,1.0,2.3],
                [.46,2.85,-.43,1.0,2.3],
                [0,3.78,-.12,.7,2.5]
            ]) {
                const light=new THREE.PointLight(warm,0,distance,2);
                light.position.set(x,y,z);
                interior.add(light);
                cabinetSources.push({light,intensity});
            }
        }
    }
    createRoomAccents({THREE,group,findNode,mesh,point,diffuser,washes});
    const board=bounds('cork noticeboard');
    if(board) {
        // A restrained warm bounce reaches the wooden face as well as its backlit edge.
        const center=board.getCenter(new THREE.Vector3());
        point(center.clone().add(new THREE.Vector3(.65,.15,0)),.38,1.8,0xffdfb1);
    }
    const monitor=findNode('InteractiveMonitorScreen');
    if(monitor) {
        monitor.updateWorldMatrix(true,false);
        const position=monitor.localToWorld(new THREE.Vector3(0,0,-.18));
        point(position,1.2,3.2,0x92bdff);
    }
    // Keep the soft portrait bounce close to the subject, rather than aiming at the room.
    const face=bounds('rounded cheeks and tapered jaw');
    if(face) {
        const center=face.getCenter(new THREE.Vector3());
        const bounce=new THREE.SpotLight(0xffdfb8,0,4.8,.85,1,2);
        bounce.position.copy(center).add(new THREE.Vector3(1.7,.5,1.3));
        bounce.target.position.copy(center).add(new THREE.Vector3(0,-.3,0));
        group.add(bounce,bounce.target);
        sources.push({light:bounce,intensity:2.1});
    }
    const dayBackground=new THREE.Color(0xF4EFE7), nightBackground=new THREE.Color(0x111722);
    const dayAmbient=new THREE.Color(0xfffbf5), nightAmbient=new THREE.Color(0xc3c6dd);
    const dayKey=new THREE.Color(0xfff8ee), nightKey=new THREE.Color(0xc0cce0);
    const dayFill=new THREE.Color(0xf4efe7), nightFill=new THREE.Color(0x91aee8);
    let target=1, mix=1;
    const query=new URLSearchParams(location.search).get('room');
    if(query==='day'||query==='night') target=query==='night'?1:0;
    mix=target;
    const control=document.createElement('div');
    control.id='room-theme-toggle';
    control.setAttribute('role','group');
    control.setAttribute('aria-label','Room lighting');
    control.innerHTML=`<button type="button" data-mode="day" aria-label="Day mode" title="Day mode"><svg class="theme-sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg></button><button type="button" data-mode="night" aria-label="Night mode" title="Night mode"><svg class="theme-moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/></svg></button>`;
    document.body.append(control);
    function select(mode) {
        target=mode==='night'?1:0;
        // Preserve the original Day rendering; the revised output profile is Night-only.
        renderer.outputEncoding=target?THREE.sRGBEncoding:THREE.LinearEncoding;
        // Match decoding to output so Night's sRGB conversion does not wash out
        // the laptop, monitor, phone or printed badge UI. Day stays unchanged.
        screenMaterials.forEach(material=>{
            if(material.map.encoding===renderer.outputEncoding) return;
            material.map.encoding=renderer.outputEncoding;
            material.map.needsUpdate=true;
            material.needsUpdate=true;
        });
        control.querySelectorAll('button').forEach(button=>{
            button.setAttribute('aria-pressed',String(button.dataset.mode===mode));
        });
        document.body.dataset.roomMode=mode;
    }
    control.querySelectorAll('button').forEach(button=>{
        button.addEventListener('click',()=>select(button.dataset.mode));
    });
    select(target?'night':'day');
    let appliedMix=NaN,appliedDoorAngle=NaN;
    function update(delta) {
        mix=reduced.matches?target:THREE.MathUtils.lerp(mix,target,1-Math.exp(-3*Math.min(delta,.1)));
        if(Math.abs(mix-target)<.001)mix=target;
        const doorAngle=Math.max(Math.abs(leftDoor?.rotation.y||0),Math.abs(rightDoor?.rotation.y||0));
        if(mix===appliedMix && doorAngle===appliedDoorAngle) return;
        appliedMix=mix;appliedDoorAngle=doorAngle;
        scene.background.copy(dayBackground).lerp(nightBackground,mix);
        ambientLight.color.copy(dayAmbient).lerp(nightAmbient,mix);
        ambientLight.intensity=THREE.MathUtils.lerp(1.35,.24,mix);
        keyLight.color.copy(dayKey).lerp(nightKey,mix);
        keyLight.intensity=THREE.MathUtils.lerp(1.85,.04,mix);
        fillLight.color.copy(dayFill).lerp(nightFill,mix);
        fillLight.intensity=THREE.MathUtils.lerp(.85,.16,mix);
        renderer.toneMappingExposure=THREE.MathUtils.lerp(1.08,.90,mix);
        washes.forEach(material=>{material.opacity=.40*mix;});
        palette.forEach(({material,day,night})=>material.color.copy(day).lerp(night,mix));
        woodMix.value=mix;
        sources.forEach(({light,intensity})=>{light.intensity=intensity*mix;});
        // Fade with the actual door pose, including when reversing an opening animation.
        // Closed doors must not leak unshadowed point light onto the outside of the room.
        const cabinetOpen=THREE.MathUtils.smoothstep(doorAngle,.08,.9);
        cabinetSources.forEach(({light,intensity})=>{light.intensity=intensity*mix*cabinetOpen;});
        emitters.forEach(material=>{material.emissiveIntensity=THREE.MathUtils.lerp(.05,1.25,mix);});
    }
    update(0);
    return {update,select,group};
};
