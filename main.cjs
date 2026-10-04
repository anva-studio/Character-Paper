'use strict';
const {app,BrowserWindow,dialog,shell,session}=require('electron');
const path=require('node:path'),fs=require('node:fs/promises');
let win,server,origin,closing=false,closedWithApproval=false;
app.setName('Character Paper');
if(process.env.PAPER_DESKTOP_TEST_DIR)app.setPath('userData',path.resolve(process.env.PAPER_DESKTOP_TEST_DIR));
if(!app.requestSingleInstanceLock()){app.quit()}else{
app.on('second-instance',()=>{if(win){if(win.isMinimized())win.restore();win.show();win.focus()}});
app.whenReady().then(async()=>{
 process.env.PAPER_PORT='0';
 process.env.PAPER_DATA=path.join(app.getPath('userData'),'profiles');
 process.env.PAPER_DESKTOP='1';
 server=require('./app/server09.cjs').server;
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
 origin='http://127.0.0.1:'+server.address().port;
 session.defaultSession.setPermissionRequestHandler((wc,permission,callback)=>callback(wc===win?.webContents&&permission==='clipboard-sanitized-write'));
 session.defaultSession.setPermissionCheckHandler((wc,permission)=>wc===win?.webContents&&permission==='clipboard-sanitized-write');
 win=new BrowserWindow({width:1320,height:900,minWidth:780,minHeight:600,title:'Character Paper',icon:path.join(__dirname,'build','icon.png'),backgroundColor:'#f7f3eb',show:false,autoHideMenuBar:true,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true,devTools:!app.isPackaged}});
 win.setMenu(null);
 const allowedLinks=new Set(['https://anva-studio.github.io/','https://forms.gle/W7qtQRmqxgZkLtS9','mailto:Anvahq@gmail.com','https://buymeacoffee.com/anva']);
 win.webContents.setWindowOpenHandler(({url})=>{if(allowedLinks.has(url))shell.openExternal(url);return{action:'deny'}});
 win.webContents.on('will-navigate',(event,url)=>{if(url!==origin+'/'){event.preventDefault();if(allowedLinks.has(url))shell.openExternal(url)}});
 win.webContents.on('will-attach-webview',event=>event.preventDefault());
 win.webContents.session.on('will-download',(_event,item)=>{item.setSaveDialogOptions({title:'Save your Character Paper file'});});
 win.on('close',event=>{if(closedWithApproval)return;event.preventDefault();if(closing)return;closing=true;(async()=>{
  try{
   const state=await win.webContents.executeJavaScript('({pending:typeof dirty!=="undefined"&&(dirty||Boolean(saving)),autosave:typeof w!=="undefined"&&w.settings.autosave})');
   if(state.pending){let response=0;if(!state.autosave){({response}=await dialog.showMessageBox(win,{type:'question',title:'Save before closing?',message:'You have unsaved writing.',detail:'Save your changes before closing Character Paper?',buttons:['Save and close','Discard changes','Keep writing'],defaultId:0,cancelId:2}));if(response===2)return}
    if(response===0){const ok=await win.webContents.executeJavaScript('save()');if(!ok){await dialog.showMessageBox(win,{type:'error',message:'Your changes could not be saved.',detail:'Character Paper will stay open. Retry saving or download an emergency backup before closing.'});return}}
   }
   const preferences=await win.webContents.executeJavaScript('({theme:localStorage.getItem("paper-theme09")})');
   await fs.writeFile(path.join(app.getPath('userData'),'appearance.json'),JSON.stringify(preferences));
   closedWithApproval=true;win.destroy();app.quit();
  }catch(error){const {response}=await dialog.showMessageBox(win,{type:'warning',message:'Character Paper could not confirm the save state.',detail:'Keep the app open if you need to recover unsaved writing.',buttons:['Keep open','Close anyway'],defaultId:0,cancelId:0});if(response===1){closedWithApproval=true;win.destroy();app.quit()}}
  finally{closing=false}
 })()});
 await win.loadURL(origin+'/');
 let preferences=null;try{preferences=JSON.parse(await fs.readFile(path.join(app.getPath('userData'),'appearance.json'),'utf8'))}catch{}
 if(preferences){const values={theme:preferences.theme==='dark'?'dark':'light'};await win.webContents.executeJavaScript(`(()=>{const p=${JSON.stringify(values)};localStorage.setItem('paper-theme09',p.theme)})()`);await win.loadURL(origin+'/')}
 if(process.env.PAPER_DESKTOP_SMOKE!=='1')win.show();
 if(process.env.PAPER_DESKTOP_SMOKE==='1'){
  const fs=require('node:fs/promises');
  const report=await win.webContents.executeJavaScript(`new Promise(resolve=>{const check=()=>{if(document.querySelector('.welcome-hero'))resolve({title:document.title,welcome:true,profilesVisible:document.querySelectorAll('.profile-book').length,nodeAvailable:typeof require!=='undefined'});else setTimeout(check,100)};check()})`);
  report.version=app.getVersion();report.packaged=app.isPackaged;report.profileDirectory=process.env.PAPER_DATA;
  await fs.writeFile(path.join(app.getPath('userData'),'smoke-report.json'),JSON.stringify(report,null,2));
  closedWithApproval=true;win.destroy();app.quit();
 }
}).catch(error=>{dialog.showErrorBox('Character Paper could not start',error.message);app.quit()});
app.on('window-all-closed',()=>app.quit());
app.on('will-quit',()=>server?.close());
}
