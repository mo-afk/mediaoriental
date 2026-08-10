document.addEventListener('DOMContentLoaded', function () {

  var navbar = document.getElementById('navbar');
  function checkScroll(){navbar.classList.toggle('scrolled',window.scrollY>60)}
  window.addEventListener('scroll',checkScroll,{passive:true});checkScroll();

  var hamburger=document.getElementById('hamburger'),navMenu=document.getElementById('navMenu'),ov=document.getElementById('navOverlay');
  function toggleMenu(){hamburger.classList.toggle('active');navMenu.classList.toggle('active');ov.classList.toggle('active');document.body.style.overflow=navMenu.classList.contains('active')?'hidden':''}
  function closeMenu(){hamburger.classList.remove('active');navMenu.classList.remove('active');ov.classList.remove('active');document.body.style.overflow=''}
  hamburger.addEventListener('click',toggleMenu);ov.addEventListener('click',closeMenu);
  document.querySelectorAll('.nav-link').forEach(function(l){l.addEventListener('click',closeMenu)});

  var aObs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){var d=parseInt(e.target.getAttribute('data-delay'))||0;setTimeout(function(){e.target.classList.add('vis')},d);aObs.unobserve(e.target)}})},{rootMargin:'0px 0px -50px 0px',threshold:.1});
  document.querySelectorAll('[data-animate]').forEach(function(el){aObs.observe(el)});

  var counted=false;function runCounters(){if(counted)return;counted=true;
    document.querySelectorAll('.stat-num[data-target]').forEach(function(c){var t=parseInt(c.getAttribute('data-target')),dur=2200,st=performance.now();function step(now){var p=Math.min((now-st)/dur,1);c.textContent=Math.floor((1-Math.pow(1-p,3))*t);if(p<1)requestAnimationFrame(step);else c.textContent=t}requestAnimationFrame(step)});
    document.querySelectorAll('.stat-fill[data-width]').forEach(function(b){setTimeout(function(){b.style.width=b.getAttribute('data-width')+'%'},300)})
  }
  var sEl=document.getElementById('stats');if(sEl){var sO=new IntersectionObserver(function(e){if(e[0].isIntersecting){runCounters();sO.unobserve(sEl)}},{threshold:.3});sO.observe(sEl)}

  /* SHOWCASE CAROUSEL */
  var showTrack = document.getElementById('showTrack');
  var showViewport = document.getElementById('showViewport');
  var showLeft = document.getElementById('showLeft');
  var showRight = document.getElementById('showRight');
  var showProgress = document.getElementById('showProgress');
  var showCards = showTrack.querySelectorAll('.show-card');
  var totalShow = showCards.length;
  var currentShow = 0;

  function getVisibleCount() {
    if (window.innerWidth <= 1024) return 1;
    return 4;
  }

  function updateShow() {
    var visible = getVisibleCount();
    var maxIndex = Math.max(0, totalShow - visible);
    if (currentShow > maxIndex) currentShow = maxIndex;

    var card = showCards[0];
    var style = getComputedStyle(showTrack);
    var gap = parseInt(style.gap) || 20;
    var cardW = card.offsetWidth + gap;

    showTrack.style.transform = 'translateX(' + (-currentShow * cardW) + 'px)';

    if (showProgress) {
      var progressWidth = (visible / totalShow) * 100;
      var progressLeft = (currentShow / totalShow) * 100;
      showProgress.style.width = progressWidth + '%';
      showProgress.style.left = progressLeft + '%';
    }

    showLeft.disabled = currentShow === 0;
    showRight.disabled = currentShow >= maxIndex;
  }

  showLeft.addEventListener('click', function () {
    if (currentShow > 0) {
      currentShow--;
      updateShow();
    }
  });

  showRight.addEventListener('click', function () {
    var maxIndex = totalShow - getVisibleCount();
    if (currentShow < maxIndex) {
      currentShow++;
      updateShow();
    }
  });

  showCards.forEach(function (card) {
    var video = card.querySelector('.show-video');
    var frame = card.querySelector('.show-frame');
    if (!video || !frame) return;

    frame.addEventListener('mouseenter', function () {
      if (window.innerWidth <= 768) return;
      video.play().catch(function () {});
      card.classList.add('playing');
    });
    frame.addEventListener('mouseleave', function () {
      if (window.innerWidth <= 768) return;
      video.pause();
      video.currentTime = 0;
      card.classList.remove('playing');
    });
    frame.addEventListener('click', function () {
      if (window.innerWidth > 768) return;
      if (card.classList.contains('playing')) {
        video.pause();
        video.currentTime = 0;
        card.classList.remove('playing');
      } else {
        showCards.forEach(function (c) {
          var v = c.querySelector('.show-video');
          if (v && c !== card) {
            v.pause();
            v.currentTime = 0;
            c.classList.remove('playing');
          }
        });
        video.play().catch(function () {});
        card.classList.add('playing');
      }
    });
  });

  var stx = 0;
  showViewport.addEventListener('touchstart', function (e) { stx = e.touches[0].clientX; }, { passive: true });
  showViewport.addEventListener('touchend', function (e) {
    var diff = stx - e.changedTouches[0].clientX;
    var maxIndex = totalShow - getVisibleCount();
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentShow < maxIndex) currentShow++;
      else if (diff < 0 && currentShow > 0) currentShow--;
      updateShow();
    }
  }, { passive: true });

  updateShow();
  window.addEventListener('resize', updateShow);

  /* PORTFOLIO FILTERS - IMAGES ONLY */
  var fBtns=document.querySelectorAll('.filter-btn'),pCards=document.querySelectorAll('.port-card');
  fBtns.forEach(function(btn){
    btn.addEventListener('click',function(){
      fBtns.forEach(function(b){b.classList.remove('active')});
      btn.classList.add('active');
      var f=btn.getAttribute('data-filter');
      pCards.forEach(function(card,i){
        var show=(f==='all'||card.getAttribute('data-cat')===f);
        if(show){
          card.classList.remove('hide');
          card.style.opacity='0';
          card.style.transform='translateY(24px)';
          setTimeout(function(){card.style.opacity='1';card.style.transform='translateY(0)'},60+i*40)
        }else{
          card.classList.add('hide')
        }
      })
    })
  });

  /* TESTI CAROUSEL */
  var track=document.getElementById('carouselTrack'),prev=document.getElementById('carPrev'),next2=document.getElementById('carNext'),dots=document.querySelectorAll('[data-i]'),cur=0,total=10,autoId;
  function goTo(i){if(i<0)i=total-1;if(i>=total)i=0;cur=i;track.style.transform='translateX(-'+cur*100+'%)';dots.forEach(function(d,idx){d.classList.toggle('active',idx===cur)})}
  function an(){goTo(cur+1)}function ra(){clearInterval(autoId);autoId=setInterval(an,5000)}
  prev.addEventListener('click',function(){goTo(cur-1);ra()});next2.addEventListener('click',function(){goTo(cur+1);ra()});
  dots.forEach(function(d){d.addEventListener('click',function(){goTo(parseInt(d.getAttribute('data-i')));ra()})});autoId=setInterval(an,5000);
  var tx2=0;track.addEventListener('touchstart',function(e){tx2=e.changedTouches[0].screenX},{passive:true});track.addEventListener('touchend',function(e){var diff=tx2-e.changedTouches[0].screenX;if(Math.abs(diff)>50){diff>0?goTo(cur+1):goTo(cur-1);ra()}},{passive:true});

  /* TEAM CAROUSEL */
  var teamTrack=document.getElementById('teamTrack'),teamPrev=document.getElementById('teamPrev'),teamNext=document.getElementById('teamNext'),teamDots=document.querySelectorAll('[data-ti]'),teamCur=0,teamTotal=8,teamAutoId;
  function teamGoTo(i){if(i<0)i=teamTotal-1;if(i>=teamTotal)i=0;teamCur=i;teamTrack.style.transform='translateX(-'+teamCur*100+'%)';teamDots.forEach(function(d,idx){d.classList.toggle('active',idx===teamCur)})}
  function teamAn(){teamGoTo(teamCur+1)}function teamRa(){clearInterval(teamAutoId);teamAutoId=setInterval(teamAn,6000)}
  if(teamTrack&&teamPrev&&teamNext){
    teamPrev.addEventListener('click',function(){teamGoTo(teamCur-1);teamRa()});
    teamNext.addEventListener('click',function(){teamGoTo(teamCur+1);teamRa()});
    teamDots.forEach(function(d){d.addEventListener('click',function(){teamGoTo(parseInt(d.getAttribute('data-ti')));teamRa()})});
    teamAutoId=setInterval(teamAn,6000);
    var ttx=0;teamTrack.addEventListener('touchstart',function(e){ttx=e.changedTouches[0].screenX},{passive:true});teamTrack.addEventListener('touchend',function(e){var diff=ttx-e.changedTouches[0].screenX;if(Math.abs(diff)>50){diff>0?teamGoTo(teamCur+1):teamGoTo(teamCur-1);teamRa()}},{passive:true});
  }

  /* SMOOTH SCROLL */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){var h=this.getAttribute('href');if(h==='#')return;e.preventDefault();var el=document.querySelector(h);if(el)window.scrollTo({top:el.getBoundingClientRect().top+window.pageYOffset-navbar.offsetHeight,behavior:'smooth'})})});

  /* ACTIVE NAV */
  var secs=document.querySelectorAll('section[id]');function hNav(){var y=window.scrollY+120;secs.forEach(function(s){var t=s.offsetTop-120,b=t+s.offsetHeight,l=document.querySelector('.nav-link[href="#'+s.id+'"]');if(l)l.style.color=(y>=t&&y<b)?'#fff':''})}window.addEventListener('scroll',hNav,{passive:true});

  /* PARALLAX */
  var hv=document.querySelector('.hero-video');if(hv&&window.innerWidth>768){window.addEventListener('scroll',function(){var s=window.scrollY;if(s<window.innerHeight)hv.style.transform='scale('+(1+s*.0003)+') translateY('+s*.12+'px)'},{passive:true})}

  /* AUTO PAUSE showcase videos */
  var pvs=document.querySelectorAll('.show-video');
  if(pvs.length){
    var vObs=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(!e.isIntersecting){
          e.target.pause();
          e.target.currentTime=0;
          var c=e.target.closest('.show-card');
          if(c)c.classList.remove('playing');
        }
      });
    },{threshold:0});
    pvs.forEach(function(v){vObs.observe(v)});
  }

});