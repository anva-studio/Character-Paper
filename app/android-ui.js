'use strict';
if(typeof PaperNative!=='undefined'){
 download=function(name,text,type='application/json'){PaperNative.save(name,type.split(';')[0],btoa(unescape(encodeURIComponent(text))))};
 const androidAction=action;
 action=async function(name,value){if(name==='download-image'){const [key,id]=value.split(':'),a=object()[key].find(x=>x.id===id),mime=a.data.split(';')[0].slice(5);return PaperNative.save(safeName(a.title||'image')+'.'+mime.split('/')[1],mime,a.data.split(',')[1])}return androidAction(name,value)};
 document.addEventListener('click',e=>{const link=e.target.closest('a[href]');if(link){e.preventDefault();PaperNative.external(link.href)}});
 window.paperBack=async function(){if(modal.open){await action('close-modal');return}if(profile09){if(object())await action('back-library101');else if(ui.page!=='home')await action('home');else await action('lock09');return}if(screen09!=='welcome'){screen09='welcome';render();return}PaperNative.finish()};
 window.paperPause=async()=>{if(profile09&&w.settings.autosave&&(dirty||saving))await save()};
 window.paperFileSaved=(ok,message)=>{if(!ok)notice(message||'The file could not be saved. Your profile is still on this device.')};
 window.addEventListener('pagehide',()=>{if(profile09&&w.settings.autosave)save()});
}
