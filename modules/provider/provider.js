/**
 * MODULE 2: SERVICE PROVIDER PORTAL LOGIC (provider.js)
 * ES6 dynamic controller for gig workers & service pros.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inject Universal Nav
  window.renderUniversalNav('provider');

  // Active Provider ID in current session
  let currentProId = localStorage.getItem('fixup_active_pro_id') || 'pro-101';

  // DOM Elements
  const proSelector = document.getElementById('proSelector');
  const proAvatarImg = document.getElementById('proAvatarImg');
  const proNameText = document.getElementById('proNameText');
  const proCategoryBadge = document.getElementById('proCategoryBadge');
  const proKycBadge = document.getElementById('proKycBadge');
  const proRatingText = document.getElementById('proRatingText');
  const dutyToggle = document.getElementById('dutyToggle');
  const proStatusDot = document.getElementById('proStatusDot');

  // KPI Elements
  const kpiEarningsToday = document.getElementById('kpiEarningsToday');
  const kpiCompletedJobs = document.getElementById('kpiCompletedJobs');
  const kpiAcceptanceRate = document.getElementById('kpiAcceptanceRate');

  // Job Radar & Active Jobs
  const jobRadarContainer = document.getElementById('jobRadarContainer');
  const activeJobsContainer = document.getElementById('activeJobsContainer');
  const completedJobsTableBody = document.getElementById('completedJobsTableBody');

  // Register Modal Elements
  const proRegisterModal = document.getElementById('proRegisterModal');
  const proRegisterForm = document.getElementById('proRegisterForm');
  const btnOpenProRegister = document.getElementById('btnOpenProRegister');
  const closeProRegisterModal = document.getElementById('closeProRegisterModal');

  // Initialize
  populateProviderSelector();
  loadCurrentProvider();
  renderJobRadar();
  renderActiveJobs();
  renderCompletedHistory();

  // Cross-tab reactive updates
  window.addEventListener('fixup-state-changed', () => {
    loadCurrentProvider();
    renderJobRadar();
    renderActiveJobs();
    renderCompletedHistory();
  });

  // --- Provider Selector Switcher ---
  function populateProviderSelector() {
    if (!proSelector) return;
    const providers = window.FixupState.getProviders();
    proSelector.innerHTML = providers.map(p => `
      <option value="${p.id}" ${p.id === currentProId ? 'selected' : ''}>
        ${p.name} (${p.serviceCategory}) — ${p.kycStatus.toUpperCase()}
      </option>
    `).join('');

    proSelector.addEventListener('change', (e) => {
      currentProId = e.target.value;
      localStorage.setItem('fixup_active_pro_id', currentProId);
      loadCurrentProvider();
      renderJobRadar();
      renderActiveJobs();
      renderCompletedHistory();
      window.FixupToast.show('Switched Profile', `Now viewing provider desk for ${proNameText.textContent}`, 'info');
    });
  }

  // --- Load Current Provider Profile ---
  function loadCurrentProvider() {
    const pro = window.FixupState.getProviderById(currentProId);
    if (!pro) return;

    if (proAvatarImg) proAvatarImg.src = pro.avatar;
    if (proNameText) proNameText.textContent = pro.name;
    if (proCategoryBadge) proCategoryBadge.textContent = `${pro.badge || pro.serviceCategory} • ${pro.experienceYears} Yrs Exp`;
    if (proRatingText) proRatingText.textContent = `${pro.rating} ★`;

    // KYC Status Badge
    if (proKycBadge) {
      if (pro.kycStatus === 'verified') {
        proKycBadge.className = 'fx-badge fx-badge-green';
        proKycBadge.innerHTML = '<i class="fa-solid fa-shield-check"></i> Fixup Verified Pro';
      } else if (pro.kycStatus === 'pending') {
        proKycBadge.className = 'fx-badge fx-badge-amber';
        proKycBadge.innerHTML = '<i class="fa-solid fa-clock"></i> KYC Review Pending';
      } else {
        proKycBadge.className = 'fx-badge fx-badge-red';
        proKycBadge.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Verification Inactive';
      }
    }

    // Duty Switch Status
    const isOnline = pro.status === 'online';
    if (dutyToggle) dutyToggle.checked = isOnline;
    if (proStatusDot) {
      proStatusDot.className = `pro-status-indicator ${isOnline ? 'online' : 'offline'}`;
    }

    // KPIs
    if (kpiEarningsToday) kpiEarningsToday.textContent = window.formatINR(pro.earningsToday || 0);
    if (kpiCompletedJobs) kpiCompletedJobs.textContent = pro.completedJobs || 0;
    if (kpiAcceptanceRate) kpiAcceptanceRate.textContent = '98.5%';
  }

  // --- Duty Online/Offline Switch ---
  dutyToggle?.addEventListener('change', (e) => {
    const isOnline = e.target.checked;
    window.FixupState.updateProviderStatus(currentProId, isOnline ? 'online' : 'offline');
    window.FixupToast.show(
      isOnline ? 'You Are Now Online' : 'You Are Now Offline',
      isOnline ? 'Ready to receive immediate incoming client leads.' : 'Job leads paused. Take a well-deserved rest!',
      isOnline ? 'success' : 'warning'
    );
  });

  // --- Render Incoming Job Radar ---
  function renderJobRadar() {
    if (!jobRadarContainer) return;
    const pro = window.FixupState.getProviderById(currentProId);
    if (!pro) return;

    if (pro.status === 'offline') {
      jobRadarContainer.innerHTML = `
        <div style="text-align: center; padding: 24px; color: var(--text-muted);">
          <i class="fa-solid fa-moon" style="font-size: 2rem; color: #94a3b8; margin-bottom: 8px;"></i>
          <h4 style="font-size: 1.1rem; color: var(--text-secondary);">You are currently Offline</h4>
          <p style="font-size: 0.9rem;">Turn the Duty Switch above <strong>ON</strong> to receive instant service requests in your area.</p>
        </div>
      `;
      return;
    }

    // Find pending bookings in this pro's category or unassigned
    const bookings = window.FixupState.getBookings();
    const radarLeads = bookings.filter(b => 
      b.status === 'pending' && 
      (b.category.toLowerCase() === pro.serviceCategory.toLowerCase() || !b.providerId)
    );

    if (radarLeads.length === 0) {
      jobRadarContainer.innerHTML = `
        <div style="text-align: center; padding: 20px; color: var(--text-muted);">
          <div style="display: inline-flex; align-items: center; gap: 8px; font-weight: 700; color: #047857;">
            <div class="pulse-dot"></div> Radar active: Scanning for new requests within 8 km...
          </div>
          <p style="font-size: 0.85rem; margin-top: 6px;">New household requests will automatically appear here.</p>
        </div>
      `;
      return;
    }

    jobRadarContainer.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <strong style="color: #065f46; font-size: 1rem;">
          <i class="fa-solid fa-satellite-dish fa-spin" style="margin-right: 6px;"></i> 
          ${radarLeads.length} Incoming Request(s) Available
        </strong>
        <span class="fx-badge fx-badge-green">High Demand Area</span>
      </div>
    ` + radarLeads.map(b => {
      const proShare = Math.round(b.totalAmount * 0.85);
      return `
        <div class="job-alert-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
            <div>
              <span class="fx-badge fx-badge-blue">${b.id}</span>
              ${b.isEmergency ? '<span class="fx-badge fx-badge-red" style="margin-left: 6px;"><i class="fa-solid fa-triangle-exclamation"></i> Emergency Rush</span>' : ''}
              <h4 style="font-size: 1.2rem; font-weight: 800; margin-top: 6px;">${b.serviceName}</h4>
              <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 6px;">
                <i class="fa-solid fa-location-dot text-danger"></i> ${b.customerAddress}
              </p>
              <div style="font-size: 0.84rem; color: var(--text-secondary);">
                <strong>Client:</strong> ${b.customerName} | <strong>Scheduled:</strong> ${b.date} (${b.timeSlot})
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.78rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Estimated Pro Payout</div>
              <div style="font-size: 1.7rem; font-weight: 900; color: #047857;">${window.formatINR(proShare)}</div>
              <span style="font-size: 0.75rem; color: var(--text-muted);">85% Net Split</span>
            </div>
          </div>

          <div style="display: flex; gap: 12px; margin-top: 18px;">
            <button class="fx-btn fx-btn-success fx-btn-sm btn-accept-job" data-id="${b.id}" style="flex: 2;">
              <i class="fa-solid fa-check"></i> Accept Job
            </button>
            <button class="fx-btn fx-btn-sm btn-decline-job" data-id="${b.id}" style="flex: 1; background: #fee2e2; color: #b91c1c;">
              Decline
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach Accept / Decline events
    jobRadarContainer.querySelectorAll('.btn-accept-job').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const bookingId = e.currentTarget.dataset.id;
        window.FixupState.assignProviderToBooking(bookingId, currentProId);
        window.FixupToast.show('Job Accepted!', `You are assigned to Booking ${bookingId}. Head over to Active Jobs.`, 'success');
        renderJobRadar();
        renderActiveJobs();
      });
    });

    jobRadarContainer.querySelectorAll('.btn-decline-job').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.currentTarget.closest('.job-alert-card');
        card.style.opacity = '0';
        setTimeout(() => card.remove(), 250);
        window.FixupToast.show('Job Passed', 'The lead has been passed to the next available specialist.', 'info');
      });
    });
  }

  // --- Render Active Jobs Desk ---
  function renderActiveJobs() {
    if (!activeJobsContainer) return;
    const bookings = window.FixupState.getBookings();
    
    // Jobs assigned to this provider that are not yet finished
    const myActive = bookings.filter(b => 
      b.providerId === currentProId && 
      ['assigned', 'enroute', 'in_progress'].includes(b.status)
    );

    if (myActive.length === 0) {
      activeJobsContainer.innerHTML = `
        <div style="text-align: center; padding: 36px; color: var(--text-muted); background: white; border-radius: var(--radius-lg); border: 1px dashed var(--border);">
          <i class="fa-solid fa-clipboard-check" style="font-size: 2.2rem; color: #cbd5e1; margin-bottom: 10px;"></i>
          <h4 style="font-size: 1.15rem; color: var(--text-secondary); margin-bottom: 4px;">No Active Jobs Right Now</h4>
          <p style="font-size: 0.9rem;">Accept an incoming request from the Radar above to begin work.</p>
        </div>
      `;
      return;
    }

    activeJobsContainer.innerHTML = myActive.map(b => {
      const proShare = Math.round(b.totalAmount * 0.85);
      return `
        <div class="active-job-pane" id="pro-job-${b.id}">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
            <div>
              <span class="status-badge status-${b.status}">
                <i class="fa-solid fa-circle-dot"></i> CURRENT STAGE: ${b.status.replace('_', ' ').toUpperCase()}
              </span>
              <h3 style="font-size: 1.4rem; font-weight: 800; margin-top: 8px;">${b.serviceName}</h3>
              <p style="color: var(--text-secondary); font-size: 0.95rem;">
                <i class="fa-solid fa-location-arrow text-primary"></i> ${b.customerAddress}
              </p>
            </div>
            <div style="text-align: right;">
              <span class="fx-badge fx-badge-purple">${b.id}</span>
              <div style="font-size: 1.6rem; font-weight: 900; color: #047857; margin-top: 4px;">
                ${window.formatINR(proShare)}
              </div>
              <span style="font-size: 0.8rem; color: var(--text-muted);">Your Net Earning</span>
            </div>
          </div>

          <div style="background: #f8fafc; padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border); margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
              <div>
                <span class="detail-item-label">Customer Name</span>
                <div style="font-weight: 700;">${b.customerName}</div>
              </div>
              <div>
                <span class="detail-item-label">Phone & Call Action</span>
                <div>
                  <a href="tel:${b.customerPhone}" style="color: var(--primary); text-decoration: none; font-weight: 700;">
                    <i class="fa-solid fa-phone"></i> ${b.customerPhone}
                  </a>
                </div>
              </div>
              <div>
                <span class="detail-item-label">Scheduled Slot</span>
                <div style="font-weight: 700;">${b.date} (${b.timeSlot})</div>
              </div>
              <div>
                <span class="detail-item-label">Add-ons Included</span>
                <div style="font-weight: 600; font-size: 0.9rem;">
                  ${b.addons && b.addons.length ? b.addons.map(a => a.name).join(', ') : 'None'}
                </div>
              </div>
            </div>
            ${b.notes ? `
              <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--border); font-size: 0.88rem; color: var(--text-secondary);">
                <strong>Client Issue Description:</strong> "${b.notes}"
              </div>
            ` : ''}
          </div>

          <!-- Provider Step-by-Step Execution Controls -->
          <div style="border-top: 1px solid var(--border); padding-top: 16px;">
            <div style="font-size: 0.88rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 10px;">
              Update Live Job Progress (Notifies Customer Instantly):
            </div>
            <div class="job-step-btn-group">
              <button class="fx-btn fx-btn-outline fx-btn-sm btn-update-status" data-id="${b.id}" data-status="enroute" ${b.status === 'enroute' ? 'disabled style="opacity: 0.6;"' : ''}>
                <i class="fa-solid fa-motorcycle"></i> 1. Start Travel (En Route)
              </button>
              <button class="fx-btn fx-btn-purple fx-btn-sm btn-update-status" data-id="${b.id}" data-status="in_progress" ${b.status === 'in_progress' ? 'disabled style="opacity: 0.6;"' : ''}>
                <i class="fa-solid fa-screwdriver-wrench"></i> 2. Reached & Started Work
              </button>
              <button class="fx-btn fx-btn-success fx-btn-sm btn-update-status" data-id="${b.id}" data-status="completed">
                <i class="fa-solid fa-circle-check"></i> 3. Mark Completed & Collect Bill
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach step actions
    activeJobsContainer.querySelectorAll('.btn-update-status').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const newStatus = e.currentTarget.dataset.status;
        window.FixupState.updateBookingStatus(id, newStatus);

        if (newStatus === 'completed') {
          window.FixupToast.show(
            'Job Completed & Payout Credited!',
            `Great work! 85% payout has been credited to your daily wallet.`,
            'success',
            5000
          );
        } else {
          window.FixupToast.show(
            'Status Broadcasted',
            `Customer has been notified that you are ${newStatus.replace('_', ' ').toUpperCase()}.`,
            'info'
          );
        }

        renderActiveJobs();
        loadCurrentProvider();
        renderCompletedHistory();
      });
    });
  }

  // --- Render Completed Jobs History ---
  function renderCompletedHistory() {
    if (!completedJobsTableBody) return;
    const bookings = window.FixupState.getBookings();
    const completed = bookings.filter(b => b.providerId === currentProId && b.status === 'completed');

    if (completed.length === 0) {
      completedJobsTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 24px; color: var(--text-muted);">
            No completed jobs logged in this session yet.
          </td>
        </tr>
      `;
      return;
    }

    completedJobsTableBody.innerHTML = completed.map(b => {
      const proEarned = Math.round(b.totalAmount * 0.85);
      return `
        <tr>
          <td><strong>${b.id}</strong></td>
          <td>${b.serviceName}</td>
          <td>${b.customerName}</td>
          <td><span class="fx-badge fx-badge-green"><i class="fa-solid fa-check"></i> Paid & Verified</span></td>
          <td><strong style="color: #047857; font-size: 1.05rem;">+${window.formatINR(proEarned)}</strong></td>
        </tr>
      `;
    }).join('');
  }

  // --- Payout Simulation ---
  window.requestInstantPayout = function() {
    const pro = window.FixupState.getProviderById(currentProId);
    if (!pro || !pro.earningsToday || pro.earningsToday <= 0) {
      window.FixupToast.show('No Balance Available', 'Complete jobs today to accrue withdrawal balance.', 'warning');
      return;
    }
    const amount = pro.earningsToday;
    pro.earningsToday = 0;
    window.FixupState.persist();
    window.FixupToast.show(
      'Payout Processed Instantly!',
      `Transferred ${window.formatINR(amount)} to UPI ID: ${pro.name.toLowerCase().replace(' ', '')}@okaxis.`,
      'success',
      6000
    );
    loadCurrentProvider();
  };

  // --- Pro Registration Modal ---
  btnOpenProRegister?.addEventListener('click', () => {
    proRegisterModal?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  });

  closeProRegisterModal?.addEventListener('click', () => {
    proRegisterModal?.classList.add('hidden');
    document.body.style.overflow = '';
  });

  proRegisterForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('regProName').value.trim();
    const phone = document.getElementById('regProPhone').value.trim();
    const serviceCategory = document.getElementById('regProCategory').value;
    const experienceYears = Number(document.getElementById('regProExp').value) || 1;
    const location = document.getElementById('regProLocation').value.trim();
    const bio = document.getElementById('regProBio').value.trim();

    const createdPro = window.FixupState.registerProvider({
      name,
      phone,
      serviceCategory,
      experienceYears,
      location,
      bio: bio || 'Certified home repair professional.'
    });

    currentProId = createdPro.id;
    localStorage.setItem('fixup_active_pro_id', currentProId);
    populateProviderSelector();
    loadCurrentProvider();
    proRegisterModal?.classList.add('hidden');
    document.body.style.overflow = '';
    proRegisterForm.reset();

    window.FixupToast.show(
      'Welcome to Fixup Pro Network!',
      `Application submitted for ${createdPro.name}. KYC verification queued with Admin.`,
      'success',
      6000
    );
  });
});
