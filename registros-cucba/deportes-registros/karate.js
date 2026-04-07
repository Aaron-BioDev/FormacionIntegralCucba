const container = document.querySelector('.slides-container');
const slides = document.querySelectorAll('.slide');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let index = 0;
const totalSlides = slides.length;

// Función para mover el carrusel
function moveCarousel(direction) {
    if (direction === 'next') {
        index = (index + 1) % totalSlides; // Si llega al final, vuelve al inicio
    } else {
        index = (index - 1 + totalSlides) % totalSlides; // Si llega al inicio, va al final
    }
    
    const scrollAmount = container.clientWidth * index;
    container.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
    });
}

// Eventos de botones
nextBtn.addEventListener('click', () => {
    moveCarousel('next');
    stopAutoPlay(); // Detiene el auto-movimiento si el usuario interactúa
});

prevBtn.addEventListener('click', () => {
    moveCarousel('prev');
    stopAutoPlay();
});

// MOVIMIENTO AUTOMÁTICO (Cada 5 segundos)
let autoPlay = setInterval(() => {
    moveCarousel('next');
}, 5000);

function stopAutoPlay() {
    clearInterval(autoPlay);
}

// Pausar si el mouse está encima
container.addEventListener('mouseenter', stopAutoPlay);
container.addEventListener('mouseleave', () => {
    autoPlay = setInterval(() => moveCarousel('next'), 5000);
});