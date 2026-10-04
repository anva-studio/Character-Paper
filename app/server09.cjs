'use strict';
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const P=require('./core.js'),V=require('./vault.cjs'),E=require('./example.js');
let PORT=Number(process.env.PAPER_PORT||4174);const dir=path.resolve(process.env.PAPER_DATA||path.join(__dirname,'data','profiles')),store=V.vault(dir),csrf=crypto.randomBytes(32).toString('hex'),sessions=new Map(),attempts=new Map();let queue=Promise.resolve();
const legacy=path.join(__dirname,'..','Character-Paper-v0.8','data','library.json');
const files={'/portrait.js':'portrait.js','/release.js':'release.js','/example.js':'example.js','/release-ui.js':'release-ui.js','/release.css':'release.css','/ui101.js':'ui101.js','/formatting.js':'formatting.js','/ui101.css':'ui101.css','/':'index.html','/index.html':'index.html','/core.js':'core.js','/app.js':'app.js','/v09.js':'v09.js','/base.css':'base.css','/style.css':'style.css','/v09.css':'v09.css','/logo.svg':'logo.svg','/welcome-art.png':'welcome-art.png'};
const clean=r=>({id:r.id,name:r.name,avatar:r.avatar,passwordProtected:V.protectedProfile(r),savedAt:r.savedAt,backupAt:r.backupAt,example:r.example===true});
function session(req){const s=sessions.get(req.headers['x-paper-token']);if(!s)throw Error('Profile is locked. Unlock it to continue.');return s}
async function body(req){let chunks=[],length=0;for await(const chunk of req){length+=chunk.length;if(length>210*1024*1024)throw Error('This file exceeds the review build limit.');chunks.push(chunk)}return JSON.parse(Buffer.concat(chunks).toString()||'{}')}
async function installExample(){const all=await store.list();if(all.some(p=>p.example))return;const made=await V.make('Example Profile','','',E.create(),false);made.record.example=true;await store.write(made.record);made.key.fill(0)}
 let exampleInitialization;
 async function initializeExample(){if(!exampleInitialization)exampleInitialization=initializeExampleOnce().catch(e=>{exampleInitialization=null;throw e});await exampleInitialization;return store.list()}
 async function initializeExampleOnce(){await fs.mkdir(dir,{recursive:true});const marker=path.join(dir,'.example-initialized');try{await fs.access(marker)}catch{await installExample();await fs.writeFile(marker,'1')}return store.list()}
 const server=http.createServer(async(req,res)=>{
 const send=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value))};
 if(!['localhost:'+PORT,'127.0.0.1:'+PORT].includes(req.headers.host))return send(403,{error:'Local access only'});
 if(req.headers.origin&&!['http://localhost:'+PORT,'http://127.0.0.1:'+PORT].includes(req.headers.origin))return send(403,{error:'Origin rejected'});
 const url=new URL(req.url,'http://localhost');
 try{
 if(!url.pathname.startsWith('/api/')){const file=files[url.pathname];if(req.method!=='GET'||!file)return send(404,{error:'Not found'});const data=await fs.readFile(path.join(__dirname,file));res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':file.endsWith('.png')?'image/png':'text/html','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"});return res.end(data)}
 if(url.pathname==='/api/bootstrap'&&req.method==='GET'){let hasLegacy=false;try{await fs.access(legacy);hasLegacy=true}catch{}return send(200,{csrf,profiles:await initializeExample(),hasLegacy})}
 if(req.headers['x-paper-csrf']!==csrf)return send(403,{error:'Refresh this window before continuing.'});
 const b=req.method==='GET'?{}:await body(req);
 const work=async()=>{
 const route=url.pathname;
 if(route==='/api/create'||route==='/api/restore-profile'){
 let state=P.empty();if(route==='/api/restore-profile'){if(b.backup?.format==='character-paper-vault'){const key=await V.keyFor(b.backup,b.secret||'',!!b.useRecovery);state=P.migrate(V.open(b.backup.current,key));key.fill(0)}else state=P.migrate(b.backup)}else if(b.migrate){state=P.migrate(JSON.parse(await fs.readFile(legacy,'utf8')))}
 const made=await V.make(b.name,b.password,b.avatar||'',state,b.passwordProtected!==false);await store.write(made.record);made.key.fill(0);return{profile:clean(made.record),recoveryKey:made.recoveryKey};
 }
 if(route==='/api/unlock'||route==='/api/recover'){
 const now=Date.now(),last=attempts.get(b.id)||0;if(now-last<1500)throw Error('Please wait a moment before trying again.');attempts.set(b.id,now);
 let r=await store.read(b.id);const key=await V.keyFor(r,b.secret||'',route==='/api/recover');let state,recovered=false;
 try{state=P.migrate(V.open(r.current,key))}catch(e){if(!r.previous){key.fill(0);throw Error('Saved data is damaged. Restore an external backup.')}state=P.migrate(V.open(r.previous,key));recovered=true}
 if(route==='/api/recover'){V.credentials(r.name,b.password,r.avatar);r.password=await V.wrap(key,b.password);await store.write(r);for(const [t,s] of sessions)if(s.id===r.id){s.key.fill(0);sessions.delete(t)}}
 const token=crypto.randomBytes(32).toString('hex');sessions.set(token,{id:r.id,key});return{token,state,revision:r.revision,profile:clean(r),recovered};
 }
 if(route==='/api/example-restore'){await installExample();return{ok:true}}
 const s=session(req);let r=await store.read(s.id);
 if(route==='/api/example-reset'){if(r.example!==true)throw Error('This is not the Example Profile.');const canonical=E.create();r.current=V.seal(canonical,s.key);r.previous=null;r.revision++;r.savedAt=Date.now();await store.write(r);return{state:canonical,revision:r.revision,profile:clean(r)}}
 if(route==='/api/delete-profile'){if(r.name!==b.confirmName)throw Error('Enter the profile name to confirm deletion.');if(V.protectedProfile(r)){const key=await V.keyFor(r,b.secret||'');key.fill(0)}await fs.unlink(path.join(dir,r.id+'.json'));for(const [t,other] of sessions)if(other.id===r.id){other.key.fill(0);sessions.delete(t)}return{ok:true}}
 
 if(route==='/api/lock'){s.key.fill(0);sessions.delete(req.headers['x-paper-token']);return{ok:true}}
 if(route==='/api/decode-backup'){const key=await V.keyFor(b.backup,b.secret||'',!!b.useRecovery);try{return{state:P.migrate(V.open(b.backup.current,key))}}finally{key.fill(0)}}
 if(route==='/api/library'&&req.method==='PUT'){P.validate(b.state);if(JSON.stringify(b.state).length>150*1024*1024)throw Error('Library exceeds 150 MB.');if(b.revision!==r.revision)throw Error('Another window saved this profile. Back up your unsaved changes and reopen it.');try{V.open(r.current,s.key);r.previous=r.current}catch{}r.current=V.seal(b.state,s.key);r.revision++;r.savedAt=Date.now();await store.write(r);return{revision:r.revision,savedAt:r.savedAt}}
 if(route==='/api/backup'){P.validate(b.state);const backup={...r,current:V.seal(b.state,s.key),previous:null,backupAt:Date.now()};r.backupAt=backup.backupAt;await store.write(r);return{backup}}
 if(route==='/api/protection'){
 if(typeof b.enabled!=='boolean')throw Error('Choose whether to use password protection.');
 if(V.protectedProfile(r)){const confirmed=await V.keyFor(r,b.currentPassword||'');confirmed.fill(0)}
 const changed=await V.changeProtection(r,s.key,b.password,b.enabled);await store.write(changed.record);
 for(const [t,other] of sessions)if(other.id===s.id){other.key.fill(0);if(t!==req.headers['x-paper-token'])sessions.delete(t)}s.key=changed.key;
 return{profile:clean(changed.record),recoveryKey:changed.recoveryKey};
 }
 if(route==='/api/profile'){V.credentials(b.name,'placeholder-password',b.avatar||'');r.name=b.name.trim();r.avatar=b.avatar||'';await store.write(r);return{profile:clean(r)}}
 if(route==='/api/location')return{path:dir};
 if(route==='/api/open-folder'){if(process.platform==='win32'){require('node:child_process').spawn('explorer.exe',[dir],{windowsHide:true,detached:true,stdio:'ignore'}).unref()}return{path:dir}}
 throw Error('Unknown operation.');
 };
 const op=queue.then(work);queue=op.catch(()=>{});return send(200,await op);
 }catch(e){send(400,{error:e.message})}
});
if(require.main===module)server.listen(PORT,'127.0.0.1',()=>console.log(`Character Paper v0.9: http://127.0.0.1:${PORT}\nEncrypted saves: ${dir}\nKeep this window open while writing.`));
server.on('listening',()=>{PORT=server.address().port});
module.exports={server};
