/**
 * FIXUP GLOBAL APP RUNTIME (app.js)
 * Manages universal commercial navbar, dynamic auth dropdowns,
 * toast alerts, and footer hydration.
 */

(function () {
  'use strict';

  // Calculate relative root path
  function getRootPrefix() {
    const p = window.location.pathname.replace(/\\/g, '/');
    if (p.includes('/frontend/pages/') || p.includes('/frontend/customer/') || p.includes('/frontend/provider/') || p.includes('/frontend/admin/')) {
      return '../../';
    }
    if (p.includes('/frontend/')) {
      return '../';
    }
    return './';
  }

  const prefix = getRootPrefix();

  // Toast Notification System
  window.FixupToast = {
    container: null,

    init() {
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.className = 'fixup-toast-container';
        document.body.appendChild(this.container);
      }
    },

    show(title, message = '', type = 'info', duration = 3500) {
      this.init();
      const toast = document.createElement('div');
      toast.className = `fixup-toast toast-${type}`;

      let icon = '<i class="fa-solid fa-circle-info text-info"></i>';
      if (type === 'success') icon = '<i class="fa-solid fa-circle-check text-success"></i>';
      if (type === 'danger') icon = '<i class="fa-solid fa-circle-exclamation text-danger"></i>';
      if (type === 'warning') icon = '<i class="fa-solid fa-triangle-exclamation text-warning"></i>';

      toast.innerHTML = `
        <div style="font-size: 1.25rem;">${icon}</div>
        <div style="flex: 1;">
          <div style="font-weight: 800; font-size: 0.92rem;">${title}</div>
          ${message ? `<div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px;">${message}</div>` : ''}
        </div>
        <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.1rem;">&times;</button>
      `;

      toast.querySelector('button').addEventListener('click', () => toast.remove());
      this.container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(12px)';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }
  };

  // Render Commercial Sticky Navbar
  function renderNavbar() {
    const navPlaceholder = document.getElementById('navbar-mount');
    if (!navPlaceholder) return;

    const session = window.FixupStore.getSession();
    const currentPath = window.location.pathname.replace(/\\/g, '/');

    let authBlockHtml = '';
    let leftCtaHtml = '';

    if (session) {
      // User is logged in
      const initials = session.name ? session.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

      if (session.role === 'CUSTOMER') {
        authBlockHtml = `
          <div class="auth-dropdown-wrapper">
            <div class="user-profile-trigger" id="userDropdownTrigger">
              <div class="user-avatar-initials">${initials}</div>
              <span class="user-display-name">${session.name}</span>
              <i class="fa-solid fa-angle-down" style="font-size: 0.75rem; color: var(--text-muted);"></i>
            </div>
            <div class="auth-dropdown-menu" id="userDropdownMenu">
              <div class="dropdown-header-block">
                <div class="dropdown-header-name">${session.name}</div>
                <div class="dropdown-header-role">Customer Account</div>
              </div>
              <a href="${prefix}frontend/customer/dashboard.html" class="dropdown-link"><i class="fa-solid fa-table-columns"></i> Dashboard</a>
              <a href="${prefix}frontend/customer/bookings.html" class="dropdown-link"><i class="fa-solid fa-calendar-check"></i> My Bookings</a>
              <a href="${prefix}frontend/customer/profile.html" class="dropdown-link"><i class="fa-solid fa-user"></i> Profile</a>
              <a href="${prefix}frontend/customer/settings.html" class="dropdown-link"><i class="fa-solid fa-gear"></i> Settings</a>
              <div class="dropdown-divider"></div>
              <a href="javascript:void(0)" class="dropdown-link dropdown-link-danger" id="navLogoutBtn"><i class="fa-solid fa-arrow-right-from-bracket"></i> Logout</a>
            </div>
          </div>
        `;
      } else if (session.role === 'SERVICE_PROVIDER') {
        authBlockHtml = `
          <div class="auth-dropdown-wrapper">
            <div class="user-profile-trigger" id="userDropdownTrigger">
              <div class="user-avatar-initials" style="background: var(--success);">${initials}</div>
              <span class="user-display-name">${session.name}</span>
              <i class="fa-solid fa-angle-down" style="font-size: 0.75rem; color: var(--text-muted);"></i>
            </div>
            <div class="auth-dropdown-menu" id="userDropdownMenu">
              <div class="dropdown-header-block">
                <div class="dropdown-header-name">${session.name}</div>
                <div class="dropdown-header-role">Service Professional</div>
              </div>
              <a href="${prefix}frontend/provider/dashboard.html" class="dropdown-link"><i class="fa-solid fa-gauge-high"></i> Provider Dashboard</a>
              <a href="${prefix}frontend/provider/assigned-jobs.html" class="dropdown-link"><i class="fa-solid fa-screwdriver-wrench"></i> My Jobs</a>
              <a href="${prefix}frontend/provider/earnings.html" class="dropdown-link"><i class="fa-solid fa-wallet"></i> Earnings & Payouts</a>
              <a href="${prefix}frontend/provider/profile.html" class="dropdown-link"><i class="fa-solid fa-id-card"></i> Profile</a>
              <div class="dropdown-divider"></div>
              <a href="javascript:void(0)" class="dropdown-link dropdown-link-danger" id="navLogoutBtn"><i class="fa-solid fa-arrow-right-from-bracket"></i> Logout</a>
            </div>
          </div>
        `;
      }
    } else {
      // Guest User
      leftCtaHtml = `
        <a href="${prefix}frontend/pages/provider-register.html" class="btn-nav-provider">
          <i class="fa-solid fa-briefcase"></i> Register as a Service Provider
        </a>
      `;

      authBlockHtml = `
        <a href="${prefix}frontend/pages/login.html" class="btn-fixup btn-secondary-fixup btn-sm">
          <i class="fa-solid fa-arrow-right-to-bracket"></i> Login / Sign Up
        </a>
      `;
    }

    const mobileAuthLinksHtml = session ? `
            <hr style="border-color: var(--border-color); margin: 6px 0;">
            ${session.role === 'CUSTOMER' ? `
            <a href="${prefix}frontend/customer/dashboard.html" class="nav-link-item"><i class="fa-solid fa-table-columns"></i> Dashboard</a>
            <a href="${prefix}frontend/customer/bookings.html" class="nav-link-item"><i class="fa-solid fa-calendar-check"></i> My Bookings</a>
            ` : `
            <a href="${prefix}frontend/provider/dashboard.html" class="nav-link-item"><i class="fa-solid fa-gauge-high"></i> Provider Dashboard</a>
            <a href="${prefix}frontend/provider/assigned-jobs.html" class="nav-link-item"><i class="fa-solid fa-screwdriver-wrench"></i> My Jobs</a>
            `}
            <a href="javascript:void(0)" class="btn-fixup btn-secondary-fixup btn-sm" id="mobileLogoutBtn"><i class="fa-solid fa-arrow-right-from-bracket"></i> Logout</a>
    ` : `
            <a href="${prefix}frontend/pages/provider-register.html" class="btn-fixup btn-secondary-fixup btn-sm">Register as Provider</a>
            <a href="${prefix}frontend/pages/login.html" class="btn-fixup btn-secondary-fixup btn-sm"><i class="fa-solid fa-arrow-right-to-bracket"></i> Login / Sign Up</a>
    `;

    navPlaceholder.innerHTML = `
      <nav class="navbar-fixup">
        <div class="navbar-container">
          <!-- Left side -->
          <div class="navbar-left">
            <a href="${prefix}index.html" class="navbar-brand">
              <div class="brand-symbol">F</div>
              <span class="brand-wordmark">Fixup<span class="brand-dot">.</span></span>
            </a>
            ${leftCtaHtml}
          </div>

          <!-- Center: nav links -->
          <div class="navbar-center">
            <ul class="nav-links-list">
              <li><a href="${prefix}index.html" class="nav-link-item ${currentPath.endsWith('index.html') || currentPath.endsWith('/') ? 'active' : ''}">Home</a></li>
              <li><a href="${prefix}frontend/pages/services.html" class="nav-link-item ${currentPath.includes('services.html') ? 'active' : ''}">Services</a></li>
              <li><a href="${prefix}frontend/pages/how-it-works.html" class="nav-link-item ${currentPath.includes('how-it-works.html') ? 'active' : ''}">How It Works</a></li>
              <li><a href="${prefix}frontend/pages/reviews.html" class="nav-link-item ${currentPath.includes('reviews.html') ? 'active' : ''}">Reviews</a></li>
              <li><a href="${prefix}frontend/pages/contact.html" class="nav-link-item ${currentPath.includes('contact.html') ? 'active' : ''}">Contact Us</a></li>
            </ul>
          </div>

          <!-- Right side -->
          <div class="navbar-right">
            <a href="${prefix}frontend/pages/request-service.html" class="btn-fixup btn-primary-fixup btn-sm">
              <i class="fa-solid fa-calendar-plus"></i> Request a Service
            </a>

            <a href="${prefix}frontend/pages/emergency.html" class="btn-fixup btn-emergency btn-sm">
              <i class="fa-solid fa-bolt"></i> Emergency Request
            </a>

            <!-- Theme Toggle -->
            <button class="btn-theme-toggle" type="button" aria-label="Toggle Theme">
              <i class="fa-solid fa-moon"></i>
            </button>

            <!-- Auth profile or login -->
            ${authBlockHtml}

            <!-- Mobile Hamburger Toggle -->
            <button class="mobile-nav-toggle" id="mobileMenuBtn" aria-label="Toggle mobile menu">
              <i class="fa-solid fa-bars"></i>
            </button>
          </div>
        </div>
      </nav>

      <!-- Mobile Drawer Overlay -->
      <div class="mobile-nav-drawer" id="mobileDrawer">
        <div class="mobile-nav-content">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
            <div style="font-size: 1.3rem; font-weight: 900;">Fixup<span style="color: var(--accent);">.</span></div>
            <button id="closeMobileDrawer" style="background: none; border: none; font-size: 1.4rem; color: var(--text-muted); cursor: pointer;">&times;</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            <a href="${prefix}index.html" class="nav-link-item">Home</a>
            <a href="${prefix}frontend/pages/services.html" class="nav-link-item">Services</a>
            <a href="${prefix}frontend/pages/how-it-works.html" class="nav-link-item">How It Works</a>
            <a href="${prefix}frontend/pages/reviews.html" class="nav-link-item">Reviews</a>
            <a href="${prefix}frontend/pages/contact.html" class="nav-link-item">Contact Us</a>
            <hr style="border-color: var(--border-color); margin: 6px 0;">
            <a href="${prefix}frontend/pages/request-service.html" class="btn-fixup btn-primary-fixup btn-sm">Request a Service</a>
            <a href="${prefix}frontend/pages/emergency.html" class="btn-fixup btn-emergency btn-sm">Emergency 60-Min Rush</a>
            ${mobileAuthLinksHtml}
          </div>
        </div>
      </div>
    `;

    // Guard: only one blue F mark is allowed beside the Fixup wordmark.
    const brandLink = navPlaceholder.querySelector('.navbar-brand');
    if (brandLink) {
      navPlaceholder.querySelectorAll('.fixup-brand-mark, .fixup-brand-link').forEach((el) => el.remove());
      const marks = brandLink.querySelectorAll('.brand-symbol');
      marks.forEach((el, idx) => {
        if (idx > 0) el.remove();
      });
      navPlaceholder.querySelectorAll('.navbar-left > .brand-symbol').forEach((el) => el.remove());
    }

    window.dispatchEvent(new CustomEvent('fixup-navbar-rendered'));

    // Dropdown toggle
    const trigger = document.getElementById('userDropdownTrigger');
    const menu = document.getElementById('userDropdownMenu');
    if (trigger && menu) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
      });
      document.addEventListener('click', () => {
        menu.classList.remove('show');
      });
    }

    // Logout button handler
    const logoutBtn = document.getElementById('navLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        window.FixupStore.clearSession();
        window.FixupToast.show('Logged Out', 'You have been safely signed out.', 'info');
        setTimeout(() => {
          window.location.href = `${prefix}index.html`;
        }, 600);
      });
    }

    // Mobile drawer toggle
    const mobBtn = document.getElementById('mobileMenuBtn');
    const drawer = document.getElementById('mobileDrawer');
    const closeMob = document.getElementById('closeMobileDrawer');
    if (mobBtn && drawer) {
      mobBtn.addEventListener('click', () => drawer.classList.add('open'));
      closeMob?.addEventListener('click', () => drawer.classList.remove('open'));
      drawer.addEventListener('click', (e) => {
        if (e.target === drawer) drawer.classList.remove('open');
      });
    }
  }

  // Render Commercial Footer
  function renderFooter() {
    const footerMount = document.getElementById('footer-mount');
    if (!footerMount) return;

    footerMount.innerHTML = `
      <footer class="footer-fixup">
        <div class="container-custom">
          <div class="row g-4" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 32px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                <div class="brand-symbol" style="width: 34px; height: 34px; font-size: 1.1rem;">F</div>
                <span style="font-size: 1.4rem; font-weight: 900; color: #ffffff;">Fixup<span style="color: var(--accent);">.</span></span>
              </div>
              <p style="font-size: 0.9rem; line-height: 1.6; color: #94a3b8; margin-bottom: 20px;">
                Your Home Deserves the Best. Connecting urban households with verified, background-checked service professionals with transparent rates and 30-day warranty.
              </p>
              <div style="display: flex; gap: 14px;">
                <a href="javascript:void(0)" style="color: #cbd5e1; font-size: 1.1rem;"><i class="fa-brands fa-facebook-f"></i></a>
                <a href="javascript:void(0)" style="color: #cbd5e1; font-size: 1.1rem;"><i class="fa-brands fa-x-twitter"></i></a>
                <a href="javascript:void(0)" style="color: #cbd5e1; font-size: 1.1rem;"><i class="fa-brands fa-instagram"></i></a>
                <a href="javascript:void(0)" style="color: #cbd5e1; font-size: 1.1rem;"><i class="fa-brands fa-linkedin-in"></i></a>
              </div>
            </div>

            <div>
              <h5>Home Services</h5>
              <ul>
                <li><a href="${prefix}frontend/pages/services.html?cat=Plumbing">Plumbing & Water Systems</a></li>
                <li><a href="${prefix}frontend/pages/services.html?cat=Electrical">Electrical Repairs & Wiring</a></li>
                <li><a href="${prefix}frontend/pages/services.html?cat=AC+Repair">Air Conditioner Servicing</a></li>
                <li><a href="${prefix}frontend/pages/services.html?cat=Cleaning">Deep Home & Kitchen Scrub</a></li>
                <li><a href="${prefix}frontend/pages/services.html?cat=Carpentry">Carpentry & Assembly</a></li>
                <li><a href="${prefix}frontend/pages/services.html?cat=Painting">Waterproofing & Painting</a></li>
              </ul>
            </div>

            <div>
              <h5>Quick Links</h5>
              <ul>
                <li><a href="${prefix}frontend/pages/how-it-works.html">How Fixup Works</a></li>
                <li><a href="${prefix}frontend/pages/request-service.html">Request a Service</a></li>
                <li><a href="${prefix}frontend/pages/emergency.html">Emergency 60-Min Rush</a></li>
                <li><a href="${prefix}frontend/pages/reviews.html">Verified Homeowner Reviews</a></li>
                <li><a href="${prefix}frontend/pages/contact.html">24/7 Customer Care</a></li>
                <li><a href="${prefix}frontend/admin/login.html">Partner & Admin Portal</a></li>
              </ul>
            </div>

            <div>
              <h5>For Service Pros</h5>
              <ul>
                <li><a href="${prefix}frontend/pages/provider-register.html">Join Verified Network</a></li>
                <li><a href="${prefix}frontend/pages/login.html">Provider Sign In</a></li>
                <li><a href="javascript:void(0)">85% Net Split Guarantee</a></li>
                <li><a href="javascript:void(0)">Instant Daily UPI Payouts</a></li>
                <li><a href="javascript:void(0)">Accidental Work Insurance</a></li>
              </ul>
            </div>
          </div>

          <div class="footer-bottom">
            <div>
              © 2026 Fixup Technologies Private Limited. All rights reserved.
            </div>
            <div style="display: flex; gap: 20px;">
              <a href="javascript:void(0)">Privacy Policy</a>
              <a href="javascript:void(0)">Terms of Service</a>
              <a href="javascript:void(0)">Safety & Police Verification</a>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();
    renderFooter();
  });
})();
