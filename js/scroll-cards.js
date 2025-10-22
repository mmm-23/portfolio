class VirtualCardStack {

  constructor() {
    this.cards = Array.from(document.querySelectorAll('.content--sticky')); // 메인 카드만 사용
    this.totalCards = this.cards.length;
    this.menuItems = document.querySelectorAll('.project-menu-list__item');
    this.currentBgColor = null;

    this.currentIndex = 0; // 현재 중앙 카드 인덱스 (정수)
    this.targetIndex = 0; // 휠 이벤트로 변경되는 목표 인덱스 (실수)
    this.scrollProgress = 0; // 애니메이션용 보간 값 (실수)

    console.log('🎴 원본 카드 개수:', this.totalCards);
    this.init();
  }

  init() {
    this.initializeCards(); // 카드 초기 위치 설정
    this.updateCards(); // 카드 초기 상태 렌더링
    this.setupEvents(); // 휠 이벤트 리스너 추가
    this.animate(); // 애니메이션 루프 시작
    console.log('✅ 가상 스크롤 카드 스택 초기화 완료');
  }

  // 모든 카드를 화면 중앙에 fixed로 고정
  initializeCards() {
    this.cards.forEach((card) => {
      card.style.position = 'fixed';
      card.style.top = '50%';
      card.style.left = '50%';
      card.style.width = '95vw';
      card.style.maxWidth = '480px';
      card.style.transformOrigin = 'center center';
      card.style.transform = 'translate(-50%, -50%)';
    });
  }

  // 마우스 휠 이벤트 설정
  setupEvents() {
    window.addEventListener('wheel', this.handleWheel.bind(this), {
      passive: false
    });
    // TODO: 나중에 터치 이벤트 추가
  }

  // 휠 이벤트 발생 시 targetIndex 업데이트
  handleWheel(e) {
    e.preventDefault();
    this.targetIndex += e.deltaY * 0.005;
  }

  // 매 프레임 실행되는 애니메이션 루프
  animate() {
    // 목표 인덱스(targetIndex)를 향해 현재 스크롤 진행률(scrollProgress) 부드럽게 이동
    this.scrollProgress += (this.targetIndex - this.scrollProgress) * 0.08;

    // 무한 루프 처리 (가장 안정적인 Codrops 방식)
    if (this.scrollProgress >= this.totalCards) {
      this.scrollProgress -= this.totalCards;
      this.targetIndex -= this.totalCards;
    }
    if (this.scrollProgress < 0) {
      this.scrollProgress += this.totalCards;
      this.targetIndex += this.totalCards;
    }

    // 현재 중앙 카드 인덱스 계산 (정수) - 메뉴 활성화용
    this.currentIndex = Math.round(this.scrollProgress + this.totalCards * 100) % this.totalCards;


    // 계산된 값으로 카드 상태 업데이트 (화면 그리기)
    this.updateCards();
    this.updateMenu(); // 메뉴 활성화 업데이트
    this.updateBackgroundColor(); // 배경색 업데이트

    // 다음 프레임 요청
    requestAnimationFrame(this.animate.bind(this));
  }

  // //수정: 'updateCards' (Y축 이동 로직 % 기반으로 복구)
  updateCards() {
    this.cards.forEach((card, index) => {
      // 현재 스크롤 위치(실수, jump 포함) 기준 상대 위치 계산
      let offset = index - this.scrollProgress;

      // 무한 루프 정규화 (-total/2 ~ +total/2 범위로)
      while (offset < -this.totalCards / 2) offset += this.totalCards;
      while (offset > this.totalCards / 2) offset -= this.totalCards;

      let scale = 1,
        yPercent = 0,
        blur = 0,
        opacity = 1,
        zIndex = 100,
        brightness = 1;
      const stackYMultiplier = 7; // //수정: 뒷 카드 세로 간격 (%) 복구 (7)
      const scaleMultiplier = 0.05; // 스케일 간격
      const incomingYStart = 100; // //수정: 올라오는 카드 시작 위치 (화면 완전 아래)


      // [0 ~ 3]: 현재 카드 및 미래 카드 (아래 스택)
      if (offset >= 0 && offset < 3) {
        scale = 1 - offset * scaleMultiplier;
        yPercent = offset * stackYMultiplier; // 0% -> 7% -> 14% (아래로 쌓임)
        blur = offset * 1.5;
        brightness = 1 - offset * 0.1;
        opacity = 1; // 항상 보임
        zIndex = 100 - Math.floor(offset * 10);
      }
      // [-1 ~ -3]: 이전 카드 (위 스택)
      else if (offset < 0 && offset > -3) {
        const absOffset = Math.abs(offset);
        scale = 1 - absOffset * scaleMultiplier;
        yPercent = offset * stackYMultiplier; // -7% -> -14% (위로 쌓임)
        blur = absOffset * 1.5;
        brightness = 1 - absOffset * 0.1;
        opacity = Math.max(0, 1 - (absOffset - 1) * 0.5); // [-1]만 보이고 나머지는 사라짐
        zIndex = 100 + Math.floor(offset * 10);
      }
      // 그 외 카드 (숨김)
      else {
        opacity = 0;
        zIndex = 0;
      }

      // //추가: 다음 카드가 아래에서 밀려 올라오는 애니메이션 로직
      if (offset >= 0 && offset < 1) {
        // offset 0 -> 1 로 갈 때 (현재 카드가 다음 카드로 바뀜)
        const progressLocal = 1 - offset; // 1 -> 0

        // [1] 다음 카드: 화면 아래(100%)에서 중앙(0%)으로 올라옴
        // //수정: Y축 이동을 '화면 아래'에서 '중앙'으로 보간
        const nextCardY = incomingYStart * offset; // 0% -> 100%

        // 현재 카드: 중앙(0%)에서 스택 위치(-7%)로 이동 (기존 로직 유지)

        // //수정: Y축 이동을 offset 기반이 아닌, 밀려 올라오는 느낌으로 보간
        if (offset > 0.001) { // 0번 카드일 때 (사라지는 카드)
          yPercent = -(offset) * stackYMultiplier; // 0 -> -7%
        }

        // 다음 카드 (Next Card, index + 1)의 애니메이션을 덮어씀
        if (index === Math.floor(this.scrollProgress) + 1) {
          yPercent = incomingYStart * (1 - progressLocal); // 100% -> 0%
          scale = 0.95 + progressLocal * 0.05; // 0.95 -> 1
          blur = 1.5 - progressLocal * 1.5; // 1.5 -> 0
          zIndex = 100;
        }
      }


      // 스타일 적용
      card.style.transform = `translate(-50%, calc(-50% + ${yPercent}%)) scale(${scale})`;
      card.style.filter = `blur(${blur}px) brightness(${brightness})`;
      card.style.opacity = opacity;
      card.style.zIndex = zIndex;
      card.style.pointerEvents = (Math.abs(offset) < 0.5) ? 'auto' : 'none';
      card.style.backgroundColor = '';
    });
  }

  // (updateMenu, updateBackgroundColor 함수는 변경 없음)
  updateMenu() {
    const activeDataIndex = this.cards[this.currentIndex].dataset.index;
    this.menuItems.forEach(item => {
      item.classList.toggle('active', item.dataset.index === activeDataIndex);
    });
  }
  updateBackgroundColor() {
    const currentCard = this.cards[this.currentIndex];
    const nextIndex = (this.currentIndex + 1 + this.totalCards) % this.totalCards;
    const nextCard = this.cards[nextIndex];
    const progress = (this.scrollProgress + this.totalCards) % 1;
    const baseColorRgb = [29, 30, 34];
    const mixAmount = 0.1;
    let bodyBgRgb = baseColorRgb;

    if (currentCard && nextCard) {
      const colorA = parseRgb(getComputedStyle(currentCard).backgroundColor);
      const colorB = parseRgb(getComputedStyle(nextCard).backgroundColor);
      const blendedCardColor = interpolateRgb(colorA, colorB, progress);
      bodyBgRgb = interpolateRgb(baseColorRgb, blendedCardColor, mixAmount);
      const newSolidColor = `rgb(${bodyBgRgb[0]}, ${bodyBgRgb[1]}, ${bodyBgRgb[2]})`;
      if (newSolidColor !== this.currentBgColor) {
        document.body.style.backgroundColor = newSolidColor;
        this.currentBgColor = newSolidColor;
      }
    } else if (currentCard) { // 예외 처리
      const colorA = parseRgb(getComputedStyle(currentCard).backgroundColor);
      bodyBgRgb = interpolateRgb(baseColorRgb, colorA, mixAmount);
      const newSolidColor = `rgb(${bodyBgRgb[0]}, ${bodyBgRgb[1]}, ${bodyBgRgb[2]})`;
      if (newSolidColor !== this.currentBgColor) {
        document.body.style.backgroundColor = newSolidColor;
        this.currentBgColor = newSolidColor;
      }
    }
  }
}

// (헬퍼 함수는 동일)
function parseRgb(rgbString) {
  const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  }
  return [29, 30, 34];
}

function interpolateRgb(colorA, colorB, progress) {
  const r = Math.round(colorA[0] + (colorB[0] - colorA[0]) * progress);
  const g = Math.round(colorA[1] + (colorB[1] - colorA[1]) * progress);
  const b = Math.round(colorA[2] + (colorB[2] - colorA[2]) * progress);
  return [r, g, b];
}

// (이미지 프리로드 후 초기화 - Lenis 관련 코드 없음)
const preloadImages = (selector = 'img') => {
  return new Promise((resolve) => {
    if (typeof imagesLoaded !== 'undefined') {
      imagesLoaded(document.querySelectorAll(selector), {
        background: true
      }, resolve);
    } else {
      resolve();
    }
  });
};
console.log('📄 스크립트 로드됨');
preloadImages('.content__img')
  .then(() => {
    console.log('🖼️ 이미지 로드 완료');
    document.body.classList.remove('loading');
    window.cardStack = new VirtualCardStack();
  })
  .catch((error) => {
    console.error('❌ 오류:', error);
    document.body.classList.remove('loading');
  });