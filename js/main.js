/* ===== CUSTOM CURSOR ===== */
const dot     = document.getElementById('cursorDot');
const outline = document.getElementById('cursorOutline');
let mx = 0, my = 0, ox = 0, oy = 0;

document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
});

(function trackOutline() {
    ox += (mx - ox) * 0.11;
    oy += (my - oy) * 0.11;
    outline.style.left = ox + 'px';
    outline.style.top  = oy + 'px';
    requestAnimationFrame(trackOutline);
})();

document.querySelectorAll('a, button, .btn, .p-card, .stat-card, .sk-group, .tech-pills span').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('c-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('c-hover'));
});

/* ===== PARTICLE CANVAS ===== */
const canvas = document.getElementById('particleCanvas');
const ctx    = canvas.getContext('2d');

function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const COLORS = ['224,170,255', '157,78,221', '123,44,191', '200,160,255', '255,255,255'];

class Particle {
    constructor() { this.init(); }
    init() {
        this.x  = Math.random() * canvas.width;
        this.y  = Math.random() * canvas.height;
        this.r  = Math.random() * 1.8 + 0.4;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = (Math.random() - 0.5) * 0.25;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.phase = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.018 + 0.008;
    }
    update(t) {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width)  this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
        this.alpha = 0.25 + 0.35 * Math.sin(t * this.speed + this.phase);
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
        ctx.fill();
    }
}

const particles = Array.from({ length: 90 }, () => new Particle());

function drawLines() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const d  = Math.sqrt(dx*dx + dy*dy);
            if (d < 110) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(123,44,191,${(1 - d/110) * 0.12})`;
                ctx.lineWidth = 0.6;
                ctx.stroke();
            }
        }
    }
}

let tick = 0;
(function animLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tick++;
    drawLines();
    particles.forEach(p => { p.update(tick); p.draw(); });
    requestAnimationFrame(animLoop);
})();

/* ===== NAVBAR SCROLL ===== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
});

/* ===== HAMBURGER MENU ===== */
const burger   = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const bSpans   = burger.querySelectorAll('span');

burger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const open = navLinks.classList.contains('open');
    bSpans[0].style.transform = open ? 'translateY(7px) rotate(45deg)'  : '';
    bSpans[1].style.opacity   = open ? '0' : '';
    bSpans[2].style.transform = open ? 'translateY(-7px) rotate(-45deg)' : '';
});

navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        bSpans[0].style.transform = '';
        bSpans[1].style.opacity   = '';
        bSpans[2].style.transform = '';
    });
});

/* ===== SMOOTH SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
});

/* ===== SCROLL REVEAL ===== */
const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ===== COUNTER ANIMATION ===== */
const counterObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const dur    = 1800;
        const start  = performance.now();

        (function count(now) {
            const p = Math.min((now - start) / dur, 1);
            const v = Math.floor((1 - Math.pow(1 - p, 3)) * target);
            el.textContent = v + (p < 1 ? '' : suffix);
            if (p < 1) requestAnimationFrame(count);
        })(start);

        counterObs.unobserve(el);
    });
}, { threshold: 0.5 });

document.querySelectorAll('.sn').forEach(el => counterObs.observe(el));

/* ===== CARD 3D TILT ===== */
document.querySelectorAll('[data-tilt]').forEach(card => {
    let raf;
    card.addEventListener('mousemove', e => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
            const r  = card.getBoundingClientRect();
            const rx = ((e.clientY - r.top)  / r.height - 0.5) * -10;
            const ry = ((e.clientX - r.left) / r.width  - 0.5) *  10;
            card.style.transform    = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.025)`;
            card.style.transition   = 'transform 0.05s';
        });
    });
    card.addEventListener('mouseleave', () => {
        cancelAnimationFrame(raf);
        card.style.transform  = '';
        card.style.transition = 'transform 0.55s ease, border-color 0.3s, box-shadow 0.3s';
    });
});

/* ===== MAGNETIC BUTTONS ===== */
document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width  / 2) * 0.16;
        const y = (e.clientY - r.top  - r.height / 2) * 0.16;
        btn.style.transform  = `translate(${x}px,${y}px)`;
        btn.style.transition = 'transform 0.1s';
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform  = '';
        btn.style.transition = 'transform 0.45s ease, box-shadow 0.3s';
    });
});

/* ===== PARALLAX ORBS ON MOUSEMOVE ===== */
const orbs = document.querySelectorAll('.orb');
document.addEventListener('mousemove', e => {
    const px = (e.clientX / window.innerWidth  - 0.5);
    const py = (e.clientY / window.innerHeight - 0.5);
    orbs.forEach((orb, i) => {
        const f = (i + 1) * 14;
        orb.style.transform = `translate(${px*f}px, ${py*f}px)`;
    });
});

/* ===== TYPEWRITER ===== */
const phrases = [
    'Desenvolvedor Full Stack',
    'Fundador da Nova Iris',
    'Criador de Experiências Web',
    'React · Node.js · Design'
];
let pi = 0, ci = 0, deleting = false;
const tw = document.getElementById('typewriter');

function typewrite() {
    const phrase = phrases[pi];
    tw.textContent = deleting
        ? phrase.substring(0, ci - 1)
        : phrase.substring(0, ci + 1);
    deleting ? ci-- : ci++;

    let delay = deleting ? 40 : 75;
    if (!deleting && ci === phrase.length) { delay = 2200; deleting = true; }
    else if (deleting && ci === 0)          { deleting = false; pi = (pi + 1) % phrases.length; delay = 400; }

    setTimeout(typewrite, delay);
}
typewrite();
