/* Batch fixed decorations only. Animated objects and interaction targets remain intact. */
window.batchStaticRoom = function(root, clips, protectedRoots) {
    const excluded=new Set(protectedRoots.filter(Boolean));
    clips.forEach(clip=>clip.tracks.forEach(track=>{
        const name=THREE.PropertyBinding.parseTrackName(track.name).nodeName;
        const target=root.getObjectByName(name)||root.getObjectByProperty('uuid',name);
        if(target) excluded.add(target);
    }));
    root.updateWorldMatrix(true,true);
    const inverseRoot=root.matrixWorld.clone().invert();
    const batches=new Map();
    root.traverse(node=>{
        if(!node.isMesh || node.isSkinnedMesh || node.isInstancedMesh || node.children.length || Array.isArray(node.material)) return;
        for(let parent=node;parent;parent=parent.parent) {
            if(!parent.visible || excluded.has(parent) || parent.isBone) return;
            if(parent===root) break;
        }
        if(Object.keys(node.geometry.morphAttributes).length || node.geometry.drawRange.start!==0 || Number.isFinite(node.geometry.drawRange.count)) return;
        const layout=Object.entries(node.geometry.attributes).map(([name,a])=>`${name}:${a.itemSize}:${a.normalized}:${a.array.constructor.name}`).sort().join('|');
        const key=[node.material.uuid,node.castShadow,node.receiveShadow,node.renderOrder,node.layers.mask,layout].join('/');
        if(!batches.has(key)) batches.set(key,[]);
        batches.get(key).push(node);
    });
    let sourceMeshes=0,draws=0;
    for(const nodes of batches.values()) {
        if(nodes.length<2) continue;
        const parts=nodes.map(node=>{
            const geometry=node.geometry.index?node.geometry.toNonIndexed():node.geometry.clone();
            const matrix=new THREE.Matrix4().multiplyMatrices(inverseRoot,node.matrixWorld);
            geometry.applyMatrix4(matrix);
            if(matrix.determinant()<0) {
                // Baking a reflection must also preserve the original front-face winding.
                for(const attribute of Object.values(geometry.attributes)) {
                    const {array,itemSize}=attribute;
                    for(let v=0;v<attribute.count;v+=3) for(let k=0;k<itemSize;k++) {
                        const a=(v+1)*itemSize+k,b=(v+2)*itemSize+k,temp=array[a];
                        array[a]=array[b];array[b]=temp;
                    }
                }
                const tangent=geometry.getAttribute('tangent');
                if(tangent) for(let i=0;i<tangent.count;i++) tangent.setW(i,-tangent.getW(i));
            }
            return geometry;
        });
        const merged=new THREE.BufferGeometry();
        for(const name of Object.keys(parts[0].attributes)) {
            const first=parts[0].getAttribute(name);
            const array=new first.array.constructor(parts.reduce((n,g)=>n+g.getAttribute(name).array.length,0));
            let offset=0;
            parts.forEach(part=>{const data=part.getAttribute(name).array;array.set(data,offset);offset+=data.length;});
            merged.setAttribute(name,new THREE.BufferAttribute(array,first.itemSize,first.normalized));
        }
        merged.computeBoundingBox();merged.computeBoundingSphere();
        const exemplar=nodes[0],mesh=new THREE.Mesh(merged,exemplar.material);
        mesh.name='Batched static room '+draws;
        mesh.castShadow=exemplar.castShadow;mesh.receiveShadow=exemplar.receiveShadow;
        mesh.renderOrder=exemplar.renderOrder;mesh.layers.mask=exemplar.layers.mask;
        mesh.matrixAutoUpdate=false;
        root.add(mesh);
        nodes.forEach(node=>{
            node.visible=false;
            // Keep semantic anchors/bounds, but raycast only the rendered batch.
            node.raycast=()=>{};
            node.matrixAutoUpdate=false;
        });
        parts.forEach(part=>part.dispose());
        sourceMeshes+=nodes.length;draws++;
    }
    return {sourceMeshes,draws};
};
