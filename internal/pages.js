'use strict';
(()=>{
 const menuButton=document.getElementById('burger'),menu=document.getElementById('nav-mobile');
 const background=[...document.querySelectorAll('main,.site-footer,.back-to-top')];
 function closeMenu(restoreFocus=false){
  if(!menu||!menuButton)return;
  menu.classList.remove('open');menu.hidden=true;menu.inert=true;
  menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open navigation');menuButton.classList.remove('active');
  document.body.classList.remove('menu-open');background.forEach(el=>el.inert=false);
  if(restoreFocus)menuButton.focus();
 }
 function openMenu(){
  if(!menu||!menuButton)return;
  menu.hidden=false;menu.inert=false;menu.classList.add('open');
  menuButton.setAttribute('aria-expanded','true');menuButton.setAttribute('aria-label','Close navigation');menuButton.classList.add('active');
  document.body.classList.add('menu-open');background.forEach(el=>el.inert=true);
  menu.querySelector('a[href]')?.focus();
 }
 menuButton?.addEventListener('click',()=>menu.hidden?openMenu():closeMenu(true));
 document.addEventListener('keydown',e=>{
  if(!menu||menu.hidden)return;
  if(e.key==='Escape'){e.preventDefault();closeMenu(true);return}
  if(e.key==='Tab'){
   const items=[menuButton,...menu.querySelectorAll('a[href]')];
   const i=items.indexOf(document.activeElement),next=(i+(e.shiftKey?-1:1)+items.length)%items.length;
   e.preventDefault();items[next].focus();
  }
 });
 menu?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
 window.addEventListener('resize',()=>{if(innerWidth>1500)closeMenu()});
 const back=document.getElementById('back-to-top');
 function scrollState(){if(back){back.hidden=scrollY<=500;back.classList.toggle('visible',scrollY>500)}document.getElementById('site-header')?.classList.toggle('scrolled',scrollY>50)}
 window.addEventListener('scroll',scrollState,{passive:true});scrollState();
 back?.addEventListener('click',()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
 function setMode(mode){if(!['support','cooperation'].includes(mode))return;document.querySelectorAll('[data-mode]').forEach(el=>el.hidden=el.dataset.mode!==mode);document.querySelectorAll('[data-mode-button]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.modeButton===mode)))}
 document.querySelectorAll('[data-mode-button]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.modeButton)));
 const params=new URLSearchParams(location.search);setMode(params.get('type')||'support');
 // Only public routing context is read from URLs; personal form values stay in memory.
 for(const key of ['service','topic','jurisdiction','category']){const value=params.get(key);if(!value||value.length>200)continue;document.querySelectorAll(`[name="${key}"]`).forEach(el=>{if(el.tagName!=='SELECT'||[...el.options].some(o=>o.value===value))el.value=value})}
 for(const table of document.querySelectorAll('.prose table')){let wrap=document.createElement('div');wrap.className='table-scroll';wrap.tabIndex=0;table.before(wrap);wrap.append(table)}
 const endpoint=(kind)=>new URL((document.body.dataset.api||'api').replace(/\/$/,'')+'/'+kind,document.baseURI).href;
 function validWebsite(input){
  if(input.type!=='url'||!input.value.trim())return true;
  try{const url=new URL(input.value.trim());return ['http:','https:'].includes(url.protocol)&&!!url.hostname&&!/\s/.test(input.value.trim())}catch{return false}
 }
 for(const form of document.querySelectorAll('form[data-kind]')){
  let pending=false,requestKey=null,lastPayload=null;
  const status=form.querySelector('.form-status'),button=form.querySelector('[type=submit]');
  const readPayload=()=>{const data=Object.fromEntries(new FormData(form));if(['support','cooperation'].includes(form.dataset.kind))data.type=form.dataset.kind;if(form.dataset.kind==='subscribe')data.consent=true;return JSON.stringify(data)};
  form.addEventListener('input',e=>{if(e.target.matches('input,textarea,select')){e.target.removeAttribute('aria-invalid');const err=document.getElementById(e.target.id+'-error');if(err)err.textContent=''}});
  form.addEventListener('submit',async e=>{
   e.preventDefault();if(pending)return;
   status.textContent='';status.className='form-status';let firstInvalid=null;
   for(const input of form.querySelectorAll('input:not([name=website_check]),textarea,select')){
    const invalidWebsite=!validWebsite(input),invalid=!input.checkValidity()||(input.required&&!input.value.trim())||invalidWebsite;const err=document.getElementById(input.id+'-error');
    if(invalid){input.setAttribute('aria-invalid','true');const text=input.validity.typeMismatch||invalidWebsite?'Please enter a valid '+(input.type==='email'?'email address.':'website address.'):'Please complete this field.';if(err){err.textContent=text;input.setAttribute('aria-describedby',err.id)}if(!firstInvalid)firstInvalid=input}else{input.removeAttribute('aria-invalid');if(err)err.textContent=''}
   }
   if(firstInvalid){firstInvalid.focus();status.textContent=document.getElementById(firstInvalid.id+'-error')?.textContent||'Please complete the required fields.';status.classList.add('error');return}
   const kind=form.dataset.kind;
   const payload=readPayload();if(payload!==lastPayload||!requestKey){requestKey=globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);lastPayload=payload}
   pending=true;button.disabled=true;form.setAttribute('aria-busy','true');status.textContent='Sending…';
   let controller=new AbortController(),timer=setTimeout(()=>controller.abort(),25000);
   try{const response=await fetch(endpoint(['support','cooperation'].includes(kind)?'network':kind),{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':requestKey},body:payload,signal:controller.signal,credentials:'omit',cache:'no-store'});const result=await response.json();if(!response.ok||result.ok!==true)throw Error('Server rejected request');const unchanged=readPayload()===payload;status.textContent=form.dataset.success+(unchanged?'':' Your newer edits have been kept; they have not been sent.');status.classList.add('success');if(unchanged)form.reset();lastPayload=null;requestKey=null}
   catch{status.textContent=form.dataset.error;status.classList.add('error')}
   finally{clearTimeout(timer);pending=false;button.disabled=false;form.removeAttribute('aria-busy')}
  });
 }
})();
