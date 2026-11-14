/* Offline bundle. Run from any directory: node tools/build-pixel.cjs.
   The source HTML is authoritative; never edit the generated package by hand. */
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..');
function build(){
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 let html=read('bab0.html');
 html=html.replace(/<link rel="stylesheet" href="([^"]+)">/g,(_,f)=>`<style>/* ${f} */\n${read(f)}\n</style>`);
 const audio={};for(const name of ['desert_exploration','desert_sanctuary','seashell_lullaby'])audio[name]='data:audio/mpeg;base64,'+fs.readFileSync(path.join(root,'assets/audio/sfx',name+'.mp3')).toString('base64');
 html=html.replace('<script src="src/bab0-pixel-engine.js">','<script>/* embedded audio */\nglobalThis.PIXEL_AUDIO_ASSETS='+JSON.stringify(audio)+';\n</script>\n<script src="src/bab0-pixel-engine.js">');
 html=html.replace(/<script src="([^"]+)"><\/script>/g,(_,f)=>`<script>/* ${f} */\n${read(f).replace(/<\/script/gi,'<\\/script')}\n</script>`);
 if(/<(?:script|link)\b[^>]*(?:src|href)=/.test(html))throw Error('External code dependency remains');
 const out=path.join(root,'Bab0-TopDown-Pixel','Jalur-Senyap-Complete-Pixel.html');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,html);
 console.log('Built '+path.relative(root,out)+' ('+(Buffer.byteLength(html)/1048576).toFixed(2)+' MiB)');
 console.log('SHA256 '+crypto.createHash('sha256').update(html).digest('hex'));
 return html;
}
if(require.main===module)build();module.exports={build};
