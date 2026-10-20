/* FARJAN PARADOX — blog-post.js
   Bilingual single article renderer with H2/H3, lists, images, links, share, author bio.
*/
document.addEventListener('DOMContentLoaded', () => {

  const root = document.getElementById('articleRoot');
  const q = new URLSearchParams(location.search);
  const slug = q.get('slug');

  const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[c]));
  const asset = v => v ? (v.startsWith('./') || v.startsWith('/') || v.startsWith('http') ? v : `./${v}`) : '';

  /* Bilingual resolver — shares the same key with project modal */
  const FP_LANG = {
    current: localStorage.getItem('fp_lang') || 'en',
    t(val) {
      if (val == null) return '';
      if (typeof val === 'string') return val;
      return val[this.current] ?? val.en ?? val.bn ?? '';
    },
    set(lang) {
      this.current = lang;
      localStorage.setItem('fp_lang', lang);
    }
  };

  /* Inline formatting */
  const inline = v => {
    const withMedia = String(v ?? '')
      .replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        (_, alt, src) => `<img src="${asset(src)}" alt="${esc(alt)}" loading="lazy" class="article-inline-img">`
      )
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        (_, txt, href) => `<a href="${esc(asset(href))}" class="article-link">${esc(txt)}</a>`
      );
    return withMedia
      .split(/(<img[^>]*>|<a [^>]*>.*?<\/a>)/g)
      .map(part => (part.startsWith('<img') || part.startsWith('<a ')) ? part : esc(part)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.+?)`/g, '<code>$1</code>'))
      .join('');
  };

  /* Block formatting */
  const block = v => {
    const s = String(v ?? '').trim();
    if (!s) return '';
    if (/^###\s/.test(s)) return `<h3>${esc(s.replace(/^###\s/, ''))}</h3>`;
    if (/^##\s/.test(s))  return `<h2>${esc(s.replace(/^##\s/, ''))}</h2>`;
    if (/^-\s/.test(s)) {
      const items = s.split(/\n-\s/).map(item => item.replace(/^-\s/, '').trim()).filter(Boolean);
      return `<ul>${items.map(i => `<li>${inline(i)}</li>`).join('')}</ul>`;
    }
    return `<p>${inline(s)}</p>`;
  };

  fetch('./content/blog.json', { cache: 'no-store' })
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => {
      const posts = Array.isArray(data) ? data : (data.posts || []);
      const p = posts.find(x => x.slug === slug);
      if (!p) throw new Error();

      const render = () => {
        const L = FP_LANG;
        const isBn = L.current === 'bn';

        document.title = `${L.t(p.title)} | Farjan Kabir`;
        document.getElementById('metaDescription').content = L.t(p.excerpt) || '';

        let canonical = document.querySelector('link[rel=canonical]');
        if (!canonical) {
          canonical = document.createElement('link');
          canonical.rel = 'canonical';
          document.head.appendChild(canonical);
        }
        canonical.href = new URL(`./blog-post.html?slug=${encodeURIComponent(p.slug)}`, location.href).href;

        /* ★ KEY FIX: L.t() applied to each content block */
        const paragraphs = Array.isArray(p.content)
          ? p.content.map(x => block(L.t(x))).join('')
          : String(p.content || '').split(/\n\n+/).filter(Boolean).map(x => block(L.t(x))).join('');

        const shareUrl = encodeURIComponent(location.href);
        const shareTitle = encodeURIComponent(L.t(p.title));

        const labels = {
          share: isBn ? 'আর্টিকেল শেয়ার করুন' : 'Share this article',
          writtenBy: isBn ? 'লিখেছেন' : 'Written by',
          bio: isBn
            ? 'ওয়ার্ডপ্রেস ডেভেলপার, SEO স্পেশালিস্ট এবং <strong>Farjan Paradox</strong> এর প্রতিষ্ঠাতা। আমি ওয়েব ডেভেলপমেন্ট, SEO এবং ডিজিটাল ক্রিয়েটিভিটি নিয়ে লিখি — যাতে বিগিনাররা আরও ভালো ওয়েবসাইট তৈরি করতে পারে।'
            : 'WordPress Developer, SEO Specialist and the creator behind <strong>Farjan Paradox</strong>. I write about web development, SEO and digital creativity to help beginners build better websites.',
          portfolio: isBn ? 'সম্পূর্ণ পোর্টফোলিও দেখুন' : 'View full portfolio',
          ctaTitle: isBn ? 'আর্টিকেলটি ভালো লেগেছে?' : 'Enjoyed this article?',
          ctaText: isBn
            ? 'ব্লগে আরও গাইড ও টিউটোরিয়াল দেখুন — অথবা আপনার প্রজেক্ট নিয়ে কথা বলি।'
            : "Explore more guides and tutorials on the blog — or let's talk about your project.",
          moreArticles: isBn ? 'আরও আর্টিকেল' : 'More Articles',
          workWithMe: isBn ? 'আমার সাথে কাজ করুন' : 'Work With Me'
        };

        root.innerHTML = `
          <div class="case-lang-switch">
            <button class="lang-btn ${!isBn ? 'is-active' : ''}" data-lang="en"><i class="fa-solid fa-globe"></i> English</button>
            <button class="lang-btn ${isBn ? 'is-active' : ''}" data-lang="bn"><i class="fa-solid fa-globe"></i> বাংলা</button>
          </div>
          <header class="article-header">
            <span class="section-eyebrow">${esc(p.category || 'Article')} · ${esc(p.date || '')}</span>
            <h1>${esc(L.t(p.title))}</h1>
            <p class="article-lead">${esc(L.t(p.excerpt) || '')}</p>
          </header>
          ${p.image ? `<figure class="article-cover"><img src="${esc(asset(p.image))}" alt="${esc(L.t(p.imageAlt) || L.t(p.title))}"></figure>` : ''}
          <div class="article-body">${paragraphs}</div>

          <div class="article-footer">
            <div class="article-share">
              <span class="share-label">${labels.share}</span>
              <div class="share-buttons">
                <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
                <a href="https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}" target="_blank" rel="noopener noreferrer" aria-label="X"><i class="fa-brands fa-x-twitter"></i></a>
                <a href="https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
                <a href="https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
                <button class="share-copy" type="button" aria-label="Copy link" id="copyLinkBtn"><i class="fa-solid fa-link"></i></button>
              </div>
            </div>

            <div class="article-author">
              <div class="author-avatar"><img src="./assets/Image5.jpeg" alt="Farjan Kabir"></div>
              <div class="author-info">
                <span class="author-label">${labels.writtenBy}</span>
                <h3>Farjan Kabir</h3>
                <p>${labels.bio}</p>
                <a href="./index.html#about" class="author-link">${labels.portfolio} <i class="fa-solid fa-arrow-right"></i></a>
              </div>
            </div>

            <div class="article-cta">
              <h3>${labels.ctaTitle}</h3>
              <p>${labels.ctaText}</p>
              <div class="article-cta-buttons">
                <a href="./blog.html" class="btn btn-ghost"><i class="fa-solid fa-book-open"></i> ${labels.moreArticles}</a>
                <a href="./index.html#contact" class="btn btn-primary">${labels.workWithMe} <i class="fa-solid fa-arrow-right"></i></a>
              </div>
            </div>
          </div>`;

        root.querySelectorAll('.lang-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            FP_LANG.set(btn.dataset.lang);
            render();
          });
        });

        const copyBtn = document.getElementById('copyLinkBtn');
        if (copyBtn) {
          copyBtn.addEventListener('click', async () => {
            try {
              await navigator.clipboard.writeText(location.href);
              copyBtn.classList.add('is-copied');
              copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
              setTimeout(() => {
                copyBtn.classList.remove('is-copied');
                copyBtn.innerHTML = '<i class="fa-solid fa-link"></i>';
              }, 2000);
            } catch (_) {}
          });
        }
      };

      render();
    })
    .catch(() => {
      root.innerHTML = '<div class="empty-state"><h1>Article not found.</h1><p>This article may have been removed or the link is incorrect.</p><a class="btn btn-primary" href="./blog.html">Back to Blog <i class="fa-solid fa-arrow-right"></i></a></div>';
    });
});