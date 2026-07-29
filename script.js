document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. CANVAS: Fondo Global Cyberpunk
    // ==========================================
    const canvas = document.getElementById('cyber-canvas');
    const ctx = canvas.getContext('2d', { alpha: true });

    let width, height;
    let particles = [];
    let mouse = { x: null, y: null, radius: 130 };
    const colors = ['#A855F7', '#EC4899', '#3B82F6', '#8B5CF6']; 
    let scrollSpeedModifier = 1;
    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
        let st = window.pageYOffset || document.documentElement.scrollTop;
        let delta = Math.abs(st - lastScrollTop);
        scrollSpeedModifier = 1 + Math.min(delta * 0.05, 3);
        lastScrollTop = st <= 0 ? 0 : st;
    });

    setInterval(() => {
        if (scrollSpeedModifier > 1) {
            scrollSpeedModifier -= 0.1;
            if (scrollSpeedModifier < 1) scrollSpeedModifier = 1;
        }
    }, 100);

    function initCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        particles = [];
        const particleCount = width < 768 ? 45 : 100;
        
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 1;
            this.baseSpeed = Math.random() * 0.8 + 0.3;
            this.density = (Math.random() * 25) + 1;
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
        update() {
            this.y += this.baseSpeed * scrollSpeedModifier;
            if (this.y > height) {
                this.y = 0;
                this.x = Math.random() * width;
            }
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                let force = (mouse.radius - distance) / mouse.radius;
                this.x -= (dx / distance) * force * this.density;
                this.y -= (dy / distance) * force * this.density;
            }
        }
    }

    function connectParticles() {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let dx = particles[a].x - particles[b].x;
                let dy = particles[a].y - particles[b].y;
                let distance = dx * dx + dy * dy;
                let maxDist = (width / 11) * (width / 11);
                
                if (distance < maxDist) {
                    let opacity = 1 - (distance / maxDist);
                    ctx.strokeStyle = `rgba(168, 85, 247, ${opacity * 0.15})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        connectParticles();
        requestAnimationFrame(animate);
    }

    window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; });
    window.addEventListener('mouseout', () => { mouse.x = undefined; mouse.y = undefined; });
    
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(initCanvas, 200);
    });

    initCanvas();
    animate();

    // ==========================================
    // 2. GSAP: ANIMACIÓN HERO & CARRUSEL DE SERVICIOS
    // ==========================================
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Animación de entrada Hero
    if (!isReducedMotion) {
        gsap.timeline()
            .from(".tagline", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.2 })
            .from("h1", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
            .from("h2", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
            .from(".hero-description", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
            .from(".cta-group", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.6");
    }

    // ==========================================
    // LÓGICA DE CARRUSELES MULTIPLES (FACTORY)
    // ==========================================
    
    function initCarousel(module) {
        const track = module.querySelector('.carousel-track');
        const slides = module.querySelectorAll('.carousel-slide');
        const prevBtn = module.querySelector('.prev-btn');
        const nextBtn = module.querySelector('.next-btn');
        const viewport = module.querySelector('.carousel-viewport');
        const dotsContainer = module.querySelector('.carousel-dots');
        
        if (!track || slides.length === 0) return;

        // ESTADO LOCAL: Cada carrusel tiene sus propias variables
        let currentIndex = 0;
        let isAnimating = false;
        let autoPlayInterval = null;
        const delay = 4000;

        // 1. Configuración inicial de tarjetas inactivas (Profundidad GSAP)
        if (!isReducedMotion) {
            slides.forEach((slide, i) => {
                if (i !== 0) {
                    gsap.set(slide.querySelector('.service-card-content'), { scale: 0.85, opacity: 0.4 });
                }
            });
        }

        // 2. Generación dinámica de Dots
        if (dotsContainer) {
            dotsContainer.innerHTML = ''; // Limpiar por si acaso
            slides.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.classList.add('dot');
                if (i === 0) dot.classList.add('active');
                dot.setAttribute('aria-label', `Ir a diapositiva ${i + 1}`);
                dot.addEventListener('click', () => {
                    if (currentIndex !== i) {
                        goToSlide(i);
                        resetAutoPlay();
                    }
                });
                dotsContainer.appendChild(dot);
            });
        }

        function updateDots() {
            if (!dotsContainer) return;
            const dots = dotsContainer.querySelectorAll('.dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
        }

        // 3. Función principal de animación
        function goToSlide(index) {
            if (isAnimating) return;
            isAnimating = true;

            // Lógica circular
            if (index < 0) {
                currentIndex = slides.length - 1;
            } else if (index >= slides.length) {
                currentIndex = 0;
            } else {
                currentIndex = index;
            }

            updateDots();

            // Desplazamiento del track (-100% de su ancho real por índice)
            const targetXPercent = -100 * currentIndex;

            gsap.to(track, {
                xPercent: targetXPercent,
                duration: isReducedMotion ? 0 : 0.8,
                ease: "power3.inOut",
                onComplete: () => { isAnimating = false; }
            });

            // Transición de profundidad para las tarjetas
            if (!isReducedMotion) {
                slides.forEach((slide, i) => {
                    const card = slide.querySelector('.service-card-content');
                    if (i === currentIndex) {
                        gsap.to(card, { scale: 1, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.1 });
                    } else {
                        gsap.to(card, { scale: 0.85, opacity: 0.4, duration: 0.8, ease: "power3.out" });
                    }
                });
            }
        }

        function nextSlide() { goToSlide(currentIndex + 1); }
        function prevSlide() { goToSlide(currentIndex - 1); }

        // 4. Autoplay y Eventos
        function startAutoPlay() {
            if (autoPlayInterval || isReducedMotion) return;
            autoPlayInterval = setInterval(nextSlide, delay);
        }

        function stopAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
            }
        }

        function resetAutoPlay() {
            stopAutoPlay();
            startAutoPlay();
        }

        if (nextBtn && prevBtn) {
            nextBtn.addEventListener('click', () => { nextSlide(); resetAutoPlay(); });
            prevBtn.addEventListener('click', () => { prevSlide(); resetAutoPlay(); });
        }

        if (viewport) {
            viewport.addEventListener('mouseenter', stopAutoPlay);
            viewport.addEventListener('mouseleave', startAutoPlay);
            viewport.addEventListener('focusin', stopAutoPlay);
            viewport.addEventListener('focusout', startAutoPlay);

            viewport.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight') { nextSlide(); resetAutoPlay(); }
                if (e.key === 'ArrowLeft') { prevSlide(); resetAutoPlay(); }
            });

            // Swipe en móviles
            let touchStartX = 0;
            let touchEndX = 0;

            viewport.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
                stopAutoPlay();
            }, { passive: true });

            viewport.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                if (touchStartX - touchEndX > 40) nextSlide();
                else if (touchEndX - touchStartX > 40) prevSlide();
                startAutoPlay();
            }, { passive: true });
        }

        startAutoPlay();
    }

    // Se inician todos los carruseles que existan en la página
    const carousels = document.querySelectorAll('.carousel-module');
    carousels.forEach(carousel => {
        initCarousel(carousel);
    });
});