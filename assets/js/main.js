document.addEventListener('DOMContentLoaded', () => {
    // 1. Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // 2. Intersection Observer for 'Reveal' animations
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, revealOptions);

    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(reveal => {
        revealOnScroll.observe(reveal);
    });

    // 3. Dynamic Card Glow Effect (Framer/Apple style mouse tracking)
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // 4. Initial Load Animation Delay
    setTimeout(() => {
        document.body.classList.add('loaded');
        // Trigger initial reveal check
        reveals.forEach(reveal => {
            const rect = reveal.getBoundingClientRect();
            if(rect.top < window.innerHeight) {
                 reveal.classList.add('active');
            }
        });
    }, 100);

    // 5. Secret Logo Click (5 clicks to open ESC Panel)
    const logo = document.querySelector('.logo');
    if(logo && window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        let clickCount = 0;
        let clickTimer;

        logo.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default anchor jump
            clickCount++;

            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => {
                clickCount = 0; // reset if they stop clicking
            }, 1000); // 1 second window to click 5 times

            if(clickCount >= 5) {
                clickCount = 0;
                const modal = document.getElementById('secret-modal');
                modal.classList.add('active');
                // Trigger modal content reveal
                setTimeout(() => {
                    modal.querySelector('.modal-content').classList.add('active');
                }, 50);
            }
        });
    }

    // Modal logic
    const modalNo = document.getElementById('secret-no');
    const modalYes = document.getElementById('secret-yes');
    const modal = document.getElementById('secret-modal');

    if(modalNo) {
        modalNo.addEventListener('click', () => {
            modal.querySelector('.modal-content').classList.remove('active');
            setTimeout(() => {
                modal.classList.remove('active');
            }, 400); // wait for spring animation to finish closing
        });
    }

    if(modalYes) {
        modalYes.addEventListener('click', () => {
            // Apple style slide up / fade out effect on whole page before redirect
            document.body.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease";
            document.body.style.transform = "scale(0.95) translateY(-20px)";
            document.body.style.opacity = "0";

            setTimeout(() => {
                window.location.href = "eu.html";
            }, 600);
        });
    }

    // 6. Magnetic Buttons (Framer style)
    const magneticBtns = document.querySelectorAll('.btn');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width/2) * 0.3; // 0.3 is pull strength
            const y = (e.clientY - rect.top - rect.height/2) * 0.3;

            btn.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = `translate(0px, 0px) scale(1)`;
        });
    });
});