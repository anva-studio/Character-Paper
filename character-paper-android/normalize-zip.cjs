const fs=require('fs'),yauzl=require('../character-paper-desktop/node_modules/yauzl'),yazl=require('../character-paper-desktop/node_modules/yazl');
const file=process.argv[2],temp=file+'.normalized',out=new yazl.ZipFile();
const done=new Promise((resolve,reject)=>{const dest=fs.createWriteStream(temp);out.outputStream.pipe(dest).on('close',resolve).on('error',reject)});
yauzl.open(file,{lazyEntries:true,strictFileNames:false},(error,zip)=>{if(error)throw error;zip.on('entry',e=>{const name=e.fileName.replaceAll('\\','/');if(name.endsWith('/')){zip.readEntry();return}zip.openReadStream(e,(err,stream)=>{if(err)throw err;const chunks=[];stream.on('data',c=>chunks.push(c));stream.on('end',()=>{out.addBuffer(Buffer.concat(chunks),name,{compress:e.compressionMethod!==0});zip.readEntry()})})});zip.on('end',()=>out.end());zip.readEntry()});
done.then(()=>fs.renameSync(temp,file)).catch(e=>{console.error(e);process.exitCode=1});
