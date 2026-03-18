gsap.registerPlugin(ScrollTrigger);

// 전역 변수
let leadershipTimeline = null;

// 메인 초기화 함수
document.addEventListener('DOMContentLoaded', function () {
  initHeader();
  initHeroSection();
  initSwiper();
  initTextInteraction();
  initServicesSection();
  initLeadershipSection();
  initCareersSection();
  initFooterSection();
  initAboutNav();
  initHistorySection(); 
  initAboutSlider(); 
  initHeaderThemeObserver();
});

// === 헤더 초기화 ===
function initHeader() {
  const header = document.querySelector('header');
  if (!header) return;

  const isAboutPage = document.querySelector('.about-nav') !== null;

  // 초기 상태 설정
  if (isAboutPage) {
    // About 페이지: 투명 배경으로 시작
    gsap.set(header, {
      y: '0%',
      backgroundColor: 'transparent',
      backdropFilter: 'none',
      webkitBackdropFilter: 'none'
    });
  } else {
    // 메인 페이지: 흰색 배경으로 시작
    gsap.set(header, {
      y: '0%',
      backgroundColor: 'white',
      backdropFilter: 'none',
      webkitBackdropFilter: 'none'
    });
  }

  function showHeader(isTop = false) {
    const isDarkSection = header.classList.contains('header-w');

    // 메인 페이지에서 최상단일 때는 흰색 배경
    if (!isAboutPage && isTop) {
      gsap.to(header, {
        y: '0%',
        backgroundColor: 'white',
        backdropFilter: 'none',
        webkitBackdropFilter: 'none',
        duration: 1,
        ease: 'power3.out'
      });
    } else {
      gsap.to(header, {
        y: '0%',
        backgroundColor: isDarkSection ? 'transparent' : 'rgba(255,255,255,0.4)',
        backdropFilter: isDarkSection ? 'none' : 'blur(10px)',
        webkitBackdropFilter: isDarkSection ? 'none' : 'blur(10px)',
        duration: 1,
        ease: 'power3.out'
      });
    }
  }

  function hideHeader() {
    gsap.to(header, {
      y: '-100%',
      duration: 1,
      ease: 'power3.out'
    });
  }

  let lastScrollTop = 0;
  const delta = 100;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;

    if (scrollTop <= 0) {
      showHeader(true);
      // 메인 페이지에서 최상단일 때 header-w 제거 및 로고 복구
      if (!isAboutPage) {
        header.classList.remove('header-w');
        const logoImg = header.querySelector('.logo img');
        if (logoImg && logoImg.src.includes('logo-w.svg')) {
          logoImg.src = logoImg.src.replace('logo-w.svg', 'logo.svg');
        }
      }
      lastScrollTop = scrollTop;
      return;
    }

    if (Math.abs(lastScrollTop - scrollTop) <= delta) return;

    if (scrollTop > lastScrollTop) {
      hideHeader();
    } else {
      showHeader(false);
    }

    lastScrollTop = scrollTop;
  });
}

// === Hero 섹션 (cover) 초기화 ===
function initHeroSection() {
  const coverImage = document.querySelector('.cover-image');
  const coverClip = document.querySelector('.cover-clip');
  const textWhite = document.querySelector('.text.white');

  if (!coverImage || !coverClip || !textWhite) return;

  gsap.timeline({
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: '+=800',
      scrub: true,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  })
    .set(coverImage, { xPercent: -50 })
    .fromTo(coverImage, {
      width: () => {
        const isMobile = window.matchMedia("(max-width: 480px)").matches;
        const padding = isMobile ? 16 : 73;
        return window.innerWidth - (padding * 2);
      },
      height: '70%',
      xPercent: -50,
      filter: "brightness(1)"
    }, {
      width: '100%',
      height: '70%',
      xPercent: -50,
      transformOrigin: 'center top',
      filter: "brightness(0.7)",
      ease: 'power3.in'
    }, 0)
    .fromTo(coverClip, {
      clipPath: 'inset(46% 0 0 0)'
    }, {
      clipPath: 'inset(0% 0 0 0)',
      ease: 'none'
    }, 0)
    .fromTo(textWhite, {
      clipPath: 'inset(100% 0 0 0)',
      y: 0, 
    }, {
      clipPath: 'inset(0% 0 0 0)',
      y: 0, 
      ease: 'none'
    }, 0)
}

// === Swiper 초기화 ===
function initSwiper() {
  new Swiper(".swiper:not(.about-slider)", {
    slidesPerView: 'auto',
    spaceBetween: 30,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    breakpoints: {
      0: { spaceBetween: 16 },
      768: { spaceBetween: 20 },
      1200: { spaceBetween: 30 }
    }
  });
}

// === About Slider 초기화 ===
function initAboutSlider() {
  const aboutSlider = document.querySelector('.about-slider');
  if (!aboutSlider) return;

      new Swiper(".about-slider", {

        slidesPerView: 1,

        effect: 'fade',

        fadeEffect: {

          crossFade: true

        },

        loop: true,

        speed: 1000,

        autoplay: {

          delay: 3000,

          disableOnInteraction: false,

        },

        allowTouchMove: false,

      });
}

// === 텍스트 인터랙션 초기화 ===
function initTextInteraction() {
  const spans = document.querySelectorAll('.text-interaction span');
  spans.forEach((span, i) => {
    const wTarget = 337;
    gsap.fromTo(span, {
      width: 0,
      opacity: 0,
      x: -100
    }, {
      width: wTarget,
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: 'power3.out',
      delay: i * 0.2,
      scrollTrigger: {
        trigger: span,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });
  });
}

// === Services 섹션 초기화 ===
function initServicesSection() {
  const servicesSwiper = new Swiper(".my-services-swiper", {
    effect: "fade",
    fadeEffect: { crossFade: true },
    speed: 600,
  });

  const tabLinks = document.querySelectorAll('.tabnav li');
  const tabContents = document.querySelectorAll('.tab-content > div');

  tabLinks.forEach((link, index) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector('.tabnav .active')?.classList.remove('active');
      link.classList.add('active');
      tabContents.forEach((content) => {
        content.classList.remove('active');
      });
      const targetId = link.querySelector('a')?.getAttribute('href');
      if (targetId) {
        document.querySelector(targetId)?.classList.add('active');
      }
      servicesSwiper.slideTo(index);
    });
  });
}

// === Leadership 섹션 초기화 ===
function initLeadershipSection() {
  const allImages = document.querySelectorAll(".leadership .bg-item img");
  if (!allImages.length) return;

  if (leadershipTimeline) {
    leadershipTimeline.kill();
    leadershipTimeline = null;
  }

  ScrollTrigger.getAll().forEach(trigger => {
    if (trigger.vars && (trigger.vars.trigger === ".leadership" || trigger.vars.pin === ".sticky-holder")) {
      trigger.kill();
    }
  });

  leadershipTimeline = gsap.timeline({
    scrollTrigger: {
      id: "leadership",
      trigger: ".leadership",
      start: "top top",
      end: "+=2000",
      scrub: true,
      pin: ".sticky-holder",
      pinSpacing: true
    }
  });

  leadershipTimeline.fromTo(
    ".leadership .bg-item:not(:nth-last-child(-n+2)) img", {
    yPercent: 80,
    opacity: 1,
    x: (i) => i === 0 ? -150 : 150
  }, {
    yPercent: -90,
    opacity: 1,
    stagger: 0.3,
    ease: "none"
  }
  );

  leadershipTimeline.fromTo(
    ".leadership .bg-item:nth-last-child(-n+2) img", {
    yPercent: 150,
    opacity: 1,
    x: (i) => i === 0 ? -150 : 150
  }, {
    y: (i, el) => {
      if (i === 0) return window.innerHeight * 0.1;
      else return window.innerHeight - el.offsetHeight;
    },
    opacity: 1,
    ease: "none",
    stagger: 0.5
  }, "<");

  leadershipTimeline.fromTo(".leadership .align-warp h3", { y: 30, opacity: 0 }, { y: 0, opacity: 1, ease: "back.out(1.5)" }, 0.5);
  leadershipTimeline.fromTo(".leadership .align-warp h2", { y: 30, opacity: 0 }, { y: 0, opacity: 1, ease: "back.out(1.5)" }, 0.5);
  leadershipTimeline.fromTo(".leadership .align-warp .more-black", { y: 20, opacity: 0 }, { y: 0, opacity: 1, ease: "back.out(1.5)" }, 0.5);
}

// === Careers 섹션 초기화 ===
function initCareersSection() {
  const careersInner = document.querySelector('.careers-inner');
  const careersContent = document.querySelector('.careers-content');
  const careersBtn = document.querySelector('.careers .more-black');

  if (!careersInner || !careersContent || !careersBtn) return;

  gsap.timeline({
    scrollTrigger: {
      trigger: '.careers',
      start: 'top top',
      end: '+=1000',
      scrub: true,
      pin: true,
      pinSpacing: true
    }
  })
    .to(careersInner, { width: '100vw', height: '100vh', ease: 'none' }, 0)
    .fromTo(careersContent, { y: 50 }, { y: 0, ease: 'back.out(1.7)' }, 0)
    .fromTo(careersBtn, { y: 50 }, { y: 0, ease: 'back.out(1.7)' }, 0.2)
    .fromTo(careersContent, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'none' }, 0)
    .fromTo(careersBtn, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'none' }, 0.2);
}

// === Footer 섹션 초기화 ===
function initFooterSection() {
  const footerBgEl = document.querySelector('.footer-bg');
  const ftWrapperEl = document.querySelector('.ft-wrapper');

  if (footerBgEl) {
    gsap.fromTo(footerBgEl, { y: '100%', opacity: 0 }, { y: '0%', opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: '.footer', start: 'bottom bottom', end: 'top bottom', scrub: true } });
  }

  if (ftWrapperEl) {
    gsap.fromTo(ftWrapperEl, { y: 50, opacity: 0 }, { y: 0, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: '.footer', start: 'top 90%', toggleActions: 'play none none reverse' } });
  }
}

// === About Nav 초기화 ===
function initAboutNav() {
  const navLinks = document.querySelectorAll('.about-nav a');
  const sections = document.querySelectorAll('section[id]'); 
  const navBar = document.querySelector('.about-nav');

  if (!navLinks.length || !sections.length) return;

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        const headerOffset = navBar ? navBar.offsetHeight : 0;
        const elementPosition = targetSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) link.classList.add('active');
        });
      }
    });
  }, { root: null, rootMargin: '-20% 0px -70% 0px', threshold: 0 });

  sections.forEach(section => observer.observe(section));

  let lastScrollTop = 0;
  const header = document.querySelector('header');
  
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const delta = 5; 

    // Sticky Active Check
    if (scrollTop > window.innerHeight - 100) {
      navBar.classList.add('sticky-active');
    } else {
      navBar.classList.remove('sticky-active');
    }

    if (Math.abs(lastScrollTop - scrollTop) <= delta) return;

    if (scrollTop > lastScrollTop && scrollTop > 0) {
      // Scroll Down
      if (navBar) gsap.to(navBar, { top: '0px', duration: 1, ease: 'power3.out' });
    } else {
      // Scroll Up
      if (navBar) gsap.to(navBar, { top: '-100px', duration: 1, ease: 'power3.out' });
    }
    lastScrollTop = scrollTop;
  });
}

// === History 섹션 초기화 ===
function initHistorySection() {
  const historyNavLinks = document.querySelectorAll('.history nav a');
  const historyTimelines = document.querySelectorAll('.history .timeline > ul');
  const sliderContainer = document.querySelector('.history .slider');

  if (!historyNavLinks.length || !historyTimelines.length || !sliderContainer) return;

  historyTimelines.forEach(ul => ul.style.display = 'block');

  let activeIndex = -1; 

  function updateActiveState(index) {
    if (index === activeIndex) return;

    historyNavLinks.forEach((link, i) => {
      if (i === index) link.classList.add('on');
      else link.classList.remove('on');
    });

    const targetTimeline = historyTimelines[index];
    const imgSource = targetTimeline.querySelector('li.img img');
    
    if (imgSource) {
      const currentImg = sliderContainer.querySelector('img');
      const newImg = document.createElement('img');
      newImg.src = imgSource.src;
      newImg.alt = imgSource.alt;
      gsap.set(newImg, { y: '100%' });
      sliderContainer.appendChild(newImg);

      if (currentImg) {
        gsap.to(currentImg, { y: '-100%', duration: 0.5, ease: "power2.out", onComplete: () => currentImg.remove() });
      }
      gsap.to(newImg, { y: '0%', duration: 0.5, ease: "power2.out" });
    }
    activeIndex = index;
  }

  historyTimelines.forEach((timeline, index) => {
    ScrollTrigger.create({
      trigger: timeline,
      start: "top center", 
      end: "bottom center",
      onEnter: () => updateActiveState(index),
      onEnterBack: () => updateActiveState(index)
    });
  });

  historyNavLinks.forEach((link, index) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTimeline = historyTimelines[index];
      const headerHeight = document.querySelector('header')?.offsetHeight || 0;
      const aboutNavHeight = document.querySelector('.about-nav')?.offsetHeight || 0;
      const offset = headerHeight + aboutNavHeight + 50; 
      const elementPosition = targetTimeline.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    });
  });
}

// === 헤더 테마 변경 옵저버 ===
function initHeaderThemeObserver() {
  const header = document.querySelector('header');
  if (!header) return;

  const logoImg = header.querySelector('.logo img, .logo-w img');
  const isAboutPage = document.querySelector('.about-nav') !== null;

  if (isAboutPage) {
    // About 페이지: 초기 상태 header-w 적용
    header.classList.add('header-w');
    if (logoImg && logoImg.src.includes('logo.svg') && !logoImg.src.includes('logo-w.svg')) {
      logoImg.src = logoImg.src.replace('logo.svg', 'logo-w.svg');
    }

    // About 페이지의 어두운 섹션들 (header-w 유지)
    const darkSections = ['hero', 'vision', 'globalLocation', 'contact', 'identity'];

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id') || entry.target.classList[0];
          const isDarkSection = darkSections.includes(id);

          if (isDarkSection) {
            header.classList.add('header-w');
            if (logoImg && logoImg.src.includes('logo.svg') && !logoImg.src.includes('logo-w.svg')) {
              logoImg.src = logoImg.src.replace('logo.svg', 'logo-w.svg');
            }
          } else {
            header.classList.remove('header-w');
            if (logoImg && logoImg.src.includes('logo-w.svg')) {
              logoImg.src = logoImg.src.replace('logo-w.svg', 'logo.svg');
            }
          }
        }
      });
    }, { root: null, rootMargin: '-10% 0px -80% 0px', threshold: 0 });

    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => observer.observe(section));

    // hero 섹션은 viewport 기반이므로 스크롤로도 체크
    window.addEventListener('scroll', () => {
      const heroHeight = window.innerHeight;
      if (window.scrollY < heroHeight - 100) {
        header.classList.add('header-w');
        if (logoImg && logoImg.src.includes('logo.svg') && !logoImg.src.includes('logo-w.svg')) {
          logoImg.src = logoImg.src.replace('logo.svg', 'logo-w.svg');
        }
      }
    });

    return;
  }

  // 메인 페이지: 어두운 섹션들 (header-w 적용)
  const darkSections = ['hero', 'careers'];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id') || entry.target.classList[0];
        const isDarkSection = darkSections.includes(id);

        // 최상단(scrollY === 0)이 아닐 때만 테마 변경
        if (window.scrollY > 0) {
          if (isDarkSection) {
            header.classList.add('header-w');
            if (logoImg && logoImg.src.includes('logo.svg') && !logoImg.src.includes('logo-w.svg')) {
              logoImg.src = logoImg.src.replace('logo.svg', 'logo-w.svg');
            }
          } else {
            header.classList.remove('header-w');
            if (logoImg && logoImg.src.includes('logo-w.svg')) {
              logoImg.src = logoImg.src.replace('logo-w.svg', 'logo.svg');
            }
          }
        } else {
          // 최상단에서는 header-w 제거 (기본 상태)
          header.classList.remove('header-w');
          if (logoImg && logoImg.src.includes('logo-w.svg')) {
            logoImg.src = logoImg.src.replace('logo-w.svg', 'logo.svg');
          }
        }
      }
    });
  }, { root: null, rootMargin: '-5% 0px -85% 0px', threshold: 0 });

  const sections = document.querySelectorAll('section');
  sections.forEach(section => observer.observe(section));
}

window.initLeadershipTimeline = initLeadershipSection;