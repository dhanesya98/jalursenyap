(function(root){
 'use strict';
 const element=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
 function mount(container,nations){
  if(!container||!Array.isArray(nations)||!nations.length)return;
  container.replaceChildren();container.classList.add('nation-explorer');
  const nav=element('div','nation-picker');nav.setAttribute('role','group');nav.setAttribute('aria-label','Pilih bangsa Tanah Lintas');
  const content=element('article','nation-detail');content.setAttribute('aria-live','polite');
  const figure=element('figure','nation-art'),image=element('img'),caption=element('figcaption');image.width=1672;image.height=941;image.loading='lazy';figure.append(image,caption);
  const info=element('div','nation-info'),eyebrow=element('p','nation-eyebrow'),heading=element('h3'),description=element('p','nation-description'),greeting=element('blockquote','nation-greeting'),facts=element('dl','nation-facts');
  info.append(eyebrow,heading,description,greeting,facts);content.append(figure,info);container.append(nav,content);
  const buttons=new Map();
  const fields=[['Adat','custom'],['Kepercayaan','trust'],['Kisah yang diwariskan','history'],['Perbedaan internal','tension'],['Jejak di lingkungan','phenomenon']];
  function select(nation){
   for(const [id,button]of buttons){button.setAttribute('aria-pressed',String(id===nation.id));button.classList.toggle('selected',id===nation.id);}
   container.dataset.nation=nation.id;image.src=nation.image;image.alt=nation.alt;caption.textContent=nation.place;
   eyebrow.textContent=nation.region+' · '+nation.role;heading.textContent=nation.name;description.textContent=nation.description;greeting.textContent='“'+nation.greeting+'”';facts.replaceChildren();
   for(const [label,key]of fields){const row=element('div','nation-fact');row.append(element('dt','',label),element('dd','',nation[key]));facts.append(row);}
  }
  for(const nation of nations){const button=element('button','',nation.name);button.type='button';button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>select(nation));buttons.set(nation.id,button);nav.append(button);}
  select(nations[0]);
 }
 root.JSNations={mount};
})(globalThis);
