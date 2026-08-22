document.addEventListener('DOMContentLoaded', function () {

  // --- NAVBAR SCROLL STATE ---
  const navbarElement = document.getElementById('navbar');
  
  function handleNavbarScroll() {
    if (window.scrollY > 60) {
      navbarElement.classList.add('scrolled');
    } else {
      navbarElement.classList.remove('scrolled');
    }
  }
  
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  // --- HAMBURGER MENU ACTIONS ---
  const hamburgerButton = document.getElementById('hamburger');
  const navigationMenu = document.getElementById('navMenu');
  const navigationOverlay = document.getElementById('navOverlay');

  function toggleMobileMenu() {
    hamburgerButton.classList.toggle('active');
    navigationMenu.classList.toggle('active');
    navigationOverlay.classList.toggle('active');
    
    if (navigationMenu.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  function closeMobileMenu() {
    hamburgerButton.classList.remove('active');
    navigationMenu.classList.remove('active');
    navigationOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburgerButton.addEventListener('click', toggleMobileMenu);
  navigationOverlay.addEventListener('click', closeMobileMenu);
  
  document.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', closeMobileMenu);
  });

  // --- ELEMENT ENTRY ANIMATIONS ---
  const elementObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.getAttribute('data-delay')) || 0;
        setTimeout(function () {
          entry.target.classList.add('vis');
        }, delay);
        elementObserver.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  });

  document.querySelectorAll('[data-animate]').forEach(function (element) {
    elementObserver.observe(element);
  });

  // --- METRIC COUNTERS ANIMATION ---
  let countersAnimated = false;
  
  function executeCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    document.querySelectorAll('.stat-num[data-target]').forEach(function (counter) {
      const targetValue = parseInt(counter.getAttribute('data-target'));
      const duration = 2200;
      const startTime = performance.now();

      function animationStep(currentTime) {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const easeOutProgress = 1 - Math.pow(1 - progress, 3);
        
        counter.textContent = Math.floor(easeOutProgress * targetValue);
        
        if (progress < 1) {
          requestAnimationFrame(animationStep);
        } else {
          counter.textContent = targetValue;
        }
      }
      
      requestAnimationFrame(animationStep);
    });

    document.querySelectorAll('.stat-fill[data-width]').forEach(function (progressBar) {
      setTimeout(function () {
        progressBar.style.width = progressBar.getAttribute('data-width') + '%';
      }, 300);
    });
  }

  const statsSection = document.getElementById('stats');
  if (statsSection) {
    const statsObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        executeCounters();
        statsObserver.unobserve(statsSection);
      }
    }, { threshold: 0.3 });
    
    statsObserver.observe(statsSection);
  }

  // --- SHOWCASE PORTFOLIO CAROUSEL ---
  const showcaseTrack = document.getElementById('showTrack');
  const showcaseViewport = document.getElementById('showViewport');
  const showcaseLeftBtn = document.getElementById('showLeft');
  const showcaseRightBtn = document.getElementById('showRight');
  const showcaseProgress = document.getElementById('showProgress');
  const showcaseCards = showcaseTrack.querySelectorAll('.show-card');
  const totalShowcaseItems = showcaseCards.length;
  let currentShowcaseIndex = 0;

  function calculateVisibleCards() {
    return window.innerWidth <= 1024 ? 1 : 4;
  }

  function updateShowcasePosition() {
    const visibleCount = calculateVisibleCards();
    const maxScrollIndex = Math.max(0, totalShowcaseItems - visibleCount);
    
    if (currentShowcaseIndex > maxScrollIndex) {
      currentShowcaseIndex = maxScrollIndex;
    }

    const singleCard = showcaseCards[0];
    const trackStyle = getComputedStyle(showcaseTrack);
    const gapWidth = parseInt(trackStyle.gap) || 20;
    const cardScrollOffset = singleCard.offsetWidth + gapWidth;

    showcaseTrack.style.transform = 'translateX(' + (-currentShowcaseIndex * cardScrollOffset) + 'px)';

    if (showcaseProgress) {
      const progressWidth = (visibleCount / totalShowcaseItems) * 100;
      const progressLeft = (currentShowcaseIndex / totalShowcaseItems) * 100;
      showcaseProgress.style.width = progressWidth + '%';
      showcaseProgress.style.left = progressLeft + '%';
    }

    showcaseLeftBtn.disabled = currentShowcaseIndex === 0;
    showcaseRightBtn.disabled = currentShowcaseIndex >= maxScrollIndex;
  }

  showcaseLeftBtn.addEventListener('click', function () {
    if (currentShowcaseIndex > 0) {
      currentShowcaseIndex--;
      updateShowcasePosition();
    }
  });

  showcaseRightBtn.addEventListener('click', function () {
    const maxScrollIndex = totalShowcaseItems - calculateVisibleCards();
    if (currentShowcaseIndex < maxScrollIndex) {
      currentShowcaseIndex++;
      updateShowcasePosition();
    }
  });

  showcaseCards.forEach(function (card) {
    const hoverVideo = card.querySelector('.show-video');
    const cardFrame = card.querySelector('.show-frame');
    if (!hoverVideo || !cardFrame) return;

    cardFrame.addEventListener('mouseenter', function () {
      if (window.innerWidth <= 768) return;
      hoverVideo.play().catch(function () {});
      card.classList.add('playing');
    });
    
    cardFrame.addEventListener('mouseleave', function () {
      if (window.innerWidth <= 768) return;
      hoverVideo.pause();
      hoverVideo.currentTime = 0;
      card.classList.remove('playing');
    });
    
    cardFrame.addEventListener('click', function () {
      if (window.innerWidth > 768) return;
      if (card.classList.contains('playing')) {
        hoverVideo.pause();
        hoverVideo.currentTime = 0;
        card.classList.remove('playing');
      } else {
        showcaseCards.forEach(function (otherCard) {
          const otherVideo = otherCard.querySelector('.show-video');
          if (otherVideo && otherCard !== card) {
            otherVideo.pause();
            otherVideo.currentTime = 0;
            otherCard.classList.remove('playing');
          }
        });
        hoverVideo.play().catch(function () {});
        card.classList.add('playing');
      }
    });
  });

  let touchStartX = 0;
  showcaseViewport.addEventListener('touchstart', function (e) { 
    touchStartX = e.touches[0].clientX; 
  }, { passive: true });
  
  showcaseViewport.addEventListener('touchend', function (e) {
    const swipeDiff = touchStartX - e.changedTouches[0].clientX;
    const maxScrollIndex = totalShowcaseItems - calculateVisibleCards();
    
    if (Math.abs(swipeDiff) > 50) {
      if (swipeDiff > 0 && currentShowcaseIndex < maxScrollIndex) {
        currentShowcaseIndex++;
      } else if (swipeDiff < 0 && currentShowcaseIndex > 0) {
        currentShowcaseIndex--;
      }
      updateShowcasePosition();
    }
  }, { passive: true });

  updateShowcasePosition();
  window.addEventListener('resize', updateShowcasePosition);

  // --- PORTFOLIO CATEGORY FILTERS ---
  const filterButtons = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.port-card');
  
  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      filterButtons.forEach(function (btn) { btn.classList.remove('active'); });
      button.classList.add('active');
      
      const filterValue = button.getAttribute('data-filter');
      portfolioCards.forEach(function (card, index) {
        const isMatch = (filterValue === 'all' || card.getAttribute('data-cat') === filterValue);
        if (isMatch) {
          card.classList.remove('hide');
          card.style.opacity = '0';
          card.style.transform = 'translateY(24px)';
          setTimeout(function () {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 60 + index * 40);
        } else {
          card.classList.add('hide');
        }
      });
    });
  });

  // --- REUSABLE CAROUSEL CONTROLLER ---
  // A clean, modular function used to initialize both Team and Testimonials carousels.
  function initializeSlider({ trackId, prevBtnId, nextBtnId, dotSelector, totalSlides, autoplayInterval }) {
    const track = document.getElementById(trackId);
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);
    const dots = document.querySelectorAll(dotSelector);
    
    if (!track) return;
    
    let currentIndex = 0;
    let autoplayTimer;

    function goToSlide(slideIndex) {
      if (slideIndex < 0) {
        slideIndex = totalSlides - 1;
      }
      if (slideIndex >= totalSlides) {
        slideIndex = 0;
      }
      currentIndex = slideIndex;
      track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
      
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('active', idx === currentIndex);
      });
    }

    function startAutoplay() {
      clearInterval(autoplayTimer);
      autoplayTimer = setInterval(function () {
        goToSlide(currentIndex + 1);
      }, autoplayInterval);
    }

    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', function () {
        goToSlide(currentIndex - 1);
        startAutoplay();
      });
      nextBtn.addEventListener('click', function () {
        goToSlide(currentIndex + 1);
        startAutoplay();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const slideIdx = parseInt(dot.getAttribute('data-i') || dot.getAttribute('data-ti'));
        goToSlide(slideIdx);
        startAutoplay();
      });
    });

    let touchStartScreenX = 0;
    track.addEventListener('touchstart', function (e) {
      touchStartScreenX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', function (e) {
      const swipeDistance = touchStartScreenX - e.changedTouches[0].screenX;
      if (Math.abs(swipeDistance) > 50) {
        if (swipeDistance > 0) {
          goToSlide(currentIndex + 1);
        } else {
          goToSlide(currentIndex - 1);
        }
        startAutoplay();
      }
    }, { passive: true });

    startAutoplay();
  }

  // Init Testimonials Carousel
  initializeSlider({
    trackId: 'carouselTrack',
    prevBtnId: 'carPrev',
    nextBtnId: 'carNext',
    dotSelector: '[data-i]',
    totalSlides: 10,
    autoplayInterval: 5000
  });

  // Init Team Carousel
  initializeSlider({
    trackId: 'teamTrack',
    prevBtnId: 'teamPrev',
    nextBtnId: 'teamNext',
    dotSelector: '[data-ti]',
    totalSlides: 8,
    autoplayInterval: 6000
  });

  // --- SMOOTH SCROLL ACTIONS ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      e.preventDefault();
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarElement.offsetHeight;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // --- NAV LINK HIGH LIGHTER ---
  const contentSections = document.querySelectorAll('section[id]');
  
  function highlightNavigation() {
    const scrollTriggerY = window.scrollY + 120;
    
    contentSections.forEach(function (section) {
      const sectionTop = section.offsetTop - 120;
      const sectionBottom = sectionTop + section.offsetHeight;
      const associatedLink = document.querySelector('.nav-link[href="#' + section.id + '"]');
      
      if (associatedLink) {
        if (scrollTriggerY >= sectionTop && scrollTriggerY < sectionBottom) {
          associatedLink.style.color = '#fff';
        } else {
          associatedLink.style.color = '';
        }
      }
    });
  }
  
  window.addEventListener('scroll', highlightNavigation, { passive: true });

  // --- PARALLAX EFFECT HERO ---
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo && window.innerWidth > 768) {
    window.addEventListener('scroll', function () {
      const currentScroll = window.scrollY;
      if (currentScroll < window.innerHeight) {
        const scaleFactor = 1 + currentScroll * 0.0003;
        const translateFactor = currentScroll * 0.12;
        heroVideo.style.transform = 'scale(' + scaleFactor + ') translateY(' + translateFactor + 'px)';
      }
    }, { passive: true });
  }

  // --- IN-VIEW SHOWCASE VIDEO AUTOPAUSE ---
  const showcaseVideos = document.querySelectorAll('.show-video');
  if (showcaseVideos.length) {
    const videoVisibilityObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          entry.target.pause();
          entry.target.currentTime = 0;
          const parentCard = entry.target.closest('.show-card');
          if (parentCard) {
            parentCard.classList.remove('playing');
          }
        }
      });
    }, { threshold: 0 });
    
    showcaseVideos.forEach(function (video) {
      videoVisibilityObserver.observe(video);
    });
  }

});