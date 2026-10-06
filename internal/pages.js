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
   const items=[menuButton,...menu.querySelectorAll('a[href],button')];
   const i=items.indexOf(document.activeElement),next=(i+(e.shiftKey?-1:1)+items.length)%items.length;
   e.preventDefault();items[next].focus();
  }
 });
 menu?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
 document.addEventListener('click',e=>{if(menu&&!menu.hidden&&!menu.contains(e.target)&&!menuButton?.contains(e.target))closeMenu()});
 window.addEventListener('resize',()=>{if(innerWidth>1500)closeMenu()});
 const back=document.getElementById('back-to-top');
 function scrollState(){if(back){back.hidden=scrollY<=500;back.classList.toggle('visible',scrollY>500)}const header=document.getElementById('site-header');header?.classList.toggle('scrolled',scrollY>50);document.documentElement.style.setProperty('--header-current',(header?.offsetHeight||100)+'px')}
 window.addEventListener('scroll',scrollState,{passive:true});scrollState();
 window.addEventListener('resize',scrollState);
 back?.addEventListener('click',()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
 const overlay=document.getElementById('search-overlay'),searchInput=document.getElementById('search-input'),searchForm=document.getElementById('search-form'),searchResult=document.getElementById('search-result');
 const searchButtons=[document.getElementById('open-search'),document.getElementById('open-search-mobile')].filter(Boolean);
 let searchFocus=null;
 const searchBackground=[...document.querySelectorAll('header,main,.site-footer,.back-to-top')];
 function closeSearch(){if(!overlay)return;overlay.hidden=true;overlay.inert=true;overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');searchButtons.forEach(b=>b.setAttribute('aria-expanded','false'));document.body.classList.remove('search-open');searchBackground.forEach(el=>el.inert=false);searchFocus?.focus()}
 function openSearch(event){if(!overlay)return;const opener=event?.currentTarget||document.activeElement;searchFocus=menu?.contains(opener)?menuButton:opener;closeMenu();overlay.hidden=false;overlay.inert=false;overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');searchButtons.forEach(b=>b.setAttribute('aria-expanded','true'));document.body.classList.add('search-open');searchBackground.forEach(el=>el.inert=true);searchInput?.focus()}
 searchButtons.forEach(b=>b.addEventListener('click',openSearch));
 document.getElementById('close-search')?.addEventListener('click',closeSearch);
 overlay?.addEventListener('click',e=>{if(e.target===overlay)closeSearch()});
 document.addEventListener('keydown',e=>{
  if(!overlay||overlay.hidden)return;
  if(e.key==='Escape'){e.preventDefault();closeSearch()}
  if(e.key==='Tab'){const items=[...overlay.querySelectorAll('button,input')],i=items.indexOf(document.activeElement);e.preventDefault();items[(i+(e.shiftKey?-1:1)+items.length)%items.length].focus()}
 });
 searchForm?.addEventListener('submit',e=>{
  e.preventDefault();const query=searchInput.value.trim();if(!query)return;
  const main=document.querySelector('main');
  main.querySelectorAll('mark.repro-mark').forEach(mark=>{const parent=mark.parentNode;mark.replaceWith(document.createTextNode(mark.textContent));parent.normalize()});
  const walker=document.createTreeWalker(main,NodeFilter.SHOW_TEXT),nodes=[];
  while(walker.nextNode()){const node=walker.currentNode;if(node.parentElement.closest('script,style,textarea,select,button,label,.form-status,[hidden]'))continue;if(node.nodeValue.toLowerCase().includes(query.toLowerCase()))nodes.push(node)}
  let first=null,count=0;
  for(const node of nodes){const value=node.nodeValue,fragment=document.createDocumentFragment();let start=0,index;
   while((index=value.toLowerCase().indexOf(query.toLowerCase(),start))!==-1){fragment.append(document.createTextNode(value.slice(start,index)));const mark=document.createElement('mark');mark.className='repro-mark';mark.textContent=value.slice(index,index+query.length);fragment.append(mark);first ||= mark;count++;start=index+query.length}
   fragment.append(document.createTextNode(value.slice(start)));node.replaceWith(fragment);
  }
  searchResult.textContent=count?`${count} matches found.`:'No matches found on this page.';
  if(first){closeSearch();const slide=first.closest('.swiper-slide'),swiper=slide?.closest('.swiper')?.swiper;if(swiper)swiper.slideTo([...slide.parentNode.children].indexOf(slide),0);first.scrollIntoView({block:'center',behavior:'instant'})}
 });
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
