// de-medeiros.com — main.js

// ── MOBILE NAVIGATION TOGGLE ──────────────────────────────────
function menuFnc() {
  const links = document.getElementById('dm-nav-links');
  if (links) {
    links.classList.toggle('dm-nav-open');
  }
}

// Close mobile nav when a link is clicked
document.addEventListener('DOMContentLoaded', function () {
  const navLinks = document.querySelectorAll('.dm-nav-link');
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      const links = document.getElementById('dm-nav-links');
      if (links) links.classList.remove('dm-nav-open');
    });
  });
});