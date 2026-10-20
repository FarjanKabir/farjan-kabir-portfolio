/* FARJAN PARADOX — content-driven portfolio
   Future updates should normally happen in /content/*.json and /assets/*.
   No HTML/CSS/JS editing is required for normal project/blog/video additions.
*/
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mobile navigation */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('is-open');
      navToggle.classList.toggle('is-active', open);
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      navMenu.classList.remove('is-open'); navToggle.classList.remove('is-active'); navToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  /* Header + active nav */
  const header = document.getElementById('siteHeader');
  const sections = [...document.querySelectorAll('section[id]')];
  const navLinks = [...document.querySelectorAll('.nav-link[href^="#"]')];
  const updateScrollUI = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 30);
    let current = 'home'; const marker = window.scrollY + 160;
    sections.forEach(section => { if (marker >= section.offsetTop) current = section.id; });
    navLinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${current}`));
  };
  window.addEventListener('scroll', updateScrollUI, { passive: true }); updateScrollUI();

  /* Hero slider — each slide uses a different derived banner/crop, so the portrait does not repeat identically. */
  const heroSlider = document.getElementById('heroSlider');
  const slides = heroSlider ? [...heroSlider.querySelectorAll('.hero-slide')] : [];
  const dotsContainer = document.getElementById('heroDots'); const prevBtn = document.getElementById('heroPrev'); const nextBtn = document.getElementById('heroNext');
  let currentSlide = 0, timer = null; const duration = 6500, dots = [];
  const goToSlide = index => { if (!slides.length) return; slides[currentSlide].classList.remove('is-active'); dots[currentSlide]?.classList.remove('is-active'); currentSlide = (index + slides.length) % slides.length; slides[currentSlide].classList.add('is-active'); dots[currentSlide]?.classList.add('is-active'); };
  const nextSlide = () => goToSlide(currentSlide + 1); const prevSlide = () => goToSlide(currentSlide - 1);
  const stopHero = () => { if (timer) clearInterval(timer); timer = null; }; const startHero = () => { if (reduceMotion || slides.length < 2 || timer) return; timer = setInterval(nextSlide, duration); }; const restartHero = () => { stopHero(); startHero(); };
  if (dotsContainer && slides.length) slides.forEach((_, i) => { const dot = document.createElement('button'); dot.type = 'button'; dot.className = `hero-dot${i === 0 ? ' is-active' : ''}`; dot.setAttribute('aria-label', `Show hero slide ${i + 1}`); dot.addEventListener('click', () => { goToSlide(i); restartHero(); }); dotsContainer.appendChild(dot); dots.push(dot); });
  if (slides.length) { nextBtn?.addEventListener('click', () => { nextSlide(); restartHero(); }); prevBtn?.addEventListener('click', () => { prevSlide(); restartHero(); }); heroSlider.addEventListener('mouseenter', stopHero); heroSlider.addEventListener('mouseleave', startHero); startHero(); }

  /* Skills marquee: duplicate once for seamless continuous motion. */
  const skillsTrack = document.getElementById('skillsTrack');
  if (skillsTrack && !reduceMotion) skillsTrack.innerHTML += skillsTrack.innerHTML;

  /* Content helpers */
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[ch]));
  const safeUrl = value => { try { const u = new URL(value, window.location.href); if (['http:','https:','mailto:','tel:'].includes(u.protocol)) return u.href; } catch (_) {} return '#'; };
  const assetPath = value => { if (!value) return ''; return value.startsWith('./') || value.startsWith('/') || value.startsWith('http') ? value : `./${value}`; };

 

/* Portfolio */
const portfolioGrid = document.getElementById('portfolioGrid');
const portfolioFilters = document.getElementById('portfolioFilters');
const portfolioEmpty = document.getElementById('portfolioEmpty');
const modal = document.getElementById('caseStudyModal');
const modalContent = document.getElementById('caseStudyContent');
const modalClose = document.getElementById('caseStudyClose');
let projects = [];
let currentProjectIndex = null;

/* ==================== BILINGUAL SYSTEM ==================== */
const FP_LANG = {
  current: localStorage.getItem('fp_lang') || 'en',
  t(val) {
    if (val == null) return '';
    if (typeof val === 'string') return val;
    return val[this.current] ?? val.en ?? val.bn ?? '';
  },
  list(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return val[this.current] || val.en || val.bn || [];
  },
  set(lang) {
    this.current = lang;
    localStorage.setItem('fp_lang', lang);
  }
};
/* ======================================================== */

const mainCat = project => String(project.mainCategory || project.category || '').toLowerCase().trim().replace(/\s+/g, '-');


const categories = project => [...new Set([...(project.categories || []), project.category || ''].filter(Boolean).map(x => String(x).toLowerCase().trim().replace(/\s+/g, '-')))];

const projectCard = (p, index) => {
  const L = FP_LANG;
  const cats = categories(p);
  const image = assetPath(p.image || 'assets/hero-banners/hero-01-home.webp');
  return `<article class="portfolio-card project-card" data-project-index="${index}" data-category="${esc(cats.join(' '))}" data-main-category="${esc(mainCat(p))}">
    <button class="project-card-button" type="button" aria-label="Open case study: ${esc(L.t(p.title))}">
      <div class="portfolio-media">
        <img src="${esc(image)}" alt="${esc(L.t(p.imageAlt) || L.t(p.title))}" loading="lazy">
        <span class="portfolio-tag">${esc(L.t(p.label) || p.category || 'Project')}</span>
        <span class="portfolio-view"><i class="fa-solid fa-arrow-up-right-from-square"></i></span>
      </div>
      <div class="portfolio-info">
        <h3 class="portfolio-title">${esc(L.t(p.title))}</h3>
        <p class="portfolio-text">${esc(L.t(p.excerpt) || L.t(p.description))}</p>
        <div class="project-meta-row">
          <span>${esc((p.tools || []).slice(0,3).join(' • '))}</span>
          <span>${L.current === 'bn' ? 'বিস্তারিত দেখুন' : 'Case Study'} <i class="fa-solid fa-arrow-right"></i></span>
        </div>
      </div>
    </button>
  </article>`;
};

const filterProjects = filter => {
  portfolioCurrentFilter = filter;
  portfolioVisibleCount = PORTFOLIO_INITIAL;
  applyPortfolioVisibility();
};



/* ==================== PORTFOLIO LOAD MORE ==================== */
const PORTFOLIO_INITIAL = 3;
const PORTFOLIO_STEP = 3;
let portfolioVisibleCount = PORTFOLIO_INITIAL;
let portfolioCurrentFilter = 'all';
let portfolioLoadWrap = null;

if (portfolioGrid && !document.getElementById('portfolioLoadMore')) {
  portfolioLoadWrap = document.createElement('div');
  portfolioLoadWrap.className = 'portfolio-load-wrap';
  portfolioLoadWrap.hidden = true;
  portfolioLoadWrap.innerHTML = '<button id="portfolioLoadMore" class="btn btn-ghost" type="button"><span>Load More</span> <i class="fa-solid fa-arrow-down"></i></button>';
  portfolioGrid.parentNode.insertBefore(portfolioLoadWrap, portfolioGrid.nextSibling);
  document.getElementById('portfolioLoadMore').addEventListener('click', () => {
    portfolioVisibleCount += PORTFOLIO_STEP;
    applyPortfolioVisibility();
  });
}

const applyPortfolioVisibility = () => {
  if (!portfolioGrid) return;
  const cards = [...portfolioGrid.querySelectorAll('.project-card')];
  const matching = cards.filter(c => portfolioCurrentFilter === 'all' || c.dataset.mainCategory === portfolioCurrentFilter);

  cards.forEach(card => card.classList.add('is-hidden'));
  matching.slice(0, portfolioVisibleCount).forEach(card => card.classList.remove('is-hidden'));

  const remaining = matching.length - portfolioVisibleCount;
  if (portfolioLoadWrap) {
    portfolioLoadWrap.hidden = remaining <= 0;
    const btn = document.getElementById('portfolioLoadMore');
    if (btn && remaining > 0) {
      btn.innerHTML = `<span>Load More (${remaining})</span> <i class="fa-solid fa-arrow-down"></i>`;
    }
  }
};
/* ============================================================== */








const renderFilters = () => {
  if (!portfolioFilters) return;
  const set = new Set(['all']);
  projects.forEach(p => {
    const c = mainCat(p);
    if (c) set.add(c);
  });
  portfolioFilters.innerHTML = [...set].map((c,i) =>
    `<button class="filter-btn${i===0?' is-active':''}" data-filter="${esc(c)}">${esc(c==='all'?'All':c.replace(/-/g,' ').replace(/\b\w/g,m=>m.toUpperCase()))}</button>`
  ).join('');
  portfolioFilters.querySelectorAll('.filter-btn').forEach(btn => btn.addEventListener('click', () => {
    portfolioFilters.querySelectorAll('.filter-btn').forEach(b=>b.classList.toggle('is-active', b===btn));
    filterProjects(btn.dataset.filter);
  }));
};

const renderProjects = () => {
  if (!portfolioGrid) return;
  portfolioGrid.innerHTML = projects.map(projectCard).join('');
  portfolioEmpty.hidden = projects.length > 0;
  renderFilters();
  portfolioGrid.querySelectorAll('.project-card-button').forEach(btn =>
    btn.addEventListener('click', () => openCaseStudy(Number(btn.closest('.project-card').dataset.projectIndex)))
  );
  portfolioCurrentFilter = 'all';
  portfolioVisibleCount = PORTFOLIO_INITIAL;
  applyPortfolioVisibility();
  if (!reduceMotion) revealElements(portfolioGrid.querySelectorAll('.project-card'));
};

const mediaMarkup = p => {
  const L = FP_LANG;
  const screenshots = p.screenshots || [];
  const images = screenshots.map((s, i) => {
    const cap = s.caption ? `<figcaption>${esc(L.t(s.caption))}</figcaption>` : '';
    return `<figure class="case-shot"><img src="${esc(assetPath(s.src || s))}" alt="${esc(L.t(s.alt) || `${L.t(p.title)} screenshot ${i+1}`)}" loading="lazy">${cap}</figure>`;
  }).join('');
  const beforeAfter = p.beforeAfter?.before && p.beforeAfter?.after
    ? `<div class="before-after">
        <div><span>Before</span><img src="${esc(assetPath(p.beforeAfter.before))}" alt="Before" loading="lazy"></div>
        <div><span>After</span><img src="${esc(assetPath(p.beforeAfter.after))}" alt="After" loading="lazy"></div>
      </div>` : '';
  const video = p.video
    ? `<div class="case-video"><video controls playsinline preload="metadata"${p.videoPoster ? ` poster="${esc(assetPath(p.videoPoster))}"` : ''}><source src="${esc(assetPath(p.video))}" type="video/mp4"></video></div>` : '';
  return `${video}${beforeAfter}${images ? `<div class="case-gallery">${images}</div>` : ''}`;
};

const listMarkup = (title, items) => {
  const list = FP_LANG.list(items);
  return list?.length
    ? `<div class="case-block"><h3>${esc(title)}</h3><ul>${list.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`
    : '';
};

const renderCaseStudy = () => {
  const p = projects[currentProjectIndex];
  if (!p || !modal || !modalContent) return;
  const L = FP_LANG;
  const isBn = L.current === 'bn';
  const cats = categories(p).map(c=>c.replace(/-/g,' ')).join(' • ');

  modalContent.innerHTML = `
    <div class="case-lang-switch">
      <button class="lang-btn ${!isBn ? 'is-active' : ''}" data-lang="en"><i class="fa-solid fa-globe"></i> English</button>
      <button class="lang-btn ${isBn ? 'is-active' : ''}" data-lang="bn"><i class="fa-solid fa-globe"></i> বাংলা</button>
    </div>
    <div class="case-hero">
      <span class="section-eyebrow">${esc(cats || 'Case Study')}</span>
      <h2 id="caseStudyTitle">${esc(L.t(p.title))}</h2>
      <p>${esc(L.t(p.description) || L.t(p.excerpt))}</p>
      ${p.liveUrl ? `<a class="btn btn-primary" href="${esc(safeUrl(p.liveUrl))}" target="_blank" rel="noopener noreferrer">${isBn?'লাইভ প্রজেক্ট দেখুন':'Visit Live Project'} <i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ''}
    </div>
    <div class="case-content">
      <div class="case-overview-grid">
        <div><span>${isBn?'ভূমিকা':'Role'}</span><strong>${esc(L.t(p.role) || (isBn?'ডেভেলপমেন্ট ও ডিজিটাল কাজ':'Development & Digital Work'))}</strong></div>
        <div><span>${isBn?'টুলস':'Tools'}</span><strong>${esc((p.tools || []).join(' • ') || '—')}</strong></div>
        <div><span>${isBn?'ক্যাটাগরি':'Category'}</span><strong>${esc(cats || '—')}</strong></div>
      </div>
      <div class="case-copy">
        <div class="case-block"><h3>${isBn?'চ্যালেঞ্জ':'The Challenge'}</h3><p>${esc(L.t(p.challenge) || '—')}</p></div>
        <div class="case-block"><h3>${isBn?'আমার পদক্ষেপ':'My Approach'}</h3><p>${esc(L.t(p.approach) || '—')}</p></div>
        ${listMarkup(isBn?'আমি যা করেছি':'What I Did', p.whatIDid)}
        ${listMarkup(isBn?'প্রসেস':'Process', p.process)}
        <div class="case-block"><h3>${isBn?'ফলাফল':'Result'}</h3><p>${esc(L.t(p.result) || '—')}</p></div>
      </div>
      ${mediaMarkup(p)}
    </div>`;

  modalContent.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      FP_LANG.set(btn.dataset.lang);
      renderCaseStudy();
    });
  });
};

const openCaseStudy = index => {
  if (index == null || !projects[index]) return;
  currentProjectIndex = index;
  renderCaseStudy();
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
  modalClose?.focus();
};

const closeCaseStudy = () => {
  modal?.classList.remove('is-open');
  modal?.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
};

modalClose?.addEventListener('click', closeCaseStudy);
modal?.querySelector('[data-close-case-study]')?.addEventListener('click', closeCaseStudy);
document.addEventListener('keydown', e => { if (e.key==='Escape') closeCaseStudy(); });

fetch('./content/projects.json', { cache: 'no-store' })
  .then(r => r.ok ? r.json() : Promise.reject())
  .then(data => { projects = Array.isArray(data) ? data : (data.projects || []); renderProjects(); })
  .catch(() => { projects = []; renderProjects(); });








  /* Blog preview */
    const renderBlogPreview = posts => {
    if (!blogPreviewGrid) return;
    const L = FP_LANG;
    const isBn = L.current === 'bn';
    const list = posts.slice(0,3);
    blogPreviewGrid.innerHTML = list.length ? list.map(p => `<article class="blog-preview-card"><a href="./blog-post.html?slug=${encodeURIComponent(p.slug)}"><div class="blog-preview-media"><img src="${esc(assetPath(p.image || 'assets/hero-banners/hero-03-seo.webp'))}" alt="${esc(L.t(p.imageAlt) || L.t(p.title))}" loading="lazy"></div><div class="blog-preview-body"><span>${esc(p.category || 'Article')} · ${esc(p.date || '')}</span><h3>${esc(L.t(p.title))}</h3><p>${esc(L.t(p.excerpt) || '')}</p><strong>${isBn ? 'আর্টিকেল পড়ুন' : 'Read article'} <i class="fa-solid fa-arrow-right"></i></strong></div></a></article>`).join('') : `<div class="empty-state compact"><div class="empty-state-icon"><i class="fa-solid fa-pen-nib"></i></div><h3>The blog is ready for your first article.</h3><p>Add a post to <code>content/blog.json</code>; the home page preview and blog page will update automatically.</p></div>`;
  };




  
  fetch('./content/blog.json',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(data=>renderBlogPreview(Array.isArray(data)?data:(data.posts||[]))).catch(()=>renderBlogPreview([]));

  /* Auto video sections: upload the expected filename and the section becomes visible. */
  const autoVideo = (sectionId, videoId) => {
    const section=document.getElementById(sectionId), video=document.getElementById(videoId); if(!section||!video)return;
    const source=video.querySelector('source'); const show=()=>{section.hidden=false;}; const hide=()=>{section.hidden=true;};
    video.addEventListener('loadedmetadata',show,{once:true}); video.addEventListener('error',hide,{once:true});
    if(source) { const probe=new Image(); probe.onerror=()=>{}; }
    video.load();
  };
  autoVideo('introVideoSection','introVideo'); autoVideo('featuredVideoSection','featuredVideo');

  /* Scroll reveal */
  function revealElements(elements) {
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    [...elements].forEach(el => { if (el.dataset.revealBound) return; el.dataset.revealBound='1'; el.style.opacity='0'; el.style.transform='translateY(24px)'; el.style.transition='opacity .7s ease, transform .7s ease'; });
    const observer=new IntersectionObserver((entries,obs)=>entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.style.opacity='1';entry.target.style.transform='translateY(0)';obs.unobserve(entry.target);}),{threshold:.12});
    [...elements].forEach(el=>observer.observe(el));
  }
  revealElements(document.querySelectorAll('[data-reveal], .service-card, .brand-copy'));

  /* Contact form — Netlify Forms */
   if(contactForm&&formStatus) contactForm.addEventListener('submit',async e=>{
    e.preventDefault();
    formStatus.textContent='Sending your message…';
    try{
      const formData = new FormData(contactForm);
      const encoded = new URLSearchParams();
      for (const [key, value] of formData.entries()) {
        encoded.append(key, value);
      }
      console.log('📤 Submitting form data:', Object.fromEntries(formData.entries()));

      const response = await fetch('/',{
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body: encoded.toString()
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response URL:', response.url);

      if(!response.ok){
        const text = await response.text();
        console.error('❌ Response error:', response.status, text);
        throw new Error(`HTTP ${response.status}`);
      }
      formStatus.textContent='Thanks — your message has been sent.';
      contactForm.reset();
    }catch(err){
      console.error('🚨 FORM ERROR:', err);
      formStatus.textContent='Error: ' + err.message;
    }
  });
  const year=document.getElementById('currentYear'); if(year)year.textContent=new Date().getFullYear();
});
