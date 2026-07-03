const root = document.documentElement;
const sections = Array.from(document.querySelectorAll('[data-section]'));
const layers = Array.from(document.querySelectorAll('[data-parallax]'));
const revealTargets = Array.from(document.querySelectorAll('.reveal'));
const progressBar = document.querySelector('.progress__bar');
const navDots = Array.from(document.querySelectorAll('.section-nav__dot'));
const nextButtons = Array.from(document.querySelectorAll('[data-scroll-next]'));

const layerMotion = new Map();
const sectionMotion = new Map();
const mediaReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const mediaMobile = window.matchMedia('(max-width: 768px)');

let targetScroll = window.scrollY;
let currentScroll = window.scrollY;
let motionEnabled = !mediaReduce.matches;
let mobileMode = mediaMobile.matches;
let activeSectionId = sections[0]?.id || '';

function updateMotionFlags() {
  motionEnabled = !mediaReduce.matches;
  mobileMode = mediaMobile.matches;
  root.classList.toggle('reduced-motion', !motionEnabled);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function scrollToSectionById(sectionId) {
  const section = document.getElementById(sectionId);

  if (!section) {
    return;
  }

  section.scrollIntoView({ behavior: motionEnabled ? 'smooth' : 'auto', block: 'start' });
}

function setActiveSection(sectionId) {
  if (!sectionId || sectionId === activeSectionId) {
    return;
  }

  activeSectionId = sectionId;
  navDots.forEach((dot) => {
    const isActive = dot.dataset.target === sectionId;
    dot.classList.toggle('is-active', isActive);
    if (isActive) {
      dot.setAttribute('aria-current', 'location');
    } else {
      dot.removeAttribute('aria-current');
    }
  });
}

function setupObservers() {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -10% 0px'
    }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    },
    {
      threshold: 0.55,
      rootMargin: '-12% 0px -42% 0px'
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

function updateProgress() {
  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const progress = clamp(currentScroll / maxScroll, 0, 1);
  progressBar.style.transform = `scaleX(${progress})`;
}

function updateNavPosition() {
  if (!sections.length) {
    return;
  }

  const nextSection = sections.find((section) => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    return currentScroll + window.innerHeight * 0.5 >= top && currentScroll + window.innerHeight * 0.5 < top + height;
  });

  if (nextSection) {
    setActiveSection(nextSection.id);
  }
}

function updateParallax() {
  const motionScale = motionEnabled ? (mobileMode ? 0.35 : 1) : 0;
  const smoothing = motionEnabled ? 0.1 : 0.2;
  const easedScroll = currentScroll + (targetScroll - currentScroll) * smoothing;
  currentScroll = easedScroll;

  layers.forEach((layer) => {
    const section = layer.closest('[data-section]');
    if (!section) {
      return;
    }

    const sectionTop = section.offsetTop;
    const speed = Number(layer.dataset.speed || '0');
    const targetY = motionEnabled ? (easedScroll - sectionTop) * speed * motionScale : 0;
    const currentY = layerMotion.get(layer) ?? 0;
    const nextY = currentY + (targetY - currentY) * smoothing;

    layerMotion.set(layer, nextY);
    layer.style.transform = `translate3d(0, ${nextY.toFixed(2)}px, 0)`;
  });

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const midpoint = easedScroll + window.innerHeight * 0.5;
    const distance = midpoint - (sectionTop + sectionHeight * 0.5);
    const sectionShift = motionEnabled ? clamp(distance / window.innerHeight, -1, 1) * (mobileMode ? 8 : 18) : 0;
    const currentShift = sectionMotion.get(section) ?? 0;
    const nextShift = currentShift + (sectionShift - currentShift) * 0.08;

    sectionMotion.set(section, nextShift);
    section.style.setProperty('--section-shift', `${nextShift.toFixed(2)}px`);
  });

  updateProgress();
  updateNavPosition();
  requestAnimationFrame(updateParallax);
}

function onScroll() {
  targetScroll = window.scrollY;
}

function onResize() {
  targetScroll = window.scrollY;
  currentScroll = window.scrollY;
  updateMotionFlags();
}

function bindControls() {
  navDots.forEach((dot) => {
    dot.addEventListener('click', () => scrollToSectionById(dot.dataset.target || ''));
  });

  nextButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const currentIndex = sections.findIndex((section) => section.id === activeSectionId);
      const nextSection = sections[currentIndex + 1];

      if (nextSection) {
        scrollToSectionById(nextSection.id);
      }
    });
  });
}

function boot() {
  updateMotionFlags();
  setupObservers();
  bindControls();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  if (typeof mediaReduce.addEventListener === 'function') {
    mediaReduce.addEventListener('change', updateMotionFlags);
    mediaMobile.addEventListener('change', updateMotionFlags);
  }

  requestAnimationFrame(() => {
    root.classList.add('is-loaded');
    requestAnimationFrame(updateParallax);
  });
}

boot();
