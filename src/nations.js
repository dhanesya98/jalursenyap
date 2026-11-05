(function(root){
 'use strict';
 const element=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
 function mount(container,nations){
  if(!container||!Array.isArray(nations)||!nations.length)return;
  container.replaceChildren();container.classList.add('nation-explorer');
  const nav=element('div','nation-picker');nav.setAttribute('role','group');nav.setAttribute('aria-label','Pilih bangsa Tanah Sada');
  const content=element('article','nation-detail');content.setAttribute('aria-live','polite');
  const figure=element('figure','nation-art'),image=element('img'),caption=element('figcaption');image.width=1672;image.height=941;image.loading='lazy';figure.append(image,caption);
  const info=element('div','nation-info'),eyebrow=element('p','nation-eyebrow'),heading=element('h3'),description=element('p','nation-description'),greeting=element('blockquote','nation-greeting'),facts=element('dl','nation-facts');
  info.append(eyebrow,heading,description,greeting,facts);content.append(figure,info);container.append(nav,content);
  const buttons=new Map();
  const fields=[
    ['Kontrak Pra-Simpul','contract'],
    ['Sistem & Politik','politics'],
    ['Kartu Truf Ekonomi','economy'],
    ['Adat Pos Singgah','custom'],
    ['Ukuran Kepercayaan (Cap Saksi)','trust'],
    ['Kisah yang Diwariskan','history'],
    ['Titik Buta Sejarah','blindspot'],
    ['Perbedaan Internal','tension'],
    ['Tanda Tekanan Bendungan','phenomenon']
  ];
  function select(nation){
   for(const [id,button]of buttons){button.setAttribute('aria-pressed',String(id===nation.id));button.classList.toggle('selected',id===nation.id);}
   container.dataset.nation=nation.id;image.src=nation.image;image.alt=nation.alt;caption.textContent=nation.place;
   eyebrow.textContent=nation.region+' · '+nation.role;heading.textContent=nation.name;description.textContent=nation.description;greeting.textContent='“'+nation.greeting+'”';facts.replaceChildren();
   for(const [label,key]of fields){
     if(nation[key]){
       const row=element('div','nation-fact');row.append(element('dt','',label),element('dd','',nation[key]));facts.append(row);
     }
   }
   if(nation.tujuhPanji && nation.tujuhPanji.length){
     const panjiRow=element('div','nation-fact nation-tujuh-panji');
     panjiRow.append(element('dt','','Tujuh Panji Cirusia (Kebuntuan Politik 3–3–1)'));
     const panjiList=element('ul','panji-list');
     for(const p of nation.tujuhPanji){
       const li=element('li');
       const strong=element('strong','',p.name);
       const span=element('span','',' ('+p.clan+') — '+p.role+'. Posisi: '+p.politics);
       li.append(strong,span);
       panjiList.append(li);
     }
     const dd=element('dd');dd.append(panjiList);panjiRow.append(dd);facts.append(panjiRow);
   }
  }
  for(const nation of nations){const button=element('button','',nation.name);button.type='button';button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>select(nation));buttons.set(nation.id,button);nav.append(button);}
  select(nations[0]);
 }
 root.JSNations={mount};
})(globalThis);
