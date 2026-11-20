'use strict';
// Factual Help documents and point-of-export disclosure; no new consent records.
const auditAbout = aboutPage09, auditAction = action;
let auditPolicy = '', auditExport = null;
function auditPolicyHtml(id) {
  const page = PaperPolicy.pages[id];
  if (!page) return '';
  return `${publicHeader09()}<main class="about-page policy-page">${btn('← Help & Tips','audit-policy-back','','flat')}<h1>${esc(page.title)}</h1><div class="reading">${markdown(page.text.replace(/^#[^\n]*\n+/,''))}</div>${id==='notices'?`<details><summary>Complete scrypt-js MIT notice</summary><pre class="policy-license">${esc(PaperPolicy.scrypt)}</pre></details><details><summary>Complete Electron MIT notice — Windows runtime</summary><pre class="policy-license">${esc(PaperPolicy.electron)}</pre></details>`:''}</main>${footer09()}`;
}
aboutPage09 = function(creator=false) {
  if (!creator && auditPolicy) return auditPolicyHtml(auditPolicy);
  const html = auditAbout(creator);
  if (creator) return html;
  return html.replace('<h2 id="faq">', `<section aria-labelledby="policy-heading"><h2 id="policy-heading">Privacy, use & notices</h2><p>How local data, sharing and software notices work.</p><div class="feature-toolbar">${Object.entries(PaperPolicy.pages).map(([id,p])=>btn(esc(p.title),'audit-policy',id)).join('')}</div></section><h2 id="faq">`);
};
function auditExportDialog(kind) {
  const c=object();if(c?.kind!=='character')return;
  const context=featureContext(c),v=P.characterPage(c,w,context),portable=kind==='portable-export';
  auditExport={kind,id:c.id};
  dialog(portable?'Export portable character':'Export Character Page', portable?
    `<p>This readable package transfers <strong>${esc(c.name)}</strong>, including every context, hidden fields, galleries, references and chatbot setup. Character Page visibility choices do not filter this package.</p><p>Designated private working/section/connection notes and protected snapshots are excluded. Use an encrypted full profile backup to move private work.</p><p>Review all character writing and reference material before sharing. Original images may retain embedded metadata. A cloud-backed destination may upload the exported file.</p>`:
    `<p>This readable HTML file follows the <strong>${esc(context)}</strong> Character Page presentation for <strong>${esc(v.name)}</strong>.</p><p>Visible blocks: ${esc(v.blocks.join(', '))}. ${v.facts.length} quick facts, ${v.details.length} detail fields, ${v.connections.length} connections and ${v.gallery.length} gallery previews are selected. Identity, hook and selected appearance names may also be included.</p><p>Review the page for spoilers or personal details inside visible text. Designated private notes are excluded. Original images may retain embedded metadata. A password on your profile does not protect this HTML file.</p>`,
    [['Cancel','close-modal'],...(portable?[]:[['Customize before exporting','customize-page']]),['Download '+(portable?'package':'HTML'),'audit-export-confirm','','primary']]);
}
action = async function(name,value) {
  if(name==='audit-policy') {
    if(!PaperPolicy.pages[value])return;
    const show=()=>{auditPolicy=value;screen09='about';render()};
    return profile09?navigate(show):show();
  }
  if(name==='audit-policy-back') {auditPolicy='';screen09='about';render();return}
  if(['faq09','about09','anva09','home','welcome09','profiles09','lock09'].includes(name))auditPolicy='';
  if(name==='portable-export'||name==='page-export')return auditExportDialog(name);
  if(name==='audit-export-confirm') {
    const pending=auditExport;auditExport=null;
    if(!pending||object()?.id!==pending.id)return notice('Return to the character you want to export.');
    closeDialog();return auditAction(pending.kind);
  }
  if(name==='close-modal')auditExport=null;
  return auditAction(name,value);
};
document.addEventListener('DOMContentLoaded',()=>{
  if(typeof PaperNative!=='undefined'){
    const previousBack=window.paperBack;
    window.paperBack=async()=>{if(auditPolicy&&!modal.open)return action('audit-policy-back');return previousBack?.()};
  }
});
