(()=>{'use strict';
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
const mk=(c,h)=>{const d=document.createElement('dialog');d.className=c;d.innerHTML=h;document.body.append(d);return d};
/* certificate lightbox: prev/next, arrows, swipe, click to zoom */
const lb=mk('lb','<div class="lb-box"><div class="lb-view"><img alt=""></div><div class="lb-bar"><div class="lb-cap"></div><button class="icon-btn" data-a="prev" aria-label="Previous">&#8249;</button><button class="icon-btn" data-a="next" aria-label="Next">&#8250;</button><button class="icon-btn" data-a="close" aria-label="Close">&#10005;</button></div></div>');
let items=[],cur=0,sx=0;
const show=i=>{cur=(i+items.length)%items.length;const c=items[cur],m=$('img',c),im=$('img',lb);im.src=m.src;im.alt=m.alt;lb.classList.remove('zoom');$('.lb-cap',lb).innerHTML=`${$('h3',c).textContent}<small>${$('.date',c).textContent} &middot; ${cur+1}/${items.length}</small>`};
$$('.cert-media').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();items=$$('.cert:not([hidden])');show(items.indexOf(a.closest('.cert')));lb.showModal()}));
lb.addEventListener('click',e=>{const a=e.target.closest('[data-a]');if(e.target===lb||(a&&a.dataset.a==='close'))lb.close();else if(a)show(cur+(a.dataset.a==='next'?1:-1));else if(e.target.tagName==='IMG')lb.classList.toggle('zoom')});
lb.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')show(cur-1);if(e.key==='ArrowRight')show(cur+1)});
lb.addEventListener('touchstart',e=>sx=e.touches[0].clientX,{passive:true});
lb.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-sx;if(Math.abs(d)>50)show(cur+(d<0?1:-1))});
/* 3D tilt on certificate previews (mouse only, one update per frame) */
if(fine&&!reduce)$$('.cert-media').forEach(m=>{const i=$('img',m);let ex=0,ey=0,f=0;m.addEventListener('pointermove',e=>{ex=e.clientX;ey=e.clientY;if(f)return;f=requestAnimationFrame(()=>{f=0;const r=m.getBoundingClientRect(),x=(ex-r.left)/r.width-.5,y=(ey-r.top)/r.height-.5;i.style.transform=`perspective(700px) rotateY(${x*10}deg) rotateX(${-y*10}deg) scale(1.06)`})},{passive:true});m.addEventListener('pointerleave',()=>{cancelAnimationFrame(f);f=0;i.style.transform=''},{passive:true})});
/* installable + works offline */
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('sw.js').catch(()=>{});
/* results chart (SVG, draws on scroll) */
const gp=$('#gpa');if(gp){const d=[['Primary','2014',4.58],['JSC','2017',4.36],['SSC','2020',4.89],['HSC','2022',5]],W=640,H=270,L=56,R=36,x=i=>L+i*(W-L-R)/(d.length-1),y=v=>220-(v-4)*170;
const pts=d.map((a,i)=>[x(i),y(a[2])]),ln=pts.map((q,i)=>(i?'L':'M')+q[0]+' '+q[1]).join(' ');
gp.innerHTML=`<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">`+
[4,4.5,5].map(v=>`<line class="gl" x1="${L-10}" x2="${W-R+10}" y1="${y(v)}" y2="${y(v)}"/><text x="4" y="${y(v)+4}">${v.toFixed(1)}</text>`).join('')+
`<path class="ar" d="${ln} L${pts[3][0]} 220 L${pts[0][0]} 220Z"/><path class="ln" pathLength="1" d="${ln}"/>`+
d.map((a,i)=>`<g><title>${a[0]} ${a[1]}: GPA ${a[2].toFixed(2)}</title><circle class="dt" cx="${pts[i][0]}" cy="${pts[i][1]}" r="7"/><text class="v" x="${pts[i][0]}" y="${pts[i][1]-16}" text-anchor="middle">${a[2].toFixed(2)}</text><text x="${pts[i][0]}" y="244" text-anchor="middle">${a[0]}</text><text x="${pts[i][0]}" y="260" text-anchor="middle">${a[1]}</text></g>`).join('')+'</svg>';
const o=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){gp.classList.add('in');o.disconnect()}}),{threshold:.35});o.observe(gp)}
})();
