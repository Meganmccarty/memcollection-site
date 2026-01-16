export function setActiveImage(thumbnail: Element) {
    const activeImage = document.querySelector('.active-image img');
    const activeImageCaption = document.querySelector('.active-image figcaption');
    const image = thumbnail.querySelector('img');

    const src = image?.getAttribute('src');
    const alt = image?.getAttribute('alt');
    const classes = image?.getAttribute('class');
    const caption = image?.getAttribute('data-desc');

    if (src) {
        activeImage?.setAttribute('src', src);
    }
    if (alt) {
        activeImage?.setAttribute('alt', alt);
    }

    if (classes) {
        activeImage?.setAttribute('class', classes);
    }

    if (caption && activeImageCaption) {
        activeImageCaption.innerHTML = caption;
    }
}

export function setActiveImageClass(thumbnails: NodeListOf<Element>, activeThumbnail: Element) {
    thumbnails.forEach((thumbnail) => {
        const img = thumbnail.querySelector('img');
        img?.classList.remove('active');
    });

    const img = activeThumbnail.querySelector('img');
    img?.classList.add('active');
}

export function triggerFadeAnimation(activeImage: Element) {
    activeImage.classList.remove('fade-in');
    if (activeImage instanceof HTMLElement) {
        /* eslint-disable @typescript-eslint/no-unused-expressions */
        activeImage.offsetWidth;
    }
    activeImage.classList.add('fade-in');
}

document.addEventListener('DOMContentLoaded', () => {
    const activeImage = document.querySelector('.active-image');
    // const closeBtn = document.querySelector('dialog button');
    const thumbnailBtns = document.querySelectorAll('.image-thumbnails > button');

    // activeImage?.addEventListener('click', (e) => {
    //     const [dialog] = document.getElementsByTagName('dialog');
    //     if (e.target instanceof Element) {
    //         const parent = e.target.parentElement?.cloneNode(true);
    //         const figure = closeBtn?.nextElementSibling;
    //         parent && figure ? figure.appendChild(parent) : null;
    //         dialog.show();
    //     }
    // });

    // closeBtn?.addEventListener('click', () => {
    //     if (closeBtn.parentElement instanceof HTMLDialogElement) {
    //         const dialog = closeBtn.parentElement;
    //         const figureBtn = closeBtn.nextElementSibling;

    //         figureBtn?.addEventListener('click', () => {
    //             const image = figureBtn.querySelector('img');
    //             image?.classList.toggle('zoom-in');
    //         })

    //         dialog.close();

    //         if (figureBtn) {
    //             const figure = figureBtn.querySelector('figure');
    //             figure ? figureBtn.removeChild(figure) : null;
    //         }
    //     }
    // })

    thumbnailBtns.forEach((thumbnail) => {
        thumbnail.addEventListener('click', () => {
            setActiveImage(thumbnail);
            setActiveImageClass(thumbnailBtns, thumbnail);
            if (activeImage) {
                triggerFadeAnimation(activeImage);
            }
        });
    });
});
