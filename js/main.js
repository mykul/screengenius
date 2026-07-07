/* ── Scroll-reveal ─────────────────────────────────────────── */
(function () {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08 }
  );
  document.querySelectorAll('.reveal, .stagger').forEach((el) => observer.observe(el));
})();

/* ── Mobile nav ────────────────────────────────────────────── */
(function () {
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.nav-mobile');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mobileNav.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    })
  );
})();

/* ── Active nav link ───────────────────────────────────────── */
(function () {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

/* ── Demo filter (demos page) ──────────────────────────────── */
function filter(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  const cards = document.querySelectorAll('.demo-card');
  let visible = 0;
  cards.forEach((card) => {
    const show = cat === 'all' || card.dataset.cat === cat;
    card.style.display = show ? 'flex' : 'none';
    if (show) visible++;
  });
  const empty = document.getElementById('empty-state');
  if (empty) empty.style.display = visible === 0 ? 'block' : 'none';
}

/* ── Contact modal ─────────────────────────────────────────── */
(function () {

  /* Web3Forms config — get a free access key at https://web3forms.com
     (registered to daniel@screengeni.us so submissions go there). */
  const WEB3FORMS_ACCESS_KEY = '5ec919e6-d303-4f9e-ac97-03a8a8e1919e';

  /* Inject modal HTML once */
  const MODAL_HTML = `
  <div class="modal-overlay" id="contact-modal" role="dialog" aria-modal="true" aria-labelledby="modal-heading">
    <div class="modal-box">
      <button class="modal-close" id="modal-close-btn" aria-label="Close form">&times;</button>

      <div id="modal-form-wrap">
        <div class="label" id="modal-eyebrow" style="margin-bottom:10px">Get in touch</div>
        <h2 class="modal-title" id="modal-heading">Book a demo</h2>
        <p class="modal-sub" id="modal-sub">Tell us about yourself and we'll be in touch within one business day.</p>
        <p class="modal-helper" id="modal-helper" style="display:none"><i class="ti ti-bolt" aria-hidden="true"></i>No password. No sales wall. Just quick access to the live demo.</p>

        <form class="modal-form" id="contact-form" novalidate>

          <div class="form-group">
            <label for="cf-name">Full name *</label>
            <input type="text" id="cf-name" name="name" placeholder="Jane Smith" autocomplete="name" required />
          </div>

          <div class="form-group">
            <label for="cf-company">Company *</label>
            <input type="text" id="cf-company" name="company" placeholder="Acme Inc." autocomplete="organization" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="cf-email">Email *</label>
              <input type="email" id="cf-email" name="email" placeholder="jane@acme.com" autocomplete="email" required />
            </div>
            <div class="form-group">
              <label for="cf-phone">Phone</label>
              <input type="tel" id="cf-phone" name="phone" placeholder="+1 (555) 000-0000" autocomplete="tel" />
            </div>
          </div>

          <div class="form-privacy">
            <label class="privacy-label">
              <input type="checkbox" id="cf-privacy" name="privacy" required />
              <span>I agree to the <a href="privacy.html" target="_blank">Privacy Policy</a> and consent to being contacted by ScreenGeni.us about my request.</span>
            </label>
          </div>

          <button type="submit" class="btn-primary modal-submit">Send request</button>

        </form>
      </div>

      <div class="modal-success" id="modal-success" style="display:none">
        <div class="success-icon">✓</div>
        <h3>We'll be in touch soon.</h3>
        <p>Thanks for your interest in ScreenGeni.us. Expect a reply within one business day.</p>
      </div>

    </div>
  </div>`;

  document.body.insertAdjacentHTML('beforeend', MODAL_HTML);

  const overlay  = document.getElementById('contact-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const form     = document.getElementById('contact-form');
  const success  = document.getElementById('modal-success');
  const formWrap = document.getElementById('modal-form-wrap');

  /* Copy elements that swap between "Book a demo" and "demo access" modes */
  const eyebrowEl = document.getElementById('modal-eyebrow');
  const titleEl   = document.getElementById('modal-heading');
  const subEl     = document.getElementById('modal-sub');
  const helperEl  = document.getElementById('modal-helper');
  const submitEl  = form.querySelector('.modal-submit');

  /* Capture the default (Book a demo) copy + success markup so we can restore it */
  const DEFAULT_COPY = {
    eyebrow: eyebrowEl.textContent,
    title:   titleEl.textContent,
    sub:     subEl.textContent,
    submit:  submitEl.textContent,
  };
  const successDefaultHTML = success.innerHTML;

  /* ── Demo-access mode state ──────────────────────────────────
     On the demos page, each demo card opens this same modal in a
     lightweight "demo access" mode that redirects to the live demo
     after the visitor submits. selectedDemo holds the clicked demo. */
  let demoAccessMode = false;
  let selectedDemo   = null;

  const DEMO_COPY = {
    eyebrow: 'Demo access',
    title:   'Launch this demo',
    sub:     "Tell us where to send follow-up, then you'll go straight into the live demo.",
    submit:  'Launch demo',
  };

  /* Guarded analytics: fires to an existing analytics util if present,
     otherwise a silent no-op (no console noise in production). */
  function track(name, props) {
    props = props || {};
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', name, props);
      } else if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push(Object.assign({ event: name }, props));
      } else if (typeof window.plausible === 'function') {
        window.plausible(name, { props: props });
      }
    } catch (e) { /* analytics must never break the flow */ }
  }

  /* localStorage helpers (guarded — can throw in private modes) */
  function hasDemoAccess() {
    try { return localStorage.getItem('screenGeniusDemoAccess') === 'granted'; }
    catch (e) { return false; }
  }
  function grantDemoAccess() {
    try { localStorage.setItem('screenGeniusDemoAccess', 'granted'); }
    catch (e) { /* ignore */ }
  }

  /* Append the campaign UTM parameters to an outgoing demo URL */
  function buildDemoUrl(baseUrl, slug) {
    try {
      const u = new URL(baseUrl);
      u.searchParams.set('utm_source', 'screengeni_us');
      u.searchParams.set('utm_medium', 'demo_launch');
      u.searchParams.set('utm_campaign', 'demo_access');
      u.searchParams.set('utm_content', slug || '');
      return u.toString();
    } catch (e) {
      return baseUrl;
    }
  }

  /* Swap modal copy for the active mode */
  function applyMode() {
    const c = demoAccessMode ? DEMO_COPY : DEFAULT_COPY;
    eyebrowEl.textContent = c.eyebrow;
    titleEl.textContent   = c.title;
    subEl.textContent     = c.sub;
    submitEl.textContent  = c.submit;
    helperEl.style.display = demoAccessMode ? '' : 'none';
    if (!demoAccessMode) success.innerHTML = successDefaultHTML;
  }

  /* CTA text patterns that should open the modal */
  const CTA_PATTERNS = [
    /book a demo/i,
    /schedule a demo/i,
    /get in touch/i, 
    /contact us/i,
    /request.*demo/i,
  ];

  function isCTA(el) {
    const text = el.textContent.trim();
    return CTA_PATTERNS.some((re) => re.test(text));
  }

  /* Open the modal. Pass a demo object to open in "demo access" mode. */
  function openContactModal(demo) {
    demoAccessMode = !!demo;
    selectedDemo   = demo || null;
    applyMode();
    form.reset();
    form.querySelectorAll('.error').forEach((el) => el.classList.remove('error'));
    formWrap.style.display = '';
    success.style.display  = 'none';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (demoAccessMode) {
      track('demo_access_modal_opened', { demo_name: selectedDemo.name, demo_url: selectedDemo.url });
    }
    // Focus first input after animation
    setTimeout(() => document.getElementById('cf-name')?.focus(), 120);
  }

  /* CTA buttons ("Book a demo", etc.) open the modal in normal mode */
  function openModal(e) {
    e.preventDefault();
    openContactModal(null);
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* Wire up all matching CTAs — runs now and after any dynamic changes */
  function wireCTAs() {
    document.querySelectorAll('a.btn-primary, button.btn-primary, a.btn-ghost, button.btn-ghost').forEach((el) => {
      if (el.dataset.modalWired) return;
      if (isCTA(el)) {
        el.dataset.modalWired = '1';
        el.addEventListener('click', openModal);
      }
    });
  }

  wireCTAs();

  /* Close on overlay click, close button, or Escape */
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  /* Form validation & submission */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    ['cf-name', 'cf-company', 'cf-email'].forEach((id) => {
      const input = document.getElementById(id);
      if (!input.value.trim()) {
        input.classList.add('error');
        valid = false;
      } else {
        input.classList.remove('error');
      }
    });

    const emailInput = document.getElementById('cf-email');
    if (emailInput.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
      emailInput.classList.add('error');
      valid = false;
    }

    const privacy = document.getElementById('cf-privacy');
    if (!privacy.checked) {
      privacy.closest('.form-privacy').style.outline = '1.5px solid #e05c5c';
      privacy.closest('.form-privacy').style.borderRadius = '4px';
      valid = false;
    } else {
      privacy.closest('.form-privacy').style.outline = '';
    }

    if (!valid) return;

    /* Submit to Web3Forms */
    const submitBtn = form.querySelector('.modal-submit');
    const origLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    const payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: 'New ScreenGeni.us demo request',
      from_name: 'ScreenGeni.us website',
      name:    document.getElementById('cf-name').value.trim(),
      company: document.getElementById('cf-company').value.trim(),
      email:   document.getElementById('cf-email').value.trim(),
      phone:   document.getElementById('cf-phone').value.trim(),
    };
    payload.replyto = payload.email;

    /* Demo-access mode: attach the selected demo + lead metadata */
    if (demoAccessMode && selectedDemo) {
      payload.subject          = 'ScreenGeni.us demo access — ' + selectedDemo.name;
      payload.leadType         = 'Demo Launch';
      payload.sourcePage       = '/demos';
      payload.selectedDemoName = selectedDemo.name;
      payload.selectedDemoUrl  = selectedDemo.url;
    }

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || 'Submission failed');
        }
        if (demoAccessMode && selectedDemo) {
          /* Unlock future launches, then send the visitor into the demo */
          grantDemoAccess();
          track('demo_access_form_submitted', { demo_name: selectedDemo.name, demo_url: selectedDemo.url });
          const finalUrl = buildDemoUrl(selectedDemo.url, selectedDemo.slug);
          /* Fallback UI in case the redirect is blocked/fails */
          success.innerHTML =
            '<div class="success-icon">✓</div>' +
            '<h3>You’re in.</h3>' +
            '<p>Opening your live demo now. If it doesn’t open automatically, use the button below.</p>' +
            '<a href="' + finalUrl + '" class="btn-primary" style="margin-top:20px" rel="noopener">Open demo →</a>';
          formWrap.style.display = 'none';
          success.style.display  = 'block';
          track('demo_opened', { demo_name: selectedDemo.name, demo_url: finalUrl });
          window.location.href = finalUrl;
        } else {
          formWrap.style.display = 'none';
          success.style.display  = 'block';
        }
      })
      .catch(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = origLabel;
        alert('Sorry, something went wrong sending your request. Please email us directly at daniel@screengeni.us.');
      });
  });

  /* Clear field error on input */
  form.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', () => input.classList.remove('error'));
  });

  /* ── Demo cards (demos page) ─────────────────────────────────
     Each card holds the live demo URL in href, plus data-demo-name
     and data-demo-slug. First-time visitors go through the demo-access
     modal; returning visitors who've been granted access open the demo
     directly in a new tab. UTM params are appended either way. */
  document.querySelectorAll('.demo-card[data-demo-name]').forEach((card) => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const demo = {
        name: card.getAttribute('data-demo-name'),
        url:  card.getAttribute('href'),
        slug: card.getAttribute('data-demo-slug'),
      };
      track('demo_launch_clicked', { demo_name: demo.name, demo_url: demo.url });

      if (hasDemoAccess()) {
        const finalUrl = buildDemoUrl(demo.url, demo.slug);
        track('demo_opened', { demo_name: demo.name, demo_url: finalUrl });
        window.open(finalUrl, '_blank', 'noopener');
        return;
      }
      openContactModal(demo);
    });
  });

})();
