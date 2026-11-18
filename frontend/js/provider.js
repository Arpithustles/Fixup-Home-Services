/**
 * FIXUP SERVICE PROVIDER DASHBOARD CONTROLLER (provider.js)
 * 9 KPI cards, native canvas earnings analytics, 5 loyal customers,
 * job progression (Assigned, In Progress, Completed), and 15-day recurring KYC countdown.
 */

(function () {
  'use strict';

  function getPrefix() {
    const p = window.location.pathname.replace(/\\/g, '/');
    if (p.includes('/frontend/provider/')) return '../../';
    return './';
  }

  const prefix = getPrefix();
  let activeChartFilter = 'weekly';

  window.initProviderDashboard = function () {
    const session = window.FixupStore.getSession();
    if (!session || session.role !== 'SERVICE_PROVIDER') {
      window.location.href = `${prefix}frontend/pages/login.html`;
      return;
    }

    const pro = window.FixupStore.getProviderById(session.userId) || window.FixupStore.getProviders()[0];
    if (!pro) return;

    // Personalization
    const welcomeName = document.getElementById('proWelcomeName');
    const avatarInitials = document.getElementById('proAvatarInitials');
    if (welcomeName) welcomeName.textContent = pro.name;
    if (avatarInitials) {
      avatarInitials.textContent = pro.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    render9Kpis(pro);
    setupDutyToggle(pro);
    setupKycCountdown(pro);
    renderEarningsChart();
    renderAssignedJobs(pro);
    renderCancelledJobs(pro);
    renderLoyalCustomers(pro);
    renderReviewsSummary(pro);

    // Chart filter buttons
    document.querySelectorAll('.chart-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.chart-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeChartFilter = btn.dataset.range;
        renderEarningsChart();
      });
    });

    // Payout button
    document.getElementById('btnRequestPayout')?.addEventListener('click', () => {
      if (!pro.earnings.today || pro.earnings.today <= 0) {
        window.FixupToast.show('No Payout Balance', 'Complete active jobs to accrue daily earnings.', 'warning');
        return;
      }
      const amt = pro.earnings.today;
      pro.earnings.today = 0;
      window.FixupStore.save();
      render9Kpis(pro);
      window.FixupToast.show('Payout Dispatched Instantly!', `Transferred ₹${amt} to UPI ID: ${pro.payoutDetails?.upiId || 'provider@upi'} with 0% fees.`, 'success', 6000);
    });

    window.addEventListener('fixup-store-updated', () => {
      const updatedPro = window.FixupStore.getProviderById(session.userId) || pro;
      render9Kpis(updatedPro);
      renderAssignedJobs(updatedPro);
      renderCancelledJobs(updatedPro);
    });
  };

  // 9 Overview Statistic Cards
  function render9Kpis(pro) {
    const e = pro.earnings || { total: 0, last7Days: 0, last30Days: 0, last6Months: 0, today: 0 };
    setVal('kpiTotalEarnings', `₹${e.total.toLocaleString('en-IN')}`);
    setVal('kpiEarnings7Days', `₹${e.last7Days.toLocaleString('en-IN')}`);
    setVal('kpiEarnings30Days', `₹${e.last30Days.toLocaleString('en-IN')}`);
    setVal('kpiEarnings6Months', `₹${e.last6Months.toLocaleString('en-IN')}`);
    setVal('kpiCompletedJobs', pro.completedJobs || 0);
    setVal('kpiPendingJobs', pro.pendingJobs || 0);
    setVal('kpiAssignedJobs', pro.assignedJobs || 1);
    setVal('kpiAvgRating', `${pro.rating} ★`);
    setVal('kpiFeedbackPoints', pro.feedbackPoints || 100);
  }

  function setVal(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // Duty Toggle
  function setupDutyToggle(pro) {
    const toggle = document.getElementById('proDutyToggle');
    const label = document.getElementById('proDutyLabel');
    const dot = document.getElementById('proDutyPulse');

    if (toggle) {
      toggle.checked = pro.status === 'online';
      updateDutyUI(toggle.checked);

      toggle.addEventListener('change', () => {
        const isOnline = toggle.checked;
        pro.status = isOnline ? 'online' : 'offline';
        window.FixupStore.updateProviderStatus(pro.id, pro.status);
        updateDutyUI(isOnline);

        window.FixupToast.show(
          isOnline ? 'Duty Online' : 'Duty Offline',
          isOnline ? 'You are now visible to dispatch radar for incoming requests.' : 'Incoming leads paused. Take a rest!',
          isOnline ? 'success' : 'info'
        );
      });
    }

    function updateDutyUI(online) {
      if (label) label.textContent = online ? 'Online (Accepting Jobs)' : 'Offline (Paused)';
      if (dot) dot.style.background = online ? 'var(--success)' : 'var(--text-light)';
    }
  }

  // 15-Day Live KYC Countdown Clock
  function setupKycCountdown(pro) {
    const timerBadge = document.getElementById('kycCountdownBadge');
    if (!timerBadge) return;

    function updateClock() {
      const remaining = window.FixupStore.getKycRemainingTime(pro.nextKycDate);
      if (remaining.isDue) {
        timerBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> KYC Verification Due Now';
        timerBadge.className = 'kyc-countdown-badge' + ' badge-danger';
      } else {
        const pad = (n) => String(n).padStart(2, '0');
        timerBadge.innerHTML = `<i class="fa-solid fa-clock"></i> Next KYC In: ${remaining.days}d ${pad(remaining.hours)}h ${pad(remaining.minutes)}m ${pad(remaining.seconds)}s`;
      }
    }

    updateClock();
    setInterval(updateClock, 1000);
  }

  // Native HTML5 Canvas Earnings Chart
  function renderEarningsChart() {
    const canvas = document.getElementById('providerEarningsCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Handle high DPI
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    let labels = [];
    let values = [];

    if (activeChartFilter === 'daily') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      values = [1200, 1850, 1400, 2200, 1950, 2800, 1850];
    } else if (activeChartFilter === 'weekly') {
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      values = [8200, 9400, 7800, 8650];
    } else if (activeChartFilter === 'monthly') {
      labels = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      values = [28000, 31500, 29000, 36000, 34200, 39000];
    } else if (activeChartFilter === 'sixMonths') {
      labels = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];
      values = [26000, 28000, 31000, 29500, 34000, 35500];
    }

    const paddingLeft = 50;
    const paddingRight = 30;
    const paddingTop = 20;
    const paddingBottom = 40;
    const chartW = width - paddingLeft - paddingRight;
    const chartH = height - paddingTop - paddingBottom;
    const maxVal = Math.max(...values) * 1.25;

    // Draw grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';

    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = paddingTop + (chartH / gridLines) * i;
      const val = Math.round(maxVal - (maxVal / gridLines) * i);
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();
      ctx.fillText(`₹${val}`, 6, y + 4);
    }

    // Draw Bars or Line Chart with gradient
    const barW = Math.min(42, (chartW / labels.length) * 0.55);
    labels.forEach((label, idx) => {
      const x = paddingLeft + (chartW / labels.length) * (idx + 0.5);
      const barH = (values[idx] / maxVal) * chartH;
      const y = paddingTop + chartH - barH;

      // Draw Bar
      const grad = ctx.createLinearGradient(0, y, 0, paddingTop + chartH);
      grad.addColorStop(0, '#1d4ed8');
      grad.addColorStop(1, '#60a5fa');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x - barW / 2, y, barW, barH, [6, 6, 0, 0]);
      ctx.fill();

      // Label
      ctx.fillStyle = '#64748b';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, height - 14);

      // Value text on hover
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`₹${values[idx]}`, x, y - 6);
    });
  }

  // Assigned & Pending Jobs Management
  function renderAssignedJobs(pro) {
    const container = document.getElementById('assignedJobsContainer');
    if (!container) return;

    const allBookings = window.FixupStore.getBookings();
    const myJobs = allBookings.filter(b => b.providerId === pro.id && b.status !== 'completed' && b.status !== 'cancelled');

    if (myJobs.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; background: var(--bg-surface); border: 1px dashed var(--border-color); border-radius: var(--radius-xl);">
          <i class="fa-solid fa-clipboard-check" style="font-size: 2.2rem; color: var(--text-light); margin-bottom: 10px;"></i>
          <h4 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 4px;">No Active Assigned Jobs</h4>
          <p style="color: var(--text-muted); font-size: 0.88rem;">Keep your Duty switch Online to receive instant local dispatch calls.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = myJobs.map(b => {
      const proShare = Math.round(b.totalAmount * 0.85);
      return `
        <div class="card-fixup" style="margin-bottom: 20px; border-left: 4px solid var(--primary);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 14px;">
            <div>
              <span class="badge-fixup badge-primary">${b.id}</span>
              ${b.isEmergency ? '<span class="badge-fixup badge-danger"><i class="fa-solid fa-bolt"></i> Emergency Rush</span>' : ''}
              <h3 style="font-size: 1.25rem; font-weight: 800; margin-top: 6px;">${b.serviceName}</h3>
              <p style="color: var(--text-muted); font-size: 0.88rem; margin: 4px 0 0 0;">
                <i class="fa-solid fa-location-arrow text-primary"></i> ${b.customerAddress}
              </p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.78rem; color: var(--text-muted); font-weight: 700;">YOUR 85% PAYOUT</div>
              <div style="font-size: 1.6rem; font-weight: 900; color: var(--success);">₹${proShare}</div>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Net Direct Payout</span>
            </div>
          </div>

          <div style="background: var(--bg-surface-secondary); padding: 14px 18px; border-radius: var(--radius-md); margin-bottom: 18px; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; font-size: 0.88rem;">
            <div>
              <span style="color: var(--text-muted); font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Customer</span>
              <div style="font-weight: 700;">${b.customerName}</div>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Contact</span>
              <div><a href="tel:${b.customerPhone}" style="color: var(--primary); font-weight: 700;"><i class="fa-solid fa-phone"></i> ${b.customerPhone}</a></div>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Scheduled Slot</span>
              <div style="font-weight: 700;">${b.date} (${b.timeSlot})</div>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Current Status</span>
              <div><span class="badge-fixup badge-info">${b.status.replace('_', ' ').toUpperCase()}</span></div>
            </div>
          </div>

          <!-- Step Progression Actions -->
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            ${b.status === 'assigned' ? `
              <button class="btn-fixup btn-primary-fixup btn-sm btn-pro-step" data-id="${b.id}" data-status="accepted" data-step="3">
                <i class="fa-solid fa-check"></i> 1. Accept Job
              </button>
              <button class="btn-fixup btn-secondary-fixup btn-sm btn-pro-reject" data-id="${b.id}">
                Decline
              </button>
            ` : ''}

            ${b.status === 'accepted' ? `
              <button class="btn-fixup btn-primary-fixup btn-sm btn-pro-step" data-id="${b.id}" data-status="in_progress" data-step="4">
                <i class="fa-solid fa-screwdriver-wrench"></i> 2. Reached & Started Work
              </button>
            ` : ''}

            ${b.status === 'in_progress' ? `
              <button class="btn-fixup btn-emergency btn-sm btn-pro-step" data-id="${b.id}" data-status="completed" data-step="5" style="background: var(--success); border-color: var(--success);">
                <i class="fa-solid fa-circle-check"></i> 3. Mark Completed & Collect Bill
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Attach step actions
    container.querySelectorAll('.btn-pro-step').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const newStatus = btn.dataset.status;
        const stepNum = Number(btn.dataset.step);

        window.FixupStore.updateBookingStatus(id, newStatus, stepNum);
        if (newStatus === 'completed') {
          window.FixupToast.show('Job Finished & Payout Accrued!', 'Congratulations! 85% net earnings credited to your balance.', 'success', 6000);
        } else {
          window.FixupToast.show('Status Broadcasted', `Job is now marked ${newStatus.toUpperCase()}. Customer notified in real-time.`, 'info');
        }
      });
    });
  }

  // Top 5 Loyal Customers
  function renderLoyalCustomers(pro) {
    const container = document.getElementById('loyalCustomersContainer');
    if (!container) return;

    const customers = pro.loyalCustomers || [];
    if (customers.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); padding: 14px 0;">Build relationships with recurring customers to unlock loyalty badges.</p>';
      return;
    }

    container.innerHTML = customers.map(c => {
      const initials = c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      return `
        <div class="loyal-cust-card">
          <div class="loyal-cust-initials">${initials}</div>
          <div style="flex: 1;">
            <div style="font-weight: 800; font-size: 0.95rem;">${c.name}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">
              <strong>${c.bookingsCount} Services Booked</strong> • ₹${c.totalSpent.toLocaleString('en-IN')} Spent
            </div>
            <div style="font-size: 0.75rem; color: var(--primary); margin-top: 2px;">
              Last served: ${c.lastDate}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Feedback & Ratings
  function renderReviewsSummary(pro) {
    const listContainer = document.getElementById('providerReviewsList');
    if (!listContainer) return;

    const reviews = window.FixupStore.data.reviews || [];
    listContainer.innerHTML = reviews.map(r => `
      <div style="background: var(--bg-surface-secondary); padding: 16px 20px; border-radius: var(--radius-md); margin-bottom: 12px; border: 1px solid var(--border-color);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <strong style="font-size: 0.95rem;">${r.authorName} (${r.location})</strong>
          <span style="color: var(--accent); font-size: 0.85rem;"><i class="fa-solid fa-star"></i> ${r.rating}.0</span>
        </div>
        <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0; font-style: italic;">
          "${r.content}"
        </p>
      </div>
    `).join('');
  }
})();
