(() => {
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];

  const body         = document.body;
  const introOverlay = $('#intro-overlay');
  const introParts   = $$('.part');
  const mainWrap     = $('#main-wrap');
  const orbits       = $$('.orbit');
  const menuToggle   = $('#menu-toggle');
  const sideNav      = $('#side-nav');
  const animBtn      = $('#animation-button');

  let animationsPaused = false;

  // ---------------------------
  // Restore angles from localStorage
  // ---------------------------
  function restoreOrbitAngles() {
    orbits.forEach(orbit => {
      const saved = localStorage.getItem(`orbit-angle-${orbit.dataset.orbitId}`);
      if (saved !== null) {
        orbit.style.transform = `rotate(${saved}deg)`; // set exact angle
      }
    });
    clearOrbitState();
  }

  // ---------------------------
  // Save current orbit angles
  // ---------------------------
  function saveOrbitAngles() {
    orbits.forEach(orbit => {
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

      localStorage.setItem(`orbit-angle-${orbit.dataset.orbitId}`, angleDeg);
    });
  }

// ------------------------------------------------------------
  // CLEAR localStorage after using the saved state (optional but cleaner)
  // ------------------------------------------------------------
  function clearOrbitState() {
    orbits.forEach((_, i) => {
      localStorage.removeItem(`orbit-${i}-transform`);
    });
    localStorage.removeItem("orbit-state-exists");
  }

  // ---------------------------
  // Intro sequence
  // ---------------------------
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

  // ---------------------------
  // Reveal main solar system
  // ---------------------------
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

  // ---------------------------
  // Skip intro if returning
  // ---------------------------
    function skipIntroImmediately() {
    introOverlay.style.display = 'none';
    mainWrap.setAttribute('aria-hidden', 'false');
    mainWrap.classList.add('show');

    orbits.forEach(orbit => {
        orbit.classList.add('show', 'rotate');
        const dur = getComputedStyle(orbit).getPropertyValue('--duration').trim();
        orbit.style.animationDuration = dur;

        // restore saved angle
        const saved = localStorage.getItem(`orbit-angle-${orbit.dataset.orbitId}`);
        if (saved !== null) orbit.style.transform = `rotate(${saved}deg)`;

        orbit.style.animationPlayState = animationsPaused ? 'paused' : 'running';
    });
    }

  // ---------------------------
  // Animation toggle
  // ---------------------------
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

  // ---------------------------
  // Fade transitions
  // ---------------------------
  function fadeThenNavigate(url) {
    saveOrbitAngles();
    body.classList.add('fade-out-page');
    setTimeout(() => { window.location.href = url; }, 600);
  }

  function setupPlanetNavigation() {
    $$('.planet').forEach(a => {
      a.addEventListener('click', e => { e.preventDefault(); fadeThenNavigate(a.href); });
      a.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fadeThenNavigate(a.href); }
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

  // ---------------------------
  // Side menu toggle
  // ---------------------------
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

  // ---------------------------
  // DOMContentLoaded
  // ---------------------------
  window.addEventListener('DOMContentLoaded', () => {
    body.classList.remove('preload');

    // Assign unique data-ids for orbits if not already set
    orbits.forEach((orbit, i) => { orbit.dataset.orbitId = i; });

    restoreOrbitAngles();

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

    // Mark intro as seen
    localStorage.setItem('skip-intro', 'true');
  });
})();
