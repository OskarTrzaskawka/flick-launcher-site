(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  try { if(location.protocol !== 'file:' && localStorage.getItem('flick-site-motion') === 'paused') root.classList.add('motion-paused'); } catch {}
  const layers = new Map(), cooldown = new WeakMap();
  const enabled = () => !document.hidden && !reduced.matches && !root.classList.contains('no-motion') && !root.classList.contains('motion-paused');
  function remove(layer) { clearTimeout(layers.get(layer)); layers.delete(layer); layer.remove(); }
  function clear() { for (const layer of [...layers.keys()]) remove(layer); }
  function burst(button) {
    if (!enabled() || button.disabled || layers.size >= 6 || performance.now() - (cooldown.get(button) || -1000) < 500) return;
    cooldown.set(button, performance.now()); button.classList.add('has-bubbles');
    const layer = document.createElement('span'); layer.className = 'button-bubbles'; layer.setAttribute('aria-hidden','true');
    for (let i=0; i<7; i++) {
      const bubble = document.createElement('span');
      bubble.style.setProperty('--bubble-x', (8 + i*13) + '%');
      bubble.style.setProperty('--bubble-size', (5 + i%3*3) + 'px');
      bubble.style.setProperty('--bubble-drift', ((i%2 ? 1 : -1)*(7+i*2)) + 'px');
      bubble.style.setProperty('--bubble-delay', (i%3*55) + 'ms'); layer.append(bubble);
    }
    button.append(layer); layers.set(layer,setTimeout(()=>remove(layer),1100));
  }
  const find = target => target.closest?.('.button.primary,.button.secondary,.button.outline,.nav-cta,.gallery-tabs button');
  document.addEventListener('pointerover',event=>{const b=find(event.target);if(b&&!b.contains(event.relatedTarget))burst(b);});
  document.addEventListener('pointerdown',event=>{const b=find(event.target);if(b)burst(b);});
  document.addEventListener('focusin',event=>{const b=find(event.target);if(b)burst(b);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
  reduced.addEventListener('change',clear);
  document.addEventListener('animationend',event=>{if(event.animationName==='flick-reveal')event.target.classList.remove('reveal-arrived');});
  new MutationObserver(()=>{if(!enabled())clear();}).observe(root,{attributes:true,attributeFilter:['class']});
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries=>{
      for(const entry of entries)if(entry.isIntersecting){
        observer.unobserve(entry.target);if(enabled())entry.target.classList.add('reveal-arrived');
      }
    },{threshold:0.08});
    document.querySelectorAll('.hero-visual,.benefit-grid article,.section-heading,.download-grid article,.release-list li,.version-entry,.project-banner').forEach(el=>observer.observe(el));
  }
})();
