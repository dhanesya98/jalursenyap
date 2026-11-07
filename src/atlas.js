(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const characters = [
    {id:'nara',name:'Nara',story:'Nara, tujuh belas tahun, dari Dusun Sela. Menjadi kurir supaya tidak ada orang yang menunggu sendirian setelah ayahnya, Tarun (kurir darat asal Bahtari), hilang di sekitar Sabuk Dalam pada tahun 95.',icon:'bag'},
    {id:'ruru',name:'Ruru',story:'Pendamping kecil bertelinga besar yang sudah menemani Nara sejak Pos Batu Biru. Lentera di ekornya membantu membaca jejak resonansi dan arah di hari berkabut.',icon:'ruru'},
    {id:'maren',name:'Maren',story:'Kepala Pos Batu Biru dan penjaga keempat Surat Penyalaan serta tas berinsulasi titipan Sahdan (Sarai → Bahar → Ilun → Maren).',icon:'letter'},
    {id:'juma',name:'Juma',story:'Penjaga Menara Batu Senja yang menyimpan buku harian kakeknya tentang kedatangan Sahdan di Pos Batu Biru malam sebelum pemutusan.',icon:'compass'},
    {id:'bulamat',name:'Bu Lamat',story:'Tetua Telaga Sumi asal Bahtari. Menjaga sumur beresonansi Urat Sumi dan menunggu Kerang Suara kiriman keponakannya, Dorin.',icon:'shell'},
    {id:'kesa',name:'Kesa',story:'Petugas muda Gerbang Dewan Tol yang ragu melihat surat warga dan laporan bahaya Simpul Terang ditahan atas nama kuota.',icon:'seal'},
    {id:'pedagang',name:'Pedagang lembah',story:'Pengembara yang membawa kabar pergesekan Kubu Pos Tua (Buku Tamu Batu) melawan Kubu Pos Dagang serta dengung bangunan uji 009.',icon:'journal'}
  ];
  const props = [
    {id:'bag',name:'Tas Pengantar',story:'Tas kulit berinsulasi resonansi yang ditinggalkan Sahdan bersama surat di Pos Batu Biru, lalu dipinjamkan Maren kepada Nara sebelum tugas pertama.',icon:'bag',category:'PERLENGKAPAN'},
    {id:'grapple',name:'Tali Lintas',story:'Tambatan tali berlentera untuk menyeberangi ngarai dan tebing curam di Lembah Pasir.',icon:'grapple',category:'TRAVERSAL'},
    {id:'ladder',name:'Tangga Tali',story:'Dua tali dan pijakan kayu yang menyambung ketinggian. Struktur sederhana yang dapat menetap di perjalanan.',icon:'ladder',category:'TRAVERSAL'},
    {id:'bread',name:'Roti Rempah',story:'Paket pertama untuk Juma di Menara Batu Senja. Kehangatannya membuka cerita buku harian kakek Juma tentang Sahdan.',icon:'bread',category:'PAKET CERITA'},
    {id:'shell',name:'Kerang Suara',story:'Wadah lagu dari Dorin (Rumah Layar) untuk Bu Lamat. Nada sumbang di ujungnya membuktikan keaslian suara manusia.',icon:'shell',category:'PAKET CERITA'},
    {id:'letter',name:'Surat Penyalaan',story:'Kunci Jejak dengan seratus tanda penyetel. Dijaga Sarai, Bahar, Ilun, lalu Maren; segel memerlukan Cap Saksi tiga bangsa dan memuat instruksi luar untuk diuji di 009.',icon:'letter',category:'PAKET CERITA'},
    {id:'lantern',name:'Lentera jalur',story:'Cahaya kuning hangat menjadi bahasa petunjuk yang sama di pos, tebing, dan reruntuhan.',icon:'checkpoint',category:'PENANDA DUNIA'},
    {id:'checkpoint',name:'Pos Singgah',story:'Penanda peristirahatan dan perjalanan yang telah dicapai. Bentuk batu dan cahaya mengikat fungsi dengan dunia.',icon:'checkpoint',category:'PENANDA DUNIA'},
    {id:'sign',name:'Penunjuk jalan',story:'Papan sederhana bagi para kurir. Membantu membaca persimpangan tanpa mengisi cakrawala dengan antarmuka.',icon:'compass',category:'PENANDA DUNIA'},
    {id:'gate',name:'Gerbang Asharim',story:'Dua pilar dan bentang lengkung memberi batas yang jelas: masuk ke kehangatan pos atau kembali ke padang pasir.',icon:'checkpoint',category:'ARSITEKTUR'},
    {id:'tower',name:'Menara penjaga',story:'Landmark tinggi dengan mahkota kubah. Titik tujuan yang dapat dikenali sebelum wajah penjaganya terlihat.',icon:'checkpoint',category:'ARSITEKTUR'},
    {id:'dome',name:'Kubah biru batu',story:'Profil kubah dan warna turquoise merangkai bahasa arsitektur Asharim pada skala besar maupun kecil.',icon:'sun',category:'ARSITEKTUR'},
    {id:'caravan',name:'Paviliun pos',story:'Bangunan singgah dengan kanopi kain. Bentuk sederhana menjadi tempat surat, makanan, dan kabar bertemu.',icon:'bag',category:'ARSITEKTUR'},
    {id:'altar',name:'Altar Gema',story:'Kristal dan perunggu tua pada pusat sebuah Simpul. Cahaya mengisyaratkan sesuatu yang masih bisa disambung.',icon:'seal',category:'RERUNTUHAN LULANAI'},
    {id:'ruin',name:'Reruntuhan Lulanai',story:'Batu retak dan bentuk menara lama menyiratkan jalur yang lebih tua daripada orang-orang yang kini melintasinya.',icon:'cliff',category:'RERUNTUHAN LULANAI'},
    {id:'palm',name:'Palem oasis',story:'Batang melengkung dan daun yang terbuka menjadi janji air di antara bentangan pasir.',icon:'sand',category:'ALAM'},
    {id:'rock',name:'Batuan lembah',story:'Bidang batu besar dengan palet pudar. Detailnya cukup untuk dibaca, tanpa menghilangkan keheningan lanskap.',icon:'rock',category:'ALAM'}
  ];
  const icons = [['bag','Tas pengantar'],['bread','Roti rempah'],['shell','Kerang suara'],['letter','Surat Penyalaan'],['grapple','Tali lintas'],['ladder','Tangga tali'],['cape','Jubah layar'],['compass','Arah tujuan'],['map','Peta jalur'],['journal','Buku Jalur'],['checkpoint','Pos singgah'],['sun','Hari hangat'],['fog','Hari berkabut'],['storm','Badai pasir'],['ruru','Ruru'],['rock','Batu'],['sand','Pasir lunak'],['cliff','Tebing curam'],['seal','Nama Baik'],['close','Tutup'],['pause','Jeda'],['volume','Suara'],['moon','Malam tenang'],['save','Simpan perjalanan']];
  let kind='character', selected='nara', pose='idle', renderer=null, scene, camera, stage, model=null;
  let azimuth=.38, elevation=.28, distance=5.8, elapsed=0, last=0, drag=null, frame=0, inView=true;
  const correctedMaterials=new WeakSet();
  const viewer=$('model-viewer');
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  if(reducedMotion.matches)$('animate-model').checked=false;
  function makeButton(text,handler){const b=document.createElement('button');b.type='button';b.textContent=text;b.addEventListener('click',handler);return b;}
  function catalogItems(){return kind==='character'?characters:props;}
  function updateCamera(){if(!camera)return;camera.position.set(Math.sin(azimuth)*Math.cos(elevation)*distance,1.2+Math.sin(elevation)*distance,Math.cos(azimuth)*Math.cos(elevation)*distance);camera.lookAt(0,1.2,0);}
  function resize(){if(!renderer)return;const w=viewer.clientWidth,h=viewer.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);}
  function buildCatalog(){
    const focusedId=$('model-options').contains(document.activeElement)?document.activeElement.dataset.id:null;
    $('show-characters').classList.toggle('selected',kind==='character');$('show-characters').setAttribute('aria-pressed',String(kind==='character'));
    $('show-props').classList.toggle('selected',kind==='prop');$('show-props').setAttribute('aria-pressed',String(kind==='prop'));
    $('model-options').replaceChildren();
    for(const item of catalogItems()){
      const b=makeButton(item.name,()=>selectModel(kind,item.id));b.dataset.id=item.id;b.classList.toggle('selected',item.id===selected);b.setAttribute('aria-pressed',String(item.id===selected));$('model-options').append(b);
    }
    if(focusedId){const focused=Array.from($('model-options').children).find(b=>b.dataset.id===focusedId);if(focused)focused.focus({preventScroll:true});}
  }
  function clearModel(){
    if(!model||!stage)return;
    stage.remove(model);
    const geometries=new Set();model.traverse(o=>{if(o.geometry)geometries.add(o.geometry);});geometries.forEach(g=>g.dispose());
    // Materials are shared and cached by JSArt; do not dispose them between selections.
    model=null;
  }
  function selectModel(nextKind,id,scroll=false){
    const oldKind=kind;kind=nextKind;const item=catalogItems().find(i=>i.id===id);if(!item){kind=oldKind;return;}selected=id;
    buildCatalog();$('model-name').textContent=item.name;$('model-story').textContent=item.story;
    $('model-kind').textContent=(kind==='character'?'KARAKTER':item.category)+' / '+String(catalogItems().indexOf(item)+1).padStart(2,'0');
    $('model-tag').textContent=kind==='character'?'Model prosedural · rig animasi':'Model prosedural · properti dunia';
    $('pose-bar').hidden=kind!=='character';
    document.querySelector('[data-pose="glide"]').disabled=id!=='nara';
    if(id!=='nara'&&pose==='glide')setPose('idle');
    if(renderer){
      try{
        clearModel();model=kind==='character'?window.JSArt.character(id):window.JSArt.prop(id);
        model.traverse(o=>{for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){if(correctedMaterials.has(m))continue;m.color?.convertSRGBToLinear();m.emissive?.convertSRGBToLinear();correctedMaterials.add(m);window.JSAtelier?.tintMaterial(m);}});
        const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
        const scale=2.65/Math.max(size.y,size.x*.85,size.z*.85,.01);
        model.scale.setScalar(scale);model.position.set(-center.x*scale,-box.min.y*scale,-center.z*scale);
        stage.add(model);elapsed=0;azimuth=.38;elevation=.28;distance=5.8;updateCamera();
        if(typeof model.userData.setActive==='function')model.userData.setActive(true);
        $('viewer-status').textContent=item.name+' / '+(kind==='character'?'karakter':'properti');
      }catch(error){$('viewer-status').textContent='Model belum dapat ditampilkan';console.error('Atlas model:',error);}
    }
    if(scroll){$('model').scrollIntoView({behavior:reducedMotion.matches?'auto':'smooth',block:'start'});viewer.focus({preventScroll:true});}
  }
  function setPose(value){pose=value;document.querySelectorAll('[data-pose]').forEach(b=>{const active=b.dataset.pose===pose;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});}
  function initViewer(){
    try{
      if(!window.THREE||!window.JSArt)throw new Error('Local Three.js or JSArt is unavailable.');
      const T=window.THREE;window.JSArt.init();
      renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.NoToneMapping;renderer.toneMappingExposure=.95;viewer.append(renderer.domElement);
      renderer.domElement.setAttribute('aria-hidden','true');
      scene=new T.Scene();camera=new T.PerspectiveCamera(38,1,.1,80);stage=new T.Group();scene.add(stage);
      scene.add(new T.HemisphereLight(0xfff2d8,0xa39982,1.05));const sun=new T.DirectionalLight(0xffecd4,1.5);sun.position.set(-3,7,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-4;sun.shadow.camera.right=4;sun.shadow.camera.top=5;sun.shadow.camera.bottom=-4;sun.shadow.normalBias=.04;scene.add(sun);const fill=new T.DirectionalLight(0xd7e8e3,.45);fill.position.set(4,3,-3);scene.add(fill);
      const floor=new T.Mesh(new T.CylinderGeometry(2.45,2.5,.08,64),new T.MeshStandardMaterial({color:0xdad0b6,roughness:1}));floor.position.y=-.05;floor.receiveShadow=true;scene.add(floor);
      const ring=new T.Mesh(new T.RingGeometry(2.21,2.225,64),new T.MeshBasicMaterial({color:0xb7a580,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=-.005;scene.add(ring);
      for(let i=0;i<4;i++){const line=new T.Mesh(new T.BoxGeometry(.012,.003,.15),new T.MeshBasicMaterial({color:0xa79574}));line.position.set(Math.sin(i*Math.PI/2)*2.22,0,Math.cos(i*Math.PI/2)*2.22);line.rotation.y=i*Math.PI/2;scene.add(line);}
      resize();updateCamera();
      renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();$('viewer-status').textContent='Konteks 3D terhenti — muat ulang halaman untuk melanjutkan.';cancelAnimationFrame(frame);});
      const tick=now=>{frame=requestAnimationFrame(tick);const dt=Math.min((now-last)/1000,.05)||0;last=now;if(document.hidden||!inView)return;if($('animate-model').checked)elapsed+=dt;if(model&&typeof model.userData.animate==='function')model.userData.animate(elapsed,kind==='character'&&pose==='walk'?4:0,kind==='character'&&pose==='glide');renderer.render(scene,camera);};
      frame=requestAnimationFrame(tick);
      if(window.ResizeObserver)new ResizeObserver(resize).observe(viewer);else window.addEventListener('resize',resize);
      if(window.IntersectionObserver)new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;},{rootMargin:'150px'}).observe(viewer);
    }catch(error){console.warn('Atlas 3D unavailable:',error);renderer=null;viewer.hidden=true;$('viewer-error').hidden=false;$('viewer-status').textContent='Mode galeri 2D';document.querySelectorAll('.viewer-toolbar button,.viewer-toolbar input,.pose-bar button').forEach(b=>b.disabled=true);}
  }
  $('show-characters').addEventListener('click',()=>selectModel('character','nara'));
  $('show-props').addEventListener('click',()=>selectModel('prop','bag'));
  document.querySelectorAll('[data-character]').forEach(b=>b.addEventListener('click',()=>selectModel('character',b.dataset.character,true)));
  document.querySelectorAll('[data-pose]').forEach(b=>b.addEventListener('click',()=>setPose(b.dataset.pose)));
  for(const item of props){const b=makeButton('',()=>selectModel('prop',item.id,true));b.className='prop-card';const img=document.createElement('img');img.src='assets/icons/'+item.icon+'.svg';img.alt='';img.width=32;img.height=32;const title=document.createElement('strong');title.textContent=item.name;const detail=document.createElement('span');detail.textContent=item.category+' · LIHAT 3D ↗';b.append(img,title,detail);$('prop-grid').append(b);}
  for(const [id,label] of icons){const a=document.createElement('a');a.href='assets/icons/'+id+'.svg';a.className='icon-card';a.setAttribute('aria-label','Buka ikon '+label);const img=document.createElement('img');img.src=a.href;img.alt='';img.width=32;img.height=32;const name=document.createElement('span');name.textContent=label;a.append(img,name);$('icon-grid').append(a);}
  const rotate=amount=>{azimuth+=amount;updateCamera();},zoom=amount=>{distance=Math.max(3.4,Math.min(10,distance+amount));updateCamera();};
  $('rotate-left').addEventListener('click',()=>rotate(-.35));$('rotate-right').addEventListener('click',()=>rotate(.35));$('zoom-in').addEventListener('click',()=>zoom(-.5));$('zoom-out').addEventListener('click',()=>zoom(.5));$('reset-view').addEventListener('click',()=>{azimuth=.38;elevation=.28;distance=5.8;updateCamera();});
  viewer.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY};viewer.setPointerCapture(e.pointerId);viewer.focus({preventScroll:true});});
  viewer.addEventListener('pointermove',e=>{if(!drag)return;azimuth-=(e.clientX-drag.x)*.008;elevation=Math.max(-.03,Math.min(1.05,elevation+(e.clientY-drag.y)*.006));drag={x:e.clientX,y:e.clientY};updateCamera();});
  viewer.addEventListener('pointerup',()=>{drag=null;});viewer.addEventListener('pointercancel',()=>{drag=null;});viewer.addEventListener('lostpointercapture',()=>{drag=null;});
  viewer.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){rotate(-.15);}else if(e.key==='ArrowRight'){rotate(.15);}else if(e.key==='ArrowUp'){elevation=Math.min(1.05,elevation+.08);updateCamera();}else if(e.key==='ArrowDown'){elevation=Math.max(-.03,elevation-.08);updateCamera();}else if(e.key==='+'||e.key==='='){zoom(-.4);}else if(e.key==='-'){zoom(.4);}else if(e.key==='Home'){azimuth=.38;elevation=.28;distance=5.8;updateCamera();}else{return;}e.preventDefault();});
  window.addEventListener('blur',()=>{drag=null;});
  JSNations.mount($('atlas-nations'),GAME_DATA.canon.nations);
  initViewer();selectModel('character','nara');
  window.addEventListener('pagehide',event=>{if(!event.persisted){cancelAnimationFrame(frame);if(renderer)renderer.dispose();}});
})();
