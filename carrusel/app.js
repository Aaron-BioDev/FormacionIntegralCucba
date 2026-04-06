document.addEventListener('DOMContentLoaded', () => {
    const slide = document.querySelector('.slide');
    const next = document.querySelector('.next');
    const prev = document.querySelector('.prev');
    const indicator = document.querySelector('.swipe-indicator');
    let isAnimating = false;

    const resetText = () => {
        const activeItem = document.querySelector('.item:nth-child(2)');
        if (!activeItem) return;
        const elements = activeItem.querySelectorAll('.name, .des, button');
        elements.forEach(el => {
            el.style.animation = 'none';
            el.offsetHeight; 
            el.style.animation = '';
        });
    };

    const move = (direction) => {
        if (isAnimating) return;
        isAnimating = true;

        const items = document.querySelectorAll('.item');
        
        if (direction === 'next') {
            slide.appendChild(items[0]);
        } else {
            slide.prepend(items[items.length - 1]);
        }

        resetText();
        if (indicator) indicator.style.opacity = '0';

        // Bloqueo de seguridad para que la animación termine suave
        setTimeout(() => {
            isAnimating = false;
        }, 600); 
    };

    if (next) next.onclick = () => move('next');
    if (prev) prev.onclick = () => move('prev');

    // Swipe para móviles
    let touchStartX = 0;
    slide.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    slide.addEventListener('touchend', e => {
        let diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? move('next') : move('prev');
        }
    }, { passive: true });
});