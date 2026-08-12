/* Midnight Builds — interactions only.
   Content lives in the HTML so the page works without JS.
   Replace the placeholder YouTube IDs / links in index.html with your real ones. */

(function () {
  'use strict';

  // Click-to-play: swap the placeholder for a privacy-enhanced YouTube embed.
  // Cards without a real data-yt id simply stay as a clean poster.
  document.querySelectorAll('[data-yt]').forEach(function (card) {
    var id = card.getAttribute('data-yt');
    if (!id || id === 'REPLACE') return;
    card.addEventListener('click', function (e) {
      e.preventDefault();
      var media = card.querySelector('.vcard__media');
      if (!media || media.dataset.loaded) return;
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) +
                   '?autoplay=1&rel=0&modestbranding=1';
      iframe.title = card.querySelector('.vcard__title')?.textContent || 'Video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.style.position = 'absolute';
      iframe.style.inset = '0';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = '0';
      media.innerHTML = '';
      media.appendChild(iframe);
      media.dataset.loaded = '1';
    });
  });

  // Subscribe: prevent the default no-op submit and show a friendly note.
  // TODO: wire this to a real provider (Buttondown / Mailchimp / ConvertKit)
  // by POSTing to their endpoint instead of the console log.
  var form = document.querySelector('[data-subscribe]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.querySelector('input[type="email"]');
      if (!email || !email.value) return;
      console.log('Subscribe (TODO connect provider):', email.value);
      var note = form.parentElement.querySelector('.note');
      if (note) {
        note.innerHTML = '<span class="ok">Thanks — you\'re on the list.</span> ' +
                         'Wire this form to your newsletter provider to go live.';
      }
      form.reset();
    });
  }
})();
