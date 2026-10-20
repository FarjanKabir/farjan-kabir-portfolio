document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('blogGrid');
  const empty = document.getElementById('blogEmpty');
  const cats = document.getElementById('blogCategories');

  const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[c]));
  const asset = v => v ? (v.startsWith('./') || v.startsWith('/') || v.startsWith('http') ? v : `./${v}`) : './assets/hero-banners/hero-03-seo.webp';

  const FP_LANG = {
    current: localStorage.getItem('fp_lang') || 'en',
    t(val) {
      if (val == null) return '';
      if (typeof val === 'string') return val;
      return val[this.current] ?? val.en ?? val.bn ?? '';
    }
  };

  fetch('./content/blog.json', { cache: 'no-store' })
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => {
      const posts = Array.isArray(data) ? data : (data.posts || []);
      if (!posts.length) { empty.hidden = false; return; }
      empty.hidden = true;

      const categories = ['all', ...new Set(posts.map(p => p.category).filter(Boolean))];
      cats.innerHTML = categories.map((c, i) => `<button class="filter-btn${i === 0 ? ' is-active' : ''}" data-cat="${esc(c)}">${esc(c === 'all' ? 'All' : c)}</button>`).join('');

      const render = cat => {
        const L = FP_LANG;
        const isBn = L.current === 'bn';
        const list = posts.filter(p => cat === 'all' || p.category === cat);
        grid.innerHTML = list.map(p => `<article class="blog-card"><a href="./blog-post.html?slug=${encodeURIComponent(p.slug)}"><div class="blog-card-media"><img src="${esc(asset(p.image))}" alt="${esc(L.t(p.imageAlt) || L.t(p.title))}" loading="lazy"></div><div class="blog-card-body"><span class="blog-card-meta">${esc(p.category || 'Article')} · ${esc(p.date || '')}</span><h2>${esc(L.t(p.title))}</h2><p>${esc(L.t(p.excerpt) || '')}</p><strong>${isBn ? 'আর্টিকেল পড়ুন' : 'Read article'} <i class="fa-solid fa-arrow-right"></i></strong></div></a></article>`).join('');
      };

      cats.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
        cats.querySelectorAll('button').forEach(x => x.classList.toggle('is-active', x === b));
        render(b.dataset.cat);
      }));
      render('all');
    })
    .catch(() => { empty.hidden = false; });
});