// script.js
// Responsible for: intro typing sequence, reveal sun + start orbits, side menu, and fade transitions to subpages.

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

  // After DOM loaded, remove preload so CSS animations run
  window.addEventListener('load', () => {
    body.classList.remove('preload');

    // Start intro animation sequence
    runIntroSequence();
    setupMenuToggle();
    setupPlanetNavigation();
    setupNavLinks();
  });

  // --- INTRO SEQUENCE ---
  function runIntroSequence(){
    // Step 1: show parts one by one (typing effect feel)
    // Timing:
    const delays = [600, 1400, 2200]; // ms for Alicia, Sun, Wu
    introParts.forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), delays[i]);
    });

    // Step 2: keep visible, then fade parts out while keeping sun image behind
    const totalIntro = 3800;
    setTimeout(() => {
      // fade out intro overlay smoothly
      introOverlay.classList.add('fade-out');
      // reveal main content (sun + planets) after overlay fades
      setTimeout(() => {
        introOverlay.style.display = 'none';
        revealMain();
      }, 700);
    }, totalIntro);
  }

  // --- REVEAL MAIN CONTENT AND START ORBITS ---
  function revealMain(){
    // allow interaction with main
    mainWrap.setAttribute('aria-hidden', 'false');
    mainWrap.classList.add('show');

    // show orbits progressively and start their rotation animations
    orbits.forEach((orbit, i) => {
      setTimeout(() => {
        orbit.classList.add('show');
        // read duration from inline style var --duration (fallback)
        const dur = getComputedStyle(orbit).getPropertyValue('--duration') || '20s';
        const numeric = ('' + dur).trim();
        orbit.style.animationDuration = numeric;
        orbit.classList.add('rotate');
      }, 350 * i + 250);
    });
  }

  // --- MENU TOGGLE ---
  function setupMenuToggle(){
    menuToggle.addEventListener('click', () => {
      const open = sideNav.classList.toggle('open');
      sideNav.setAttribute('aria-hidden', open ? 'false' : 'true');
    });
    // close menu if click outside
    document.addEventListener('click', (e) => {
      if (!sideNav.contains(e.target) && e.target !== menuToggle && sideNav.classList.contains('open')) {
        sideNav.classList.remove('open');
        sideNav.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // --- PLANET LINK NAVIGATION WITH DISSOLVE TRANSITION ---
  function fadeThenNavigate(url){
    // Apply fade class to body (fade out)
    body.classList.add('fade-out-page');
    // small delay to let CSS animate, then navigate
    setTimeout(() => { window.location.href = url; }, 600);
  }

  function setupPlanetNavigation(){
    const planetAnchors = $$('.planet');
    planetAnchors.forEach(a => {
      a.addEventListener('click', (ev) => {
        ev.preventDefault();
        const href = a.getAttribute('href');
        fadeThenNavigate(href);
      });
      // keyboard accessibility: Enter triggers navigation
      a.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          const href = a.getAttribute('href');
          fadeThenNavigate(href);
        }
      });
    });
  }

  // Side nav links should behave same as planet links (dissolve)
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

  // Prevent accidental middle-click open in new tab: still allow default for ctrl/cmd clicks
  document.addEventListener('click', (e) => {
    if (e.target.closest('.planet')) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) {
        // default — allow new tab
        return;
      }
    }
  });

})();
