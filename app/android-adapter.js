'use strict';
if(typeof PaperNative!=='undefined'){
 const result=s=>{const v=JSON.parse(s);if(v.error)throw Error(v.error);return v};
 const store={list:async()=>result(PaperNative.list()),read:async id=>result(PaperNative.read(id)),write:async r=>result(PaperNative.write(JSON.stringify(r))),remove:async id=>result(PaperNative.remove(id)),marker:async()=>PaperNative.initialized(),mark:async()=>PaperNative.initialize(),location:'Android app-private profiles. Use Settings → Back up profile to save a portable file outside the app.'};
 const backend=PaperLocal.createBackend(store),oldFetch=window.fetch.bind(window);
 window.fetch=async(url,options={})=>{if(!String(url).startsWith('/api/'))return oldFetch(url,options);try{const route=String(url).slice(5),data=JSON.parse(options.body||'{}'),token=options.headers?.['X-Paper-Token']||'';return new Response(JSON.stringify(await backend.call(route,data,token)),{status:200,headers:{'Content-Type':'application/json'}})}catch(e){return new Response(JSON.stringify({error:e.message}),{status:400})}};
}
