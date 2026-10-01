/* Only compatibility pages load this file. */
'use strict';
(()=>{
 const destination=document.querySelector('meta[name="redirect-target"]')?.content;
 if(!destination)return;
 const target=new URL(destination,location.href);
 target.search=location.search;target.hash=location.hash;
 const original=new URL(destination,location.href);
 for(const link of document.querySelectorAll('main a[href]'))if(link.href===original.href)link.href=target.href;
 location.replace(target.href);
})();
