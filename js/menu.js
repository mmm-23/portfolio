document.addEventListener('DOMContentLoaded', () => {

    window.isDetailViewOpen = false;

    const projectFileMapping = {
        '신한': 'menu/sinhan.html',
        '삼성': 'samsung.html',
        '배민': 'baemin.html',
        '머핀': 'muffin.html',
        '화장품': 'chicor.html'
    };

    const detailContainer = document.getElementById('projectDetailContainer');
    const scrollWrapper = document.getElementById('scrollWrapper');
    const projectOpenBtn = document.getElementById('projectOpen');
    const currentProjectDiv = document.getElementById('currentProject');
    // const cardSections = document.querySelectorAll('.card-section'); // No longer needed

    // function hideCardSections() { // No longer needed
    //     cardSections.forEach(card => {
    //         card.style.display = 'none';
    //     });
    // }

    // function showCardSections() { // No longer needed
    //     cardSections.forEach(card => {
    //         card.style.display = ''; // Revert to default display
    //     });
    // }

    function closeDetail() {
        window.isDetailViewOpen = false;
        scrollWrapper.style.display = 'block'; // Show scrollWrapper
        detailContainer.style.display = 'none';
        detailContainer.innerHTML = '';
        projectOpenBtn.innerHTML = '↗'; // Change back to open icon
    }

    function openDetail(projectTitleFromMenu = null) {
        if (!window.cardStack) {
            console.error('cardStack is not initialized yet.');
            return;
        }

        const isDetailOpen = detailContainer.style.display === 'block';
        if (isDetailOpen) {
            return; // Do nothing if detail is already open
        }

        let projectTitle;
        if (projectTitleFromMenu) {
            projectTitle = projectTitleFromMenu;
        } else {
            const currentIndex = window.cardStack.currentIndex;
            projectTitle = window.cardStack.centerTitles[currentIndex]?.value;
        }

        if (!projectTitle) {
            console.error('Could not find the title for the current project.');
            return;
        }

        const fileName = projectFileMapping[projectTitle];

        if (!fileName) {
            console.error(`No HTML file mapped for project: ${projectTitle}`);
            return;
        }

        fetch(fileName)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Could not load ${fileName}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(html => {
                window.isDetailViewOpen = true;
                scrollWrapper.style.display = 'none'; // Hide scrollWrapper
                detailContainer.innerHTML = html;
                detailContainer.style.display = 'block';
                projectOpenBtn.innerHTML = 'X'; // Change to close icon

                const backToMainBtn = document.getElementById('backToMain');
                if (backToMainBtn) {
                    backToMainBtn.addEventListener('click', closeDetail);
                }
            })
            .catch(error => {
                console.error('Error loading project detail:', error);
            });
    }

    // Toggle function for opening/closing detail
    function toggleDetail() {
        if (detailContainer.style.display === 'block') {
            closeDetail();
        } else {
            openDetail();
        }
    }

    // Make functions globally accessible
    window.openDetail = openDetail;
    window.toggleDetail = toggleDetail;

    // --- About Me Toggle Logic ---
    const aboutMeToggle = document.getElementById('aboutMeToggle');
    const aboutMeContainer = document.getElementById('aboutMeContainer');
    const aboutHomeBtn = document.getElementById('aboutHomeBtn');

    function openAboutMe() {
        aboutMeContainer.classList.add('active');
    }

    function closeAboutMe() {
        aboutMeContainer.classList.remove('active');
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

    // --- Side Menu Logic ---
    const menuToggle = document.getElementById('menuToggle');
    const sideMenuContainer = document.getElementById('sideMenuContainer');
    let isMenuGenerated = false;

    function generateGridMenu() {
        const projects = [
            { title: '신한', image: 'img/cover_1.jpg' },
            { title: '삼성', image: 'img/cover_2.jpg' },
            { title: '배민', image: 'img/cover_3.jpg' },
            { title: '머핀', image: 'img/cover_4.jpg' },
            { title: '화장품', image: 'img/cover_5.jpg' }
        ];

        const gridContainer = document.createElement('div');
        gridContainer.className = 'side-menu-grid';

        projects.forEach(project => {
            const item = document.createElement('div');
            item.className = 'menu-item-square';
            item.style.backgroundImage = `url(${project.image})`;

            const title = document.createElement('div');
            title.className = 'menu-item-title';
            title.textContent = project.title;

            item.appendChild(title);
            gridContainer.appendChild(item);

            item.addEventListener('click', () => {
                openDetail(project.title);
                toggleMenu(); // Close the side menu after opening detail
            });
        });

        return gridContainer;
    }

    function toggleMenu() {
        const isOpen = sideMenuContainer.classList.contains('open');

        if (isOpen) {
            sideMenuContainer.classList.remove('open');
        } else {
            if (!isMenuGenerated) {
                const menuContent = generateGridMenu();
                sideMenuContainer.innerHTML = ''; // Clear previous content
                sideMenuContainer.appendChild(menuContent);
                isMenuGenerated = true;
            }
            sideMenuContainer.classList.add('open');
        }
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }

    if (sideMenuContainer) {
        sideMenuContainer.addEventListener('click', function(e) {
            // Close menu if the click is on the container itself (the overlay)
            if (e.target === sideMenuContainer) {
                toggleMenu();
            }
        });
    }

});