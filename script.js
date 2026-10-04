document.addEventListener('DOMContentLoaded', () => {
    let audioCtx = null;
    let sfxEnabled = true;

    // Initialize and unlock Audio Context on first user interaction
    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    // Global user interaction listener to unblock browser audio security policies
    const unlockAudioEvents = ['click', 'touchstart', 'keydown', 'mousemove'];
    const unlockAudio = () => {
        initAudio();
        unlockAudioEvents.forEach(evt => window.removeEventListener(evt, unlockAudio));
    };
    unlockAudioEvents.forEach(evt => window.addEventListener(evt, unlockAudio));

    function playSound(type) {
        if (!sfxEnabled) return;
        initAudio();
        if (!audioCtx || audioCtx.state !== 'running') return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'hover') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.05);
        } else if (type === 'click') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.08);
        }
    }

    // Sound Toggle Control
    const sfxBtn = document.getElementById('sfx-toggle');
    if (sfxBtn) {
        sfxBtn.addEventListener('click', () => {
            sfxEnabled = !sfxEnabled;
            sfxBtn.textContent = sfxEnabled ? '🔊 SFX: ON' : '🔇 SFX: OFF';
            if (sfxEnabled) playSound('click');
        });
    }

    // Glowing Custom Pointer Movement
    const cursorDot = document.querySelector('[data-cursor-dot]');
    const cursorOutline = document.querySelector('[data-cursor-outline]');

    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        if (cursorDot) {
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;
        }

        if (cursorOutline) {
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 250, fill: "forwards" });
        }
    });

    // Attach Pointer Hover States & Sound Triggers
    const interactables = document.querySelectorAll('a, button, .project-card, .news-card, input, textarea');
    interactables.forEach(elem => {
        elem.addEventListener('mouseenter', () => {
            if (cursorOutline) cursorOutline.classList.add('hovered');
            playSound('hover');
        });

        elem.addEventListener('mouseleave', () => {
            if (cursorOutline) cursorOutline.classList.remove('hovered');
        });

        elem.addEventListener('click', () => {
            playSound('click');
        });
    });

    // Category Filtering Logic
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const categories = card.getAttribute('data-category').split(' ');
                if (filter === 'all' || categories.includes(filter)) {
                    card.classList.remove('hide');
                } else {
                    card.classList.add('hide');
                }
            });
        });
    });
});