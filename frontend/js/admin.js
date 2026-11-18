/**
 * FIXUP ADMIN & OPERATIONS CONTROLLER (admin.js)
 * Enterprise overview metrics, provider KYC verification desk with 15-day live countdowns,
 * customer management, emergency dispatch monitor, and pricing controls.
 */

(function () {
  'use strict';

  function getPrefix() {
    const p = window.location.pathname.replace(/\\/g, '/');
    if (p.includes('/frontend/admin/')) return '../../';
    return './';
  }

  const prefix = getPrefix();

  // Admin Login Handler
  window.initAdminLogin = function () {
    const form = document.getElementById('adminLoginForm');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('adminUser').value.trim();
      const pass = document.getElementById('adminPass').value;

      if (user === 'admin' && pass === 'admin123') {
        window.FixupStore.setAdminSession(true);
        window.FixupToast.show('Access Granted', 'Welcome to the Fixup Enterprise Admin Deck.', 'success');
        setTimeout(() => {
          window.location.href = `${prefix}frontend/admin/dashboard.html`;
        }, 700);
      } else {
        window.FixupToast.show('Access Denied', 'Invalid administrator credentials. Hint: admin / admin123', 'danger');
      }
    });
  };

  // Admin Dashboard Handler
  window.initAdminDashboard = function () {
    if (!window.FixupStore.requireAdmin(`${prefix}frontend/admin/login.html`)) return;

    renderAdminMetrics();
    renderKycManagementTable();
    renderBookingsDispatchTable();
    setupPricingControls();

    // Setup live recurring 15-day KYC countdown timer ticks
    setInterval(updateKycLiveTimers, 1000);

    // Admin Logout
    document.getElementById('adminLogoutBtn')?.addEventListener('click', () => {
      window.FixupStore.setAdminSession(false);
      window.FixupToast.show('Session Ended', 'Admin signed out.', 'info');
      setTimeout(() => {
        window.location.href = `${prefix}frontend/admin/login.html`;
      }, 500);
    });
  };

  // Executive Overview Metrics
  function renderAdminMetrics() {
    const customers = window.FixupStore.data.customers || [];
    const providers = window.FixupStore.data.providers || [];
    const bookings = window.FixupStore.data.bookings || [];

    const verifiedPros = providers.filter(p => p.kycStatus === 'verified');
    const pendingKyc = providers.filter(p => p.kycStatus === 'pending_admin_approval');

    const activeJobs = bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled');
    const completedJobs = bookings.filter(b => b.status === 'completed');
    const cancelledJobs = bookings.filter(b => b.status === 'cancelled');
    const emergencyJobs = bookings.filter(b => b.isEmergency);

    const gmv = bookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
    const platformRev = Math.round(gmv * 0.15); // 15% platform take rate
    const pendingPayouts = Math.round(gmv * 0.85);

    setT('admStatCustomers', customers.length);
    setT('admStatProviders', providers.length);
    setT('admStatVerifiedPros', verifiedPros.length);
    setT('admStatPendingKyc', pendingKyc.length);
    setT('admStatTotalBookings', bookings.length);
    setT('admStatActiveBookings', activeJobs.length);
    setT('admStatCompletedBookings', completedJobs.length);
    setT('admStatCancelledBookings', cancelledJobs.length);
    setT('admStatRevenue', `₹${gmv.toLocaleString('en-IN')}`);
    setT('admStatCommission', `₹${platformRev.toLocaleString('en-IN')}`);
    setT('admStatPendingPayouts', `₹${pendingPayouts.toLocaleString('en-IN')}`);
    setT('admStatEmergency', emergencyJobs.length);
  }

  function setT(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  // Provider KYC Management & 15-Day Live Countdown Table
  function renderKycManagementTable() {
    const tbody = document.getElementById('adminKycTableBody');
    if (!tbody) return;

    const providers = window.FixupStore.getProviders();
    tbody.innerHTML = providers.map(p => {
      let badgeCls = 'badge-success';
      let statusLabel = 'VERIFIED';
      if (p.kycStatus === 'pending_admin_approval') {
        badgeCls = 'badge-warning';
        statusLabel = 'PENDING APPROVAL';
      } else if (p.kycStatus === 'rejected') {
        badgeCls = 'badge-danger';
        statusLabel = 'REJECTED';
      }

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${p.avatar}" style="width: 38px; height: 38px; border-radius: var(--radius-sm); object-fit: cover;" alt="pro">
              <div>
                <strong style="font-size: 0.95rem;">${p.name}</strong>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${p.id} • ${p.email}</div>
              </div>
            </div>
          </td>
          <td><strong>${p.serviceCategory}</strong></td>
          <td><span class="badge-fixup ${badgeCls}">${statusLabel}</span></td>
          <td>
            <div class="kyc-live-timer" data-next-date="${p.nextKycDate || ''}">
              <i class="fa-solid fa-clock"></i> Calculating...
            </div>
          </td>
          <td>
            <div style="display: flex; gap: 6px;">
              ${p.kycStatus !== 'verified' ? `
                <button class="btn-fixup btn-primary-fixup btn-sm btn-adm-approve-kyc" data-id="${p.id}" title="Approve KYC">
                  <i class="fa-solid fa-check"></i> Approve
                </button>
              ` : `
                <button class="btn-fixup btn-secondary-fixup btn-sm btn-adm-reject-kyc" data-id="${p.id}" title="Put on Review Hold">
                  Revoke
                </button>
              `}
              <button class="btn-fixup btn-outline-fixup btn-sm" onclick="window.FixupToast.show('KYC Dossier', 'Aadhaar ID and Trade Cert verified with Police record check.', 'info');">
                <i class="fa-solid fa-file-shield"></i> Docs
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach approve / reject listeners
    tbody.querySelectorAll('.btn-adm-approve-kyc').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        window.FixupStore.updateProviderKyc(id, 'verified');
        window.FixupToast.show('KYC Approved', `Provider ${id} is now Verified. 15-day cycle reset.`, 'success');
        renderAdminMetrics();
        renderKycManagementTable();
      });
    });

    tbody.querySelectorAll('.btn-adm-reject-kyc').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        window.FixupStore.updateProviderKyc(id, 'rejected');
        window.FixupToast.show('KYC Revoked', `Provider ${id} suspended from dispatches.`, 'warning');
        renderAdminMetrics();
        renderKycManagementTable();
      });
    });

    updateKycLiveTimers();
  }

  function updateKycLiveTimers() {
    document.querySelectorAll('.kyc-live-timer').forEach(el => {
      const targetDate = el.dataset.nextDate;
      const rem = window.FixupStore.getKycRemainingTime(targetDate);
      const pad = (n) => String(n).padStart(2, '0');

      if (rem.isDue) {
        el.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> DUE NOW';
        el.classList.add('urgent');
      } else {
        el.innerHTML = `<i class="fa-solid fa-hourglass-half"></i> ${rem.days}d ${pad(rem.hours)}h ${pad(rem.minutes)}m ${pad(rem.seconds)}s`;
        el.classList.remove('urgent');
      }
    });
  }

  // Live Dispatch Board
  function renderBookingsDispatchTable() {
    const tbody = document.getElementById('adminBookingsTableBody');
    if (!tbody) return;

    const bookings = window.FixupStore.getBookings();
    const verifiedPros = window.FixupStore.getProviders().filter(p => p.kycStatus === 'verified');

    tbody.innerHTML = bookings.map(b => `
      <tr>
        <td>
          <strong>${b.id}</strong>
          ${b.isEmergency ? '<br><span class="badge-fixup badge-danger" style="font-size: 0.65rem;">EMERGENCY</span>' : ''}
          ${b.isNight ? '<br><span class="badge-fixup badge-warning" style="font-size: 0.65rem;">NIGHT CHARGE</span>' : ''}
        </td>
        <td>
          <div style="font-weight: 700;">${b.customerName}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${b.customerAddress}</div>
        </td>
        <td>
          <div style="font-weight: 700;">${b.serviceName}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${b.date} • ${b.timeSlot}</div>
        </td>
        <td>
          <span class="badge-fixup badge-info">${b.status.replace('_', ' ').toUpperCase()}</span>
        </td>
        <td>
          <select class="form-select-fixup select-reassign-pro" data-id="${b.id}" style="padding: 4px 8px; font-size: 0.84rem; width: auto; font-weight: 700;">
            <option value="">${b.providerName ? `Assigned: ${b.providerName}` : 'Assign Pro...'}</option>
            ${verifiedPros.map(p => `
              <option value="${p.id}" ${p.id === b.providerId ? 'selected' : ''}>${p.name} (${p.serviceCategory})</option>
            `).join('')}
          </select>
        </td>
        <td><strong>₹${b.totalAmount}</strong></td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.select-reassign-pro').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const bookingId = e.currentTarget.dataset.id;
        const newProId = e.currentTarget.value;
        const pro = window.FixupStore.getProviderById(newProId);
        const booking = window.FixupStore.getBookingById(bookingId);
        if (booking && pro) {
          booking.providerId = pro.id;
          booking.providerName = pro.name;
          booking.status = 'assigned';
          booking.statusStep = 2;
          window.FixupStore.save();
          window.FixupToast.show('Technician Reassigned', `${pro.name} assigned to ${bookingId}`, 'success');
        }
      });
    });
  }

  // Pricing & Night Charges Setup
  function setupPricingControls() {
    const config = window.FixupStore.data.config || {};
    const nightStart = document.getElementById('cfgNightStart');
    const nightSurcharge = document.getElementById('cfgNightSurcharge');
    const emergencyCharge = document.getElementById('cfgEmergencyCharge');
    const btnSaveCfg = document.getElementById('btnSavePricingConfig');

    if (nightStart) nightStart.value = config.nightStartHour || 20;
    if (nightSurcharge) nightSurcharge.value = Math.round(((config.nightSurchargeRate || 1.25) - 1) * 100);
    if (emergencyCharge) emergencyCharge.value = config.emergencySurcharge || 350;

    btnSaveCfg?.addEventListener('click', () => {
      config.nightStartHour = Number(nightStart.value) || 20;
      config.nightSurchargeRate = 1 + (Number(nightSurcharge.value) || 25) / 100;
      config.emergencySurcharge = Number(emergencyCharge.value) || 350;

      window.FixupStore.save();
      window.FixupToast.show('Tariff Updated', 'Night surcharge & emergency pricing updated platform-wide.', 'success');
    });
  }
})();
