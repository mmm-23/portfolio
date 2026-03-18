const components = {
    header: (type) => {
        const isWhite = type === 'white';
        const headerClass = isWhite ? 'header-w' : '';
        const logoSrc = isWhite ? 'assets/logo-w.svg' : 'assets/logo.svg';
        
        return `
        <header class="${headerClass}">
            <div class="header-warp">
                <div class="logo"> <a href="../iloom/index.html"><img src="${logoSrc}" alt="iloom 로고"></a> </div>
                <aside>
                    <nav>
                        <ul>
                            <li><a href="../iloom/about.html"><span>About</span></a></li>
                            <li><a href="category.html"><span>Category</span></a></li>
                            <li><a href="magazine.html"><span>Magazine</span></a></li>
                            <li><a href="careers.html"><span>Careers</span></a></li>
                        </ul>
                    </nav>
                    <div class="lang"> <a href="#">KR</a> </div>
                </aside>
            </div>
        </header>
        `;
    },
    footer: () => {
        return `
        <footer class="footer">
            <div class="ft-waper">
                <div class="logo"> <img src="assets/logo-w.svg" alt="iloom 로고"> </div>
                <aside>
                    <div class="copy">
                        <p>(주)일룸</br>서울특별시 송파구 오금로 311 (오금동) 퍼시스 서울본사</br>사업자등록번호 :
                            215-86-93600&nbsp;&nbsp;통신판매업신고 :
                            2009-서울송파-0069호&nbsp;&nbsp;부가통신사업신고필증 : 021129</br>311, Ogeum-ro, Songpa-gu, Seoul, Republic of Korea</p>
                        <p>COPYRIGHT (c) 2025 iloom lnc.</br>All rights reserved</p>
                    </div>
                    <div class="out-link"> <a href="#">청렴위반신고</a> <a href="#">전자조달시스템</a> </div>
                </aside>
            </div>
            <div class="footer-bg"></div>
        </footer>
        `;
    }
};

function loadHeader(type = 'default') {
    const headerContainer = document.getElementById('header-placeholder');
    if (headerContainer) {
        headerContainer.innerHTML = components.header(type);

        // 현재 페이지에 맞는 메뉴에 active 클래스 추가
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
        const menuItems = headerContainer.querySelectorAll('nav a');

        menuItems.forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
                const pageName = href.split('/').pop().replace('.html', '');

                // 현재 페이지와 메뉴 항목이 일치하면 active 클래스 추가
                if (currentPage === pageName ||
                    (currentPage === 'index' && pageName === 'index') ||
                    (currentPage === '' && pageName === 'index')) {
                    link.classList.add('active');
                }
            }
        });
    }
}

function loadFooter() {
    const footerContainer = document.getElementById('footer-placeholder');
    if (footerContainer) {
        footerContainer.innerHTML = components.footer();
    }
}
