// script.js — final merged version
// Features:
// ✔ First visit: play intro
// ✔ Returning from subpage: skip intro entirely
// ✔ Save exact orbit angles before leaving
// ✔ Restore exact angles when loading
// ✔ Keep pause/resume button
// ✔ Fade transitions
// ✔ Side menu + planet link handling
// -----------------------------------------------------------

(() => {
  // Shorthand
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];

  // DOM elements
  const body         = document.body;
  const introOverlay = $('#intro-overlay');
  const introParts   = $$('.part');
  const mainWrap     = $('#main-wrap');
  const orbits       = $$('.orbit');
  const menuToggle   = $('#menu-toggle');
  const sideNav      = $('#side-nav');
  const animBtn      = $('#animation-button');

  let animationsPaused = false;

  // =============================
  // 1. Restore saved angles
  // =============================
  function restoreOrbitAngles() {
    orbits.forEach(orbit => {
      const id = orbit.classList.value;
      const saved = localStorage.getItem(`orbit-angle-${id}`);
      if (saved !== null) {
        orbit.style.setProperty('--initial-rotation', `${saved}deg`);
        orbit.style.animationDelay = `-${(saved / 360) *
          parseFloat(getComputedStyle(orbit).getPropertyValue('--duration'))}s`;
      }
    });
  }

  // =============================
  // 2. Save angles before leaving
  // =============================
  function saveOrbitAngles() {
    orbits.forEach(orbit => {
      const id = orbit.classList.value;

      const style = getComputedStyle(orbit);
      const matrix = style.transform;

      let angleDeg = 0;

      if (matrix && matrix !== 'none') {
        const values = matrix.match(/matrix\(([^)]+)\)/);
        if (values) {
          const parts = values[1].split(',').map(Number);
          const [a, b] = parts;
          angleDeg = Math.round(Math.atan2(b, a) * (180 / Math.PI));
        }
      }

      if (angleDeg < 0) angleDeg += 360;

      localStorage.setItem(`orbit-angle-${id}`, angleDeg);
    });
  }

  // =============================
  // Intro Sequence
  // =============================
  function runIntroSequence() {
    const delays = [600, 1400, 2200];

    introParts.forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), delays[i]);
    });

    setTimeout(() => {
      introParts.forEach(el => el.classList.add('out'));

      setTimeout(() => {
        introOverlay.classList.add('fade-out');
        setTimeout(() => {
          introOverlay.style.display = 'none';
          revealMain();
        }, 700);
      }, 1000);

    }, 3800);
  }

  // =============================
  // Reveal Main UI
  // =============================
  function revealMain() {
    mainWrap.setAttribute('aria-hidden', 'false');
    mainWrap.classList.add('show');

    orbits.forEach((orbit, i) => {
      setTimeout(() => {
        orbit.classList.add('show', 'rotate');
        const dur = getComputedStyle(orbit).getPropertyValue('--duration').trim();
        orbit.style.animationDuration = dur;
        orbit.style.animationPlayState = animationsPaused ? 'paused' : 'running';
      }, 250 + 350 * i);
    });
  }

  // =============================
  // Skip intro for returning users
  // =============================
  function skipIntroImmediately() {
    introOverlay.style.display = 'none';
    mainWrap.setAttribute('aria-hidden', 'false');
    mainWrap.classList.add('show');

    orbits.forEach(orbit => {
      orbit.classList.add('show', 'rotate');
      const dur = getComputedStyle(orbit).getPropertyValue('--duration').trim();
      orbit.style.animationDuration = dur;
      orbit.style.animationPlayState = animationsPaused ? 'paused' : 'running';
    });
  }

  // =============================
  // Pause/Resume animation button
  // =============================
  function setupAnimationToggle() {
    if (!animBtn) return;

    updateAnimBtnLabel();

    animBtn.addEventListener('click', () => {
      animationsPaused = !animationsPaused;
      orbits.forEach(orbit =>
        orbit.style.animationPlayState = animationsPaused ? 'paused' : 'running'
      );
      updateAnimBtnLabel();
    });
  }

  function updateAnimBtnLabel() {
    animBtn.textContent = animationsPaused ? 'Start Animation' : 'Stop Animation';
    animBtn.setAttribute('aria-pressed', animationsPaused);
  }

  // =============================
  // Fade-out navigation
  // =============================
  function fadeThenNavigate(url) {
    saveOrbitAngles(); // <-- store exact positions

    body.classList.add('fade-out-page');
    setTimeout(() => {
      window.location.href = url;
    }, 600);
  }

  function setupPlanetNavigation() {
    $$('.planet').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        fadeThenNavigate(a.href);
      });

      a.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          fadeThenNavigate(a.href);
        }
      });
    });
  }

  function setupNavLinks() {
    $$('.nav-link').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        sideNav.classList.remove('open');
        fadeThenNavigate(a.href);
      });
    });
  }

  // =============================
  // Side menu
  // =============================
  function setupMenuToggle() {
    menuToggle.addEventListener('click', () => {
      const open = sideNav.classList.toggle('open');
      sideNav.setAttribute('aria-hidden', !open);
    });

    document.addEventListener('click', e => {
      if (!sideNav.contains(e.target) &&
          e.target !== menuToggle &&
          sideNav.classList.contains('open')) {
        sideNav.classList.remove('open');
        sideNav.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // =============================
  // DOMContentLoaded main logic
  // =============================
  window.addEventListener('DOMContentLoaded', () => {
    body.classList.remove('preload');

    restoreOrbitAngles(); // Must run before showing anything

    const returning = localStorage.getItem('skip-intro') === 'true';

    if (returning) {
      skipIntroImmediately();
    } else {
      runIntroSequence();
    }

    setupMenuToggle();
    setupPlanetNavigation();
    setupNavLinks();
    setupAnimationToggle();

    // Mark that intro should be skipped on return
    localStorage.setItem('skip-intro', 'true');
  });

})();
