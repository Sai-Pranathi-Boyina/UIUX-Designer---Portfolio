/* Small physical details that connect the room's warm light sources. */
window.createRoomAccents = function ({THREE,group,findNode,mesh,point,diffuser,washes}) {
    const holder=findNode('shelf pencil cup');
    const shelf=findNode('floating shelf');
    if(holder && shelf) {
        holder.updateWorldMatrix(true,true);shelf.updateWorldMatrix(true,true);
        const cupBox=new THREE.Box3().setFromObject(holder);
        const shelfBox=new THREE.Box3().setFromObject(shelf);
        // All parts of the shelf pencils share this prefix, including tips and graphite.
        const root=holder.parent;
        root.traverse(node=>{
            if(/shelf\s*pencil/i.test(node.name.replace(/[_|]/g,' '))) {
                node.visible=false;node.castShadow=false;
            }
        });
        const pear=new THREE.Group();pear.name='Pear mini night light';group.add(pear);
        pear.position.copy(cupBox.getCenter(new THREE.Vector3()));
        pear.position.y=shelfBox.max.y+.025;
        pear.rotation.y=1.90;
        const silicone=diffuser();silicone.color.setHex(0xffedba);silicone.emissive.setHex(0xffd577);
        const ink=new THREE.MeshBasicMaterial({color:0x30251b});
        const honey=new THREE.MeshStandardMaterial({color:0xe1ab47,roughness:.75});
        const leafMaterial=new THREE.MeshStandardMaterial({color:0x77933b,roughness:.8});
        const stemMaterial=new THREE.MeshStandardMaterial({color:0x69462c,roughness:.85});
        const contour=[[0,0],[.095,.004],[.155,.035],[.18,.11],[.175,.20],[.145,.29],[.12,.39],[.095,.46],[.045,.49],[0,.49]];
        const profile=new THREE.CatmullRomCurve3(contour.map(([r,y])=>new THREE.Vector3(r,y,0)));
        const body=mesh(new THREE.LatheGeometry(profile.getPoints(64).map(p=>new THREE.Vector2(Math.max(0,p.x),p.y)),48),silicone,new THREE.Vector3(),pear);
        body.name='Soft pear-shaped glowing silicone';body.castShadow=false;
        function ellipsoid(material,position,scale) {
            const part=mesh(new THREE.SphereGeometry(1,24,16),material,new THREE.Vector3(...position),pear);
            part.scale.set(...scale);return part;
        }
        function tube(points,radius,material) {
            return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),20,radius,8,false),material,new THREE.Vector3(),pear);
        }
        tube([[0,.48,0],[.005,.525,0],[-.009,.555,0]],.014,stemMaterial);
        const leaf=ellipsoid(leafMaterial,[.06,.512,0],[.068,.012,.029]);leaf.rotation.z=.35;
        for(const sign of [-1,1]) {
            ellipsoid(ink,[sign*.046,.265,.151],[.012,.016,.007]);
            ellipsoid(new THREE.MeshBasicMaterial({color:0xcc8360}),[sign*.083,.235,.142],[.018,.010,.004]);
            tube([[sign*.17,.22,0],[sign*.203,.18,.008],[sign*.211,.14,.012]],.009,honey);
            ellipsoid(honey,[sign*.211,.135,.012],[.013,.019,.012]);
            tube([[sign*.075,.025,.09],[sign*.09,.008,.16],[sign*.105,.008,.205]],.012,honey);
            ellipsoid(honey,[sign*.105,.012,.211],[.026,.032,.018]);
        }
        const smile=[];
        for(let i=0;i<=16;i++) {
            const angle=Math.PI+i*Math.PI/16;
            smile.push([Math.cos(angle)*.031,.227+Math.sin(angle)*.021,.179]);
        }
        tube(smile,.004,ink);
        point(pear.position.clone().add(new THREE.Vector3(0,.25,0)),.55,1.9,0xffd18b);
    }

    const frame=findNode('ContinuousNoticeboardFrame');
    const wall=findNode('right warm wall');
    if(frame && wall) {
        frame.updateWorldMatrix(true,true);wall.updateWorldMatrix(true,true);
        const box=new THREE.Box3().setFromObject(frame), wallBox=new THREE.Box3().setFromObject(wall);
        const center=box.getCenter(new THREE.Vector3()), size=box.getSize(new THREE.Vector3());
        const width=size.z, height=size.y;
        // A soft rectangle on the wall, occluded naturally by the existing wooden frame.
        const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
        const ctx=canvas.getContext('2d'), pixels=ctx.createImageData(256,256);
        const extentX=width/2+.28,extentY=height/2+.28;
        for(let y=0;y<256;y++) for(let x=0;x<256;x++) {
            const dx=Math.max(Math.abs((x/255*2-1)*extentX)-width/2,0);
            const dy=Math.max(Math.abs((y/255*2-1)*extentY)-height/2,0);
            const distance=Math.hypot(dx,dy);
            const i=(y*256+x)*4;
            pixels.data[i]=255;pixels.data[i+1]=187;pixels.data[i+2]=101;
            pixels.data[i+3]=Math.round(210*Math.exp(-Math.pow(distance/.115,1.5)));
        }
        ctx.putImageData(pixels,0,0);
        const haloMaterial=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,opacity:0,
            depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,toneMapped:false});
        const halo=new THREE.Mesh(new THREE.PlaneGeometry(extentX*2,extentY*2),haloMaterial);
        halo.name='Noticeboard concealed warm wall halo';
        halo.position.set(wallBox.max.x+.004,center.y,center.z);halo.rotation.y=Math.PI/2;
        group.add(halo);washes.push(haloMaterial);
        const lightMaterial=diffuser();
        const ledX=Math.max(box.min.x-.006,wallBox.max.x+.009);
        // Thin LEDs behind the outer perimeter; the wood remains the visible frame.
        for(const sign of [-1,1]) {
            const vertical=mesh(new THREE.BoxGeometry(.008,height,.012),lightMaterial,
                new THREE.Vector3(ledX,center.y,center.z+sign*(width/2+.004)));
            vertical.name='Concealed noticeboard edge LED';vertical.castShadow=false;
            const horizontal=mesh(new THREE.BoxGeometry(.008,.012,width),lightMaterial,
                new THREE.Vector3(ledX,center.y+sign*(height/2+.004),center.z));
            horizontal.castShadow=false;
        }
    }
};
