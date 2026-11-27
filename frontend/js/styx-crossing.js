'use strict';

const crossing = document.querySelector('#crossing');
const coin = document.querySelector('#coin');
const rowboat = document.querySelector('#rowboat');
const skipButton = document.querySelector('#skip-crossing');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let finished = false;

function finishCrossing() {
    if (finished) return;
    finished = true;
    sessionStorage.setItem('crossed', 'true');
    document.body.classList.remove('locked');
    crossing.hidden = true;
    document.querySelector('#elysium').scrollIntoView({behavior: 'smooth'});
}

function payFerryman() {
    coin.disabled = true;
    coin.classList.add('paid');

    if (reducedMotion) {
        finishCrossing();
        return;
    }

    const startSailing = (event) => {
        if (event.propertyName !== 'left') return;
        coin.removeEventListener('transitionend', startSailing);
        rowboat.classList.add('sailing');
    };
    coin.addEventListener('transitionend', startSailing);
}

if (sessionStorage.getItem('crossed') === 'true') {
    crossing.hidden = true;
} else {
    document.body.classList.add('locked');
    coin.addEventListener('click', payFerryman);
    skipButton.addEventListener('click', finishCrossing);
    rowboat.addEventListener('transitionend', (event) => {
        if (event.propertyName === 'left') finishCrossing();
    });
}