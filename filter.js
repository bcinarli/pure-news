/**
 * cleaner.js
 **/

console.log('Filtering the news');

const current = window.location.href;

const filterable_links = [
    // general links
    'a[href*="/galeri-"]',
    'a[href*="/galeri/"]',
    'a[href*="/galeriler"]',
    'a[href*="/fotogaleri"]',
    'a[href*="/foto-galeri"]',
    'a[href*="/magazin-haberleri/"]',
    'a[href*="/magazin/"]',
    'a[href*="/video"]',
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

const hasSibling = el => (el.nextSibling != null || el.previousSibling != null);

const unwanted_news = document.querySelectorAll(filterable_links.join(','));
console.log('Total filtered news count: ', unwanted_news.length);
unwanted_news.forEach(link => {
    let parent = link.parentNode;

    if (parent.parentNode
        && isSingleLink(link)
        // dirty hack for milliyet's mega banner
        && !link.matches('a[href*="-skorergaleri"]')) {
        parent.parentNode.removeChild(parent);
    }
    else {
        parent.removeChild(link);
    }
});

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

updateCarousels(current);
