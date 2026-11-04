#!/usr/bin/env node
/* Dependency-free glTF 2.0 GLB exporter for the project's original JSArt models.
 * Run: node tools/export-models.cjs [--verify]
 * Visible geometry, hierarchy and local TRS are retained. PBR approximates toon
 * shading. No skins, cloth simulation, JS behavior or animation clips exported.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const project = path.resolve(__dirname, '..');
const output = path.join(project, 'assets', 'models');
const manifestPath = path.join(project, 'assets', 'models-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const characterIds = manifest.characters;
const propIds = manifest.props;
const entries = [...characterIds.map(id => ({id, category:'character', file:'character-'+id+'.glb'})),
  ...propIds.map(id => ({id, category:'prop', file:'prop-'+id+'.glb'}))];
const align4 = n => (n + 3) & ~3;
function assert(condition, message) { if (!condition) throw new Error(message); }
function exportGLB(root, entry) {
  const doc = {asset:{version:'2.0',generator:'Jalur Senyap original procedural asset exporter'},
    scene:0,scenes:[{name:root.name||entry.id,nodes:[]}],nodes:[],meshes:[],materials:[],
    accessors:[],bufferViews:[],buffers:[{byteLength:0}],
    extras:{source:entry.id==='nara'?'src/nara-art.js':['maren','ruru'].includes(entry.id)?'src/companions-art.js':['juma','bulamat','kesa','pedagang'].includes(entry.id)?'src/travelers-art.js':'src/art.js',asset:entry.category+':'+entry.id,pose:'static',animationsExported:false,
      materialNote:'MeshToonMaterial approximated by rough PBR. Ink lines use KHR_materials_unlit.'}};
  const chunks = [];
  let offset = 0;
  const materialMap = new Map(), geoMap = new Map();
  function writeAccessor(values, width, type, componentType, target, bounds=false) {
    assert(values.length % width === 0, 'Non-integral accessor count');
    assert(Array.from(values).every(Number.isFinite), 'Nonfinite geometry');
    const data = Buffer.from(values.buffer, values.byteOffset, values.byteLength);
    const view = doc.bufferViews.length;
    doc.bufferViews.push({buffer:0,byteOffset:offset,byteLength:data.length,target});
    chunks.push(data);
    const padding = align4(data.length)-data.length;
    if (padding) chunks.push(Buffer.alloc(padding));
    offset += data.length + padding;
    const acc={bufferView:view,byteOffset:0,componentType,count:values.length/width,type};
    if(bounds){
      acc.min=Array(width).fill(Infinity);acc.max=Array(width).fill(-Infinity);
      for(let i=0;i<values.length;i++){const k=i%width;acc.min[k]=Math.min(acc.min[k],values[i]);acc.max[k]=Math.max(acc.max[k],values[i]);}
    }
    const index=doc.accessors.length;doc.accessors.push(acc);return index;
  }
  function attribute(attr, size, bounds=false) {
    const values=new Float32Array(attr.count*size);
    for(let i=0;i<attr.count;i++)for(let k=0;k<size;k++)values[i*size+k]=attr.getComponent ? attr.getComponent(i,k) : attr[['getX','getY','getZ','getW'][k]](i);
    return writeAccessor(values,size,{1:'SCALAR',2:'VEC2',3:'VEC3',4:'VEC4'}[size],5126,34962,bounds);
  }
  function getMaterial(m) {
    if(materialMap.has(m.uuid))return materialMap.get(m.uuid);
    const color=m.color||{r:1,g:1,b:1};
    const result={name:m.name||m.type+'_'+doc.materials.length,
      pbrMetallicRoughness:{baseColorFactor:[color.r,color.g,color.b,m.opacity===undefined?1:m.opacity],metallicFactor:0,roughnessFactor:1},doubleSided:m.side===2};
    if(m.transparent&&m.opacity<1)result.alphaMode='BLEND';
    if(m.alphaTest>0){result.alphaMode='MASK';result.alphaCutoff=m.alphaTest;}
    if(m.emissive){const e=m.emissiveIntensity===undefined?1:m.emissiveIntensity;result.emissiveFactor=[m.emissive.r,m.emissive.g,m.emissive.b].map(v=>Math.min(1,v*e));}
    if(m.isLineBasicMaterial||m.isMeshBasicMaterial){result.extensions={KHR_materials_unlit:{}};doc.extensionsUsed=['KHR_materials_unlit'];}
    if(m.gradientMap)result.extras={sourceShader:'MeshToonMaterial',gradientMapOmitted:true};
    const index=doc.materials.length;doc.materials.push(result);materialMap.set(m.uuid,index);return index;
  }
  function geometry(g) {
    if(geoMap.has(g.uuid))return geoMap.get(g.uuid);
    const attrs={POSITION:attribute(g.attributes.position,3,true)};
    if(g.attributes.normal)attrs.NORMAL=attribute(g.attributes.normal,3);
    if(g.attributes.uv)attrs.TEXCOORD_0=attribute(g.attributes.uv,2);
    if(g.attributes.color)attrs.COLOR_0=attribute(g.attributes.color,g.attributes.color.itemSize);
    const result={attributes:attrs};
    if(g.index){
      const max=Math.max(...(g.index.count<10000?Array.from(g.index.array):[g.attributes.position.count-1]));
      const values=max>65535?new Uint32Array(g.index.count):new Uint16Array(g.index.count);
      for(let i=0;i<g.index.count;i++){const value=g.index.getX(i);assert(Number.isInteger(value)&&value>=0&&value<g.attributes.position.count,'Geometry index out of bounds');values[i]=value;}
      result.indices=writeAccessor(values,1,'SCALAR',max>65535?5125:5123,34963);
    }
    geoMap.set(g.uuid,result);return result;
  }
  function visit(object) {
    if(!object.visible)return null;
    const index=doc.nodes.length;
    const node={name:object.name||object.type+'_'+index,translation:object.position.toArray(),rotation:object.quaternion.toArray(),scale:object.scale.toArray()};
    doc.nodes.push(node);
    if(object.isMesh||object.isLine){
      assert(!Array.isArray(object.material), 'Multi-material object needs explicit primitive grouping');
      const primitive={...geometry(object.geometry),material:getMaterial(object.material),mode:object.isLineSegments?1:object.isLineLoop?2:object.isLine?3:4};
      node.mesh=doc.meshes.length;doc.meshes.push({name:node.name,primitives:[primitive]});
    }
    const children=object.children.map(visit).filter(i=>i!==null);
    if(children.length)node.children=children;
    return index;
  }
  doc.scenes[0].nodes.push(visit(root));
  const binary=Buffer.concat(chunks);doc.buffers[0].byteLength=binary.length;
  const json=Buffer.from(JSON.stringify(doc),'utf8');
  const jsonChunk=Buffer.alloc(align4(json.length),0x20);json.copy(jsonChunk);
  const total=12+8+jsonChunk.length+8+binary.length;
  const header=Buffer.alloc(12);header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(total,8);
  const jsonHeader=Buffer.alloc(8);jsonHeader.writeUInt32LE(jsonChunk.length,0);jsonHeader.writeUInt32LE(0x4e4f534a,4);
  const binHeader=Buffer.alloc(8);binHeader.writeUInt32LE(binary.length,0);binHeader.writeUInt32LE(0x004e4942,4);
  return Buffer.concat([header,jsonHeader,jsonChunk,binHeader,binary]);
}
function validateGLB(file) {
  const bytes=fs.readFileSync(file);
  assert(bytes.readUInt32LE(0)===0x46546c67,'Bad GLB magic');
  assert(bytes.readUInt32LE(4)===2,'Bad GLB version');
  assert(bytes.readUInt32LE(8)===bytes.length,'GLB total length mismatch');
  const jlen=bytes.readUInt32LE(12);assert(jlen%4===0,'JSON chunk unaligned');
  assert(bytes.readUInt32LE(16)===0x4e4f534a,'Missing JSON chunk');
  const doc=JSON.parse(bytes.subarray(20,20+jlen).toString('utf8'));
  const binPos=20+jlen,blen=bytes.readUInt32LE(binPos);assert(blen%4===0,'BIN chunk unaligned');
  assert(bytes.readUInt32LE(binPos+4)===0x004e4942,'Missing BIN chunk');
  assert(binPos+8+blen===bytes.length,'BIN chunk length mismatch');
  const bin=bytes.subarray(binPos+8);assert(doc.asset.version==='2.0','Not glTF 2.0');
  assert(doc.buffers.length===1&&!doc.buffers[0].uri&&doc.buffers[0].byteLength===bin.length,'External reference or byteLength mismatch');
  assert(!doc.images&&!doc.textures&&!doc.skins&&!doc.animations,'Unexpected external media, skin, or animation');
  const widths={SCALAR:1,VEC2:2,VEC3:3,VEC4:4},sizes={5123:2,5125:4,5126:4};
  function readAccessor(id) {
    const a=doc.accessors[id];assert(a,'Missing accessor');const v=doc.bufferViews[a.bufferView];assert(v,'Missing bufferView');
    const width=widths[a.type],size=sizes[a.componentType];assert(width&&size,'Unsupported accessor format');
    assert(Number.isInteger(a.count)&&a.count>0,'Invalid accessor count');
    const base=v.byteOffset+(a.byteOffset||0),length=a.count*width*size;
    assert(v.byteOffset%4===0&&base%size===0,'Misaligned accessor');
    assert(v.buffer===0&&v.byteOffset+v.byteLength<=bin.length,'bufferView exceeds buffer');
    assert((a.byteOffset||0)+length<=v.byteLength,'Accessor exceeds bufferView');
    const arr=[];for(let i=0;i<a.count*width;i++){
      const p=base+i*size,value=a.componentType===5126?bin.readFloatLE(p):a.componentType===5125?bin.readUInt32LE(p):bin.readUInt16LE(p);
      assert(Number.isFinite(value),'Nonfinite accessor');arr.push(value);
    }
    if(a.min&&a.max){for(let k=0;k<width;k++){let min=Infinity,max=-Infinity;for(let i=k;i<arr.length;i+=width){min=Math.min(min,arr[i]);max=Math.max(max,arr[i]);}assert(Math.abs(min-a.min[k])<1e-6&&Math.abs(max-a.max[k])<1e-6,'Bounds mismatch');}}
    return {a,arr};
  }
  doc.accessors.forEach((a,i)=>readAccessor(i));
  let vertices=0,triangles=0;
  doc.meshes.forEach(m=>m.primitives.forEach(p=>{
    const pos=readAccessor(p.attributes.POSITION);vertices+=pos.a.count;
    assert(pos.a.type==='VEC3'&&pos.a.componentType===5126,'Invalid POSITION');
    for(const [semantic,id]of Object.entries(p.attributes)){assert(doc.accessors[id].count===pos.a.count,'Attribute count mismatch: '+semantic);}
    let count=pos.a.count;
    if(p.indices!==undefined){const indices=readAccessor(p.indices);count=indices.arr.length;assert(indices.a.type==='SCALAR','Indices not scalar');for(const i of indices.arr)assert(i<pos.a.count,'Index outside POSITION');}
    if(p.mode===4){assert(count%3===0,'Invalid triangle count');triangles+=count/3;}
    if(p.mode===1)assert(count%2===0,'Invalid line segment count');
    assert(doc.materials[p.material],'Missing material');
  }));
  doc.nodes.forEach(n=>{
    for(const k of ['translation','rotation','scale'])assert(n[k].every(Number.isFinite),'Invalid transform');
    assert(Math.abs(n.rotation.reduce((a,v)=>a+v*v,0)-1)<1e-5,'Quaternion not unit length');
    for(const c of n.children||[])assert(doc.nodes[c],'Missing child node');
    if(n.mesh!==undefined)assert(doc.meshes[n.mesh],'Missing mesh');
  });
  const visited=new Set();function walk(i){assert(!visited.has(i),'Node hierarchy is cyclic or shared');visited.add(i);for(const c of doc.nodes[i].children||[])walk(c);}
  doc.scenes[0].nodes.forEach(walk);assert(visited.size===doc.nodes.length,'Unreachable nodes');
  return {file:path.basename(file),bytes:bytes.length,nodes:doc.nodes.length,meshes:doc.meshes.length,accessors:doc.accessors.length,vertices,triangles};
}
function main(){
  fs.mkdirSync(output,{recursive:true});
  const verifyOnly=process.argv.includes('--verify');
  if(!verifyOnly){
    const sandbox=vm.createContext({console});sandbox.window=sandbox;
    vm.runInContext(fs.readFileSync(path.join(project,'vendor','three.min.js'),'utf8'),sandbox,{timeout:10000});
    vm.runInContext(fs.readFileSync(path.join(project,'src','art.js'),'utf8'),sandbox,{timeout:10000});
    vm.runInContext(fs.readFileSync(path.join(project,'src','nara-art.js'),'utf8'),sandbox,{timeout:10000});
    vm.runInContext(fs.readFileSync(path.join(project,'src','companions-art.js'),'utf8'),sandbox,{timeout:10000});
    vm.runInContext(fs.readFileSync(path.join(project,'src','travelers-art.js'),'utf8'),sandbox,{timeout:10000});
    for(const entry of entries){const model=entry.category==='character'?sandbox.JSArt.character(entry.id):sandbox.JSArt.prop(entry.id);model.updateMatrixWorld(true);fs.writeFileSync(path.join(output,entry.file),exportGLB(model,entry));}
  }
  const report=entries.map(entry=>({...validateGLB(path.join(output,entry.file)),id:entry.id,category:entry.category}));
  fs.writeFileSync(path.join(output,'validation.json'),JSON.stringify({format:'glTF 2.0 GLB',checks:['binary headers and chunk lengths','alignment and buffer bounds','accessor counts and min/max','all geometry finite','indices in bounds','material and node references','unit quaternions','acyclic reachable scene hierarchy','no external references'],assets:report},null,2)+'\n');
  if(!verifyOnly){
    manifest.exports={directory:'assets/models',format:'glTF 2.0 GLB',generator:'tools/export-models.cjs',count:entries.length,geometry:'Visible meshes and ink line primitives; node hierarchy and local transforms retained.',materials:'Rough PBR approximation of toon colors; unlit ink lines. No toon ramp texture.',animations:false,skins:false,notes:'Static reusable models. Runtime JS animations, cloth waves, light activation, collision, and gameplay are not exported.',files:report.map(r=>({id:r.id,category:r.category,file:'assets/models/'+r.file,bytes:r.bytes}))};
    fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
    fs.writeFileSync(path.join(output,'README.txt'),[
      'JALUR SENYAP — REUSABLE 3D ASSETS','',
      '24 self-contained glTF 2.0 binary files (GLB): 7 characters and 17 props.',
      'Created from the original procedural art in src/art.js. No network or npm dependencies.',
      'Regenerate: node tools/export-models.cjs',
      'Validate existing outputs: node tools/export-models.cjs --verify','',
      'COORDINATES',
      'Y up, characters face +Z. Units match the game; humans approximately 2 units tall.',
      'Hierarchy and local object transforms are preserved. Original limb groups remain editable.',
      'This is an articulated object hierarchy, not a skinned skeleton. There are no skin weights.',
      'Props use their default dimensions; change the source factory options to export other sizes.','',
      'DIFFERENCES FROM RUNTIME',
      'Static rest pose only. No animation clips, skeletal animation, cloth simulation, or procedural behavior.',
      'Nara uses the folded cape; the hidden extended glide wing group is omitted.',
      'Checkpoint and altar use their inactive state. Emissive material colors are retained.',
      'Toon shading is approximated with rough nonmetallic PBR; lighting will depend on the editor/viewer.',
      'Ink line geometry uses glTF line primitives and KHR_materials_unlit. Some importers hide lines.',
      'No external images, textures, audio, collision shapes, physics, interaction, or gameplay are embedded.',
      'The game still uses procedural JSArt models so its runtime animations and state changes remain intact.','',
      'VERIFICATION',
      'validation.json records binary headers, chunk lengths, buffer alignment/bounds, accessor counts,',
      'finite geometry, min/max bounds, index bounds, references, and node hierarchy checks.',
      'Validation is structural and numeric. No claim of visual testing in third-party 3D editors.','',
      'PROVENANCE',
      'Original code-native models created for this project. Three.js is used to construct geometry.',
      'See assets/models-manifest.json for source and asset inventory.',''
    ].join('\n'));
  }
  console.log(JSON.stringify({status:'passed',models:report.length,totalBytes:report.reduce((n,r)=>n+r.bytes,0),report:'assets/models/validation.json'},null,2));
}
main();
