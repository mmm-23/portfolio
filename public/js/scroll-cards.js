/* ==========================================================================
   Virtual Card Stack - 무한 스크롤 카드 스택 구현
   ========================================================================== */

/**
 * 가상 카드 스택 클래스
 * 휠 스크롤로 카드들을 순환하며 보여주는 무한 스크롤 구현
 */
class VirtualCardStack {
  constructor() {
    // DOM 요소 캐싱
    this.cards = Array.from(document.querySelectorAll('.content--sticky'));
    this.totalCards = this.cards.length;
    this.menuItems = Array.from(document.querySelectorAll('.project-menu-list__item'));
    this.backgroundTexts = Array.from(document.querySelectorAll('.background-text-item'));
    this.projectCenter = document.getElementById('currentProject');
    this.centerTitles = Array.from(document.querySelectorAll('.center-title'));

    // 스크롤 상태 관리
    this.currentIndex = 0;
    this.targetIndex = 0;
    this.scrollProgress = 0;
    this.direction = 1;

    // 애니메이션 설정
    this.textOffsets = [];
    this.marqueeSpeed = 0.5;
    this.brightnessFactor = 0.8;
    this.currentBgColor = null;

    this.init();
  }

  /**
   * 초기화 메서드
   */
  init() {
    this.initializeCards();
    this.setupEvents();
    this.setupBackgroundText();
    this.updateCards();
    this.updateMenu();
    this.updateBackgroundColor();
    this.animate();
  }

  /**
   * 카드 초기 설정
   */
  initializeCards() {
    this.cards.forEach(card => {
      card.style.position = 'fixed';
      card.style.width = '44rem';
      card.style.height = '44rem';
      card.style.left = 'calc(50% - 22rem)';
      card.style.top = 'calc(50% - 22rem)';
      card.style.transformOrigin = 'center center';
      card.style.transform = '';
      card.style.transition = 'none';
      card.style.willChange = 'transform, opacity, filter';
    });

    const firstCard = this.cards[0];
    if (firstCard) {
      this.currentBgColor = getComputedStyle(firstCard).backgroundColor;
      document.body.style.backgroundColor = this.currentBgColor;
    }
  }

  /**
   * 이벤트 리스너 설정
   */
  setupEvents() {
    let lastWheel = 0;
    const cooldown = 420;

    // 휠 스크롤 이벤트
    window.addEventListener('wheel', e => {
      if (window.isDetailViewOpen || window.isAboutMeOpen) return;
      e.preventDefault();
      const now = performance.now();
      if (now - lastWheel < cooldown) return;
      lastWheel = now;

      const direction = Math.sign(e.deltaY);
      this.direction = direction;
      this.targetIndex += direction;
    }, {
      passive: false
    });

    // 메뉴 아이템 클릭 이벤트
    this.menuItems.forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        const idx = parseInt(item.dataset.index);
        if (!isNaN(idx)) this.scrollToIndex(idx);
      });
    });
  }

  /**
   * 특정 인덱스로 스크롤
   */
  scrollToIndex(idx) {
    this.targetIndex = idx;
  }

  animate() {
    if (window.isTransitioning) {
      requestAnimationFrame(this.animate.bind(this));
      return;
    }

    // isReturningHome일 때는 카드 업데이트만 스킵하고 background-text는 업데이트
    if (!window.isReturningHome) {
      this.scrollProgress += (this.targetIndex - this.scrollProgress) * 0.14;

      // 루프 처리
      if (this.scrollProgress >= this.totalCards) {
        this.scrollProgress -= this.totalCards;
        this.targetIndex -= this.totalCards;
      }
      if (this.scrollProgress < 0) {
        this.scrollProgress += this.totalCards;
        this.targetIndex += this.totalCards;
      }

      this.currentIndex = Math.round(this.scrollProgress + this.totalCards * 100) % this.totalCards;

      this.updateCards();
      this.updateMenu();
      this.updateBackgroundColor();

      // 홈 페이지에서만 카드 진행률로 스크롤바 업데이트
      if (!window.isDetailViewOpen && !window.isAboutMeOpen) {
        const continuousProgress = this.scrollProgress / this.totalCards;
        updateCustomScrollbar(continuousProgress, this.totalCards);
      }
    }

    // background-text는 항상 업데이트
    this.updateBackgroundText();

    requestAnimationFrame(this.animate.bind(this));
  }

  updateCards() {
    const VH_HALF = window.innerHeight * 0.3; // 카드 간격과 3D 효과 조절을 위한 기준값
    const MAX_ROTATION = 70;   // rotateX 최대 각도 (degrees)
    const MAX_DEPTH = 100;     // translateZ 최대값 (px)
    const MIN_SCALE = 0.86;
    const SCALE_RANGE = 0.14;

    this.cards.forEach((card, index) => {
      const length = this.totalCards;

      let distance = index - this.scrollProgress;
      if (distance > length / 2) distance -= length;
      if (distance < -length / 2) distance += length;

      const abs = Math.abs(distance);

      const y = distance * 300;

      // gradientslider 스타일 3D 효과 (세로 방향 적용)
      const norm = Math.max(-1, Math.min(1, y / VH_HALF));
      const absNorm = Math.abs(norm);
      const invNorm = 1 - absNorm;

      const rx = norm * MAX_ROTATION;          // 위아래로 갈수록 기울어짐
      const tz = invNorm * MAX_DEPTH;          // 중앙 카드가 앞으로 튀어나옴
      const scale = MIN_SCALE + invNorm * SCALE_RANGE;
      const scaleY = scale * (1 - absNorm * 0.4); // 카드의 세로 길이 (0.2를 조절)

      const opacity = Math.max(1 - abs * 0.5, 0);
      const blur = Math.max(abs - 0.35, 0) * 1.4;
      const zIndex = 100 - abs * 20;

      card.style.transform = `perspective(1200px) translate3d(0, ${y}px, ${tz}px) rotateX(${rx}deg) scale(${scale}, ${scaleY})`;
      card.style.filter = `blur(${blur}px)`;
      card.style.opacity = opacity;
      card.style.zIndex = Math.round(zIndex);
      card.style.pointerEvents = abs < 0.5 ? 'auto' : 'none';
    });
  }

  updateMenu() {
    const activeDataIndex = this.cards[this.currentIndex] ?.dataset.index;
    this.menuItems.forEach(item => {
      item.classList.toggle('active', item.dataset.index === activeDataIndex);
    });

    const projectId = this.centerTitles[this.currentIndex] ?.value;
    if (projectId) {
      // projectConfig에서 displayName 가져오기
      const displayName = window.projectConfig?.[projectId]?.displayName || projectId;

      // 영어, 숫자, 공백, 특수문자를 포함하는 부분을 찾기 위한 정규식
      const nonKoreanRegex = /([a-zA-Z0-9\s`~!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+)/;
      const parts = displayName.split(nonKoreanRegex);

      const newHtml = parts.map(part => {
        if (part.match(nonKoreanRegex)) {
          return `<span>${part}</span>`;
        }
        return part;
      }).join('');
      this.projectCenter.innerHTML = newHtml;
    }
  }

  updateBackgroundColor() {
    const currentCard = this.cards[this.currentIndex];
    if (!currentCard) return;

    const color = parseRgb(getComputedStyle(currentCard).backgroundColor);
    const adjustedColor = color.map(c => Math.round(c * this.brightnessFactor));
    const newColor = `rgb(${adjustedColor[0]}, ${adjustedColor[1]}, ${adjustedColor[2]})`;

    if (newColor !== this.currentBgColor) {
      document.body.style.backgroundColor = newColor;
      this.currentBgColor = newColor;
    }
  }

  setupBackgroundText() {
    this.backgroundTexts.forEach((text, idx) => {
      text.style.position = 'absolute';
      text.style.top = '50%';
      text.style.left = '0';
      text.style.transform = 'translateY(-50%)';
      text.style.whiteSpace = 'nowrap';
      text.style.opacity = 0;

      // 반복 텍스트 문자열 생성
      const content = text.dataset.text || text.innerText;
      text.innerText = `${content} ${content} ${content}`;

      // 초기 x 위치
      this.textOffsets[idx] = 0;
    });
  }

  updateBackgroundText() {
    this.backgroundTexts.forEach((text, idx) => {
      if (idx === this.currentIndex) {
        text.style.opacity = 1;

        // 좌측 끝에서 시작하는 끊김 없는 루프
        this.textOffsets[idx] -= this.marqueeSpeed;
        const textWidth = text.offsetWidth / 3;
        if (this.textOffsets[idx] <= -textWidth) this.textOffsets[idx] += textWidth;

        text.style.transform = `translateX(${this.textOffsets[idx]}px) translateY(-50%)`;
      } else {
        text.style.opacity = 0;
      }
    });
  }
}

// 헬퍼 함수
function parseRgb(rgbString) {
  const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  return [29, 30, 34];
}

// 이미지 프리로드 (선택 사항)
function preloadImages(selector = 'img') {
  return new Promise(resolve => {
    if (typeof imagesLoaded !== 'undefined') {
      imagesLoaded(document.querySelectorAll(selector), {
        background: true
      }, resolve);
    } else resolve();
  });
}

// 초기 실행
preloadImages('.content--card')
  .then(() => {
    document.body.classList.remove('loading');
    window.cardStack = new VirtualCardStack();
  })
  .catch(err => {
    console.error(err);
    document.body.classList.remove('loading');
  });
