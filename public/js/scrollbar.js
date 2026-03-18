/* ==========================================================================
   Custom Scrollbar Implementation
   ========================================================================== */

// 스크롤 진행 상태를 추적하여 무한 루프 감지
let lastRawProgress = 0;
let lastThumbPosition = 0;
let isWrapping = false;

/**
 * 커스텀 스크롤바 업데이트
 * @param {number} progress - 스크롤 진행도 (0-1)
 * @param {number|null} totalItems - 전체 아이템 수 (카드 스크롤용)
 * @param {boolean} didLoop - 루프 발생 여부
 */
function updateCustomScrollbar(progress, totalItems = null, didLoop = false) {
	const scrollbar = document.querySelector('.scrollbar');
	let thumb = document.querySelector('.scrollbar__thumb');
	if (!scrollbar) return;

	const scrollbarHeight = scrollbar.clientHeight;
	scrollbar.classList.add('visible');

	// 상세 페이지 스크롤 (0-1 범위)
	if (!totalItems) {
		if (!thumb) return;
		const thumbHeight = thumb.clientHeight;
		const maxThumbPosition = scrollbarHeight - thumbHeight;
		const thumbPosition = progress * maxThumbPosition;

		thumb.style.transform = `translateY(${thumbPosition}px)`;
		thumb.style.opacity = 1;
		return;
	}

	// 카드 스택 스크롤 (무한 루프 지원)
	let currentThumbHeight;
	const scrollWrapper = document.getElementById('scrollWrapper');

	if (scrollWrapper && scrollWrapper.scrollHeight > scrollWrapper.clientHeight) {
		currentThumbHeight = scrollbarHeight * (scrollWrapper.clientHeight / scrollWrapper.scrollHeight);
	} else {
		currentThumbHeight = scrollbarHeight / totalItems;
	}

	// 연속적인 thumb 위치 계산
	const rawThumbPosition = progress * scrollbarHeight;

	// 루프 감지 (아래→위, 위→아래)
	const wrappedForward = rawThumbPosition < lastRawProgress - scrollbarHeight * 0.5;
	const wrappedBackward = rawThumbPosition > lastRawProgress + scrollbarHeight * 0.5;
	lastRawProgress = rawThumbPosition;

	if (wrappedForward || wrappedBackward) {
		isWrapping = true;
	}

	let thumbPosition = rawThumbPosition % scrollbarHeight;

	// 아래로 스크롤하여 위에서 다시 나타날 때
	if (wrappedForward && thumb) {
		thumb.remove();

		thumb = document.createElement('div');
		thumb.className = 'scrollbar__thumb';
		scrollbar.appendChild(thumb);

		thumb.style.height = `${currentThumbHeight}px`;
		thumb.style.display = 'block';
		thumb.style.transform = `translateY(-${currentThumbHeight}px)`;
		thumb.style.opacity = 1;

		void thumb.offsetHeight;
	}

	// 위로 스크롤하여 아래에서 다시 나타날 때
	if (wrappedBackward && thumb) {
		thumb.remove();

		thumb = document.createElement('div');
		thumb.className = 'scrollbar__thumb';
		scrollbar.appendChild(thumb);

		thumb.style.height = `${currentThumbHeight}px`;
		thumb.style.display = 'block';
		thumb.style.transform = `translateY(${scrollbarHeight + currentThumbHeight}px)`;
		thumb.style.opacity = 1;

		void thumb.offsetHeight;
	}

	// Thumb이 없으면 생성
	if (!thumb) {
		thumb = document.createElement('div');
		thumb.className = 'scrollbar__thumb';
		thumb.style.height = `${currentThumbHeight}px`;
		thumb.style.display = 'block';
		thumb.style.transform = 'translateY(0px)';
		thumb.style.opacity = '1';
		scrollbar.appendChild(thumb);
	}

	thumb.style.height = `${currentThumbHeight}px`;
	thumb.style.display = 'block';

	// 스크롤 방향 감지
	const isMovingUp = thumbPosition < lastThumbPosition;
	const isMovingDown = thumbPosition > lastThumbPosition;

	// Fade 효과 계산
	let opacity = 1;

	// 매우 작은 값일 때는 무조건 보이도록 (두 번째 바퀴 이후에도 첫 카드가 보이도록)
	const safeZone = 10; // px

	if (thumbPosition >= safeZone && thumbPosition <= scrollbarHeight - currentThumbHeight - safeZone) {
		// 정상 범위에 있으면 wrapping 플래그 리셋
		isWrapping = false;
		opacity = 1;
	}
	// 아래로 스크롤 시 하단에서 페이드 아웃
	else if (isMovingDown && thumbPosition > scrollbarHeight - currentThumbHeight && thumbPosition <= scrollbarHeight) {
		const fadeProgress = (thumbPosition - (scrollbarHeight - currentThumbHeight)) / currentThumbHeight;
		opacity = 1 - fadeProgress;
	}
	// 위에서 나타날 때 페이드 인
	else if (thumbPosition < 0 && isWrapping) {
		const fadeProgress = (thumbPosition + currentThumbHeight) / currentThumbHeight;
		opacity = fadeProgress;
	}
	// 위로 스크롤 시 상단에서 페이드 아웃 (wrapping 중이고 safe zone 밖일 때만)
	else if (isMovingUp && thumbPosition < safeZone && thumbPosition >= 0 && isWrapping) {
		const fadeProgress = thumbPosition / safeZone;
		opacity = fadeProgress;
	}
	// 아래에서 나타날 때 페이드 인
	else if (thumbPosition > scrollbarHeight && isWrapping) {
		const fadeProgress = 1 - ((thumbPosition - scrollbarHeight) / currentThumbHeight);
		opacity = fadeProgress;
	}

	lastThumbPosition = thumbPosition;

	// Thumb 위치 및 투명도 적용
	thumb.style.transform = `translateY(${thumbPosition}px)`;
	thumb.style.opacity = Math.max(0, Math.min(1, opacity));
}

/**
 * 요소의 스크롤 이벤트 처리
 * @param {HTMLElement} element - 스크롤할 요소
 */
function handleScroll(element) {
	if (!element) {
		updateCustomScrollbar(0);
		return;
	}

	const scrollbar = document.querySelector('.scrollbar');
	if (!scrollbar) return;

	const scrollbarHeight = scrollbar.clientHeight;

	if (element.scrollHeight <= element.clientHeight) {
		updateCustomScrollbar(0);
		return;
	}

	const thumbHeight = scrollbarHeight * (element.clientHeight / element.scrollHeight);
	const thumb = document.querySelector('.scrollbar__thumb');
	if (thumb) {
		thumb.style.height = `${thumbHeight}px`;
	}

	const progress = element.scrollTop / (element.scrollHeight - element.clientHeight);
	updateCustomScrollbar(progress);
}
