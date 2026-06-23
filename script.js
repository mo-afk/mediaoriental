document.addEventListener('DOMContentLoaded', function () {

  /* ========================================
     NAVBAR
     ======================================== */
  var navbar = document.getElementById('navbar');
  function checkScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', checkScroll, { passive: true });
  checkScroll();

  /* ========================================
     HAMBURGER
     ======================================== */
  var hamburger = document.getElementById('hamburger');
  var navMenu = document.getElementById('navMenu');
  var overlay = document.getElementById('navOverlay');

  function toggleMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
  }
  function closeMenu() {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  hamburger.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', closeMenu);
  document.querySelectorAll('.nav-link').forEach(function (l) {
    l.addEventListener('click', closeMenu);
  });

  /* ========================================
     SCROLL REVEAL
     ======================================== */
  var animEls = document.querySelectorAll('[data-animate]');
  var animObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        var delay = parseInt(e.target.getAttribute('data-delay')) || 0;
        setTimeout(function () { e.target.classList.add('vis'); }, delay);
        animObs.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -50px 0px', threshold: 0.1 });
  animEls.forEach(function (el) { animObs.observe(el); });

  /* ========================================
     COUNTERS + STAT BARS
     ======================================== */
  var counters = document.querySelectorAll('.stat-num[data-target]');
  var statBars = document.querySelectorAll('.stat-fill[data-width]');
  var counted = false;
  function runCounters() {
    if (counted) return;
    counted = true;
    counters.forEach(function (c) {
      var target = parseInt(c.getAttribute('data-target'));
      var dur = 2200, start = performance.now();
      function step(now) {
        var p = Math.min((now - start) / dur, 1);
        var ease = 1 - Math.pow(1 - p, 3);
        c.textContent = Math.floor(ease * target);
        if (p < 1) requestAnimationFrame(step);
        else c.textContent = target;
      }
      requestAnimationFrame(step);
    });
    statBars.forEach(function (bar) {
      var w = bar.getAttribute('data-width');
      setTimeout(function () { bar.style.width = w + '%'; }, 300);
    });
  }
  var statsEl = document.getElementById('stats');
  if (statsEl) {
    var statsObs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { runCounters(); statsObs.unobserve(statsEl); }
    }, { threshold: 0.3 });
    statsObs.observe(statsEl);
  }

  /* ========================================
     PORTFOLIO FILTERS
     ======================================== */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var portCards = document.querySelectorAll('.port-card');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.getAttribute('data-filter');

      // Stop all videos when filtering
      document.querySelectorAll('.port-video').forEach(function (v) {
        v.pause();
        v.currentTime = 0;
      });
      document.querySelectorAll('.port-card').forEach(function (c) {
        c.classList.remove('playing');
      });

      portCards.forEach(function (card, i) {
        var show = (f === 'all' || card.getAttribute('data-cat') === f);
        if (show) {
          card.classList.remove('hide');
          card.style.opacity = '0';
          card.style.transform = 'translateY(24px)';
          setTimeout(function () {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 60 + i * 40);
        } else {
          card.classList.add('hide');
        }
      });
    });
  });

  /* ========================================
     ★ PORTFOLIO VIDEO — HOVER PLAY (desktop)
       + TAP PLAY (mobile)
     ======================================== */
  var allPortCards = document.querySelectorAll('.port-card');

  allPortCards.forEach(function (card) {
    var video = card.querySelector('.port-video');
    if (!video) return;

    // ---- DESKTOP: hover play ----
    card.addEventListener('mouseenter', function () {
      if (window.innerWidth <= 768) return;
      video.play().catch(function () {});
      card.classList.add('playing');
    });

    card.addEventListener('mouseleave', function () {
      if (window.innerWidth <= 768) return;
      video.pause();
      video.currentTime = 0;
      card.classList.remove('playing');
    });

    // ---- MOBILE: tap to play/pause ----
    card.querySelector('.port-media').addEventListener('click', function (e) {
      if (window.innerWidth > 768) return;
      e.preventDefault();

      if (card.classList.contains('playing')) {
        // Stop
        video.pause();
        video.currentTime = 0;
        card.classList.remove('playing');
      } else {
        // Stop all others
        allPortCards.forEach(function (c) {
          var v = c.querySelector('.port-video');
          if (v && c !== card) {
            v.pause();
            v.currentTime = 0;
            c.classList.remove('playing');
          }
        });
        // Play this one
        video.play().catch(function () {});
        card.classList.add('playing');
      }
    });
  });

  /* ========================================
     CAROUSEL
     ======================================== */
  var track = document.getElementById('carouselTrack');
  var prev = document.getElementById('carPrev');
  var next = document.getElementById('carNext');
  var dots = document.querySelectorAll('.dot');
  var cur = 0, total = 3, autoId;

  function goTo(i) {
    if (i < 0) i = total - 1;
    if (i >= total) i = 0;
    cur = i;
    track.style.transform = 'translateX(-' + cur * 100 + '%)';
    dots.forEach(function (d, idx) { d.classList.toggle('active', idx === cur); });
  }
  function autonext() { goTo(cur + 1); }
  function resetAuto() { clearInterval(autoId); autoId = setInterval(autonext, 5000); }

  prev.addEventListener('click', function () { goTo(cur - 1); resetAuto(); });
  next.addEventListener('click', function () { goTo(cur + 1); resetAuto(); });
  dots.forEach(function (d) {
    d.addEventListener('click', function () { goTo(parseInt(d.getAttribute('data-i'))); resetAuto(); });
  });
  autoId = setInterval(autonext, 5000);

  var tx = 0;
  track.addEventListener('touchstart', function (e) { tx = e.changedTouches[0].screenX; }, { passive: true });
  track.addEventListener('touchend', function (e) {
    var diff = tx - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) { diff > 0 ? goTo(cur + 1) : goTo(cur - 1); resetAuto(); }
  }, { passive: true });

  /* ========================================
     SMOOTH SCROLL
     ======================================== */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      var el = document.querySelector(href);
      if (el) {
        var top = el.getBoundingClientRect().top + window.pageYOffset - navbar.offsetHeight;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ========================================
     ACTIVE NAV
     ======================================== */
  var sections = document.querySelectorAll('section[id]');
  function highlightNav() {
    var y = window.scrollY + 120;
    sections.forEach(function (s) {
      var top = s.offsetTop - 120;
      var bot = top + s.offsetHeight;
      var link = document.querySelector('.nav-link[href="#' + s.id + '"]');
      if (link) link.style.color = (y >= top && y < bot) ? '#fff' : '';
    });
  }
  window.addEventListener('scroll', highlightNav, { passive: true });

  /* ========================================
     PARALLAX hero video
     ======================================== */
  var heroVideo = document.querySelector('.hero-video');
  if (heroVideo && window.innerWidth > 768) {
    window.addEventListener('scroll', function () {
      var s = window.scrollY;
      if (s < window.innerHeight) {
        heroVideo.style.transform = 'scale(' + (1 + s * .0003) + ') translateY(' + s * .15 + 'px)';
      }
    }, { passive: true });
  }

  /* ========================================
     TILT service cards (desktop)
     ======================================== */
  if (window.innerWidth > 1024) {
    document.querySelectorAll('.srv-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var rx = (e.clientY - r.top - r.height / 2) / 30;
        var ry = (r.width / 2 - (e.clientX - r.left)) / 30;
        card.style.transform = 'translateY(-4px) perspective(800px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  /* ========================================
     PAUSE portfolio videos when out of viewport
     (performance — saves bandwidth)
     ======================================== */
  var portVideos = document.querySelectorAll('.port-video');
  if (portVideos.length > 0) {
    var vidObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) {
          e.target.pause();
          e.target.currentTime = 0;
          var card = e.target.closest('.port-card');
          if (card) card.classList.remove('playing');
        }
      });
    }, { threshold: 0 });
    portVideos.forEach(function (v) { vidObs.observe(v); });
  }

});