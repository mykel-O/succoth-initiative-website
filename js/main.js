/* ═══════════════════════════════════════════════════
   SUCCOTH INITIATIVE INC. — main.js
   All interactive functionality:
   - Scroll progress bar
   - Nav shadow on scroll
   - Active nav link highlighting
   - Back to top button
   - Scroll reveal (IntersectionObserver)
   - Animated stat counters
   - Mobile hamburger menu
   - Dropdown navigation
   - Testimonial tabs
   - FAQ accordion
   - Contact form validation & submission
   - Character counter
   - Toast notifications
   - Smooth anchor scrolling
═══════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────
   DOM REFERENCES
   All queried once at the top — avoids repeated
   lookups and makes the code easier to maintain.
───────────────────────────────────────────────── */
const progressBar  = document.getElementById('scroll-progress');
const mainNav      = document.getElementById('main-nav');
const backBtn      = document.getElementById('back-to-top');
const hamburger    = document.getElementById('hamburger');
const mobileMenu   = document.getElementById('mobile-menu');
const toastEl      = document.getElementById('toast');
const contactForm  = document.getElementById('contact-form');
const submitBtn    = document.getElementById('submit-btn');
const formSuccess  = document.getElementById('form-success');
const messageField = document.getElementById('fmessage');
const charCounter  = document.getElementById('char-counter');
const statStrip    = document.getElementById('stats-strip');

/* ─────────────────────────────────────────────────
   1. SCROLL PROGRESS BAR
   Updates a thin bar at the very top of the page
   showing how far down the user has scrolled.
───────────────────────────────────────────────── */
function updateScrollProgress() {
  const scrolled = window.scrollY;
  const total    = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (scrolled / total * 100) + '%';
}

/* ─────────────────────────────────────────────────
   2. NAV SHADOW ON SCROLL
   Adds a stronger shadow to the nav once the user
   starts scrolling, giving it a "lifted" effect.
───────────────────────────────────────────────── */
function updateNavShadow() {
  mainNav.classList.toggle('scrolled', window.scrollY > 20);
}

/* ─────────────────────────────────────────────────
   3. BACK TO TOP BUTTON
   Fades in after scrolling 400px, smooth scrolls
   to the top when clicked.
───────────────────────────────────────────────── */
function updateBackToTop() {
  backBtn.classList.toggle('show', window.scrollY > 400);
}

backBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ─────────────────────────────────────────────────
   4. ACTIVE NAV LINK ON SCROLL
   Highlights the correct nav link based on which
   section is currently in view.
───────────────────────────────────────────────── */
const pageSections = document.querySelectorAll('section[id], div[id="stats-strip"]');
const navLinks     = document.querySelectorAll('.nav-links > li > a:not(.nav-cta)');

function updateActiveNavLink() {
  let currentSection = '';

  pageSections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 100) {
      currentSection = section.id;
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + currentSection) {
      link.classList.add('active');
    }
  });
}

/* ─────────────────────────────────────────────────
   5. COMBINED SCROLL HANDLER
   All scroll-dependent functions run from a single
   event listener (passive = better performance).
───────────────────────────────────────────────── */
window.addEventListener('scroll', () => {
  updateScrollProgress();
  updateNavShadow();
  updateBackToTop();
  updateActiveNavLink();
}, { passive: true });

/* ─────────────────────────────────────────────────
   6. SCROLL REVEAL (IntersectionObserver)
   Elements with class="reveal" start invisible and
   fade+slide up into view when they enter viewport.
   Once triggered, the observer stops watching them.
───────────────────────────────────────────────── */
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // fire once only
      }
    });
  },
  { threshold: 0.12 }
);

revealElements.forEach(el => revealObserver.observe(el));

/* ─────────────────────────────────────────────────
   7. ANIMATED STAT COUNTERS
   Numbers in the stats strip count up from 0 when
   the strip scrolls into view. Uses requestAnimationFrame
   for smooth, GPU-friendly animation.
   HTML data attributes used:
     data-target="2400"   — the final number
     data-suffix="+"      — optional text appended (e.g. "+", "%")
───────────────────────────────────────────────── */
function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const suffix   = el.dataset.suffix || '';
  const duration = 1800; // ms
  const startTime = performance.now();

  function step(currentTime) {
    const elapsed  = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out quart: fast start, slow finish
    const eased    = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('[data-target]').forEach(animateCounter);
        statsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

if (statStrip) statsObserver.observe(statStrip);

/* ─────────────────────────────────────────────────
   8. MOBILE HAMBURGER MENU
   Toggles the full-screen mobile nav overlay.
   Also locks body scroll when menu is open so the
   background doesn't scroll underneath.
───────────────────────────────────────────────── */
hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close the menu when any link inside it is clicked
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

/* ─────────────────────────────────────────────────
   9. TESTIMONIAL TABS
   Clicking a tab button shows the matching panel
   and hides all others. Also triggers reveal
   animation on cards in the newly shown panel.
───────────────────────────────────────────────── */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTab = btn.dataset.tab;

    // Update all buttons
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    // Update all panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    const targetPanel = document.getElementById('tab-' + targetTab);
    if (targetPanel) {
      targetPanel.classList.add('active');
      // Trigger reveal on cards that just became visible
      targetPanel.querySelectorAll('.reveal').forEach(el => {
        setTimeout(() => el.classList.add('visible'), 50);
      });
    }
  });
});

/* ─────────────────────────────────────────────────
   10. FAQ ACCORDION
   Clicking a question expands its answer and
   collapses all other open answers. Uses max-height
   animation (CSS) driven by JS setting the value.
───────────────────────────────────────────────── */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item   = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-answer').style.maxHeight  = '0';
      i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });

    // If the clicked item was closed, open it
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      const answer = item.querySelector('.faq-answer');
      // Set max-height to actual content height to trigger the CSS transition
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

/* ─────────────────────────────────────────────────
   11. TOAST NOTIFICATION
   Shows a small pop-up message at the bottom of
   the screen. Auto-hides after 4 seconds.
   Usage: showToast('Message here', 'success')
          showToast('Error message', 'error')
───────────────────────────────────────────────── */
let toastTimer;

function showToast(message, type = '') {
  toastEl.textContent = message;
  toastEl.className   = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 4000);
}

/* ─────────────────────────────────────────────────
   12. CONTACT FORM — CHARACTER COUNTER
   Updates the live counter below the message
   textarea. Turns yellow near the limit, red if over.
───────────────────────────────────────────────── */
if (messageField && charCounter) {
  messageField.addEventListener('input', () => {
    const len = messageField.value.length;
    charCounter.textContent = len + ' / 500';
    charCounter.classList.remove('near', 'over');
    if (len >= 500)      charCounter.classList.add('over');
    else if (len >= 400) charCounter.classList.add('near');
  });
}

/* ─────────────────────────────────────────────────
   13. CONTACT FORM — VALIDATION HELPERS
   setFieldState()  — marks a field as error or valid
   validateEmail()  — simple email regex check
   validateForm()   — runs all validation rules,
                      returns true if everything passes
───────────────────────────────────────────────── */
function getFieldValue(id) {
  return document.getElementById(id).value.trim();
}

function setFieldState(fieldId, errorId, hasError) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  field.classList.toggle('error', hasError);
  field.classList.toggle('valid', !hasError && field.value.trim() !== '');
  error.classList.toggle('show', hasError);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm() {
  let isValid = true;

  // Full Name: required, at least 2 characters
  const name = getFieldValue('fname');
  if (!name || name.length < 2) {
    setFieldState('fname', 'fname-error', true);
    isValid = false;
  } else {
    setFieldState('fname', 'fname-error', false);
  }

  // Email: required, valid format
  const email = getFieldValue('femail');
  if (!validateEmail(email)) {
    setFieldState('femail', 'femail-error', true);
    isValid = false;
  } else {
    setFieldState('femail', 'femail-error', false);
  }

  // Service: required (must select one)
  const service = document.getElementById('fservice').value;
  if (!service) {
    setFieldState('fservice', 'fservice-error', true);
    isValid = false;
  } else {
    setFieldState('fservice', 'fservice-error', false);
  }

  return isValid;
}

/* ─────────────────────────────────────────────────
   14. CONTACT FORM — REAL-TIME BLUR VALIDATION
   Validates individual fields when the user leaves
   them (on blur), giving immediate feedback without
   waiting for submit.
───────────────────────────────────────────────── */
['fname', 'femail', 'fservice'].forEach(id => {
  const field = document.getElementById(id);
  if (field) field.addEventListener('blur', validateForm);
});

/* ─────────────────────────────────────────────────
   15. CONTACT FORM — SUBMIT HANDLER
   1. Prevents default form submission
   2. Validates all fields
   3. Shows loading spinner on the button
   4. Simulates async API call (replace setTimeout
      with a real fetch() to your backend or service
      like Formspree / EmailJS)
   5. Shows success state or error toast
───────────────────────────────────────────────── */
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Stop if validation fails
    if (!validateForm()) {
      showToast('⚠️ Please fix the errors above.', 'error');
      return;
    }

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      /*
        REPLACE THIS with a real API call, e.g.:
        const response = await fetch('https://formspree.io/f/YOUR_ID', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(contactForm)
        });
        if (!response.ok) throw new Error('Submission failed');
      */

      // Simulated 1.8s network delay (delete this in production)
      await new Promise(resolve => setTimeout(resolve, 1800));

      // Hide form, show success message
      contactForm.style.display = 'none';
      formSuccess.classList.add('show');
      showToast('✅ Request sent successfully!', 'success');

      // Smooth scroll to the contact section so user sees the success message
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        window.scrollTo({
          top: contactSection.offsetTop - 80,
          behavior: 'smooth'
        });
      }

    } catch (error) {
      showToast('❌ Something went wrong. Please try again.', 'error');
    } finally {
      // Always restore button state (whether success or error)
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });
}

/* ─────────────────────────────────────────────────
   16. SMOOTH ANCHOR SCROLL
   Intercepts all internal anchor links (href="#...")
   and scrolls smoothly to the target section,
   offset by the nav height so content isn't hidden.
───────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId  = link.getAttribute('href');
    const targetEl  = document.querySelector(targetId);
    if (!targetEl) return;
    e.preventDefault();
    const offsetTop = targetEl.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
  });
});