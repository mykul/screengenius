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
        <div class="label" style="margin-bottom:10px">Get in touch</div>
        <h2 class="modal-title" id="modal-heading">Book a demo</h2>
        <p class="modal-sub">Tell us about yourself and we'll be in touch within one business day.</p>

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

  function openModal(e) {
    e.preventDefault();
    form.reset();
    form.querySelectorAll('.error').forEach((el) => el.classList.remove('error'));
    formWrap.style.display = '';
    success.style.display  = 'none';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Focus first input after animation
    setTimeout(() => document.getElementById('cf-name')?.focus(), 120);
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

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          formWrap.style.display = 'none';
          success.style.display  = 'block';
        } else {
          throw new Error(data.message || 'Submission failed');
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

})();
