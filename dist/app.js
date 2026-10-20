const toggle=document.querySelector('.menu-toggle');
const menu=document.querySelector('#menu');
function closeMenu(){menu.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Abrir menu');}
toggle.addEventListener('click',()=>{const open=menu.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape' && menu.classList.contains('open')){closeMenu();toggle.focus();}});
document.querySelector('#year').textContent=new Date().getFullYear();

// A flowing surface of connected points, rendered without a video download.
(() => {
  const canvas = document.querySelector('#connectivity');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, time = 0, lastFrame = 0, frame = 0;
  let paused = reduced.matches, visible = true;
  function point(u, v, t) {
    const depth = .24 + v * .76;
    const wave = Math.sin(u * 7.1 + v * 3.8 - t * .48) * .145
      + Math.cos(u * 4.8 - v * 4.5 + t * .24) * .073;
    return {
      x: width * (-.14 + u * 1.5 + (v - .5) * .11),
      y: height * (.29 + v * .48 + wave + Math.cos(u * 3.6) * .035),
      radius: (.45 + depth * 1.2) * (width < 700 ? .77 : 1),
      alpha: .2 + depth * .7
    };
  }
  function draw() {
    context.clearRect(0, 0, width, height);
    const cols = width < 700 ? 64 : 112, rows = width < 700 ? 34 : 48;
    for (let row = 0; row < rows; row++) {
      const v = row / (rows - 1);
      // Fine threads between the particles create the sense of a connected network.
      if (row % 3 === 0) {
        context.beginPath();
        for (let col = 0; col < cols; col++) {
          const p = point(col / (cols - 1), v, time);
          if (col === 0) context.moveTo(p.x, p.y); else context.lineTo(p.x, p.y);
        }
        context.lineWidth = .55;
        context.strokeStyle = `rgba(12,137,231,${.035 + v * .09})`;
        context.stroke();
      }
      for (let col = 0; col < cols; col++) {
        const u = col / (cols - 1), p = point(u, v, time);
        const shine = (Math.sin(u * 9 + v * 6 - time * .55) + 1) / 2;
        context.beginPath();
        context.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(${22 + Math.floor(shine * 35)},${108 + Math.floor(shine * 95)},255,${p.alpha})`;
        context.fill();
        if (row % 8 === 0 && col % 13 === 0) {
          const glow = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, 13);
          glow.addColorStop(0, `rgba(78,190,255,${.32 * shine})`);
          glow.addColorStop(1, 'rgba(20,130,255,0)');
          context.fillStyle = glow; context.fillRect(p.x - 13, p.y - 13, 26, 26);
        }
      }
    }
    // Sparse changing values anchored to the wave, with staggered fade cycles.
    const slots = [[.53,.18],[.66,.36],[.77,.16],[.57,.65],[.73,.76]];
    const format = new Intl.NumberFormat('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
    context.save();
    context.textAlign = 'right';
    context.textBaseline = 'middle';
    for (let i = 0; i < (width < 700 ? 3 : slots.length); i++) {
      const step = Math.floor(time / 1.1), progress = (time / 1.1) % 1;
      const eased = Math.min(1, progress * 2.4);
      const smooth = eased * eased * (3 - 2 * eased);
      const valueAt = n => 140 + i * 287.31 + Math.sin(n * 1.71 + i * 2.2) * (14 + i * 3);
      const from = valueAt(step), to = valueAt(step + 1);
      const value = from + (to - from) * smooth;
      const anchor = point(slots[i][0], slots[i][1], time);
      const x = anchor.x, y = anchor.y - 12;
      const phase = (time + i * 1.8 + 1.2) % 9;
      const fadeIn = Math.min(1, phase / 1.1);
      const fadeOut = Math.max(0, Math.min(1, (6.8 - phase) / 1.3));
      const opacity = fadeIn * fadeOut;
      if (opacity <= 0) continue;
      context.font = `${width < 700 ? 14 : 19 + i % 3 * 4}px ui-monospace, monospace`;
      context.fillStyle = to >= from ? `rgba(116,213,255,${.46 * opacity})` : `rgba(66,158,229,${.38 * opacity})`;
      context.fillText(format.format(value), x, y);
      context.font = '11px ui-monospace, monospace';
      context.fillText(to >= from ? '↑' : '↓', x + 16, y);
    }
    context.restore();
  }
  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width; height = bounds.height;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.7);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }
  function animate(stamp) {
    frame = 0;
    if (paused || !visible || document.hidden) return;
    if (stamp - lastFrame > 32) {
      time += Math.min((stamp - lastFrame) / 1000 || .033, .05);
      lastFrame = stamp;
      draw();
    }
    frame = requestAnimationFrame(animate);
  }
  function schedule() {
    cancelAnimationFrame(frame); frame = 0; lastFrame = performance.now();
    if (!paused && visible && !document.hidden) frame = requestAnimationFrame(animate);
  }
  reduced.addEventListener('change', () => { paused = reduced.matches; schedule(); });
  document.addEventListener('visibilitychange', schedule);
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }).observe(canvas);
  resize(); schedule();
})();

// Native touch scrolling, mouse dragging and keyboard navigation for partner cards.
(() => {
  const gallery=document.querySelector('#partner-gallery');
  const previous=document.querySelector('.partners-prev');
  const next=document.querySelector('.partners-next');
  if(!gallery||!previous||!next)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const distance=()=>gallery.querySelector('.partner-card').getBoundingClientRect().width+parseFloat(getComputedStyle(gallery).gap);
  const move=direction=>gallery.scrollBy({left:distance()*direction,behavior:reduced.matches?'instant':'smooth'});
  const update=()=>{previous.disabled=gallery.scrollLeft<=2;next.disabled=gallery.scrollLeft+gallery.clientWidth>=gallery.scrollWidth-2;};
  previous.addEventListener('click',()=>move(-1));
  next.addEventListener('click',()=>move(1));
  gallery.addEventListener('scroll',update,{passive:true});
  gallery.addEventListener('keydown',event=>{
    if(event.target!==gallery)return;
    if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}
  });
  let drag=null;
  gallery.addEventListener('pointerdown',event=>{
    if(event.pointerType!=='mouse'||event.button!==0||event.target.closest('a,button'))return;
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:gallery.scrollLeft,active:false};
  });
  gallery.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.id)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(!drag.active){
      if(Math.abs(dy)>8&&Math.abs(dy)>Math.abs(dx)){drag=null;return;}
      if(Math.abs(dx)<8)return;
      drag.active=true;gallery.setPointerCapture(event.pointerId);gallery.classList.add('is-dragging');
    }
    event.preventDefault();gallery.scrollLeft=drag.left-dx;
  });
  const end=()=>{if(drag&&gallery.hasPointerCapture(drag.id))gallery.releasePointerCapture(drag.id);drag=null;gallery.classList.remove('is-dragging');};
  gallery.addEventListener('pointerup',end);
  gallery.addEventListener('pointercancel',end);
  gallery.addEventListener('lostpointercapture',end);
  gallery.addEventListener('pointerleave',()=>{if(drag&&!drag.active)drag=null;});
  new ResizeObserver(update).observe(gallery);update();
})();

// Photo service navigation, with keyboard-accessible native disclosure panels.
(() => {
  const gallery = document.querySelector('.service-gallery');
  const previous = document.querySelector('.services-prev');
  const next = document.querySelector('.services-next');
  if (!gallery || !previous || !next) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const distance = () => gallery.querySelector('.photo-service').getBoundingClientRect().width + parseFloat(getComputedStyle(gallery).gap);
  const update = () => {
    previous.disabled = gallery.scrollLeft <= 2;
    next.disabled = gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 2;
  };
  previous.addEventListener('click', () => gallery.scrollBy({left: -distance(), behavior: reduced.matches ? 'instant' : 'smooth'}));
  next.addEventListener('click', () => gallery.scrollBy({left: distance(), behavior: reduced.matches ? 'instant' : 'smooth'}));
  gallery.addEventListener('scroll', update, {passive:true});
  new ResizeObserver(update).observe(gallery);
  gallery.addEventListener('keydown', event => {
    if (event.target !== gallery) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      gallery.scrollBy({left: distance() * (event.key === 'ArrowRight' ? 1 : -1), behavior: reduced.matches ? 'instant' : 'smooth'});
    }
  });
  gallery.querySelectorAll('[data-service]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const details = document.getElementById(link.dataset.service);
      details.open = true;
      details.querySelector('summary').focus({preventScroll:true});
      details.scrollIntoView({behavior: reduced.matches ? 'instant' : 'smooth', block:'nearest', inline:'nearest'});
    });
  });
  update();
})();

// A lightweight point globe accompanying the orbital partner network.
(() => {
  const section = document.querySelector('.network-orbital');
  const canvas = document.querySelector('#partner-globe');
  if (!section || !canvas) return;
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches, visible = false, frame = 0, last = 0, angle = 0, size = 0;
  const points = Array.from({length:850}, (_,i) => {
    const y = 1 - 2 * (i + .5) / 850;
    const radius = Math.sqrt(1 - y*y);
    const theta = i * Math.PI * (3 - Math.sqrt(5));
    return {x:Math.cos(theta)*radius, y, z:Math.sin(theta)*radius};
  });
  function draw() {
    if (!ctx || !size) return;
    ctx.clearRect(0,0,size,size);
    const c=Math.cos(angle), s=Math.sin(angle), r=size*.465;
    const rotated=points.map(p=>({x:p.x*c+p.z*s,y:p.y,z:p.z*c-p.x*s})).sort((a,b)=>a.z-b.z);
    for(const p of rotated){
      const depth=(p.z+1)/2;
      ctx.beginPath();
      ctx.arc(size/2+p.x*r,size/2+p.y*r,(.6+depth*.95)*(size/400),0,Math.PI*2);
      ctx.fillStyle=`rgba(42,157,225,${.12+depth*.7})`;
      ctx.fill();
    }
  }
  function tick(t){
    frame=0;
    if(paused||!visible||document.hidden||reduced.matches)return;
    if(t-last>=33){angle+=Math.min(t-last,70)*.00013;last=t;draw();}
    frame=requestAnimationFrame(tick);
  }
  function sync(){
    const stop=paused||!visible||document.hidden||reduced.matches;
    section.classList.toggle('is-paused',stop);
    cancelAnimationFrame(frame);frame=0;last=performance.now();
    if(!stop&&ctx)frame=requestAnimationFrame(tick);
  }
  new ResizeObserver(()=>{
    size=canvas.clientWidth;
    const dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(size*dpr);canvas.height=Math.round(size*dpr);
    if(ctx)ctx.setTransform(dpr,0,0,dpr,0,0);
    draw();
  }).observe(canvas);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0}).observe(section);
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',()=>{paused=reduced.matches;sync();draw();});
  sync();
})();

// Brief labels follow each moving orbit badge without interrupting its animation.
(() => {
  const section=document.querySelector('.network-orbital');
  const stage=section?.querySelector('.orbit-stage');
  const label=document.querySelector('#orbit-label');
  if(!stage||!label)return;
  const badges=[...stage.querySelectorAll('.triade-orbit-badge')];
  let active=null,expiry=0,frame=0,focusTimer=0;
  function hide(){
    clearTimeout(expiry);cancelAnimationFrame(frame);frame=0;
    active?.classList.remove('is-active');active?.removeAttribute('aria-describedby');
    active=null;label.hidden=true;
  }
  function position(){
    if(!active)return;
    const box=active.getBoundingClientRect(),area=stage.getBoundingClientRect();
    if(box.bottom<area.top||box.top>area.bottom||box.right<area.left||box.left>area.right){hide();return;}
    const half=label.offsetWidth/2;
    label.style.left=`${Math.max(half+10,Math.min(area.width-half-10,box.left-area.left+box.width/2))}px`;
    const below=box.bottom-area.top+10;
    const limit=area.height-label.offsetHeight-10;
    const y=below<limit?below:box.top-area.top-label.offsetHeight-10;
    label.style.top=`${Math.max(8,Math.min(limit,y))}px`;
    frame=requestAnimationFrame(position);
  }
  function show(badge){
    hide();active=badge;badge.classList.add('is-active');
    label.textContent=badge.dataset.partner;label.hidden=false;
    badge.setAttribute('aria-describedby','orbit-label');
    position();expiry=setTimeout(hide,2800);
  }
  badges.forEach(badge=>{
    badge.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'||e.pointerType==='pen')show(badge);});
    badge.addEventListener('focus',()=>show(badge));
    badge.addEventListener('click',()=>{
      show(badge);
      const solution=document.getElementById(badge.dataset.solution);
      if(!solution)return;
      solution.focus({preventScroll:true});
      solution.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest',inline:'center'});
    });
    // Leaving the moving badge does not immediately dismiss its short-lived label.
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
  document.addEventListener('pointerdown',e=>{if(active&&!active.contains(e.target))hide();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)hide();});
  function focusTargets(){
    if(document.hidden)return;
    const area=stage.getBoundingClientRect();
    badges.forEach(badge=>{const b=badge.getBoundingClientRect();badge.tabIndex=b.left>=area.left+2&&b.right<=area.right-2&&b.top>=area.top+2&&b.bottom<=area.bottom-2?0:-1;});
  }
  new IntersectionObserver(entries=>{
    clearInterval(focusTimer);
    if(entries[0].isIntersecting){focusTargets();focusTimer=setInterval(focusTargets,250);}
    else{hide();badges.forEach(b=>b.tabIndex=-1);}
  }).observe(stage);
})();
