const progress=document.querySelector('.progress');
window.addEventListener('scroll',()=>{const h=document.documentElement;progress.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';});
const menu=document.querySelector('.menu'), nav=document.querySelector('.navlinks');
menu?.addEventListener('click',()=>nav.classList.toggle('open'));
document.querySelectorAll('.navlinks a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')}),{threshold:.08});
document.querySelectorAll('.reveal').forEach(e=>observer.observe(e));
const modal=document.getElementById('viewer'), frame=document.getElementById('pdf-frame'), title=document.getElementById('modal-title'), openPdf=document.getElementById('open-pdf');
function openViewer(file,name){title.textContent=name;frame.src=file+'#view=FitH';openPdf.href=file;modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function closeViewer(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');frame.src='';document.body.style.overflow=''}
document.querySelectorAll('[data-url]').forEach(el=>el.addEventListener('click',()=>{ if(el.dataset.url && el.dataset.url!='#') window.open(el.dataset.url,'_blank'); }));



const themeBtn=document.querySelector('.theme-toggle');
themeBtn?.addEventListener('click',()=>{
 document.body.classList.toggle('dark');
 themeBtn.textContent=document.body.classList.contains('dark')?'☀':'☾';
 localStorage.setItem('theme',document.body.classList.contains('dark')?'dark':'light');
});
if(localStorage.getItem('theme')==='dark'){document.body.classList.add('dark');if(themeBtn)themeBtn.textContent='☀';}
