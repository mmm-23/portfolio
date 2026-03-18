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
});

// === 헤더 초기화 ===
function initHeader() {
  const header = document.querySelector('header');
  if (!header) return;

  gsap.set(header, {
    y: '0%'
  });

  function showHeader(isTop = false) {
    gsap.to(header, {
      y: '0%',
      backgroundColor: isTop ? 'transparent' : 'rgba(255,255,255,0.4)',
      backdropFilter: isTop ? 'none' : 'blur(10px)',
      webkitBackdropFilter: isTop ? 'none' : 'blur(10px)',
      duration: 0.35,
      ease: 'power3.out'
    });
  }

  function hideHeader() {
    gsap.to(header, {
      y: '-100%',
      duration: 0.35,
      ease: 'power3.out'
    });
  }

  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      const s = self.scroll();
      if (s <= 0) {
        showHeader(true);
      } else if (self.direction === 1 && s > 50) {
        hideHeader();
      } else if (self.direction === -1) {
        showHeader(false);
      }
    }
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
      markers: true,
      scrub: true,
      pin: true,
      anticipatePin: 1,
      pinSpacing: true
    }
  })
    .set(coverImage, { xPercent: -50 })
    .fromTo(coverImage, {
      width: '92%',
      height: '70%',
      xPercent: -50,
      filter: "brightness(1)"
    }, {
      width: '100%',
      height: '80%',
      xPercent: -50,
      transformOrigin: 'center top',
      filter: "brightness(0.7)", 
      ease: 'none'
    }, 0)
    
    .fromTo(coverClip, {
    clipPath: 'inset(46% 0 0 0)'
  }, {
    clipPath: 'inset(0% 0 0 0)',
    ease: 'power3.inOut'
  }, 0)
      .fromTo(textWhite, {
        clipPath: 'inset(100% 0 0 0)'
      }, {
        clipPath: 'inset(0% 0 0 0)',
        ease: 'none'
      }, 0);
}


// === 외부에서 호출할 수 있는 함수들 ===
window.initLeadershipTimeline = initLeadershipSection;