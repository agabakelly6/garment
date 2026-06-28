(function(){
  const selectors = [
    '.pcard-img-wrap img',
    '.coll-img-wrap img',
    '.related-card img',
    '.about-img-grid img',
    '.pcard img',
    '.hero-img img'
  ];

  function createModal(){
    if(document.getElementById('img-modal-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'img-modal-overlay';
    overlay.className = 'img-modal-overlay';

    overlay.innerHTML = `
      <div class="img-modal" role="dialog" aria-modal="true">
        <div class="img-modal-caption" id="img-modal-caption"></div>
        <div class="img-modal-content">
          <button class="img-modal-close" id="img-modal-close" aria-label="Close">✕</button>
          <img id="img-modal-img" src="" alt="">
        </div>
        <div class="img-modal-actions">
          <div class="img-modal-price" id="img-modal-price"></div>
          <div class="img-size-group" id="img-size-group">
            <button class="img-size-btn" data-size="S">S</button>
            <button class="img-size-btn" data-size="M">M</button>
            <button class="img-size-btn" data-size="L">L</button>
            <button class="img-size-btn" data-size="XL">XL</button>
          </div>
          <button class="img-order-btn" id="img-order-wa">Order on WhatsApp</button>
        </div>
        <div class="img-modal-controls">
          <button id="img-rot-left" title="Rotate left">⟲</button>
          <button id="img-rot-right" title="Rotate right">⟳</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // event bindings
    const closeBtn = document.getElementById('img-modal-close');
    const overlayEl = overlay;
    const imgEl = document.getElementById('img-modal-img');
    const rotLeft = document.getElementById('img-rot-left');
    const rotRight = document.getElementById('img-rot-right');
    const caption = document.getElementById('img-modal-caption');
    const priceEl = document.getElementById('img-modal-price');
    const sizeGroup = document.getElementById('img-size-group');
    const orderBtn = document.getElementById('img-order-wa');

    function close(){
      overlayEl.classList.remove('open');
      imgEl.style.transform = 'rotate(0deg)';
      imgEl.dataset.rotate = 0;
      document.body.style.overflow = '';
    }

    overlayEl.addEventListener('click', (e)=>{
      if(e.target === overlayEl) close();
    });
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', (e)=>{
      if(!overlayEl.classList.contains('open')) return;
      if(e.key === 'Escape') close();
      if(e.key === 'ArrowLeft') rotate(-90);
      if(e.key === 'ArrowRight') rotate(90);
    });

    rotLeft.addEventListener('click', ()=> rotate(-90));
    rotRight.addEventListener('click', ()=> rotate(90));

    function rotate(delta){
      const cur = parseInt(imgEl.dataset.rotate || '0', 10);
      const next = cur + delta;
      imgEl.dataset.rotate = next;
      imgEl.style.transform = `rotate(${next}deg)`;
    }

    // size selection
    let selectedSize = 'M';
    function setActiveSize(btn){
      sizeGroup.querySelectorAll('.img-size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = btn.dataset.size;
    }
    sizeGroup.addEventListener('click', (e)=>{
      const b = e.target.closest('.img-size-btn');
      if(!b) return;
      setActiveSize(b);
    });
    // default active
    const defaultBtn = sizeGroup.querySelector('.img-size-btn[data-size="M"]');
    if(defaultBtn) setActiveSize(defaultBtn);

    // order button opens WhatsApp with prefilled message
    orderBtn.addEventListener('click', ()=>{
      const name = caption.textContent || '';
      const size = selectedSize || 'M';
      const phone = '256702587863';
      const text = `Hi, I want to buy ${name} in size ${size}`;
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    });

    // expose open function
    return {
      open: (src, alt) => {
        imgEl.src = src;
        imgEl.alt = alt || '';
        caption.textContent = alt || '';
        // find product price from nearest card when opening
        const activeCard = document.querySelector(`img[src="${src}"]`)?.closest('.pcard, .coll-card, .related-card') || null;
        let priceText = '';
        if(activeCard){
          const p = activeCard.querySelector('.pprice, .price, .coll-body .pprice');
          if(p) priceText = p.textContent.trim();
        } else {
          // fallback: try to find price near the clicked image via alt match
          const possible = Array.from(document.querySelectorAll('.pprice'))
            .find(pp => pp.previousElementSibling && pp.previousElementSibling.querySelector && pp.previousElementSibling.querySelector('img') && pp.previousElementSibling.querySelector('img').alt === alt);
          if(possible) priceText = possible.textContent.trim();
        }
        priceEl.textContent = priceText;
        imgEl.dataset.rotate = 0;
        imgEl.style.transform = 'rotate(0deg)';
        overlayEl.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    };
  }

  const modal = createModal();

  function attach(){
    const imgs = new Set();
    selectors.forEach(sel => document.querySelectorAll(sel).forEach(i=> imgs.add(i)));
    imgs.forEach(img => {
      if(img.dataset.modalAttached) return;
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', (e)=>{
        // try to use a higher-resolution source if present
        const hi = img.dataset.highres || img.dataset.src || img.src;
        const alt = img.alt || (img.closest('.pcard-body') && img.closest('.pcard-body').querySelector('h3')?.textContent) || '';
        modal.open(hi, alt);
      });
      img.dataset.modalAttached = '1';
    });
  }

  // attach on DOM ready and when new content appears
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();

  // observe DOM for dynamic changes (optional)
  const obs = new MutationObserver((muts)=>{
    attach();
  });
  obs.observe(document.body, { childList: true, subtree: true });
})();
