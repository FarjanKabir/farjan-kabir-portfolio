document.addEventListener('DOMContentLoaded', () => {
  const cvContent = document.getElementById('cvContent');
  const langBtns = document.querySelectorAll('.lang-btn');

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
      updateLangUI();
      renderCV(); // ভাষা পরিবর্তন হলে CV আবার রেন্ডার হবে
    }
  };

  const updateLangUI = () => {
    langBtns.forEach(btn => btn.classList.toggle('is-active', btn.dataset.lang === FP_LANG.current));
  };

  let cvData = null;

  const renderCV = () => {
    if (!cvData) return;
    const L = FP_LANG;
    const isBn = L.current === 'bn';
    const cv = cvData;

    // Experience HTML
    const expHTML = cv.experience.map(exp => `
      <div class="cv-timeline-item">
        <h3>${L.t(exp.role)}</h3>
        <h4>${L.t(exp.company)}</h4>
        <span class="cv-timeline-date">${L.t(exp.date)}</span>
        <ul>
          ${L.list(exp.points).map(p => `<li>${p}</li>`).join('')}
        </ul>
      </div>
    `).join('');

    // Skills HTML
    const skillsHTML = cv.skills.map(skill => `
      <div class="cv-skills-group">
        <h4>${L.t(skill.category)}</h4>
        <div class="cv-skills-list">
          ${skill.items.map(item => `<span class="cv-skill-tag">${item}</span>`).join('')}
        </div>
      </div>
    `).join('');

    // Education HTML
    const eduHTML = cv.education.map(edu => `
      <div class="cv-edu-item">
        <h4>${L.t(edu.degree)}</h4>
        <p>${L.t(edu.institution)}</p>
        <span>${L.t(edu.date)}</span>
      </div>
    `).join('');

    // Projects HTML
    const projHTML = cv.projects.map(proj => `
      <div class="cv-project-item">
        <h4>${proj.title}</h4>
        <p>${proj.tech}</p>
      </div>
    `).join('');

       // References HTML (ছবিসহ)
    const refHTML = (cv.references || []).map(ref => `
      <div class="cv-ref-item">
        ${ref.image ? `<div class="cv-ref-img-wrap"><img src="${ref.image}" alt="${ref.name}"></div>` : ''}
        <div class="cv-ref-info">
          <h4>${ref.name}</h4>
          <p>${L.t(ref.title)}</p>
          <span>${L.t(ref.org)}</span>
        </div>
      </div>
    `).join('');

    cvContent.innerHTML = `
      <div class="cv-header">
        <img src="${cv.photo}" alt="${L.t(cv.name)}" class="cv-photo">
        <div class="cv-title-area">
          <h1>${L.t(cv.name)}</h1>
          <h2>${L.t(cv.title)}</h2>
          <p style="color:#8b949e; font-size:0.9rem; margin-bottom:10px;">${L.t(cv.company)}</p>
          <div class="cv-contact-info">
            <span><i class="fa-solid fa-envelope"></i> ${cv.contact.email}</span>
            <span><i class="fa-solid fa-phone"></i> ${cv.contact.phone}</span>
            <span><i class="fa-solid fa-location-dot"></i> ${L.t(cv.contact.location)}</span>
          </div>
        </div>
      </div>

      <!-- Professional Summary -->
      <div class="cv-section">
        <h3 class="cv-section-title"><i class="fa-solid fa-user-tie"></i> ${isBn ? 'পেশাগত সারসংক্ষেপ' : 'Professional Summary'}</h3>
        <p style="color: #c9d1d9; font-size: 0.95rem; line-height: 1.6;">${L.t(cv.summary)}</p>
      </div>

      <!-- Experience -->
      <div class="cv-section">
        <h3 class="cv-section-title"><i class="fa-solid fa-briefcase"></i> ${isBn ? 'অভিজ্ঞতা' : 'Experience'}</h3>
        <div class="cv-timeline">
          ${expHTML}
        </div>
      </div>

      <!-- Two Column Layout: Skills & Education -->
      <div class="cv-grid-2">
        <div class="cv-section">
          <h3 class="cv-section-title"><i class="fa-solid fa-code"></i> ${isBn ? 'দক্ষতা' : 'Core Skills'}</h3>
          ${skillsHTML}
        </div>
        <div class="cv-section">
          <h3 class="cv-section-title"><i class="fa-solid fa-graduation-cap"></i> ${isBn ? 'শিক্ষা' : 'Education'}</h3>
          ${eduHTML}
        </div>
      </div>

      <!-- Featured Projects -->
      <div class="cv-section">
        <h3 class="cv-section-title"><i class="fa-solid fa-folder-open"></i> ${isBn ? 'সাম্প্রতিক প্রজেক্ট' : 'Recent Projects'}</h3>
        <div class="cv-grid-2">
          ${projHTML}
        </div>
      </div>

      <!-- References -->
      <div class="cv-section">
        <h3 class="cv-section-title"><i class="fa-solid fa-handshake"></i> ${isBn ? 'রেফারেন্স' : 'References'}</h3>
        <div class="cv-grid-2">
          ${refHTML}
        </div>
      </div>
    `;
  };

  // Fetch & Initial Render
  fetch('./content/cv.json', { cache: 'no-store' })
    .then(res => res.json())
    .then(data => {
      cvData = data.cv;
      updateLangUI();
      renderCV();
    })
    .catch(err => console.error("CV Data Load Error:", err));

  // Language Switch Logic
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      FP_LANG.set(btn.dataset.lang);
    });
  });

  // Share Button
  document.getElementById('cvShareBtn').addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Farjan Kabir - CV',
          text: 'Check out the professional CV of Farjan Kabir.',
          url: window.location.href,
        });
      } catch (err) { console.log('Share failed', err); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('CV Link Copied to Clipboard!');
    }
  });
});