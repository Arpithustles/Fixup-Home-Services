/**
 * FIXUP THEME MANAGER — LIGHT & DARK MODE CONTROLLER
 * Applies smoothly across every page, dashboard, and remembers user preference.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'fixup_theme';

  function getStoredTheme() {
    return localStorage.getItem(STORAGE_KEY);
  }

  function getSystemPreference() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateToggleButtons(theme);
  }

  function updateToggleButtons(theme) {
    const buttons = document.querySelectorAll('.btn-theme-toggle');
    buttons.forEach(btn => {
      if (theme === 'dark') {
        btn.innerHTML = '<i class="fa-solid fa-sun text-warning"></i>';
        btn.setAttribute('aria-label', 'Switch to Light Mode');
        btn.title = 'Switch to Light Mode';
      } else {
        btn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        btn.setAttribute('aria-label', 'Switch to Dark Mode');
        btn.title = 'Switch to Dark Mode';
      }
    });
  }

  // Initialize theme as early as possible to prevent flash of wrong theme
  const initialTheme = getStoredTheme() || getSystemPreference();
  applyTheme(initialTheme);

  // Setup toggle handlers on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    updateToggleButtons(document.documentElement.getAttribute('data-theme') || 'light');

    document.querySelectorAll('.btn-theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
    });
  });

  // Re-apply toggle button state after navbar is dynamically rendered
  window.addEventListener('fixup-navbar-rendered', () => {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    updateToggleButtons(theme);
    document.querySelectorAll('.btn-theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    });
  });

  // Global helper
  window.FixupTheme = {
    get: () => document.documentElement.getAttribute('data-theme') || 'light',
    set: applyTheme,
    toggle: () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    }
  };
})();
