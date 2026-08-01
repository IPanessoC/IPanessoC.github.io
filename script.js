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

    // ==========================================
    // CONTROL DEL RATÓN (Con detector de inactividad)
    // ==========================================
    let mouseIdleTimer;

    window.addEventListener('mousemove', (e) => {
        // 1. Actualizamos coordenadas mientras se mueve
        mouse.x = e.x;
        mouse.y = e.y;

        // 2. Limpiamos el temporizador previo en cada frame de movimiento
        clearTimeout(mouseIdleTimer);

        // 3. Si pasan 150ms sin que se dispare otro 'mousemove', consideramos que está quieto
        mouseIdleTimer = setTimeout(() => {
            mouse.x = undefined;
            mouse.y = undefined;
        }, 150); // Puedes ajustar este valor (150-200ms se siente muy natural)
    });

    window.addEventListener('mouseout', () => {
        // Limpiamos el temporizador y el ratón si salen de la ventana del navegador
        clearTimeout(mouseIdleTimer);
        mouse.x = undefined;
        mouse.y = undefined;
    });

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(initCanvas, 200);
    });

    initCanvas();
    animate();

    // ==========================================
    // 2. GSAP: ANIMACIÓN HERO & CONFIG GLOBAL
    // ==========================================
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ==========================================
    // EFECTO TYPEWRITER (Terminal en el Hero)
    // ==========================================
    const words = ["tu proyecto", "tu plataforma", "tu presencia", "tu alcance"];
    const typeTarget = document.getElementById("typewriter-target");
    
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function typeWriterEffect() {
        if (!typeTarget) return;

        // ACCESIBILIDAD: Si el usuario prefiere movimiento reducido, 
        // dejamos la primera palabra estática y cancelamos el bucle.
        if (isReducedMotion) {
            typeTarget.textContent = words[0];
            return;
        }

        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            // Borrando
            typeTarget.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 40; // Borra rápido (como cuando dejas presionado Backspace)
        } else {
            // Escribiendo
            typeTarget.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            // Lógica para que parezca humano (pequeñas variaciones de tiempo)
            typeSpeed = 100 + Math.random() * 50; 
        }

        // Control de estados (Cuándo parar, borrar o cambiar de palabra)
        if (!isDeleting && charIndex === currentWord.length) {
            // Terminó de escribir: Pausa antes de borrar
            isDeleting = true;
            typeSpeed = 2000; 
        } else if (isDeleting && charIndex === 0) {
            // Terminó de borrar: Cambia de palabra
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500; // Pausa antes de empezar a escribir la nueva
        }

        setTimeout(typeWriterEffect, typeSpeed);
    }

    // Iniciamos el efecto
    typeWriterEffect();

    if (!isReducedMotion) {
        gsap.timeline()
            .from(".tagline", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.2 })
            .from("h1", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
            .from("h2", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
            .from(".hero-description", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
            .from(".cta-group", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.6");
    }

    // ==========================================
    // 3. LÓGICA DE CARRUSELES MULTIPLES (3D Flip & Slide)
    // ==========================================
    
    function initCarousel(module) {
        const track = module.querySelector('.carousel-track');
        const slides = module.querySelectorAll('.carousel-slide');
        const prevBtn = module.querySelector('.prev-btn');
        const nextBtn = module.querySelector('.next-btn');
        const viewport = module.querySelector('.carousel-viewport');
        const dotsContainer = module.querySelector('.carousel-dots') || module.querySelector('#carousel-dots');
        
        const numSlides = slides.length;
        if (!track || numSlides === 0) return;

        let currentIndex = 0;
        let isAnimating = false;
        let autoPlayInterval = null;
        const delay = 4500;

        // ... (Tu código anterior de initCarousel, botones prev/next, etc.)

        if (viewport) {
            viewport.addEventListener('mouseenter', stopAutoPlay);
            viewport.addEventListener('mouseleave', startAutoPlay);
            viewport.addEventListener('focusin', stopAutoPlay);
            viewport.addEventListener('focusout', startAutoPlay);

            viewport.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight') { nextSlide(); resetAutoPlay(); }
                if (e.key === 'ArrowLeft') { prevSlide(); resetAutoPlay(); }
            });

            // Swipe táctil nativo (Celulares)
            let touchStartX = 0;
            viewport.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
                stopAutoPlay();
            }, { passive: true });

            viewport.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].screenX;
                if (touchStartX - touchEndX > 50) nextSlide();
                else if (touchEndX - touchStartX > 50) prevSlide();
                startAutoPlay();
            }, { passive: true });

            // =====================================
            // NUEVO: EVENTOS AVANZADOS CORRECTAMENTE AISLADOS
            // =====================================
            
            // Lógica del Tutorial (Solo si tienen cursor/mouse)
            const isTouchDevice = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
            const tutorial = module.querySelector('#swipe-tutorial');
            
            if (!isTouchDevice && tutorial && !sessionStorage.getItem('tutorialSeen')) {
                const tutTl = gsap.timeline();
                tutTl.to(tutorial, { autoAlpha: 1, duration: 0.5, ease: "power2.out", delay: 1 })
                     .to(tutorial.querySelector('.tutorial-content'), { y: 0, duration: 0.5, ease: "power2.out" }, "-=0.5")
                     .to(tutorial, { autoAlpha: 0, duration: 0.5, ease: "power2.in", delay: 3 })
                     .call(() => sessionStorage.setItem('tutorialSeen', 'true'));
            }

            // A) Trackpad: Deslizamiento fluido con Acumulador
            let wheelAccumulatorX = 0;
            let isWheelCooldown = false;

            viewport.addEventListener('wheel', (e) => {
                // 1. Prioridad a la usabilidad: Si scrollean verticalmente (deltaY mayor), no bloqueamos la página
                if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) return;
                
                // 2. Prevenimos que Safari/Chrome naveguen hacia "Atrás/Adelante" en el historial
                e.preventDefault();

                if (isWheelCooldown || isAnimating) return;

                // 3. Acumulamos la inercia del trackpad
                wheelAccumulatorX += e.deltaX;

                // 4. Umbral de intención (60 es un buen balance entre sensibilidad y toques accidentales)
                const swipeThreshold = 60; 

                if (Math.abs(wheelAccumulatorX) > swipeThreshold) {
                    if (wheelAccumulatorX > 0) {
                        nextSlide(); 
                    } else {
                        prevSlide(); 
                    }
                    resetAutoPlay();
                    
                    // Reset y Cooldown corto para que se sienta responsivo (600ms en lugar de 1200ms)
                    wheelAccumulatorX = 0;
                    isWheelCooldown = true;
                    setTimeout(() => { isWheelCooldown = false; }, 600); 
                }
            }, { passive: false });

            // B) Mouse: Drag and Drop (Arrastrar)
            let isDragging = false;
            let startDragX = 0;

            viewport.addEventListener('mousedown', (e) => {
                isDragging = true;
                startDragX = e.clientX;
                stopAutoPlay();
            });

            window.addEventListener('mouseup', () => {
                isDragging = false;
                startAutoPlay();
            });

            viewport.addEventListener('mousemove', (e) => {
                if (!isDragging || isAnimating) return;
                
                const currentDragX = e.clientX;
                const diff = startDragX - currentDragX;

                if (Math.abs(diff) > 60) {
                    isDragging = false;
                    if (diff > 0) nextSlide();
                    else prevSlide();
                    resetAutoPlay();
                }
            });
        }

        
        // 1. Setup Inicial: Configuración del espacio 3D
        function setupLayout() {
            if (viewport) {
                // Configuramos la cámara (perspective) para la profundidad Z
                gsap.set(viewport, { overflow: "hidden", perspective: 1200 }); 
            }

            const slideHeight = slides[0].offsetHeight || 440;
            gsap.set(track, { height: slideHeight, position: "relative" });

            slides.forEach((slide, i) => {
                gsap.set(slide, { clearProps: "transform,rotationY,z" });

                // Cambiamos 'scale' por 'z' para profundidad 3D real
                gsap.set(slide, {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    opacity: i === 0 ? 1 : 0,           
                    xPercent: i === 0 ? 0 : 100,        
                    rotationY: i === 0 ? 0 : 45, 
                    z: i === 0 ? 0 : -400, // Profundidad real
                    zIndex: i === 0 ? 2 : 1, // La activa va al frente         
                    pointerEvents: i === 0 ? "auto" : "none" 
                });
                
                const card = slide.querySelector('.service-card-content');
                if (card) gsap.set(card, { clearProps: "scale,opacity" });
            });

            track.classList.add('is-ready');
        }

        // Recalcular la altura dinámica
        window.addEventListener('resize', () => {
            clearTimeout(module.resizeCarouselTimeout);
            module.resizeCarouselTimeout = setTimeout(() => {
                if (slides[currentIndex]) {
                    gsap.to(track, { height: slides[currentIndex].offsetHeight, duration: 0.3 });
                }
            }, 200);
        });

        // 2. Dots Interactivos
        function updateDots(index) {
            if (!dotsContainer) return;
            const dots = dotsContainer.querySelectorAll('.dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }

        if (dotsContainer) {
            dotsContainer.innerHTML = ''; 
            slides.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.classList.add('dot');
                if (i === 0) dot.classList.add('active');
                dot.setAttribute('aria-label', `Ir a diapositiva ${i + 1}`);
                dot.addEventListener('click', () => {
                    if (currentIndex !== i) {
                        goToSlide(i, i > currentIndex ? 1 : -1);
                        resetAutoPlay();
                    }
                });
                dotsContainer.appendChild(dot);
            });
        }

        // 3. Animación Secuencial con Rotación 3D Verdadera
        function goToSlide(targetIndex, direction) {
            if (isAnimating || targetIndex === currentIndex) return;
            isAnimating = true;

            const currentSlide = slides[currentIndex];
            const nextSlide = slides[targetIndex];
            updateDots(targetIndex);

            if (isReducedMotion) {
                gsap.set(currentSlide, { opacity: 0, pointerEvents: "none" });
                gsap.set(nextSlide, { opacity: 1, pointerEvents: "auto", xPercent: 0, rotationY: 0, z: 0 });
                currentIndex = targetIndex;
                isAnimating = false;
                return;
            }

            // Gestionamos las capas para que la nueva tarjeta pase por delante
            gsap.set(currentSlide, { zIndex: 1 });
            gsap.set(nextSlide, { zIndex: 2 });

            const tl = gsap.timeline({
                onComplete: () => {
                    gsap.set(currentSlide, { pointerEvents: "none" });
                    gsap.set(nextSlide, { pointerEvents: "auto" });
                    currentIndex = targetIndex;
                    isAnimating = false;
                }
            });

            // SALIDA: La tarjeta actual se va al fondo (eje Z negativo) y rota
            tl.to(currentSlide, {
                xPercent: -60 * direction, 
                rotationY: -55 * direction, 
                z: -400, 
                opacity: 0,
                duration: 0.9,
                ease: "power3.inOut"
            }, 0); 

            // ENTRADA: La nueva tarjeta entra desde el fondo (z: -400) hacia el frente (z: 0)
            tl.fromTo(nextSlide, 
                { xPercent: 60 * direction, rotationY: 55 * direction, z: -400, opacity: 0 },
                { xPercent: 0, rotationY: 0, z: 0, opacity: 1, duration: 0.9, ease: "power3.inOut" },
                0 
            );
            
            tl.to(track, { height: nextSlide.offsetHeight, duration: 0.9, ease: "power3.inOut" }, 0);
        }

        function nextSlide() { goToSlide((currentIndex + 1) % numSlides, 1); }
        function prevSlide() { goToSlide((currentIndex - 1 + numSlides) % numSlides, -1); }

        // 4. Autoplay Inteligente
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

            // Swipe mejorado
            let touchStartX = 0;
            viewport.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
                stopAutoPlay();
            }, { passive: true });

            viewport.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].screenX;
                if (touchStartX - touchEndX > 50) nextSlide();
                else if (touchEndX - touchStartX > 50) prevSlide();
                startAutoPlay();
            }, { passive: true });
        }

        setupLayout();
        startAutoPlay();
    }

    const carousels = document.querySelectorAll('.carousel-module, #services');
    carousels.forEach(carousel => {
        initCarousel(carousel);
    });
    // ==========================================
    // MENÚ MÓVIL RESPONSIVO CON GSAP
    // ==========================================
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li');
    let isMenuOpen = false;

    let mm = gsap.matchMedia();

    mm.add("(max-width: 768px)", () => {
        const tl = gsap.timeline({ paused: true });

        tl.to(navLinks, {
            autoAlpha: 1,
            clipPath: "circle(150% at calc(100% - 40px) 40px)",
            duration: 0.6,
            ease: "power3.inOut"
        }).from(links, {
            y: 30,
            opacity: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: "power2.out"
        }, "-=0.3");

        const toggleMenu = () => {
            isMenuOpen = !isMenuOpen;
            menuToggle.classList.toggle('is-active');
            menuToggle.setAttribute('aria-expanded', isMenuOpen);
            
            if (isMenuOpen) {
                tl.play();
                document.body.style.overflow = 'hidden'; 
            } else {
                tl.reverse();
                document.body.style.overflow = '';
            }
        };

        menuToggle.addEventListener('click', toggleMenu);

        const navAnchors = document.querySelectorAll('.nav-links a');

        const handleLinkClick = (e) => {
            if (!isMenuOpen) return;
            e.preventDefault(); 
            
            const targetId = e.currentTarget.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            toggleMenu(); 

            if (targetSection) {
                setTimeout(() => {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }, 150);
            }
        };

        navAnchors.forEach(anchor => {
            anchor.addEventListener('click', handleLinkClick);
        });

        // Cleanup unificado para evitar memory leaks al redimensionar la pantalla
        return () => {
            tl.kill();
            isMenuOpen = false;
            menuToggle.classList.remove('is-active');
            document.body.style.overflow = '';
            menuToggle.removeEventListener('click', toggleMenu);
            navAnchors.forEach(anchor => {
                anchor.removeEventListener('click', handleLinkClick);
            });
        };
    });
});