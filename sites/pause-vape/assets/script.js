/* =========================================================
   La Pause Vape & Détente — interactions
   Aucune dépendance externe.
   ========================================================= */
(function () {
  'use strict';

  /* ------------------------------------------------------
     CONFIGURATION — à adapter par la boutique
     ------------------------------------------------------ */
  var CONFIG = {
    // Adresse qui reçoit les messages du formulaire (ouverture du client mail).
    email: 'contact@lapausevape.fr',
    // Numéro affiché / composé.
    phone: '+33361431379',
    // Optionnel : URL d'un service de formulaire (Formspree, API…).
    // Si renseignée, le message est envoyé en POST JSON au lieu d'ouvrir le client mail.
    formEndpoint: null
  };

  /* Horaires : 0 = dimanche … 6 = samedi. Minutes depuis minuit. */
  var HOURS = {
    0: null,
    1: { open: 11 * 60, close: 19 * 60 + 30 },
    2: { open: 10 * 60, close: 19 * 60 + 30 },
    3: { open: 10 * 60, close: 19 * 60 + 30 },
    4: { open: 10 * 60, close: 19 * 60 + 30 },
    5: { open: 10 * 60, close: 19 * 60 + 30 },
    6: { open: 9 * 60 + 30, close: 18 * 60 }
  };
  var DAY_NAMES = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------
     1. Révélation au défilement
     ------------------------------------------------------ */
  function initReveal() {
    var items = $$('.reveal');
    items.forEach(function (el) {
      var d = el.getAttribute('data-delay');
      if (d) el.style.setProperty('--d', d);
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    items.forEach(function (el) { io.observe(el); });

    // Filet de sécurité : rien ne doit rester invisible.
    window.setTimeout(function () {
      items.forEach(function (el) { el.classList.add('is-in'); });
    }, 4000);
  }

  /* ------------------------------------------------------
     2. En-tête collant + lien actif
     ------------------------------------------------------ */
  function initHeader() {
    var header = $('#header');
    var pill = $('#status-pill-header');
    var ticking = false;

    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      header.classList.toggle('is-stuck', y > 24);
      if (pill) pill.hidden = y < 320 || window.innerWidth < 1080;
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();

    // Lien de navigation actif
    var links = $$('.nav a[href^="#"]');
    var sections = links.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
    if (!('IntersectionObserver' in window) || !sections.length) return;

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ------------------------------------------------------
     3. Menu mobile
     ------------------------------------------------------ */
  function initMenu() {
    var burger = $('#burger');
    var nav = $('#nav');
    if (!burger || !nav) return;

    function close() {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Ouvrir le menu');
    }

    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    });

    $$('a', nav).forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 820) close(); });
  }

  /* ------------------------------------------------------
     4. Statut d'ouverture (heure de Paris)
     ------------------------------------------------------ */
  function parisNow() {
    try {
      var parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Paris', weekday: 'short',
        hour: '2-digit', minute: '2-digit', hour12: false
      }).formatToParts(new Date());
      var map = {};
      parts.forEach(function (p) { map[p.type] = p.value; });
      var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var day = days[map.weekday];
      var minutes = (parseInt(map.hour, 10) % 24) * 60 + parseInt(map.minute, 10);
      if (typeof day !== 'number' || isNaN(minutes)) throw new Error('bad parts');
      return { day: day, minutes: minutes };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function fmt(minutes) {
    var h = Math.floor(minutes / 60);
    var m = minutes % 60;
    return h + 'h' + (m < 10 ? '0' + m : m);
  }

  function nextOpening(day) {
    for (var i = 1; i <= 7; i++) {
      var d = (day + i) % 7;
      if (HOURS[d]) return { day: d, offset: i, open: HOURS[d].open };
    }
    return null;
  }

  function computeStatus() {
    var now = parisNow();
    var today = HOURS[now.day];

    if (today && now.minutes >= today.open && now.minutes < today.close) {
      return { open: true, label: 'Ouvert · ferme à ' + fmt(today.close) };
    }
    if (today && now.minutes < today.open) {
      return { open: false, label: 'Fermé · ouvre à ' + fmt(today.open) };
    }
    var next = nextOpening(now.day);
    if (!next) return { open: false, label: 'Fermé' };
    var when = next.offset === 1 ? 'demain' : next.offset === 7 ? 'dans une semaine' : DAY_NAMES[next.day];
    return { open: false, label: 'Fermé · ouvre ' + when + ' à ' + fmt(next.open) };
  }

  function initStatus() {
    function render() {
      var status = computeStatus();
      $$('.status-pill').forEach(function (pill) {
        var label = $('[data-status-label]', pill);
        if (label) label.textContent = status.label;
        pill.classList.toggle('is-closed', !status.open);
      });

      var day = parisNow().day;
      $$('#hours-list li').forEach(function (li) {
        li.classList.toggle('is-today', Number(li.getAttribute('data-day')) === day);
      });
    }
    render();
    window.setInterval(render, 60000);
  }

  /* ------------------------------------------------------
     5. Barre d'action mobile
     ------------------------------------------------------ */
  function initMobileBar() {
    var bar = $('#mobile-bar');
    if (!bar) return;
    var contact = $('#contact');

    function update() {
      var scrolled = (window.scrollY || window.pageYOffset) > 420;
      var inContact = false;
      if (contact) {
        var r = contact.getBoundingClientRect();
        inContact = r.top < window.innerHeight * 0.75 && r.bottom > 0;
      }
      bar.classList.toggle('is-visible', scrolled && !inContact);
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  /* ------------------------------------------------------
     6. Formulaire de contact
     ------------------------------------------------------ */
  function initForm() {
    var form = $('#contact-form');
    if (!form) return;
    var note = $('#form-note');

    function say(message, kind) {
      note.textContent = message;
      note.className = 'form-note' + (kind ? ' is-' + kind : '');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var fields = [$('#f-name'), $('#f-contact'), $('#f-msg')];
      var missing = fields.filter(function (f) { return !f.value.trim(); });
      fields.forEach(function (f) { f.classList.toggle('is-error', !f.value.trim()); });

      if (missing.length) {
        missing[0].focus();
        say('Merci de compléter les champs manquants.', 'error');
        return;
      }

      var data = {
        name: $('#f-name').value.trim(),
        contact: $('#f-contact').value.trim(),
        topic: $('#f-topic').value,
        message: $('#f-msg').value.trim()
      };

      if (CONFIG.formEndpoint) {
        say('Envoi en cours…');
        fetch(CONFIG.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          form.reset();
          say('Message envoyé — merci ! Nous revenons vers vous rapidement.', 'ok');
        }).catch(function () {
          say('L\'envoi a échoué. Appelez-nous au 03 61 43 13 79, c\'est plus rapide.', 'error');
        });
        return;
      }

      var subject = 'Question site — ' + data.topic;
      var body = 'Nom : ' + data.name + '\n'
               + 'Contact : ' + data.contact + '\n'
               + 'Sujet : ' + data.topic + '\n\n'
               + data.message;
      window.location.href = 'mailto:' + CONFIG.email
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);
      say('Votre messagerie s\'ouvre avec le message pré-rempli. Vous pouvez aussi nous appeler au 03 61 43 13 79.', 'ok');
    });

    $$('input, textarea', form).forEach(function (f) {
      f.addEventListener('input', function () { f.classList.remove('is-error'); });
    });
  }

  /* ------------------------------------------------------
     7. Contrôle d'âge
     ------------------------------------------------------ */
  function initAgeGate() {
    var gate = $('#age-gate');
    if (!gate) return;

    var stored = null;
    try { stored = window.localStorage.getItem('lpv-age-ok'); } catch (e) { /* mode privé */ }
    if (stored === '1') return;

    gate.hidden = false;
    document.body.classList.add('is-locked');
    var yes = $('#age-yes');
    if (yes) {
      yes.focus();
      yes.addEventListener('click', function () {
        try { window.localStorage.setItem('lpv-age-ok', '1'); } catch (e) { /* ignore */ }
        gate.hidden = true;
        document.body.classList.remove('is-locked');
      });
    }
  }

  /* ------------------------------------------------------
     8. Divers
     ------------------------------------------------------ */
  function initMisc() {
    var year = $('#year');
    if (year) year.textContent = String(new Date().getFullYear());

    // Défilement doux avec compensation de l'en-tête fixe.
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id === '#' || id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 74;
        var top = target.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) - offset + 1;
        window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
        if (history.replaceState) history.replaceState(null, '', id);
      });
    });
  }

  /* ------------------------------------------------------ */
  function boot() {
    [initReveal, initHeader, initMenu, initStatus, initMobileBar, initForm, initAgeGate, initMisc]
      .forEach(function (fn) {
        try { fn(); } catch (e) { if (window.console) console.error(e); }
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
