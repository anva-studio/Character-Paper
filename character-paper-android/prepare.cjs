const fs=require('fs'),path=require('path'),esbuild=require('../character-paper-desktop/node_modules/esbuild');
const app=path.join(__dirname,'build/assets/www');
for(const file of fs.readdirSync(app)){if(file.endsWith('.js')&&file!=='portrait.js'){const p=path.join(app,file);fs.writeFileSync(p,esbuild.transformSync(fs.readFileSync(p,'utf8'),{target:'chrome80',loader:'js',legalComments:'inline'}).code)}}
