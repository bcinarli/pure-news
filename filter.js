/**
 * cleaner.js
 **/

const current = window.location.href;
let isDisabledForThisPage = false;
let areVideosFiltered = false;

chrome.storage.sync.get('alsoFilterVideos', result => {
    areVideosFiltered = result.alsoFilterVideos || false;
});

chrome.storage.sync.get('disablePureNewsForThisPage', result => {
    isDisabledForThisPage = result.disablePureNewsForThisPage || false;

    if (!isDisabledForThisPage) {
        start_filters();
    }
});

const filterable_links = [
    // general links
    'a[href*="/galeri-"]',
    'a[href*="/galeri/"]',
    'a[href*="/galeriler"]',
    'a[href*="/fotogaleri"]',
    'a[href*="/foto-galeri"]',
    'a[href*="/magazin-haberleri/"]',
    'a[href*="/magazin/"]',
    //news from hurriyet.com.tr
    'a[href*="/kelebek/"]',
    // news from posta.com.tr
    'a[href*="haber-foto"]',
    'div[class*="magazine-container"]',
    // news from sozcu.com.tr
    'a[href*="bit.ly"]',
    // news from milliyet.com.tr
    'a[href*="-skorergaleri"]'
];

const carousels = {
    swiper: ['hurriyet.com.tr', 'posta.com.tr', 'sozcu.com.tr'],
    slick: ['sabah.com.tr']
};

const isSingleLink = link => {
    let isSingleLink = false;

    if (link.nodeType === 1 && link.nodeName.toLowerCase() === 'a') {
        isSingleLink = true;
    }

    return isSingleLink;
};

const updateNotifications = notifications => {
    console.log(chrome.browserAction);
    chrome.browserAction.setBadgeText({text: notifications || ''});
    console.log(notifications);
};

const start_filters = () => {
    console.log('Filtering the news');

    if(areVideosFiltered) {
        filterable_links.push('a[href*="/video/"]');
        filterable_links.push('a[href*="video-"]');
    }

    const unwanted_news = document.querySelectorAll(filterable_links.join(','));
    unwanted_news.forEach(link => {
        let parent = link.parentNode;

        if (parent.parentNode
            && isSingleLink(link)
            // dirty hack for milliyet's mega banner
            && (!link.matches('a[href*="-skorergaleri"]') && !current.includes('ntv.com.tr'))) {
            parent.parentNode.removeChild(parent);
        }
        else {
            parent.removeChild(link);
        }
    });
    console.log('Total filtered news count: ', unwanted_news.length);
    //updateNotifications(unwanted_news.length);
    updateCarousels(current);
};

const whichCarousel = page => {
    let theCarousel = null;

    Object.keys(carousels).forEach(carousel => {
        carousels[carousel].forEach(site => {
            if (page.includes(site)) {
                theCarousel = carousel;
            }
        })
    });

    return theCarousel;
};

const carouselScriptTemplates = {
    swiper: `
        const swipers = document.querySelectorAll('.slider-wrapper');
        swipers.forEach(swiper => {
            let slider = swiper.dataset.sliderName;
            if (window[slider]) {
                window[slider].update();
            }
        });
    `,
    slick: `
        const slicks = document.querySelectorAll('.slick-slider');
        slicks.forEach(slick => {
            let slider = slick.slick;
            let options = slider.options;
            let updatedSlides = [];
            
            for(slide of slider.$slides){
                if(document.body.contains(slide)){
                    updatedSlides.push(slide);
                }
            }
            
            slider.$slides = jQuery(updatedSlides);            
            jQuery(slick).slick('unslick').slick(options);
        });
    `
};

const carouselScript = carousel => {
    const s = document.createElement('script');
    s.textContent = carouselScriptTemplates[carousel];
    document.body.appendChild(s);
};

const updateCarousels = (page) => {
    let carousel = whichCarousel(page);
    carouselScript(carousel);
};
