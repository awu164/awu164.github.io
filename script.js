// script.js
// Responsible for: intro typing sequence, reveal sun + start orbits, side menu, fade transitions,
// and NOW saving + restoring orbit animation state so animation resumes when returning to main page.

(() => {
  // Utility helpers
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));

  // Elements
  const body = document.body;
  const introOverlay = $('#intro-overlay');
  const introParts = $$('.part');
  const mainWrap = $('#main-wrap');
  const orbits = $$('.orbit');
  const menuToggle = $('#menu-toggle');
  const sideNav = $('#side-nav');
  const animBtn = document.getElementById('animation-button');
  let animationsPaused = false;

  // ------------------------------------------------------------
  // Detect if we have saved orbit state (indicating a return)
  // ------------------------------------------------------------
  function hasSavedOrbitState() {
    return localStorage.getItem("orbit-state-exists") === "true";
  }

  // ------------------------------------------------------------
  // Save current CSS transforms for each orbit before navigation
  // ------------------------------------------------------------
  function saveOrbitPositions() {
    orbits.forEach((orbit, i) => {
      const computed = getComputedStyle(orbit);
      const matrix = computed.transform;

      localStorage.setItem(`orbit-${i}-transform`, matrix);
    });

    localStorage.setItem("orbit-state-exists", "true");
  }

  // ------------------------------------------------------------
  // Restore CSS transforms for each orbit on page load
  // ------------------------------------------------------------
  function restoreOrbitPositions() {
    orbits.forEach((orbit, i) => {
      const saved = localStorage.getItem(`orbit-${i}-transform`);
      if (!saved) return;

      // Restore the transform
      orbit.style.transform = saved;

      // Ensure the CSS animation picks up from restored transform
      orbit.classList.add("rotate");
      orbit.style.animationPlayState = animationsPaused ? 'paused' : 'running';
    });
  }

  // ------------------------------------------------------------
  // Skip intro if returning from a subpage
  // ------------------------------------------------------------
  function skipIntroSequence() {
    introOverlay.style.display = "none";
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

  // ------------------------------------------------------------
  // PAGE LOAD HANDLING
  // ------------------------------------------------------------
  window.addEventListener('DOMContentLoaded', () => {
    body.classList.remove('preload');

    setupMenuToggle();
    setupPlanetNavigation();
    setupNavLinks();
    setupAnimationToggle();

    // If user is returning from a subpage, skip intro and restore animation
    if (hasSavedOrbitState()) {
      skipIntroSequence();
      revealMain();
      restoreOrbitPositions();
      clearOrbitState(); // remove after restoring
    } else {
      runIntroSequence();
    }
  });

  // --- INTRO SEQUENCE ---
  function runIntroSequence(){
    // Step 1: show parts one by one (typing effect feel)
    const delays = [600, 1400, 2200];
    introParts.forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), delays[i]);
    });

    // Step 2: fade out
    const totalIntro = 3800;
    setTimeout(() => {
      introParts.forEach(el => el.classList.add('out'));

      setTimeout(() => {
        introOverlay.classList.add('fade-out');
        setTimeout(() => {
          introOverlay.style.display = 'none';
          revealMain();
        }, 700);
      }, 1000);
    }, totalIntro);
  }

  // --- REVEAL MAIN CONTENT AND START ORBITS ---
  function revealMain(){
    mainWrap.setAttribute('aria-hidden', 'false');
    mainWrap.classList.add('show');

    // show orbits progressively and start their rotation animations
    orbits.forEach((orbit, i) => {
      setTimeout(() => {
        orbit.classList.add('show');
        const dur = getComputedStyle(orbit).getPropertyValue('--duration') || '20s';
        orbit.style.animationDuration = dur.trim();
        orbit.classList.add('rotate');
        orbit.style.animationPlayState = animationsPaused ? 'paused' : 'running';
      }, 350 * i + 250);
    });
  }

  // --- ANIMATION TOGGLE BUTTON ---
  function setupAnimationToggle(){
    if (!animBtn) return;
    updateAnimBtnLabel();
    animBtn.addEventListener('click', () => {
      animationsPaused = !animationsPaused;
      updateAnimationState();
      updateAnimBtnLabel();
    });
  }

  function updateAnimationState(){
    orbits.forEach(orbit => {
      orbit.style.animationPlayState = animationsPaused ? 'paused' : 'running';
    });
  }

  function updateAnimBtnLabel(){
    animBtn.textContent = animationsPaused ? 'Start Animation' : 'Stop Animation';
    animBtn.setAttribute('aria-pressed', String(animationsPaused));
  }

  // --- MENU TOGGLE ---
  function setupMenuToggle(){
    menuToggle.addEventListener('click', () => {
      const open = sideNav.classList.toggle('open');
      sideNav.setAttribute('aria-hidden', open ? 'false' : 'true');
    });
    document.addEventListener('click', (e) => {
      if (!sideNav.contains(e.target) && e.target !== menuToggle && sideNav.classList.contains('open')) {
        sideNav.classList.remove('open');
        sideNav.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // --- FADE + SAVE STATE + NAVIGATE ---
  function fadeThenNavigate(url){
    saveOrbitPositions(); // <-- NEW: save animation before page leaves
    body.classList.add('fade-out-page');
    setTimeout(() => { window.location.href = url; }, 600);
  }

  function setupPlanetNavigation(){
    const planetAnchors = $$('.planet');
    planetAnchors.forEach(a => {
      a.addEventListener('click', (ev) => {
        ev.preventDefault();
        fadeThenNavigate(a.getAttribute('href'));
      });
      a.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          fadeThenNavigate(a.getAttribute('href'));
        }
      });
    });
  }

  // Side nav links behave same as planets
  function setupNavLinks(){
    const navLinks = $$('.nav-link');
    navLinks.forEach(a => {
      a.addEventListener('click', (ev) => {
        ev.preventDefault();
        sideNav.classList.remove('open');
        fadeThenNavigate(a.href);
      });
    });
  }

  // Allow ctrl/cmd new-tab but block middle click resets
  document.addEventListener('click', (e) => {
    if (e.target.closest('.planet')) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    }
  });

})();
