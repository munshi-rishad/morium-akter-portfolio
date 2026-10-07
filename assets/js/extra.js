(()=>{'use strict';
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000)};
const copy=t=>navigator.clipboard.writeText(t).then(()=>toast('Copied'),()=>toast('Copy failed'));
const mk=(c,h)=>{const d=document.createElement('dialog');d.className=c;d.innerHTML=h;document.body.append(d);return d};
const mail=()=>$('[data-copy*="@"]').dataset.copy;
/* certificate lightbox: prev/next, arrows, swipe, click to zoom */
const lb=mk('lb','<div class="lb-box"><div class="lb-view"><img alt=""></div><div class="lb-bar"><div class="lb-cap"></div><button class="icon-btn" data-a="prev" aria-label="Previous">&#8249;</button><button class="icon-btn" data-a="next" aria-label="Next">&#8250;</button><button class="icon-btn" data-a="close" aria-label="Close">&#10005;</button></div></div>');
let items=[],cur=0,sx=0;
const show=i=>{cur=(i+items.length)%items.length;const c=items[cur],m=$('img',c),im=$('img',lb);im.src=m.src;im.alt=m.alt;lb.classList.remove('zoom');$('.lb-cap',lb).innerHTML=`${$('h3',c).textContent}<small>${$('.date',c).textContent} &middot; ${cur+1}/${items.length}</small>`};
$$('.cert-media').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();items=$$('.cert:not([hidden])');show(items.indexOf(a.closest('.cert')));lb.showModal()}));
lb.addEventListener('click',e=>{const a=e.target.closest('[data-a]');if(e.target===lb||(a&&a.dataset.a==='close'))lb.close();else if(a)show(cur+(a.dataset.a==='next'?1:-1));else if(e.target.tagName==='IMG')lb.classList.toggle('zoom')});
lb.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')show(cur-1);if(e.key==='ArrowRight')show(cur+1)});
lb.addEventListener('touchstart',e=>sx=e.touches[0].clientX,{passive:true});
lb.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-sx;if(Math.abs(d)>50)show(cur+(d<0?1:-1))});
/* quick-jump palette: Ctrl/Cmd+K or the search button */
const pal=mk('pal','<div class="pal-box"><input type="search" placeholder="Jump to a section, certificate or action" aria-label="Quick search"><ul role="listbox"></ul><div class="pal-foot">Up/Down move &middot; Enter open &middot; Esc close</div></div>');
const inp=$('input',pal),ul=$('ul',pal);let list=[],sel=0;
const cmds=[...$$('.menu a').map(a=>({t:a.textContent,k:'Section',f:()=>$(a.getAttribute('href')).scrollIntoView({behavior:reduce?'auto':'smooth'})})),
{t:'View CV',k:'Action',f:()=>open($('.cta a').href,'_blank','noopener')},{t:'Copy email',k:'Action',f:()=>copy(mail())},
...$$('.cert').map(c=>({t:$('h3',c).textContent,k:'Certificate',f:()=>$('.cert-media',c).click()}))];
const draw=()=>{const q=inp.value.trim().toLowerCase();list=cmds.filter(c=>(c.t+' '+c.k).toLowerCase().includes(q));sel=Math.min(sel,Math.max(list.length-1,0));ul.innerHTML=list.map((c,i)=>`<li role="option" aria-selected="${i===sel}" data-i="${i}">${c.t}<small>${c.k}</small></li>`).join('')||'<li>No match</li>'};
const run=i=>{const c=list[i];if(!c)return;pal.close();setTimeout(c.f,60)};
const openPal=()=>{inp.value='';sel=0;draw();pal.showModal();inp.focus()};
inp.addEventListener('input',()=>{sel=0;draw()});
pal.addEventListener('keydown',e=>{if(!list.length)return;if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();sel=(sel+(e.key==='ArrowDown'?1:-1)+list.length)%list.length;draw();const s=$('[aria-selected=true]',ul);if(s)s.scrollIntoView({block:'nearest'})}else if(e.key==='Enter'){e.preventDefault();run(sel)}});
ul.addEventListener('click',e=>{const li=e.target.closest('li[data-i]');if(li)run(+li.dataset.i)});
pal.addEventListener('click',e=>{if(e.target===pal)pal.close()});
$('#cmd').addEventListener('click',openPal);
addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();pal.open?pal.close():openPal()}});
/* 3D tilt on certificate previews (mouse only) */
if(fine&&!reduce)$$('.cert-media').forEach(m=>{const i=$('img',m);m.addEventListener('pointermove',e=>{const r=m.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;i.style.transform=`perspective(700px) rotateY(${x*10}deg) rotateX(${-y*10}deg) scale(1.06)`});m.addEventListener('pointerleave',()=>{i.style.transform=''})});
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
/* side dots (section index) */
const secs=$$('main > section'),dn=document.createElement('nav');dn.className='dots';dn.setAttribute('aria-label','Sections');
dn.innerHTML=secs.map(s=>`<a href="#${s.id}" aria-label="${s.id}" data-t="${s.id}"></a>`).join('');document.body.append(dn);
const so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)$$('a',dn).forEach(a=>a.classList.toggle('on',a.dataset.t===e.target.id))}),{rootMargin:'-45% 0px -50% 0px'});secs.forEach(s=>so.observe(s));
})();
