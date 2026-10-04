(function(root){
'use strict';
const uid=()=>globalThis.crypto.randomUUID?globalThis.crypto.randomUUID():Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join(''),clone=x=>JSON.parse(JSON.stringify(x));
const contexts=['chatbot','roleplay','story','game'];
const defaults={
 Information:['Nickname / Alias','Age','Gender','Pronouns','Occupation','Location','Bio'],
 Appearance:['Height','Build','Hair','Eyes','Skin','Face','Clothing','Distinguishing features'],
 Personality:['Core personality','Traits','Likes','Dislikes','Habits / Mannerisms','Strengths','Flaws','Fears','Values','Goals / Motivations','Secrets','Public persona','Private persona'],
 World:['World type','World description','Setting','Time period','Locations','Society / Culture','Politics','Technology','Magic / Power system','Species / Races','Organizations / Factions','Religion / Mythology','History','Rules of the world'],
 History:['Childhood','Education / Training','Career','Important events','Past relationships','Major experiences','Current situation'],
 'Speech & behaviour':['Speaking style','Vocabulary','Tone','Accent / Dialect','Common expressions','Verbal tics','Humour style','Body language','Emotional expression','How they text'],
 'Relationship with {{user}}':['Who is {{user}}?','Relationship','How they met','Current dynamic','Feelings','Treatment','Shared history','Relationship goals / tension'],
 'User / Persona':['Name','Appearance','Personality','Background','Additional details'],
 'Relationship with partner':['Who is the partner?','Relationship','How they met','Current dynamic','Feelings / Tension','Shared history'],
 'Partner Character':['Name','Appearance','Personality','Background','Additional details'],
 Scenario:['Scenario','Starting location','Current situation','Recent events','Character’s current goal','User’s role'],
 'Author instructions':['Roleplay style','Narration style','Point of view','Response length','Character rules','Things to do','Things to avoid','Author instructions']
};
const sectionScope=name=>['Relationship with {{user}}','User / Persona'].includes(name)?['chatbot']:['Relationship with partner','Partner Character'].includes(name)?['roleplay']:name==='Author instructions'?['chatbot','roleplay']:contexts.slice();
function section(name,labels=[],custom=false){return{id:uid(),name,key:name,custom,scope:custom?contexts.slice():sectionScope(name),mode:'Structured',free:'',notes:'',linkedId:'',pinned:false,collapsed:false,fields:labels.map(label=>({id:uid(),label,value:'',custom:false,hidden:false}))}}
function base(kind,name){return{id:uid(),kind,name,updated:Date.now(),archived:false,color:'#405b59',gallery:[],references:[],notes:'',cover:null,snapshot:null}}
function character(name){return{...base('character',name),uses:['chatbot'],view:['chatbot'],sections:Object.entries(defaults).map(([n,f])=>section(n,f)),connections:[],greetings:[],dialogues:[],setup:{title:'',chatName:'',tagline:'',publicIntro:'',tags:'',system:'',post:''},exportPrefs:{target:'bio',context:'story',representation:'both',layout:'separate',links:[]},portraitId:''}}
function story(name){return{...base('story',name),chapters:[{id:uid(),title:'',text:''}],cast:[]}}
function project(name){return{...base('project',name),description:'',members:[],stories:[]}}
function empty(){return{format:'character-paper',schemaVersion:9,contextVersion:2,relationships:[],characters:[],stories:[],projects:[],templates:[],settings:{autosave:true,dark:false,collapseEmpty:false}}}
function applicable(scope,selected){return !scope||scope.some(c=>selected.includes(c))}
function sectionText(s,representation='both',stats){const parts=[];if(representation!=='freeform'){for(const f of s.fields){if(f.value.trim()){parts.push(`${f.label}: ${f.value}`);if(stats)stats.included++}else if(stats)stats.empty++}}if(representation!=='structured'){if(s.free.trim()){parts.push(s.free);if(stats)stats.included++}else if(stats)stats.empty++}return parts.join('\n\n')}
function hasContent(s){return !!(s.free.trim()||s.notes.trim()||s.fields.some(f=>f.value.trim())||s.linkedId)}
function normalizeConnection(c){return{id:c.id||uid(),name:c.name||'',linkedId:c.linkedId||'',relationship:c.relationship||'',description:c.description||'',notes:c.notes||'',scope:c.scope||contexts.slice(),custom:c.custom||[]}}
function migrate(input){
 if([8,9].includes(input?.schemaVersion)){validate(input);const result=clone(input);result.schemaVersion=9;result.relationships??=[];if(!result.contextVersion){const wasAll=a=>Array.isArray(a)&&a.length===3&&['chatbot','roleplay','story'].every(c=>a.includes(c));const upgrade=node=>{if(!node||typeof node!=='object')return;for(const [k,v] of Object.entries(node)){if((k==='scope'||k==='view')&&wasAll(v))v.push('game');else if(typeof v==='object')upgrade(v)}};upgrade(result);result.contextVersion=2}for(const c of result.characters){c.sections=c.sections.filter(s=>s.name!=='Connections'||hasContent(s));for(const s of c.sections){s.key??=s.name;if(s.name==='Connections')s.name='Connection details'}}return result}
 if(!input||!Array.isArray(input.characters))throw Error('This is not a Character Paper workspace backup.');
 const w=empty();w.settings.dark=input.theme==='dark';
 w.characters=input.characters.map(old=>{if(!old||typeof old.name!=='string'||!old.name.trim())throw Error('Invalid character in backup.');const c=character(old.name);c.id=old.id||c.id;c.color=/^#[0-9a-f]{6}$/i.test(old.color)?old.color:c.color;c.updated=old.updated||c.updated;c.uses=old.use==='both'?['chatbot','roleplay']:[old.use==='roleplay'?'roleplay':'chatbot'];c.view=c.uses.slice();c.notes=old.sections?.['Quick notes']?.free||'';
 for(const [name,oldS] of Object.entries(old.sections||{})){if(name==='Quick notes')continue;
 if(['Dialogue','Greetings'].includes(name)){const texts=[...Object.values(oldS.fields||{}),oldS.free||''].filter(Boolean);if(texts.length)c[name==='Dialogue'?'dialogues':'greetings'].push({id:uid(),label:'Imported',text:texts.join('\n\n'),primary:true});if(oldS.notes)c.notes+='\n\n'+name+' private notes:\n'+oldS.notes;continue}
 if(name==='Connections'&&!oldS.free&&!oldS.notes&&!Object.values(oldS.fields||{}).some(Boolean))continue;
 let s=c.sections.find(s=>s.name===name);if(!s){s=section(name==='Connections'?'Connection details':name,[],true);c.sections.push(s)}s.free=oldS.free||'';s.notes=oldS.notes||'';s.mode=oldS.mode||'Structured';s.linkedId=oldS.linkedId||'';
 for(const [label,value] of Object.entries(oldS.fields||{})){let f=s.fields.find(f=>f.label===label);if(!f){f={id:uid(),label,value:'',custom:true,hidden:false};s.fields.push(f)}f.value=String(value??'')}
 }c.connections=(old.connections||[]).map(normalizeConnection);return c});
 w.projects=(input.stories||[]).map(old=>({...project(old.name),id:old.id||uid(),description:old.description||'',members:old.members||[]}));validate(w);return w;
}
function validate(w){
 const fail=()=>{throw Error('Backup is incomplete or invalid. Your current library has not been changed.')};
 if(w?.format!=='character-paper'||![8,9].includes(w.schemaVersion)||!w.settings||typeof w.settings.autosave!=='boolean')fail();
 const str=x=>{if(typeof x!=='string')fail()},arr=x=>{if(!Array.isArray(x))fail()},ids=new Set();
 const safeId=x=>{str(x);if(!/^[A-Za-z0-9_-]{1,100}$/.test(x))fail()};const id=x=>{safeId(x);if(ids.has(x))fail();ids.add(x)},scope=x=>{arr(x);if(!x.length||x.some(v=>!contexts.includes(v)))fail()};
 function object(o,snapshot=false){if(!o||typeof o!=='object')fail();if(!snapshot)id(o.id);str(o.name);if(!o.name.trim())fail();if(!['character','story','project'].includes(o.kind))fail();str(o.notes);if(!/^#[0-9a-f]{6}$/i.test(o.color))fail();
 for(const group of ['gallery','references']){arr(o[group]);for(const a of o[group]){str(a.id);str(a.title);str(a.description);if(a.type==='image'){if(typeof a.data!=='string'||!/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(a.data))fail()}else if(group==='references'&&a.type==='text'){str(a.text)}else fail()}}
 if(o.cover&&(!Number.isFinite(o.cover.x)||!Number.isFinite(o.cover.y)||!Number.isFinite(o.cover.zoom)))fail();
 if(o.kind==='character'){scope(o.uses);scope(o.view);arr(o.sections);for(const s of o.sections){str(s.id);str(s.name);scope(s.scope);str(s.free);str(s.notes);arr(s.fields);for(const f of s.fields){str(f.id);str(f.label);str(f.value)}}arr(o.connections);for(const c of o.connections){scope(c.scope);for(const k of ['id','name','linkedId','relationship','description','notes'])str(c[k]);arr(c.custom);for(const f of c.custom){str(f.label);str(f.value)}}for(const g of ['greetings','dialogues']){arr(o[g]);for(const item of o[g]){str(item.id);str(item.label);str(item.text)}}for(const k of ['title','chatName','tagline','publicIntro','tags','system','post'])str(o.setup?.[k]);}
 if(o.kind==='story'){arr(o.chapters);arr(o.cast);for(const c of o.chapters){str(c.id);str(c.title);str(c.text)}for(const c of o.cast){str(c.characterId);str(c.role)}}
 if(o.kind==='project'){str(o.description);arr(o.members);arr(o.stories);o.members.forEach(str);o.stories.forEach(str)}
 const inspectIds=node=>{if(Array.isArray(node)){node.forEach(inspectIds);return}if(!node||typeof node!=='object')return;for(const [key,value] of Object.entries(node)){if(key==='snapshot')continue;if(['id','linkedId','characterId','portraitId'].includes(key)&&value)safeId(value);if(typeof value==='object')inspectIds(value)}};inspectIds(o);
 if(o.snapshot){if(snapshot||!o.snapshot.data||o.snapshot.data.kind!==o.kind||o.snapshot.data.id!==o.id)fail();object(o.snapshot.data,true)}
 }
 for(const key of ['characters','stories','projects']){arr(w[key]);w[key].forEach(o=>object(o))}
 if(w.relationships!==undefined){arr(w.relationships);const seen=new Set();for(const r of w.relationships){safeId(r.id);safeId(r.a);safeId(r.b);str(r.context);str(r.history);if(r.a===r.b||seen.has(r.id))fail();seen.add(r.id)}}
 for(const c of w.characters)for(const link of c.connections)if(link.relationshipId)safeId(link.relationshipId);
 arr(w.templates);for(const t of w.templates){str(t.name);arr(t.sections);for(const s of t.sections){str(s.name);arr(s.fields);s.fields.forEach(f=>str(f.label));scope(s.scope)}}return true;
}
function makeSnapshot(o,label){const copy=clone(o);copy.snapshot=null;return{label:label||'Protected snapshot',date:Date.now(),data:copy}}
function restoreSnapshot(o){if(!o.snapshot)throw Error('No snapshot exists.');const restored=clone(o.snapshot.data);restored.snapshot=clone(o.snapshot);restored.updated=Date.now();return restored}
function makeTemplate(c,name){return{id:uid(),name,uses:c.uses.slice(),sections:c.sections.map(s=>({...section(s.name,[],s.custom),scope:s.scope.slice(),mode:s.mode,pinned:s.pinned,fields:s.fields.map(f=>({id:uid(),label:f.label,value:'',custom:f.custom,hidden:f.hidden}))}))}}
function fromTemplate(t,name){const c=character(name);c.uses=t.uses?.slice()||['chatbot'];c.view=c.uses.slice();c.sections=t.sections.map(s=>({...clone(s),id:uid(),fields:s.fields.map(f=>({...f,id:uid(),value:''})),free:'',notes:'',linkedId:''}));return c}
function exportCharacter(c,w,prefs={}){
 const p={target:'bio',context:'story',representation:'both',layout:'separate',links:[],...prefs};const ctx=p.target==='bio'?(p.context==='all'?contexts:[p.context]):['chatbot'];const stats={included:0,empty:0,excluded:0};const blocks=[];
 for(const s of c.sections){if(!applicable(s.scope,ctx)){if(hasContent(s))stats.excluded++;continue}const text=sectionText(s,p.sectionRepresentations?.[s.id]||p.representation,stats);if(text)blocks.push({name:s.name,key:s.custom?'custom':s.key||s.name,text});if(s.linkedId&&p.links.includes(s.linkedId)){const linked=w.characters.find(b=>b.id===s.linkedId);if(linked)blocks.push({name:s.name+' — '+linked.name,text:linkedSummary(linked)})}}
 const connections=[];for(const conn of c.connections){if(!applicable(conn.scope,ctx)){stats.excluded++;continue}const linked=w.characters.find(b=>b.id===conn.linkedId);const relation=(w.relationships||[]).find(r=>r.id===conn.relationshipId);const other=linked?.connections.find(x=>x.relationshipId&&x.relationshipId===conn.relationshipId);const detail=[relation?.context?"Context: "+relation.context:"",relation?.history?"Shared history: "+relation.history:"",conn.relationship,conn.description,p.includeOtherPerspective&&other?"Other perspective: "+[other.relationship,other.description].filter(Boolean).join(" — "):"",...(conn.custom||[]).filter(f=>f.value.trim()).map(f=>`${f.label}: ${f.value}`)].filter(t=>t?.trim());const name=linked?.name||conn.name;if(name.trim()||detail.length){connections.push([name,...detail].filter(Boolean).join('\n'));stats.included++}if(linked&&p.links.includes(linked.id))connections.push(linkedSummary(linked))}
 if(connections.length)blocks.push({name:'Connections',text:connections.join('\n\n')});
 function linkedSummary(b){return b.name+'\n'+b.sections.filter(s=>applicable(s.scope,ctx)).map(s=>{const t=sectionText(s,p.representation);return t?s.name+'\n'+t:''}).filter(Boolean).join('\n\n')}
 const formatted=list=>list.map(b=>`${b.name}\n${b.text}`).join('\n\n');const scenario=formatted(blocks.filter(b=>b.key==='Scenario'));const definition=formatted(blocks.filter(b=>b.key!=='Scenario'));const examples=c.dialogues.filter(d=>d.text.trim()).map(d=>d.text).join('\n\n');const greetings=c.greetings.filter(g=>g.text.trim()).slice().sort((a,b)=>Number(!!b.primary)-Number(!!a.primary));
 const bioBlocks=blocks.slice();if(ctx.some(x=>x==='chatbot'||x==='roleplay')){if(c.dialogues.some(d=>d.text.trim()))bioBlocks.push({name:'Dialogue examples',text:examples});if(greetings.length)bioBlocks.push({name:'Greetings',text:greetings.map(g=>g.text).join('\n\n')});}
 if(p.target==='bio')return{text:c.name+'\n'+'='.repeat(Math.min(c.name.length,60))+'\n\n'+formatted(bioBlocks),stats,context:ctx.join(' + ')};
 const full=p.layout==='combined'?[definition,scenario,examples&&'Example dialogue\n'+examples].filter(Boolean).join('\n\n'):definition;
 if(p.target==='jai'){const fields={'Title':c.setup.title||c.name,'Chat name':c.setup.chatName||c.name,'Bio':c.setup.publicIntro,'Tags':c.setup.tags,'Personality':full,'Scenario':p.layout==='combined'?'':scenario,'Example dialogs':p.layout==='combined'?'':examples};let selected=greetings;if(p.greetingIds)selected=greetings.filter(g=>p.greetingIds.includes(g.id));return{fields,greetings:selected.map(g=>({id:g.id,text:g.text,label:g.label})),tooMany:selected.length>10,stats,context:'chatbot'}}
 const card={spec:'chara_card_v2',spec_version:'2.0',data:{name:c.setup.title||c.name,description:full,personality:'',scenario:p.layout==='combined'?'':scenario,first_mes:greetings[0]?.text||'',mes_example:p.layout==='combined'?'':examples,creator_notes:c.setup.publicIntro,system_prompt:c.setup.system,post_history_instructions:c.setup.post,alternate_greetings:greetings.slice(1).map(g=>g.text),tags:c.setup.tags.split(/[,\n]/).map(s=>s.trim()).filter(Boolean),creator:'',character_version:'',extensions:{}}};
 // V2 has no standardized listing tagline or separate chat name. Keep them explicit,
 // namespaced, and copyable; do not claim undocumented destination import behavior.
 card.data.extensions.character_paper={tagline:c.setup.tagline,chat_name:c.setup.chatName};
 return{card,text:JSON.stringify(card,null,2),metadata:{Tagline:c.setup.tagline,'In-Chat Name':c.setup.chatName},stats,context:'chatbot'};
}
function searchable(c){return[c.name,c.notes,...c.sections.flatMap(s=>[s.name,s.free,s.notes,...s.fields.map(f=>f.value)]),...c.connections.flatMap(x=>[x.name,x.relationship,x.description,x.notes]),...c.greetings.map(x=>x.text),...c.dialogues.map(x=>x.text)].join(' ').toLowerCase()}
const api={uid,clone,contexts,defaults,sectionScope,section,character,story,project,empty,applicable,sectionText,hasContent,migrate,validate,makeSnapshot,restoreSnapshot,makeTemplate,fromTemplate,exportCharacter,searchable};
if(typeof module!=='undefined')module.exports=api;else root.Paper=api;
})(globalThis);
