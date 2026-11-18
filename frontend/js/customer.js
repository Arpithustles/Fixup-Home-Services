/**
 * FIXUP CUSTOMER DASHBOARD CONTROLLER (customer.js)
 * Visual 5-step order timeline, booking management, review submission.
 */

(function () {
  'use strict';

  function getPrefix() {
    const p = window.location.pathname.replace(/\\/g, '/');
    if (p.includes('/frontend/customer/')) return '../../';
    return './';
  }

  const prefix = getPrefix();

  window.initCustomerDashboard = function () {
    // Role check
    const session = window.FixupStore.getSession();
    if (!session || session.role !== 'CUSTOMER') {
      window.location.href = `${prefix}frontend/pages/login.html`;
      return;
    }

    // Set Welcome Name & Initials
    const welcomeName = document.getElementById('custWelcomeName');
    const avatarInitials = document.getElementById('custAvatarInitials');
    if (welcomeName) welcomeName.textContent = session.name;
    if (avatarInitials) {
      avatarInitials.textContent = session.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    renderMetrics();
    renderActiveBookings();
    renderBookingHistory();

    // Listen for state changes across tabs
    window.addEventListener('fixup-store-updated', () => {
      renderMetrics();
      renderActiveBookings();
      renderBookingHistory();
    });
  };

  function renderMetrics() {
    const session = window.FixupStore.getSession();
    if (!session) return;
    const bookings = window.FixupStore.getBookingsForCustomer(session.userId);

    const active = bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled');
    const completed = bookings.filter(b => b.status === 'completed');
    const cancelled = bookings.filter(b => b.status === 'cancelled');
    const spending = completed.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

    const elTotal = document.getElementById('statTotalBookings');
    const elActive = document.getElementById('statActiveBookings');
    const elCompleted = document.getElementById('statCompletedBookings');
    const elCancelled = document.getElementById('statCancelledBookings');
    const elSpend = document.getElementById('statTotalSpending');

    if (elTotal) elTotal.textContent = bookings.length;
    if (elActive) elActive.textContent = active.length;
    if (elCompleted) elCompleted.textContent = completed.length;
    if (elCancelled) elCancelled.textContent = cancelled.length;
    if (elSpend) elSpend.textContent = `₹${spending.toLocaleString('en-IN')}`;
  }

  function renderActiveBookings() {
    const container = document.getElementById('activeBookingsContainer');
    if (!container) return;

    const session = window.FixupStore.getSession();
    const bookings = window.FixupStore.getBookingsForCustomer(session.userId);
    const active = bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled');

    if (active.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 48px 24px; background: var(--bg-surface); border: 1px dashed var(--border-color); border-radius: var(--radius-xl);">
          <i class="fa-solid fa-calendar-check" style="font-size: 2.5rem; color: var(--text-light); margin-bottom: 12px;"></i>
          <h4 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 6px;">No Active Service Bookings</h4>
          <p style="color: var(--text-muted); font-size: 0.92rem; margin-bottom: 20px;">Your home is running smoothly! Need an expert for routine maintenance?</p>
          <a href="${prefix}frontend/pages/request-service.html" class="btn-fixup btn-primary-fixup btn-sm">
            <i class="fa-solid fa-calendar-plus"></i> Book a Service
          </a>
        </div>
      `;
      return;
    }

    const steps = [
      '1. Request Placed',
      '2. Pro Assigned',
      '3. Pro Accepted',
      '4. In Progress',
      '5. Completed'
    ];

    container.innerHTML = active.map(b => {
      const stepIndex = b.statusStep || 1;
      const progressPercent = ((stepIndex - 1) / (steps.length - 1)) * 100;

      return `
        <div class="booking-tracking-card" id="card-${b.id}">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="badge-fixup badge-primary">${b.id}</span>
                ${b.isEmergency ? '<span class="badge-fixup badge-danger"><i class="fa-solid fa-bolt"></i> Emergency 60-Min</span>' : ''}
                ${b.isNight ? '<span class="badge-fixup badge-warning"><i class="fa-solid fa-moon"></i> Night Service</span>' : ''}
              </div>
              <h3 style="font-size: 1.35rem; font-weight: 800; margin-top: 8px;">${b.serviceName}</h3>
              <p style="color: var(--text-muted); font-size: 0.88rem; margin: 4px 0 0 0;">
                <i class="fa-solid fa-location-dot text-danger"></i> ${b.customerAddress}
              </p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Estimated Total</div>
              <div style="font-size: 1.6rem; font-weight: 900; color: var(--primary);">₹${b.totalAmount}</div>
              <span class="badge-fixup badge-success">Cashless Guarantee</span>
            </div>
          </div>

          <!-- 5-Step Visual Timeline -->
          <div class="timeline-5-step">
            <div class="timeline-5-progress" style="width: ${progressPercent}%;"></div>
            ${steps.map((label, idx) => {
              const num = idx + 1;
              let cls = '';
              if (num < stepIndex) cls = 'completed';
              else if (num === stepIndex) cls = 'active';
              return `
                <div class="step-node-5 ${cls}">
                  <div class="node-bullet">${num < stepIndex ? '<i class="fa-solid fa-check"></i>' : num}</div>
                  <span class="step-label-text">${label}</span>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Assigned Specialist Info -->
          <div style="background: var(--bg-surface-secondary); padding: 14px 18px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-top: 18px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary); color: white; display: grid; place-items: center; font-weight: 800;">
                <i class="fa-solid fa-user-shield"></i>
              </div>
              <div>
                <div style="font-weight: 800; font-size: 0.95rem;">${b.providerName}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">Assigned Verified Professional</div>
              </div>
            </div>
            <div style="font-size: 0.88rem; font-weight: 700; color: var(--text-secondary);">
              <i class="fa-regular fa-clock text-primary"></i> Scheduled: ${b.date} (${b.timeSlot})
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderBookingHistory() {
    const container = document.getElementById('completedBookingsContainer');
    if (!container) return;

    const session = window.FixupStore.getSession();
    const bookings = window.FixupStore.getBookingsForCustomer(session.userId);
    const completed = bookings.filter(b => b.status === 'completed');

    if (completed.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); padding: 16px 0;">No completed service records yet.</p>';
      return;
    }

    container.innerHTML = completed.map(b => `
      <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
        <div>
          <span class="badge-fixup badge-success"><i class="fa-solid fa-check"></i> Completed</span>
          <h4 style="font-size: 1.15rem; font-weight: 800; margin-top: 6px;">${b.serviceName}</h4>
          <p style="font-size: 0.84rem; color: var(--text-muted); margin: 2px 0 0 0;">
            Serviced by: <strong>${b.providerName}</strong> on ${b.date}
          </p>
        </div>
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="font-size: 1.25rem; font-weight: 900; color: var(--text-primary);">₹${b.totalAmount}</div>
          <button class="btn-fixup btn-secondary-fixup btn-sm" onclick="window.FixupToast.show('Service Rebooked', 'Redirecting to booking confirmation...', 'info'); setTimeout(() => { window.location.href='${prefix}frontend/pages/request-service.html'; }, 800);">
            <i class="fa-solid fa-arrow-rotate-right"></i> Rebook
          </button>
        </div>
      </div>
    `).join('');
  }
})();
