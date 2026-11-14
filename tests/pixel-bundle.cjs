const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'Bab0-TopDown-Pixel/Jalur-Senyap-Complete-Pixel.html'),'utf8');
const normalized=s=>s.replace(/\r\n/g,'\n').trim();let count=0;
for(const [,f,code]of html.matchAll(/<script>\/\* ([^*]+\.js) \*\/\n([\s\S]*?)<\/script>/g)){assert.equal(normalized(code),normalized(fs.readFileSync(path.join(root,f),'utf8')).replace(/<\/script/gi,'<\\/script'),f);new vm.Script(code,{filename:f});count++;}
assert.equal(count,9);assert(!/<(?:script|link)\b[^>]*(?:src|href)=/.test(html));assert.equal((html.match(/data:audio\/mpeg;base64,/g)||[]).length,3);
for(const [,f,code]of html.matchAll(/<style>\/\* ([^*]+\.css) \*\/\n([\s\S]*?)<\/style>/g))assert.equal(normalized(code),normalized(fs.readFileSync(path.join(root,f),'utf8')),f);
const ids=[...html.matchAll(/\bid="([^"<>]+)"/g)].map(x=>x[1]); // Script templates can repeat IDs; inspect markup separately.
const markup=html.slice(0,html.indexOf('<script>'));
const actual=[...markup.matchAll(/\bid="([^"<>]+)"/g)].map(x=>x[1]);assert.equal(new Set(actual).size,actual.length);
const clean=markup.replace(/<style>[\s\S]*?<\/style>/g,'').replace(/<!--[\s\S]*?-->/g,''),stack=[],voidTags=new Set(['meta','link','img','input','br','hr','source','wbr','area','base','embed']);
for(const [,closing,tag]of clean.matchAll(/<(\/?)([a-z][a-z0-9-]*)\b[^>]*>/gi)){const name=tag.toLowerCase();if(voidTags.has(name))continue;if(closing)assert.equal(stack.pop(),name,'Unbalanced HTML near '+name);else stack.push(name);}
assert.deepEqual(stack,['html','body']); // script section and closing document follow markup.
console.log('PASS 9 embedded scripts match source, 2 styles match, 3 audio tracks embedded, JS syntax and unique HTML IDs.');
