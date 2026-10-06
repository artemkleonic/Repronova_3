'use strict';
// Homepage carousels; menu, search and forms share internal/pages.js.
for (const region of document.querySelectorAll('[data-carousel]')) {
 const viewport=region.querySelector('.swiper'),previous=region.querySelector('.carousel-prev'),next=region.querySelector('.carousel-next'),position=region.querySelector('.carousel-position');
 const total=viewport.querySelectorAll('.swiper-slide').length;
 if(!window.Swiper)continue;
 const slider=new Swiper(viewport,{
  slidesPerView:1,spaceBetween:24,watchOverflow:true,
  breakpoints:{768:{slidesPerView:2},1024:{slidesPerView:3}},
  navigation:{prevEl:previous,nextEl:next},
  pagination:{el:region.querySelector('.swiper-pagination'),clickable:true},
  a11y:{enabled:true,prevSlideMessage:'Previous cards',nextSlideMessage:'Next cards'},
  on:{init:update,slideChange:update,breakpoint:update,resize:update}
 });
 function update(swiper){
  const count=Number(swiper.params.slidesPerView)||1,start=Math.min(swiper.activeIndex+1,total);
  position.textContent=`${start}–${Math.min(start+count-1,total)} of ${total}`;
  swiper.slides?.forEach((slide,index)=>{slide.inert=!(index>=start-1&&index<start-1+count)});
 }
 viewport.addEventListener('keydown',event=>{
  if(event.key==='ArrowRight'){event.preventDefault();slider.slideNext()}
  if(event.key==='ArrowLeft'){event.preventDefault();slider.slidePrev()}
  if(event.key==='Home'){event.preventDefault();slider.slideTo(0)}
  if(event.key==='End'){event.preventDefault();slider.slideTo(total-1)}
 });
}
