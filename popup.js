/**
 * popup
 **/

const manifest = chrome.runtime.getManifest();
const sites = manifest.content_scripts[0].matches;
let isDisabledForThisPage = false;
let currentURL = '';
let isSupported = false;

chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    currentURL = tabs[0].url;
    updateView(currentURL);
});

const updateView = (url) => {
    showSupportedOptions(url);
    showActiveOption(url);
    checkboxActions();
};

const showActiveOption = (url) => {
    let currentSite = document.querySelector('.current-site');
    currentSite.innerHTML = url;
};

const showSupportedOptions = url => {
    const supportedSitesContainer = document.querySelector('.supported-sites');
    const unsupportedSitesContainer = document.querySelector('.unsupported-sites');

    let supportedSite = sites.filter(site => site.includes(url));

    if (supportedSite.length > 0) {
        isSupported = true;
        unsupportedSitesContainer.style.display = 'none';
    }
    else {
        supportedSitesContainer.style.display = 'none';
    }
};

const checkboxActions = () => {
    updateActiveCheckbox();
    updateVideoCheckbox();
    bindActions();
};

const updateActiveCheckbox = () => {
    let activateFilter = document.querySelector('#activate-filter');

    chrome.storage.sync.get(['disablePureNewsForThisPage'], result => {
        isDisabledForThisPage = result.disablePureNewsForThisPage || false;
        activateFilter.checked = !isDisabledForThisPage;
        console.log(activateFilter.checked);
    });
};

const updateVideoCheckbox = () => {
    let videoFilter = document.querySelector('#video-filter');

    chrome.storage.sync.get(['alsoFilterVideos'], result => {
        areVideosFiltered = result.alsoFilterVideos || false;
        videoFilter.checked = areVideosFiltered;
        console.log(videoFilter.checked);
    });
};

const bindActions = () => {
    let activateFilter = document.querySelector('#activate-filter');
    let videoFilter = document.querySelector('#video-filter');

    activateFilter.addEventListener('change', () => {
        let newOption = !activateFilter.checked;
        updateStorage('disablePureNewsForThisPage', newOption);
    });

    videoFilter.addEventListener('change', () => {
        let newOption = videoFilter.checked;
        updateStorage('alsoFilterVideos', newOption);
    });
};

const updateStorage = (name, value) => {
    chrome.storage.sync.set({[name]: value}, () => {
        console.log(`New option saved: "${name}"`, value);
        document.querySelector('.help-desc').classList.remove('is-hidden');
    });
};