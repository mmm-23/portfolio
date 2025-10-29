class VirtualCardStack {
  constructor() {
    this.cards = Array.from(document.querySelectorAll('.content--sticky'));
    this.totalCards = this.cards.length;
    this.menuItems = Array.from(document.querySelectorAll('.project-menu-list__item'));
    this.backgroundTexts = Array.from(document.querySelectorAll('.background-text-item'));

    this.currentIndex = 0;
    this.targetIndex = 0;
    this.scrollProgress = 0;

    this.textOffsets = [];
    this.marqueeSpeed = 0.5; // px/frame
    this.brightnessFactor = 0.8;
    this.currentBgColor = null;

    this.init();
  }

  init() {
    this.initializeCards();
    this.setupEvents();
    this.setupBackgroundText();
    this.updateCards();
    this.updateMenu();
    this.updateBackgroundColor();
    this.animate();
  }

  initializeCards() {
    this.cards.forEach(card => {
      card.style.position = 'fixed';
      card.style.top = '50%';
      card.style.left = '50%';
      card.style.width = '30vw';
      card.style.height = '30vw';
      card.style.maxWidth = '50vw';
      card.style.maxHeight = '50vw';
      card.style.transformOrigin = 'center center';
      card.style.transform = 'translate(-50%, -50%)';
    });

    const firstCard = this.cards[0];
    if (firstCard) {
      this.currentBgColor = getComputedStyle(firstCard).backgroundColor;
      document.body.style.backgroundColor = this.currentBgColor;
    }
  }

  setupEvents() {
    let lastWheel = 0;
    const cooldown = 180;

    window.addEventListener('wheel', e => {
      e.preventDefault();
      const now = performance.now();
      if (now - lastWheel < cooldown) return;
      lastWheel = now;

      const direction = Math.sign(e.deltaY);
      this.targetIndex += direction;
    }, {
      passive: false
    });

    this.menuItems.forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        const idx = parseInt(item.dataset.index);
        if (!isNaN(idx)) this.scrollToIndex(idx);
      });
    });
  }

  scrollToIndex(idx) {
    this.targetIndex = idx;
  }

  animate() {
    this.scrollProgress += (this.targetIndex - this.scrollProgress) * 0.08;

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
    this.updateBackgroundText();

    requestAnimationFrame(this.animate.bind(this));
  }

  updateCards() {
    this.cards.forEach((card, index) => {
      let offset = index - this.scrollProgress;
      while (offset < -this.totalCards / 2) offset += this.totalCards;
      while (offset > this.totalCards / 2) offset -= this.totalCards;

      let scale = 1,
        yPercent = 0,
        blur = 0,
        opacity = 1,
        zIndex = 100,
        brightness = 1;
      const stackYMultiplier = 7;
      const scaleMultiplier = 0.05;
      const incomingYStart = 100;

      if (offset >= 0 && offset < 3) {
        scale = 1 - offset * scaleMultiplier;
        yPercent = offset * stackYMultiplier;
        blur = offset * 1.5;
        brightness = 1 - offset * 0.1;
        zIndex = 100 - Math.floor(offset * 10);
      } else if (offset < 0 && offset > -3) {
        const absOffset = Math.abs(offset);
        scale = 1 - absOffset * scaleMultiplier;
        yPercent = offset * stackYMultiplier;
        blur = absOffset * 1.5;
        brightness = 1 - absOffset * 0.1;
        opacity = Math.max(0, 1 - (absOffset - 1) * 0.5);
        zIndex = 100 + Math.floor(offset * 10);
      } else {
        opacity = 0;
        zIndex = 0;
      }

      // 카드 등장 애니메이션 (아래 → 위)
      if (offset >= 0 && offset < 1) {
        const progressLocal = 1 - offset;
        if (index === Math.floor(this.scrollProgress) + 1 || (this.currentIndex === 0 && index === 0)) {
          yPercent = incomingYStart * (1 - progressLocal);
          scale = 0.95 + progressLocal * 0.05;
          blur = 1.5 - progressLocal * 1.5;
          zIndex = 100;
        }

      }

      card.style.transform = `translate(-50%, calc(-50% + ${yPercent}%)) scale(${scale})`;
      card.style.filter = `blur(${blur}px) brightness(${brightness})`;
      card.style.opacity = opacity;
      card.style.zIndex = zIndex;
      card.style.pointerEvents = (Math.abs(offset) < 0.5) ? 'auto' : 'none';
    });
  }

  updateMenu() {
    const activeDataIndex = this.cards[this.currentIndex]?.dataset.index;
    this.menuItems.forEach(item => {
      item.classList.toggle('active', item.dataset.index === activeDataIndex);
    });
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
preloadImages('.content__img')
  .then(() => {
    document.body.classList.remove('loading');
    window.cardStack = new VirtualCardStack();
  })
  .catch(err => {
    console.error(err);
    document.body.classList.remove('loading');
  });
