const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
if(fs.existsSync(path.join(root,'assets/world/asharim-distance-v5.png')))fs.writeFileSync(path.join(root,'data/atelier-backdrop.js'),'window.ATELIER_BACKDROP="data:image/png;base64,'+fs.readFileSync(path.join(root,'assets/world/asharim-distance-v5.png')).toString('base64')+'";');
const data={deliveries:read('data/deliveries.json'),weather:read('data/weather.json'),world:read('data/world.json'),dialogues:{}};
for(const file of fs.readdirSync(path.join(root,'data/dialogue')).filter(f=>f.endsWith('.json'))){const d=read('data/dialogue/'+file);data.dialogues[d.id]=d;for(const n of Object.values(d.nodes)){for(const next of [n.next,...(n.choices||[]).map(c=>c.next)].filter(Boolean))if(!d.nodes[next])throw Error('Node dialog hilang: '+file+' '+next);}}
if(fs.existsSync(path.join(root,'data/copy.json')))data.copy=read('data/copy.json');
data.canon=read('data/canon.json');
for(const nation of data.canon.nations)if(!fs.existsSync(path.join(root,nation.image)))throw Error('Ilustrasi bangsa hilang: '+nation.id);
fs.writeFileSync(path.join(root,'data/game-data.js'),'/* Generated from data/*.json. Run node tools/build.cjs after source edits. */\nwindow.GAME_DATA = '+JSON.stringify(data).replace(/</g,'\\u003c')+';\n');
const xy=p=>[60+(p[0]+190)/390*880,60+(p[2]+170)/310*700];
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
let svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 850"><title>Peta Lembah Pasir — Jalur Senyap</title><rect width="1000" height="850" fill="#eee3c9"/><rect x="20" y="20" width="960" height="810" fill="none" stroke="#aa9471"/><g fill="none" stroke="#c8b79b" stroke-width="1">';
for(let i=0;i<12;i++){svg+=`<path d="M ${120+i*9} ${650-i*30} Q ${420+i*12} ${260-i*12} ${880-i*7} ${480-i*28}"/>`;}svg+='</g><g stroke-linecap="round" fill="none">';
for(const [id,r]of Object.entries(data.world.routes)){svg+=`<path d="${r.points.map((p,i)=>(i?'L':'M')+xy(p).join(' ')).join(' ')}" stroke="${id==='safe'?'#52777b':id==='fast'?'#9b5341':'#968669'}" stroke-width="${id==='safe'||id==='fast'?3:2}" ${id==='direct'?'stroke-dasharray="5 6"':''}/>`;}svg+='</g>';
const water=xy([-142,0,77]);svg+=`<ellipse cx="${water[0]}" cy="${water[1]}" rx="30" ry="24" fill="#83aaa4" opacity=".7"/>`;
for(const l of data.world.landmarks){const [x,y]=xy(l.position);svg+=`<circle cx="${x}" cy="${y}" r="6" fill="#f2c46b" stroke="#5a4e3b"/><text x="${x+(l.id==='relay'?-85:9)}" y="${y+(l.id==='relay'?-15:22)}" font-size="16" font-family="Georgia,serif" fill="#494a3b">${esc(l.name)}</text>`;}
svg+='<text x="500" y="700" text-anchor="middle" fill="#8e7b5f" font-family="Georgia,serif" font-size="32" font-style="italic">Lembah Pasir</text><text x="500" y="738" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#776b59" letter-spacing="4">TANAH SADA / ASHARIM</text><path d="M900 70v60m-20-30h40m-20-30-5 16h10Z" stroke="#5a4e3b" fill="#5a4e3b"/><text x="894" y="57" font-family="Georgia" fill="#5a4e3b">U</text><text x="50" y="802" font-family="sans-serif" font-size="12" fill="#52777b">Jalur Lentera — aman &amp; panjang</text><text x="390" y="802" font-family="sans-serif" font-size="12" fill="#9b5341">Tebing Utara — cepat &amp; terpapar angin</text></svg>';
fs.writeFileSync(path.join(root,'assets/world/peta-lembah.svg'),svg);
const template=fs.readFileSync(path.join(root,'index.html'),'utf8');fs.writeFileSync(path.join(root,'tests/visual.html'),template.replace('<head>','<head><base href="../">').replace('</body>','<script src="tests/visual.js"></script></body>'));
fs.writeFileSync(path.join(root,'pos-batu-biru.html'),template.replace(/<title>[^<]*<\/title>/,'<title>Pos Batu Biru — studi visual Jalur Senyap</title>').replace('</head>','<link rel="stylesheet" href="src/scene-review.css"></head>').replace('</body>','<script src="src/scene-review.js"></script></body>'));
console.log('Build ready: offline data bundle, dialogue links, map and isolated visual QA page.');
fs.writeFileSync(path.join(root,'tests/playthrough.html'),template.replace('<head>','<head><base href="../">').replace('</body>','<script src="tests/playthrough.js"></script></body>'));
