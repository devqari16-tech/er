
// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
  });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    if (hamburger) {
      hamburger.classList.remove('active');
    }
  });
});

// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');
  
  question.addEventListener('click', () => {
    const isActive = item.classList.contains('active');
    
    // Close all FAQ items
    faqItems.forEach(faq => faq.classList.remove('active'));
    
    // Open clicked item if it wasn't active
    if (!isActive) {
      item.classList.add('active');
    }
  });
});

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    
    if (target) {
      const offsetTop = target.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  });
});

// Navbar Background Change on Scroll
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 100) {
    navbar.style.background = 'rgba(10, 17, 40, 0.98)';
    navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.5)';
  } else {
    navbar.style.background = 'rgba(10, 17, 40, 0.95)';
    navbar.style.boxShadow = 'none';
  }
});

// Form Submission Handler with AJAX
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    
    submitButton.disabled = true;
    submitButton.innerHTML = '<span>Sending...</span>';
    
    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        contactForm.reset();
        submitButton.innerHTML = '<span>✓ Sent Successfully!</span>';
        submitButton.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        
        alert('Thank you for your booking request! We will contact you shortly at the email and phone number you provided.');
        
        setTimeout(() => {
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonText;
          submitButton.style.background = '';
        }, 3000);
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
      alert('Oops! There was a problem submitting your form. Please try again or call us at (647) 778-8430.');
    }
  });
}

// Counter Animation for Stats
function animateCounter(element, target) {
  let current = 0;
  const increment = target / 100;
  const duration = 2000;
  const stepTime = duration / 100;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target + (target === 100 ? '%' : '+');
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current) + (target === 100 ? '%' : '+');
    }
  }, stepTime);
}

// Intersection Observer for Stats Animation
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const statNumbers = entry.target.querySelectorAll('.stat-number');
      statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        animateCounter(stat, target);
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsBanner = document.querySelector('.stats-banner');
if (statsBanner) {
  statsObserver.observe(statsBanner);
}

// Scroll Reveal Animation
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Apply animation to various elements
document.querySelectorAll('.service-card, .gallery-item, .review-card, .faq-item, .process-step, .contact-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// Parallax effect for hero background
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const heroContent = document.querySelector('.hero-content');
  
  if (heroContent && scrolled < window.innerHeight) {
    heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
    heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
  }
});

// Simple tilt effect for service cards (optional enhancement)
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
  });
});

// Reviews Carousel
(function() {
  const track = document.querySelector('.reviews-track');
  const prevBtn = document.querySelector('.reviews-nav-prev');
  const nextBtn = document.querySelector('.reviews-nav-next');
  const dotsContainer = document.querySelector('.reviews-dots');
  if (!track || !prevBtn || !nextBtn || !dotsContainer) return;

  const cards = track.querySelectorAll('.review-card');
  let currentIndex = 0;
  let cardsPerView = 3;

  function getCardsPerView() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1100) return 2;
    return 3;
  }

  function getTotalPages() {
    return Math.max(1, cards.length - cardsPerView + 1);
  }

  function buildDots() {
    dotsContainer.innerHTML = '';
    const pages = Math.ceil(cards.length / cardsPerView);
    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('button');
      dot.classList.add('reviews-dot');
      dot.setAttribute('aria-label', 'Go to reviews page ' + (i + 1));
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', function() {
        currentIndex = i * cardsPerView;
        if (currentIndex > cards.length - cardsPerView) currentIndex = cards.length - cardsPerView;
        updateCarousel();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateCarousel() {
    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex > cards.length - cardsPerView) currentIndex = cards.length - cardsPerView;

    const card = cards[0];
    const gap = 24; // 1.5rem
    const cardWidth = card.offsetWidth + gap;
    const offset = currentIndex * cardWidth;
    track.style.transform = 'translateX(-' + offset + 'px)';

    prevBtn.disabled = currentIndex <= 0;
    nextBtn.disabled = currentIndex >= cards.length - cardsPerView;

    const dots = dotsContainer.querySelectorAll('.reviews-dot');
    const activePage = Math.round(currentIndex / cardsPerView);
    dots.forEach(function(dot, i) {
      dot.classList.toggle('active', i === activePage);
    });
  }

  function init() {
    cardsPerView = getCardsPerView();
    currentIndex = 0;
    buildDots();
    updateCarousel();
  }

  prevBtn.addEventListener('click', function() {
    currentIndex--;
    updateCarousel();
  });

  nextBtn.addEventListener('click', function() {
    currentIndex++;
    updateCarousel();
  });

  // Touch/swipe support
  let startX = 0;
  let isDragging = false;
  const carousel = document.querySelector('.reviews-carousel');

  carousel.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
    isDragging = true;
  }, { passive: true });

  carousel.addEventListener('touchend', function(e) {
    if (!isDragging) return;
    isDragging = false;
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        currentIndex++;
      } else {
        currentIndex--;
      }
      updateCarousel();
    }
  }, { passive: true });

  // Auto-play
  let autoplayTimer = setInterval(function() {
    if (currentIndex >= cards.length - cardsPerView) {
      currentIndex = 0;
    } else {
      currentIndex++;
    }
    updateCarousel();
  }, 5000);

  // Pause on hover
  const wrapper = document.querySelector('.reviews-carousel-wrapper');
  wrapper.addEventListener('mouseenter', function() { clearInterval(autoplayTimer); });
  wrapper.addEventListener('mouseleave', function() {
    autoplayTimer = setInterval(function() {
      if (currentIndex >= cards.length - cardsPerView) {
        currentIndex = 0;
      } else {
        currentIndex++;
      }
      updateCarousel();
    }, 5000);
  });

  window.addEventListener('resize', function() {
    cardsPerView = getCardsPerView();
    buildDots();
    updateCarousel();
  });

  init();
})();
