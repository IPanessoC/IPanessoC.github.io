document.addEventListener("DOMContentLoaded", () => {
    
    const themeBtn = document.getElementById('theme-toggle');
    const sunIcon = themeBtn.querySelector('.sun-icon');
    const moonIcon = themeBtn.querySelector('.moon-icon');
    
    // 1. DETERMINAR EL TEMA INICIO (Jerarquía: LocalStorage -> Sistema OS)
    const savedTheme = localStorage.getItem('theme');
    
    // matchMedia nos permite consultar reglas CSS desde JavaScript
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)');

    // Lógica: Si hay algo guardado, respetamos eso. 
    // Si no (primera visita), miramos el sistema operativo.
    let isLightMode = savedTheme === 'light' || (!savedTheme && systemPrefersLight.matches);

    // 2. FUNCIÓN PARA APLICAR LA INTERFAZ VISUAL
    function applyThemeUI(isLight) {
        if (isLight) {
            document.body.classList.add('light-theme');
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            document.body.classList.remove('light-theme');
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    }

    // Ejecutamos la función al cargar la página
    applyThemeUI(isLightMode);

    // 3. EVENTO PARA CAMBIOS EN TIEMPO REAL DEL SISTEMA OPERATIVO
    systemPrefersLight.addEventListener('change', (e) => {
        // Solo reaccionamos si el usuario NO ha forzado un tema con tu botón
        if (!localStorage.getItem('theme')) {
            isLightMode = e.matches;
            applyThemeUI(isLightMode);
            initCanvas(); // Es crucial reiniciar el canvas para actualizar matrix/constelación
        }
    });

    // 2. EVENTO CLICK DEL BOTÓN
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        isLightMode = document.body.classList.contains('light-theme');
        localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
        
        sunIcon.style.display = isLightMode ? 'none' : 'block';
        moonIcon.style.display = isLightMode ? 'block' : 'none';
        
        initCanvas(); // Reinicia el canvas con las nuevas reglas físicas
    });

    // ==========================================
    // CANVAS: CONSTELACIÓN NÍTIDA Y MATRIX LLUVIA
    // ==========================================
    const canvas = document.getElementById('cyber-canvas');
    const ctx = canvas.getContext('2d', { alpha: true });
    let width, height, particles = [];
    let mouse = { x: null, y: null, radius: 150 };

    // Banco de caracteres estilo Matrix
    const matrixChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*<>[]{}";

    function initCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        particles = [];
        
        // El modo Matrix necesita más "gotas" para llenar la pantalla
        const particleCount = isLightMode ? Math.floor(width / 20) : (width < 768 ? 45 : 90);
        
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(i));
        }
    }

    function initCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = [];
    
    // CAMBIO: Mucha menor cantidad en modo claro (divisor más grande)
    const particleCount = isLightMode ? Math.floor(width / 100) : (width < 768 ? 45 : 90);
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(i));
    }
}

    // 2. Modificar dentro de class Particle -> constructor(index) (~Líneas 70-82)
    class Particle {
        constructor(index) {
            // CAMBIO: Espaciado en X más ancho para compensar que hay menos
            this.x = isLightMode ? index * 100 + Math.random() * 50 : Math.random() * width;
            this.y = Math.random() * height;
            
            // Físicas Modo Oscuro (Constelación) - Quedan igual
            this.size = Math.random() * 2 + 1;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            
            // Físicas Modo Claro (Nuevos Cuadrados Lentos)
            // CAMBIO: Mucho más grandes
            this.matrixSize = Math.random() * 15 + 25; 
            // CAMBIO: Mucho más lentos
            this.speedY = Math.random() * 0.5 + 0.5;      
            
            this.char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
            this.frameCount = 0; // Para el efecto glitcheado
            
            const darkColors = ['#A855F7', '#EC4899', '#8B5CF6']; 
            const lightColors = ['#228B22', '#32CD32', '#00FF00', '#7FFF00'];
            
            this.colorDark = darkColors[Math.floor(Math.random() * darkColors.length)];
            this.colorLight = lightColors[Math.floor(Math.random() * lightColors.length)];
        }

        update() {
            if (isLightMode) {
                // FÍSICA MATRIX
                this.y += this.speedY;
                this.frameCount++;
                
                // Efecto Glitch: Cambiar el carácter cada 5 frames
                if (this.frameCount % 5 === 0) {
                    this.char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
                }

                if (this.y > height) {
                    this.y = 0;
                    this.speedY = Math.random() * 2 + 2; 
                }
            } else {
                // FÍSICA CONSTELACIÓN
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
                
                // Interacción sutil con el ratón solo en modo oscuro
                if (mouse.x && mouse.y) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        let force = (mouse.radius - distance) / mouse.radius;
                        this.x -= (dx / distance) * force * 2;
                        this.y -= (dy / distance) * force * 2;
                    }
                }
            }
        }

        draw() {
            ctx.beginPath();
            if (isLightMode) {
                // DIBUJO MATRIX
                ctx.fillStyle = this.colorLight;
                ctx.font = `bold ${this.matrixSize}px monospace`;
                ctx.textAlign = 'center';
                ctx.fillText(this.char, this.x, this.y);
            } else {
                // DIBUJO CONSTELACIÓN NÍTIDA
                ctx.fillStyle = this.colorDark;
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.closePath();
        }
    }

    function connectParticles() {
        if (isLightMode) return; 

        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let dx = particles[a].x - particles[b].x;
                let dy = particles[a].y - particles[b].y;
                let distance = dx * dx + dy * dy;
                let maxDist = (width / 11) * (width / 11);
                
                if (distance < maxDist) {
                    let opacity = 1 - (distance / maxDist);
                    ctx.strokeStyle = `rgba(168, 85, 247, ${opacity * 0.2})`;
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
        if (isLightMode) {
            // Estela semi-transparente para Matrix
            ctx.fillStyle = 'rgba(248, 250, 252, 0.15)'; 
            ctx.fillRect(0, 0, width, height);
        } else {
            // SOLUCIÓN "MANCHAS": Limpieza total del canvas. 
            ctx.clearRect(0, 0, width, height);
        }

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        
        connectParticles();
        requestAnimationFrame(animate);
    }
    
    // Inicializar
    initCanvas();
    animate();

    // Resize listener para que no se rompa al voltear el celular
    window.addEventListener('resize', () => {
        initCanvas();
    });

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
    // GSAP: MENÚ HAMBURGUESA MULTI-DISPOSITIVO
    // ==========================================
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li');
    let isMenuOpen = false;

    let mm = gsap.matchMedia();

    // Declaramos ambos breakpoints en el mismo contexto
    mm.add({
        isMobile: "(max-width: 768px)",
        isDesktop: "(min-width: 769px)"
    }, (context) => {
        let { isMobile } = context.conditions;
        const tl = gsap.timeline({ paused: true });

        if (isMobile) {
            // Animación para Celulares: Círculo expansivo
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
        } else {
            // Animación para Escritorio: Panel deslizante desde la derecha
            tl.to(navLinks, {
                autoAlpha: 1,
                x: 0, // Regresa a su posición original (translateX: 0)
                duration: 0.6,
                ease: "power3.inOut"
            }).from(links, {
                x: 30, // Los textos entran deslizando levemente
                opacity: 0,
                duration: 0.4,
                stagger: 0.1,
                ease: "power2.out"
            }, "-=0.4");
        }

        const toggleMenu = () => {
            isMenuOpen = !isMenuOpen;
            menuToggle.classList.toggle('is-active');
            menuToggle.setAttribute('aria-expanded', isMenuOpen);
            
            if (isMenuOpen) {
                tl.play();
                document.body.style.overflow = 'hidden'; // Bloquea el scroll de fondo
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
                }, isMobile ? 300 : 500); // Espera a que la animación fluya antes de hacer scroll
            }
        };

        navAnchors.forEach(anchor => {
            anchor.addEventListener('click', handleLinkClick);
        });

        // Cleanup: vital para no romper el layout al redimensionar la ventana de PC a Móvil
        return () => {
            tl.kill();
            isMenuOpen = false;
            menuToggle.classList.remove('is-active');
            document.body.style.overflow = '';
            menuToggle.removeEventListener('click', toggleMenu);
            navAnchors.forEach(anchor => {
                anchor.removeEventListener('click', handleLinkClick);
            });
            // Limpiamos los estilos inyectados por GSAP para que el CSS puro vuelva a tomar el control
            gsap.set(navLinks, { clearProps: "all" });
            gsap.set(links, { clearProps: "all" });
        };
    });
        // 20 Estilos con 3 Colores Principales y 3 Secundarios
    const styles = [
        { name: "Minimalista Elegante", description: "Limpio, con mucho espacio y tipografía refinada.", fontClass: "font-inter", shapeClasses: "rounded-sm", colors: { primary: ["#ffffff", "#f8fafc", "#f1f5f9"], secondary: ["#0f172a", "#334155", "#64748b"] } },
        { name: "Brutalista Moderno", description: "Contraste fuerte, bordes duros y sombras sólidas.", fontClass: "font-space", shapeClasses: "rounded-none border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]", colors: { primary: ["#ffffff", "#e5e5e5", "#d4d4d4"], secondary: ["#000000", "#ef4444", "#3b82f6"] } },
        { name: "Elegante Clásico", description: "Tradicional, tipografía serif y tonos sobrios.", fontClass: "font-playfair", shapeClasses: "rounded-md shadow-md", colors: { primary: ["#faf9f6", "#f3f0e9", "#e8e2d5"], secondary: ["#1a1a1a", "#4a4a4a", "#8b7355"] } },
        { name: "Tecnológico / IT", description: "Colores fríos y oscuros, look de código y precisión.", fontClass: "font-roboto", shapeClasses: "rounded-none rounded-tl-2xl rounded-br-2xl shadow-lg", colors: { primary: ["#0f172a", "#1e293b", "#334155"], secondary: ["#38bdf8", "#818cf8", "#e0e7ff"] } },
        { name: "Amigable / Startup", description: "Redondeado, accesible y con colores cálidos.", fontClass: "font-poppins", shapeClasses: "rounded-2xl shadow-sm", colors: { primary: ["#ffffff", "#fef2f2", "#fee2e2"], secondary: ["#ef4444", "#b91c1c", "#7f1d1d"] } },
        { name: "Editorial / Revista", description: "Sofisticado, centrado en texto e imágenes amplias.", fontClass: "font-lora", shapeClasses: "rounded-sm", colors: { primary: ["#fdfbf7", "#f4f0e6", "#e9e3d5"], secondary: ["#2c1810", "#4a2c2a", "#8c5a4f"] } },
        { name: "Monocromático Oscuro", description: "Variaciones de negros y grises profundos.", fontClass: "font-inter", shapeClasses: "rounded-lg border border-gray-700", colors: { primary: ["#09090b", "#18181b", "#27272a"], secondary: ["#fafafa", "#e4e4e7", "#a1a1aa"] } },
        { name: "Juguetón Pop", description: "Vibrante, formas muy redondeadas y divertido.", fontClass: "font-poppins", shapeClasses: "rounded-[2rem] shadow-xl", colors: { primary: ["#fdf4ff", "#fae8ff", "#f5d0fe"], secondary: ["#c026d3", "#db2777", "#9333ea"] } },
        { name: "Corporativo Moderno", description: "Azules de confianza, limpio y muy profesional.", fontClass: "font-space", shapeClasses: "rounded-md shadow-sm border border-gray-200", colors: { primary: ["#ffffff", "#f3f4f6", "#e5e7eb"], secondary: ["#1d4ed8", "#1e40af", "#1f2937"] } },
        { name: "Vintage Nostálgico", description: "Tonos sepia y cálidos, look retro encantador.", fontClass: "font-lora", shapeClasses: "rounded-xl border-2 border-dashed", colors: { primary: ["#fef3c7", "#fde68a", "#fcd34d"], secondary: ["#78350f", "#92400e", "#b45309"] } },
        { name: "Cyberpunk", description: "Alto contraste, neón sobre negro absoluto.", fontClass: "font-roboto", shapeClasses: "rounded-none border-l-4 border-r-4 shadow-[0_0_15px_rgba(0,255,255,0.5)]", colors: { primary: ["#000000", "#111111", "#222222"], secondary: ["#00ff00", "#ff00ff", "#00ffff"] } },
        { name: "Lujo Moderno", description: "Negros y dorados, exuda exclusividad.", fontClass: "font-playfair", shapeClasses: "rounded-none border border-yellow-600", colors: { primary: ["#111827", "#1f2937", "#374151"], secondary: ["#fbbf24", "#f59e0b", "#d97706"] } },
        { name: "Natural Orgánico", description: "Verdes suaves, evoca naturaleza y bienestar.", fontClass: "font-inter", shapeClasses: "rounded-[30%_70%_70%_30%/30%_30%_70%_70%]", colors: { primary: ["#f0fdf4", "#dcfce7", "#bbf7d0"], secondary: ["#14532d", "#166534", "#15803d"] } },
        { name: "Neumorfismo Suave", description: "Efectos de plastilina y sombras suaves integradas.", fontClass: "font-poppins", shapeClasses: "rounded-3xl shadow-lg border border-white border-opacity-40", colors: { primary: ["#f1f5f9", "#e2e8f0", "#cbd5e1"], secondary: ["#475569", "#334155", "#0f172a"] } },
        { name: "Geométrico Estricto", description: "Líneas rectas, preciso, balance de grises.", fontClass: "font-space", shapeClasses: "rounded-none", colors: { primary: ["#ffffff", "#f4f4f5", "#e4e4e7"], secondary: ["#27272a", "#3f3f46", "#52525b"] } },
        { name: "Art Deco", description: "Azul oscuro, oro y acentos amarillos.", fontClass: "font-playfair", shapeClasses: "rounded-t-full rounded-b-md border-2", colors: { primary: ["#0f172a", "#1e293b", "#334155"], secondary: ["#d4af37", "#aa8c2c", "#fef08a"] } },
        { name: "Bauhaus", description: "Colores primarios fuertes, diseño utilitario.", fontClass: "font-inter", shapeClasses: "rounded-full", colors: { primary: ["#f8fafc", "#f1f5f9", "#e2e8f0"], secondary: ["#dc2626", "#2563eb", "#eab308"] } },
        { name: "Tropical Vibrante", description: "Celestes y naranjas, energía y movimiento.", fontClass: "font-poppins", shapeClasses: "rounded-tl-[2rem] rounded-br-[2rem] shadow-md", colors: { primary: ["#ecfeff", "#cffafe", "#a5f3fc"], secondary: ["#0891b2", "#0d9488", "#ea580c"] } },
        { name: "Gótico / Dark", description: "Oscuro, toques rojizos y estética lúgubre.", fontClass: "font-lora", shapeClasses: "rounded-t-[3rem] border-b-4", colors: { primary: ["#000000", "#0a0a0a", "#171717"], secondary: ["#a3a3a3", "#d4d4d8", "#7f1d1d"] } },
        { name: "Espacial Sci-Fi", description: "Azul profundo espacial y morados eléctricos.", fontClass: "font-roboto", shapeClasses: "rounded-3xl border border-purple-500", colors: { primary: ["#020617", "#0f172a", "#1e293b"], secondary: ["#c084fc", "#a855f7", "#38bdf8"] } }
    ];

    const container = document.getElementById('styleCards');

    styles.forEach((style, index) => {
        const card = document.createElement('div');
        card.className = "bg-white border border-gray-200 rounded-xl p-5 hover:shadow-xl hover:border-brand-200 transition-all duration-300 flex flex-col h-full";
        
        card.innerHTML = `
            <h4 class="font-bold text-lg text-gray-900 mb-1">${style.name}</h4>
            <p class="text-xs text-gray-500 mb-4 h-8 overflow-hidden">${style.description}</p>
            
            <!-- Paleta de Colores en la Tarjeta -->
            <div class="mb-4 bg-gray-50 p-2 rounded-lg border border-gray-100">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Principales</span>
                    <div class="flex gap-1">
                        ${style.colors.primary.map(c => `<div class="w-6 h-6 rounded border border-gray-200 shadow-sm" style="background-color: ${c};" title="${c}"></div>`).join('')}
                    </div>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Secundarios</span>
                    <div class="flex gap-1">
                        ${style.colors.secondary.map(c => `<div class="w-6 h-6 rounded border border-gray-200 shadow-sm" style="background-color: ${c};" title="${c}"></div>`).join('')}
                    </div>
                </div>
            </div>

            <!-- Mini Ejemplo Visual -->
            <div class="mb-5 p-3 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 shadow-inner" style="min-height: 100px; background-color: ${style.colors.primary[0]}; border: 1px solid ${style.colors.primary[2]}; border-radius: 8px;">
                <div class="${style.fontClass} w-full text-center transition-all" style="color: ${style.colors.secondary[0]};">
                    <h5 class="text-sm font-bold mb-1">Tipografía</h5>
                    <div class="flex justify-center gap-2 mt-2">
                        <div class="${style.shapeClasses} w-14 h-5 flex items-center justify-center text-[9px] font-bold transition-all" style="background-color: ${style.colors.secondary[0]}; color: ${style.colors.primary[0]}; border: 1px solid ${style.colors.secondary[0]};">Botón</div>
                        <div class="${style.shapeClasses} w-14 h-5 flex items-center justify-center text-[9px] font-bold transition-all opacity-80" style="background-color: ${style.colors.primary[1]}; color: ${style.colors.secondary[0]}; border: 1px solid ${style.colors.secondary[1]};">Forma</div>
                    </div>
                </div>
            </div>

            <!-- Controles de Selección -->
            <div class="space-y-2 pt-3 border-t border-gray-100 mt-auto">
                <label class="flex items-center space-x-2 cursor-pointer group">
                    <input type="radio" name="selected_typography" value="${style.name}" class="form-radio text-brand-600 focus:ring-brand-500 h-4 w-4" onchange="updatePreview()" ${index === 0 ? 'checked' : ''}>
                    <span class="text-xs font-medium text-gray-600 group-hover:text-brand-600 transition-colors">Usar tipografía</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer group">
                    <input type="radio" name="selected_colors" value="${style.name}" class="form-radio text-brand-600 focus:ring-brand-500 h-4 w-4" onchange="updatePreview()" ${index === 0 ? 'checked' : ''}>
                    <span class="text-xs font-medium text-gray-600 group-hover:text-brand-600 transition-colors">Usar colores</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer group">
                    <input type="radio" name="selected_shapes" value="${style.name}" class="form-radio text-brand-600 focus:ring-brand-500 h-4 w-4" onchange="updatePreview()" ${index === 0 ? 'checked' : ''}>
                    <span class="text-xs font-medium text-gray-600 group-hover:text-brand-600 transition-colors">Usar formas</span>
                </label>
            </div>
        `;
        container.appendChild(card);
    });

    function updatePreview() {
        const fontName = document.querySelector('input[name="selected_typography"]:checked')?.value;
        const colorName = document.querySelector('input[name="selected_colors"]:checked')?.value;
        const shapeName = document.querySelector('input[name="selected_shapes"]:checked')?.value;

        if(!fontName || !colorName || !shapeName) return;

        const fontStyle = styles.find(s => s.name === fontName);
        const colorStyle = styles.find(s => s.name === colorName);
        const shapeStyle = styles.find(s => s.name === shapeName);

        // Colores
        const p0 = colorStyle.colors.primary[0];
        const p1 = colorStyle.colors.primary[1];
        const p2 = colorStyle.colors.primary[2];
        const s0 = colorStyle.colors.secondary[0];
        const s1 = colorStyle.colors.secondary[1];
        const s2 = colorStyle.colors.secondary[2];

        // Container (Fondo y Fuente global)
        const previewContainer = document.getElementById('previewContainer');
        previewContainer.className = `p-8 md:p-14 relative w-full h-full min-h-[400px] flex flex-col justify-center ${fontStyle.fontClass}`;
        previewContainer.style.backgroundColor = p0;
        previewContainer.style.color = s0;

        // Nav y Header
        document.getElementById('prevHeaderBorder').style.borderColor = s2;
        document.getElementById('prevNav').style.color = s1;

        // Textos y Botones
        const badge = document.getElementById('prevBadge');
        badge.className = `inline-block px-4 py-1.5 text-xs font-bold tracking-widest uppercase shadow-sm ${shapeStyle.shapeClasses}`;
        badge.style.backgroundColor = p2;
        badge.style.color = s0;
        badge.style.border = `1px solid ${s2}`;

        const btnPri = document.getElementById('prevButtonPrimary');
        btnPri.className = `px-8 py-3.5 font-bold transition-transform hover:-translate-y-1 shadow-lg ${shapeStyle.shapeClasses}`;
        btnPri.style.backgroundColor = s0;
        btnPri.style.color = p0;
        if(shapeStyle.name.includes("Brutalista")) {
            btnPri.style.border = `2px solid ${s0}`;
        } else {
            btnPri.style.border = 'none';
        }

        const btnSec = document.getElementById('prevButtonSecondary');
        btnSec.className = `px-8 py-3.5 font-bold transition-transform hover:-translate-y-1 border-2 ${shapeStyle.shapeClasses}`;
        btnSec.style.backgroundColor = 'transparent';
        btnSec.style.borderColor = s0;
        btnSec.style.color = s0;

        // Área Visual (Placeholder y Formas Abstractas)
        const imgPlaceholder = document.getElementById('prevImagePlaceholder');
        imgPlaceholder.className = `w-full h-64 md:h-80 flex items-center justify-center relative overflow-hidden shadow-2xl ${shapeStyle.shapeClasses}`;
        imgPlaceholder.style.backgroundColor = p1;
        imgPlaceholder.style.border = `1px solid ${p2}`;

        document.getElementById('prevImageText').style.color = s0;

        const shape1 = document.getElementById('prevShape1');
        shape1.className = `absolute w-40 h-40 top-[-20px] left-[-20px] opacity-70 ${shapeStyle.shapeClasses}`;
        shape1.style.backgroundColor = s1;

        const shape2 = document.getElementById('prevShape2');
        shape2.className = `absolute w-32 h-32 bottom-10 right-10 opacity-90 ${shapeStyle.shapeClasses}`;
        shape2.style.backgroundColor = s2;
        
        const shape3 = document.getElementById('prevShape3');
        shape3.className = `absolute w-16 h-16 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-50 ${shapeStyle.shapeClasses}`;
        shape3.style.backgroundColor = s0;
    }

    // Inicializar Vista Previa al cargar
    window.onload = () => {
        updatePreview();
    };

    // Reemplazo de la función de descarga a Markdown por Fetch/API
    document.getElementById('webForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        // Referencias al botón para la animación de carga
        const submitBtn = document.getElementById('submitBtn');
        const btnText = document.getElementById('btnText');
        const btnSpinner = document.getElementById('btnSpinner');

        // Cambiar estado a cargando
        submitBtn.disabled = true;
        btnText.classList.add('opacity-0');
        setTimeout(() => {
            btnSpinner.classList.remove('hidden');
        }, 150);

        // Recopilación de datos
        const nombre = document.getElementById('nombre').value || 'No especificado';
        const profesion = document.getElementById('profesion').value || 'No especificada';
        const descripcion = document.getElementById('descripcion').value || 'No especificada';
        
        const objetivos = Array.from(document.querySelectorAll('input[name="objetivos"]:checked')).map(el => el.value);
        const funciones = Array.from(document.querySelectorAll('input[name="funciones"]:checked')).map(el => el.value);
        
        const dispositivos = document.querySelector('input[name="dispositivos"]:checked')?.value || 'No especificado';
        const contenido = document.querySelector('input[name="contenido"]:checked')?.value || 'No especificado';
        const dominio = document.querySelector('input[name="dominio"]:checked')?.value || 'No especificado';
        const tiempo = document.getElementById('tiempo').value || 'No especificado';
        
        const mantNode = document.querySelector('input[name="mantenimiento"]:checked');
        let mantenimiento = 'No especificado';
        if(mantNode) {
            mantenimiento = mantNode.value === 'casi_estatica' ? 
                'Página casi estática (sin mantenimiento recurrente)' : 
                'Actualización periódica (requiere mantenimiento)';
        }

        const fontName = document.querySelector('input[name="selected_typography"]:checked')?.value || 'No especificado';
        const colorName = document.querySelector('input[name="selected_colors"]:checked')?.value || 'No especificado';
        const shapeName = document.querySelector('input[name="selected_shapes"]:checked')?.value || 'No especificado';
        
        // Extracción colores hex
        let coloresHex = 'No especificados';
        if (colorName !== 'No especificado') {
            const colorStyle = styles.find(s => s.name === colorName);
            if (colorStyle) {
                coloresHex = `Primarios: ${colorStyle.colors.primary.join(', ')} | Secundarios: ${colorStyle.colors.secondary.join(', ')}`;
            }
        }

        const sentimientos = document.getElementById('sentimientos').value || 'Ninguno especificado';
        const no_quiero = document.getElementById('no_quiero').value || 'Ninguno especificado';

        // Formateando el cuerpo de la petición (Payload)
        const payload = {
            Nombre_Marca: nombre,
            Profesion_Sector: profesion,
            Descripcion_Actividad: descripcion,
            Objetivos: objetivos.length > 0 ? objetivos.join(', ') : 'Ninguno',
            Funciones_Deseadas: funciones.length > 0 ? funciones.join(', ') : 'Ninguna',
            Dispositivos_Principales: dispositivos,
            Estado_Contenido: contenido,
            Dominio_Hosting: dominio,
            Tiempo_Estimado: tiempo,
            Mantenimiento_Futuro: mantenimiento,
            Estilo_Tipografia: fontName,
            Estilo_Colores: colorName,
            Colores_Hexadecimales: coloresHex,
            Estilo_Formas: shapeName,
            Sentimientos_Deseados: sentimientos,
            Elementos_No_Deseados: no_quiero
        };

        // AQUI PON TU ENDPOINT DE FORMSPREE
        const ENDPOINT_FORMSPREE = 'https://formspree.io/f/TU_ID_AQUI';

        try {
            const response = await fetch(ENDPOINT_FORMSPREE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('¡Tus requerimientos han sido enviados con éxito! Nos pondremos en contacto pronto.');
                document.getElementById('webForm').reset();
                updatePreview(); // Actualiza la vista previa al reiniciar
            } else {
                alert('Hubo un problema al enviar el formulario. Por favor intenta nuevamente.');
            }
        } catch (error) {
            console.error('Error durante el envío:', error);
            alert('Ocurrió un error de red. Verifica tu conexión a internet e inténtalo de nuevo.');
        } finally {
            // Restaurar botón de envío
            btnSpinner.classList.add('hidden');
            btnText.classList.remove('opacity-0');
            submitBtn.disabled = false;
        }
    });
});