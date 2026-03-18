/* ==========================================================================
   Menu & Navigation Management
   ========================================================================== */

/* --------------------------------------------------------------------------
   Scroll Control Utilities
   -------------------------------------------------------------------------- */

/**
 * 스크롤 차단 핸들러
 * @param {Event} e - 이벤트 객체
 */
function preventScroll(e) {
	e.preventDefault();
}

/**
 * 키보드 인터랙션 차단 핸들러
 * @param {KeyboardEvent} e - 키보드 이벤트
 */
function preventKeydown(e) {
	const blockedKeys = [
		'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
		' ', 'Spacebar', 'Enter', 'PageUp', 'PageDown', 'Home', 'End', 'Tab'
	];
	if (blockedKeys.includes(e.key)) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
}

/**
 * 이벤트 차단 핸들러
 * @param {Event} e - 이벤트 객체
 */
function blockEvent(e) {
	e.stopPropagation();
	e.preventDefault();
}

/**
 * 카드 섹션 스크롤 차단
 * @param {boolean} enable - 차단 활성화 여부
 */
function blockCardSectionScroll(enable) {
	const scrollWrapper = document.querySelector('.scroll-wrapper');
	const cardSections = document.querySelectorAll('.card-section');
	const events = ['wheel', 'touchmove', 'scroll'];
	const action = enable ? 'addEventListener' : 'removeEventListener';

	if (scrollWrapper) {
		events.forEach(ev => scrollWrapper[action](ev, preventScroll, {
			passive: false
		}));
	}
	cardSections.forEach(section => {
		events.forEach(ev => section[action](ev, preventScroll, {
			passive: false
		}));
	});
}

/**
 * 카드 섹션 이벤트 차단
 * @param {boolean} block - 차단 활성화 여부
 */
function setCardSectionBlock(block) {
	const cardSections = document.querySelectorAll('.card-section');
	const action = block ? 'addEventListener' : 'removeEventListener';
	const eventOptions = {
		passive: false
	};

	cardSections.forEach(section => {
		section[action]('click', blockEvent, true);
		section[action]('wheel', blockEvent, eventOptions);
		section[action]('touchstart', blockEvent, eventOptions);
		section[action]('touchmove', blockEvent, eventOptions);
		section[action]('keydown', blockEvent, true);
	});
}

/* --------------------------------------------------------------------------
   Main Initialization
   -------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
	// 상태 변수
	window.isDetailViewOpen = false;
	let isTransitioning = false;
	let detailScrollHandler = null;
	let aboutMeScrollHandler = null;

	// 프로젝트 파일 매핑
	const projectFileMapping = {
		'신한 슈퍼 SOL': 'menu/sinhan.html',
		'Samsung Microfiber Filter': 'menu/samsung.html',
		'우아한형제들 채용 사이트': 'menu/baemin.html',
		'SK에너지 Muffin': 'menu/muffin.html',
		'신세계 Chicor': 'menu/chicor.html',
		'iloom': 'menu/iloom.html'
	};

	// DOM 요소 캐싱
	const detailContainer = document.getElementById('projectDetailContainer');
	const scrollWrapper = document.getElementById('scrollWrapper');
	const projectOpenBtn = document.getElementById('projectOpen');

	// 프로젝트 설정 매핑
	const projectConfig = {
		'sinhan': {
			id: 'sinhan',
			displayName: '신한 슈퍼 SOL',
			fileKey: '신한 슈퍼 SOL'
		},
		'samsung': {
			id: 'samsung',
			displayName: 'Samsung Microfiber Filter',
			fileKey: 'Samsung Microfiber Filter'
		},
		'baemin': {
			id: 'baemin',
			displayName: '우아한형제들 채용 사이트',
			fileKey: '우아한형제들 채용 사이트'
		},
		'muffin': {
			id: 'muffin',
			displayName: 'SK에너지 Muffin',
			fileKey: 'SK에너지 Muffin'
		},
		'chicor': {
			id: 'chicor',
			displayName: '신세계 Chicor',
			fileKey: '신세계 Chicor'
		},
		'iloom': {
			id: 'iloom',
			displayName: 'iloom',
			fileKey: 'iloom'
		}
	};
	window.projectConfig = projectConfig;

	/* --------------------------------------------------------------------------
	   Helper Functions (Zoom Effect) - [추가됨]
	   -------------------------------------------------------------------------- */

	/**
	 * 상세 페이지 이미지 스크롤 줌 효과 계산 함수
	 * @param {HTMLElement} container - 스크롤이 발생하는 컨테이너
	 */
	function updateImageScale(container) {
		// .img-frame 안에 있는 이미지만 선택
		const contentImages = container.querySelectorAll('.project-body .img-frame .project-image');

		if (contentImages.length === 0) return;

		const viewportHeight = window.innerHeight;

		contentImages.forEach(img => {
			// 이미지의 부모(액자) 위치 정보를 가져옴
			const rect = img.parentElement.getBoundingClientRect();

			// 이미지가 화면 안에 보일 때만 계산 (성능 최적화)
			if (rect.top < viewportHeight && rect.bottom > 0) {
				// 화면 아래쪽에서 올라올수록 1 -> 1.2배로 커짐
				// 속도 조절: 0.0002 값을 조절하세요 (예: 0.0005 = 더 빠름)
				const scale = 1 + ((viewportHeight - rect.top) * 0.0002);

				// 최소 1배 ~ 최대 1.2배로 제한
				const clampedScale = Math.min(Math.max(scale, 1), 1.2);

				img.style.transform = `scale(${clampedScale})`;
			}
		});
	}

	/* --------------------------------------------------------------------------
	   Project Detail Functions
	   -------------------------------------------------------------------------- */

	/**
	 * 프로젝트 상세 페이지 열기
	 * @param {string|null} projectTitleFromMenu - 메뉴에서 선택한 프로젝트 제목
	 */
	function openDetail(projectTitleFromMenu = null) {
		if (isTransitioning) return;

		// 프로젝트 상세페이지가 이미 열려있으면 내용만 교체
		if (window.isDetailViewOpen && projectTitleFromMenu) {
			switchDetailProject(projectTitleFromMenu);
			return;
		}

		if (window.isDetailViewOpen) return;
		if (window.isAboutMeOpen) closeAboutMe();

		isTransitioning = true;
		scrollWrapper.classList.add('fade-out');

		// 현재 카드에 bounce 애니메이션 추가
		const currentCard = window.cardStack.cards[window.cardStack.currentIndex];
		if (currentCard) {
			currentCard.classList.add('bounce-click');
			setTimeout(() => currentCard.classList.remove('bounce-click'), 600);
		}

		const projectTitle = projectTitleFromMenu || window.cardStack.centerTitles[window.cardStack.currentIndex]?.value;
		if (!projectTitle) {
			console.error('Could not find the title for the current project.');
			isTransitioning = false;
			return;
		}

		const config = projectConfig[projectTitle];
		if (!config) {
			console.error(`No configuration found for project title: ${projectTitle}`);
			isTransitioning = false;
			return;
		}

		const fileName = projectFileMapping[config.fileKey];
		if (!fileName) {
			console.error(`No HTML file mapped for project key: ${config.fileKey}`);
			isTransitioning = false;
			return;
		}

		projectOpenBtn.classList.add('is-active');

		fetch(fileName)
			.then(response => response.text())
			.then(html => {
				setTimeout(() => {
					document.body.classList.add('detail-is-open');

					// 배경 텍스트 처리
					const allTexts = document.querySelectorAll('.background-text-item');
					const currentIndex = window.cardStack.currentIndex;
					allTexts.forEach((text, index) => {
						if (index === currentIndex) {
							text.style.opacity = '1';
							text.style.color = '#D8D8D2';
						} else {
							text.style.opacity = '0';
						}
					});

					scrollWrapper.style.display = 'none';
					detailContainer.innerHTML = html;
					detailContainer.dataset.project = config.id;
					detailContainer.style.display = 'block';
					window.isDetailViewOpen = true;

					// 스크롤바 초기화 및 이벤트 연결 [수정됨]
					setTimeout(() => {
						detailContainer.scrollTop = 0;
						if (typeof handleScroll === 'function') handleScroll(detailContainer); // 기존 스크롤바 함수
						updateImageScale(detailContainer); // [추가] 초기 이미지 스케일 계산
					}, 0);

					// 스크롤 핸들러 설정 [수정됨]
					detailScrollHandler = () => {
						if (typeof handleScroll === 'function') handleScroll(detailContainer);
						updateImageScale(detailContainer); // [추가] 스크롤 시 이미지 줌 효과
					};
					detailContainer.addEventListener('scroll', detailScrollHandler);

					// 마스크 애니메이션
					const projectHeaderMask = detailContainer.querySelector('.project-header .project-mask');
					const projectBodies = detailContainer.querySelectorAll('.project-body');

					requestAnimationFrame(() => {
						projectBodies.forEach(body => body.classList.add('visible'));
						setTimeout(() => {
							if (projectHeaderMask) projectHeaderMask.classList.add('active');
						}, 100);
					});
				}, 550);
			})
			.catch(error => console.error('Error loading project detail:', error))
			.finally(() => {
				setTimeout(() => {
					isTransitioning = false;
				}, 1800);
			});
	}

	// [삭제됨] 이전에 여기에 있던 잘못된 위치의 코드는 삭제했습니다.

	/**
	 * 프로젝트 상세 페이지 전환 (이미 열려있을 때)
	 * @param {string} projectTitle - 전환할 프로젝트 제목
	 */
	function switchDetailProject(projectTitle) {
		if (isTransitioning || !window.isDetailViewOpen) return;

		isTransitioning = true;

		const config = projectConfig[projectTitle];
		if (!config) {
			console.error(`No configuration found for project title: ${projectTitle}`);
			isTransitioning = false;
			return;
		}

		const fileName = projectFileMapping[config.fileKey];
		if (!fileName) {
			console.error(`No HTML file mapped for project key: ${config.fileKey}`);
			isTransitioning = false;
			return;
		}

		// 페이드 아웃
		detailContainer.style.opacity = '0';
		detailContainer.style.transition = 'opacity 0.3s ease';

		fetch(fileName)
			.then(response => response.text())
			.then(html => {
				setTimeout(() => {
					// 내용 교체
					detailContainer.innerHTML = html;
					detailContainer.dataset.project = config.id;

					// 스크롤바 초기화 [수정됨]
					detailContainer.scrollTop = 0;
					if (typeof handleScroll === 'function') handleScroll(detailContainer);
					updateImageScale(detailContainer); // [추가] 새 프로젝트 이미지 스케일 초기화

					// 마스크 애니메이션
					const projectHeaderMask = detailContainer.querySelector('.project-header .project-mask');
					const projectBodies = detailContainer.querySelectorAll('.project-body');

					// 페이드 인
					detailContainer.style.opacity = '1';

					requestAnimationFrame(() => {
						projectBodies.forEach(body => body.classList.add('visible'));
						setTimeout(() => {
							if (projectHeaderMask) projectHeaderMask.classList.add('active');
						}, 100);
					});

					isTransitioning = false;
				}, 300);
			})
			.catch(error => {
				console.error('Error loading project detail:', error);
				isTransitioning = false;
			});
	}

	/**
	 * 프로젝트 상세 페이지 닫기
	 */
	function closeDetail() {
		if (isTransitioning || !window.isDetailViewOpen) return;

		if (detailScrollHandler) {
			detailContainer.removeEventListener('scroll', detailScrollHandler);
			detailScrollHandler = null;
		}

		isTransitioning = true;
		window.isDetailViewOpen = false;
		projectOpenBtn.classList.remove('is-active');

		const projectHeaderMask = detailContainer.querySelector('.project-header .project-mask');
		if (projectHeaderMask) {
			projectHeaderMask.classList.remove('active');
		}

		setTimeout(() => {
			document.body.classList.remove('detail-is-open');

			const allTexts = document.querySelectorAll('.background-text-item');
			allTexts.forEach(text => {
				text.style.opacity = '';
				text.style.color = '';
			});

			detailContainer.style.display = 'none';
			detailContainer.innerHTML = '';

			// 홈 복귀 애니메이션
			window.isReturningHome = true;
			const cards = document.querySelectorAll('.content--sticky');
			const currentIndex = window.cardStack ? window.cardStack.currentIndex : 0;

			cards[currentIndex].classList.add('bounce-in-home');

			cards.forEach((card, index) => {
				if (index !== currentIndex) {
					card.style.transform = 'translate(-50%, -50%) scale(1)';
					card.style.filter = 'blur(0px) brightness(1)';
					card.classList.add('fan-in-home');
				}
			});

			scrollWrapper.style.display = 'block';
			scrollWrapper.classList.remove('fade-out');

			requestAnimationFrame(() => {
				cards.forEach((card, index) => {
					if (index !== currentIndex) {
						let offset = index - currentIndex;
						const totalCards = cards.length;
						while (offset < -totalCards / 2) offset += totalCards;
						while (offset > totalCards / 2) offset -= totalCards;

						const absOffset = Math.abs(offset);
						const yPercent = offset * 8;
						const scale = 1 - absOffset * 0.05;
						const blur = absOffset * 1.5;
						const brightness = 1 - absOffset * 0.1;
						const zIndex = 100 - absOffset * 10;

						card.style.transform = `translate(-50%, calc(-50% + ${yPercent}%)) scale(${scale})`;
						card.style.filter = `blur(${blur}px) brightness(${brightness})`;
						card.style.zIndex = Math.round(zIndex);
						card.style.pointerEvents = (absOffset < 0.5) ? 'auto' : 'none';
						card.classList.add('visible');
					}
				});
			});

			setTimeout(() => {
				cards.forEach(card => {
					card.classList.remove('bounce-in-home', 'fan-in-home', 'visible');
				});
				window.isReturningHome = false;
			}, 1000);

			if (window.cardStack) {
				window.cardStack.updateBackgroundColor();
				const continuousProgress = window.cardStack.scrollProgress / window.cardStack.totalCards;
				if (typeof updateCustomScrollbar === 'function') updateCustomScrollbar(continuousProgress, window.cardStack.totalCards);
			}

			isTransitioning = false;
		}, 600);
	}

	/**
	 * 프로젝트 상세 페이지 토글
	 */
	function toggleDetail() {
		if (window.isDetailViewOpen) {
			closeDetail();
		} else {
			openDetail();
		}
	}

	window.openDetail = openDetail;
	window.toggleDetail = toggleDetail;

	/* --------------------------------------------------------------------------
	   Proxy Hover Effect
	   -------------------------------------------------------------------------- */

	const projectCenter = document.getElementById('currentProject');
	const allCardSections = document.querySelectorAll('.card-section');
	const hoverProxyElements = [projectCenter, ...allCardSections];

	hoverProxyElements.forEach(elem => {
		if (!elem) return;
		elem.addEventListener('mouseenter', () => {
			if (!projectOpenBtn.classList.contains('is-active')) {
				projectOpenBtn.classList.add('proxy-hover');
			}
		});
		elem.addEventListener('mouseleave', () => {
			projectOpenBtn.classList.remove('proxy-hover');
		});
	});

	/* --------------------------------------------------------------------------
	   About Me Functions
	   -------------------------------------------------------------------------- */

	const aboutMeToggle = document.getElementById('aboutMeToggle');
	const aboutMeContainer = document.getElementById('aboutMeContainer');
	const aboutHomeBtn = document.getElementById('aboutHomeBtn');
	const projectMenuList = document.querySelector('.project-menu-list');

	/**
	 * About Me 페이지 열기
	 */
	function openAboutMe() {
		if (window.isDetailViewOpen) closeDetail();

		window.isAboutMeOpen = true;
		aboutMeContainer.classList.add('active');
		document.body.classList.add('about-me-open');
		if (projectMenuList) projectMenuList.style.display = 'none';
		setCardSectionBlock(true);
		if (scrollWrapper) scrollWrapper.classList.add('no-scroll');

		const frameTitle = document.querySelector('.frame__title');
		if (frameTitle) frameTitle.classList.add('hide');
		blockCardSectionScroll(true);

		// About Me 스크롤바 초기화
		const aboutWapper = aboutMeContainer.querySelector('.aboutWapper');
		if (aboutWapper) {
			if (typeof updateCustomScrollbar === 'function') updateCustomScrollbar(0);

			aboutWapper.addEventListener('wheel', (e) => {
				e.stopPropagation();
			}, {
				passive: false,
				capture: true
			});

			// DOM 요소 캐싱
			const aboutImg1 = aboutMeContainer.querySelector('.about-img-1');
			const aboutImg2 = aboutMeContainer.querySelector('.about-img-2');
			let ticking = false;

			const aboutMeAnimationHandler = () => {
				if (!ticking) {
					requestAnimationFrame(() => {
						const scrollPosition = aboutWapper.scrollTop;
						const scrollHeight = aboutWapper.scrollHeight - aboutWapper.clientHeight;
						// scrollHeight가 0인 경우 (스크롤바가 없을 때) NaN 방지
						const scrollPercentage = scrollHeight > 0 ? (scrollPosition / scrollHeight) * 100 : 0;

						// 1. 이미지 전환 로직
						if (aboutImg1 && aboutImg2) {
							// 스크롤이 10% 이상 내려가면 이미지를 슬라이드하여 교체
							if (scrollPercentage > 10) {
								aboutImg1.style.transform = 'translateY(-100%)';
								aboutImg2.style.transform = 'translateY(0)';
							} else {
								// 스크롤을 다시 올리면 원래 이미지로 복귀
								aboutImg1.style.transform = 'translateY(0)';
								aboutImg2.style.transform = 'translateY(100%)';
							}
						}

						// 2. 스크롤바 업데이트
						if (typeof handleScroll === 'function') handleScroll(aboutWapper);

						ticking = false;
					});
					ticking = true;
				}
			};
			aboutMeScrollHandler = aboutMeAnimationHandler;
			aboutWapper.addEventListener('scroll', aboutMeScrollHandler);
		}
	}

	/**
	 * About Me 페이지 닫기
	 */
	function closeAboutMe() {
		window.isAboutMeOpen = false;

		// active 제거하고 closing 추가 - 닫히는 애니메이션 시작하면서 레이아웃 유지
		aboutMeContainer.classList.remove('active');
		aboutMeContainer.classList.add('closing');
		document.body.classList.remove('about-me-open');
		document.body.classList.add('about-me-closing');

		const frameTitle = document.querySelector('.frame__title');
		if (frameTitle) frameTitle.classList.remove('hide');

		// 애니메이션 완료 후 실행 (800ms - about-content의 transform transition 시간)
		setTimeout(() => {
			aboutMeContainer.classList.remove('closing');
			document.body.classList.remove('about-me-closing');

			// 스크롤 관련 클래스 및 제약 해제
			if (projectMenuList) projectMenuList.style.display = '';
			setCardSectionBlock(false);
			document.body.classList.remove('no-scroll');
			document.documentElement.classList.remove('no-scroll');
			if (scrollWrapper) scrollWrapper.classList.remove('no-scroll');
			blockCardSectionScroll(false);

			// 스크롤 핸들러 정리
			const aboutWapper = aboutMeContainer.querySelector('.aboutWapper');
			if (aboutWapper && aboutMeScrollHandler) {
				aboutWapper.removeEventListener('scroll', aboutMeScrollHandler);
				aboutMeScrollHandler = null;
				aboutWapper.scrollTop = 0;
			}

			const contactSection = aboutMeContainer.querySelector('.about-content.about-contact');
			if (contactSection) {
				contactSection.style.transform = 'translateY(0)';
			}

			if (window.cardStack) {
				window.cardStack.updateBackgroundColor();
				const continuousProgress = window.cardStack.scrollProgress / window.cardStack.totalCards;
				if (typeof updateCustomScrollbar === 'function') updateCustomScrollbar(continuousProgress, window.cardStack.totalCards);
			}
		}, 800);
	}

	if (aboutMeToggle) {
		aboutMeToggle.addEventListener('click', (e) => {
			e.preventDefault();
			openAboutMe();
		});
	}

	if (aboutHomeBtn) {
		aboutHomeBtn.addEventListener('click', (e) => {
			e.preventDefault();
			closeAboutMe();
		});
	}

	/* --------------------------------------------------------------------------
	   Side Menu Functions
	   -------------------------------------------------------------------------- */

	const sideMenuContainer = document.getElementById('sideMenuContainer');
	const menuToggleBtn = document.getElementById('menuToggle');
	let isMenuGenerated = false;

	/**
	 * 사이드 메뉴 그리드 생성
	 */
	function generateGridMenu() {
		const projects = [{
				title: 'sinhan',
				image: '../assets/img/cover_1.jpg'
			},
			{
				title: 'samsung',
				image: '../assets/img/cover_2.jpg'
			},
			{
				title: 'baemin',
				image: '../assets/img/cover_3.jpg'
			},
			{
				title: 'muffin',
				image: '../assets/img/cover_4.jpg'
			},
			{
				title: 'chicor',
				image: '../assets/img/cover_5.jpg'
			},
			{
				title: 'iloom',
				image: '../assets/img/cover_6.jpg'
			}
		];

		const gridContainer = document.createElement('div');
		gridContainer.className = 'side-menu-grid';

		projects.forEach(project => {
			const wrapper = document.createElement('div');
			wrapper.className = 'menu-item-wrapper';

			const item = document.createElement('div');
			item.className = 'menu-item-square';
			item.style.backgroundImage = `url(${project.image})`;
			item.setAttribute('data-project-title', project.title);

			const title = document.createElement('div');
			title.className = 'menu-item-title';
			title.textContent = project.title;

			wrapper.appendChild(item);
			wrapper.appendChild(title);
			gridContainer.appendChild(wrapper);

			wrapper.addEventListener('click', () => {
				openDetail(project.title);
				toggleMenu();
			});
		});

		return gridContainer;
	}

	/**
	 * 사이드 메뉴 토글
	 */
	function toggleMenu() {
		const isOpen = sideMenuContainer.classList.contains('open');

		if (isOpen) {
			sideMenuContainer.classList.remove('open');
			menuToggleBtn.classList.remove('is-active');
		} else {
			if (!isMenuGenerated) {
				const menuContent = generateGridMenu();
				sideMenuContainer.innerHTML = '';
				sideMenuContainer.appendChild(menuContent);
				isMenuGenerated = true;
			}
			sideMenuContainer.classList.add('open');
			menuToggleBtn.classList.add('is-active');
		}
	}

	/* --------------------------------------------------------------------------
	   Global Event Listener
	   -------------------------------------------------------------------------- */

	document.addEventListener('click', function (e) {
		const target = e.target;

		// 사이드 메뉴 토글
		if (target.closest('#menuToggle')) {
			e.preventDefault();
			toggleMenu();
			return;
		}

		// 프로젝트 상세 토글
		if (target.closest('#projectOpen')) {
			e.preventDefault();
			toggleDetail();
			return;
		}

		// 프로젝트 상세 열기
		if ((target.closest('#currentProject') || target.closest('.card-section')) && !window.isDetailViewOpen) {
			e.preventDefault();
			openDetail();
			return;
		}

		// 프로젝트 상세 닫기
		if (target.closest('#closeDetail') || target.closest('#backToMain')) {
			e.preventDefault();
			closeDetail();
			return;
		}

		// 사이드 메뉴 오버레이 클릭
		if (target === document.getElementById('sideMenuContainer')) {
			toggleMenu();
			return;
		}
	});
});