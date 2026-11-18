/**
 * MODULE 3: ADMIN & DEVELOPER CONSOLE LOGIC (admin.js)
 * High-performance telemetry, dispatch control, KYC desk & API sandbox.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inject Universal Nav
  window.renderUniversalNav('admin');

  // DOM Elements - Metrics
  const adminGmv = document.getElementById('adminGmv');
  const adminRevenue = document.getElementById('adminRevenue');
  const adminActiveBookings = document.getElementById('adminActiveBookings');
  const adminTotalPros = document.getElementById('adminTotalPros');
  const adminKycQueueCount = document.getElementById('adminKycQueueCount');

  // Tabs
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  const tabPanes = document.querySelectorAll('.admin-tab-pane');

  // Tables & Containers
  const dispatchTableBody = document.getElementById('dispatchTableBody');
  const kycTableBody = document.getElementById('kycTableBody');
  const catalogTableBody = document.getElementById('catalogTableBody');
  const logStreamContainer = document.getElementById('logStreamContainer');

  // Dev API Sandbox Elements
  const apiEndpointSelect = document.getElementById('apiEndpointSelect');
  const apiMethodBadge = document.getElementById('apiMethodBadge');
  const btnExecuteApi = document.getElementById('btnExecuteApi');
  const apiResponseCode = document.getElementById('apiResponseCode');
  const apiStatusPill = document.getElementById('apiStatusPill');
  const apiLatencyPill = document.getElementById('apiLatencyPill');
  const btnTriggerMockEmergency = document.getElementById('btnTriggerMockEmergency');

  // Service Modal Elements
  const addServiceModal = document.getElementById('addServiceModal');
  const btnOpenAddService = document.getElementById('btnOpenAddService');
  const closeAddServiceModal = document.getElementById('closeAddServiceModal');
  const addServiceForm = document.getElementById('addServiceForm');

  // Initial Render
  refreshAllAdminViews();

  // Cross-tab reactive updates
  window.addEventListener('fixup-state-changed', () => {
    refreshAllAdminViews();
  });

  function refreshAllAdminViews() {
    renderTelemetryMetrics();
    renderDispatchBoard();
    renderKycDesk();
    renderCatalogManager();
    renderAuditLogs();
  }

  // --- Tab Navigation ---
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.add('hidden'));
      btn.classList.add('active');
      const targetPane = document.getElementById(btn.dataset.tab);
      if (targetPane) targetPane.classList.remove('hidden');
    });
  });

  // --- Telemetry Metrics ---
  function renderTelemetryMetrics() {
    const bookings = window.FixupState.getBookings();
    const providers = window.FixupState.getProviders();

    const gmvTotal = bookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
    const platformRev = Math.round(gmvTotal * 0.15); // 15% platform commission
    const pendingKyc = providers.filter(p => p.kycStatus === 'pending');
    const activeJobs = bookings.filter(b => ['pending', 'assigned', 'enroute', 'in_progress'].includes(b.status));

    if (adminGmv) adminGmv.textContent = window.formatINR(gmvTotal);
    if (adminRevenue) adminRevenue.textContent = window.formatINR(platformRev);
    if (adminActiveBookings) adminActiveBookings.textContent = `${activeJobs.length} Live (${bookings.length} Total)`;
    if (adminTotalPros) adminTotalPros.textContent = `${providers.filter(p => p.kycStatus === 'verified').length} Active`;
    if (adminKycQueueCount) adminKycQueueCount.textContent = pendingKyc.length;
  }

  // --- Live Dispatch Board ---
  function renderDispatchBoard() {
    if (!dispatchTableBody) return;
    const bookings = window.FixupState.getBookings();
    const providers = window.FixupState.getProviders().filter(p => p.kycStatus === 'verified');

    if (bookings.length === 0) {
      dispatchTableBody.innerHTML = `
        <tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">No bookings in system.</td></tr>
      `;
      return;
    }

    dispatchTableBody.innerHTML = bookings.map(b => `
      <tr>
        <td>
          <strong>${b.id}</strong>
          ${b.isEmergency ? '<br><span class="fx-badge fx-badge-red" style="font-size: 0.65rem;">EMERGENCY</span>' : ''}
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
          <span class="status-badge status-${b.status}">${b.status.replace('_', ' ').toUpperCase()}</span>
        </td>
        <td>
          <select class="fx-select select-reassign-pro" data-id="${b.id}" style="padding: 4px 8px; font-size: 0.82rem; width: auto; font-weight: 700;">
            <option value="">${b.providerName ? `Assigned: ${b.providerName}` : 'Assign Pro...'}</option>
            ${providers.map(p => `
              <option value="${p.id}" ${p.id === b.providerId ? 'selected' : ''}>
                ${p.name} (${p.serviceCategory})
              </option>
            `).join('')}
          </select>
        </td>
        <td><strong>${window.formatINR(b.totalAmount)}</strong></td>
        <td>
          <div style="display: flex; gap: 6px;">
            ${b.status !== 'completed' ? `
              <button class="fx-btn fx-btn-success fx-btn-sm btn-admin-advance" data-id="${b.id}" data-current="${b.status}" title="Advance to next state">
                <i class="fa-solid fa-play"></i>
              </button>
            ` : '<span style="color: var(--success); font-weight: 700;"><i class="fa-solid fa-check"></i> Settled</span>'}
          </div>
        </td>
      </tr>
    `).join('');

    // Attach reassign listener
    dispatchTableBody.querySelectorAll('.select-reassign-pro').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const bookingId = e.currentTarget.dataset.id;
        const newProId = e.currentTarget.value;
        if (newProId) {
          window.FixupState.assignProviderToBooking(bookingId, newProId);
          window.FixupToast.show('Dispatcher Override', `Booking ${bookingId} reassigned.`, 'success');
          refreshAllAdminViews();
        }
      });
    });

    // Attach advance step listener
    dispatchTableBody.querySelectorAll('.btn-admin-advance').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const current = e.currentTarget.dataset.current;
        const flow = { 'pending': 'assigned', 'assigned': 'enroute', 'enroute': 'in_progress', 'in_progress': 'completed' };
        const next = flow[current] || 'completed';
        window.FixupState.updateBookingStatus(id, next);
        window.FixupToast.show('Dispatch Status Updated', `${id} moved to ${next.toUpperCase()}`, 'info');
        refreshAllAdminViews();
      });
    });
  }

  // --- Provider KYC Verification Desk ---
  function renderKycDesk() {
    if (!kycTableBody) return;
    const providers = window.FixupState.getProviders();

    kycTableBody.innerHTML = providers.map(p => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${p.avatar}" style="width: 38px; height: 38px; border-radius: var(--radius-sm); object-fit: cover;" alt="Avatar">
            <div>
              <div style="font-weight: 800;">${p.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${p.id}</div>
            </div>
          </div>
        </td>
        <td><strong>${p.serviceCategory}</strong></td>
        <td>${p.experienceYears} Years</td>
        <td>${p.phone}</td>
        <td>
          <span class="fx-badge fx-badge-${p.kycStatus === 'verified' ? 'green' : (p.kycStatus === 'pending' ? 'amber' : 'red')}">
            ${p.kycStatus.toUpperCase()}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            ${p.kycStatus !== 'verified' ? `
              <button class="fx-btn fx-btn-success fx-btn-sm btn-approve-kyc" data-id="${p.id}">
                <i class="fa-solid fa-check"></i> Approve KYC
              </button>
            ` : `
              <button class="fx-btn fx-btn-sm btn-revoke-kyc" data-id="${p.id}" style="background: #fee2e2; color: #b91c1c;">
                Revoke
              </button>
            `}
          </div>
        </td>
      </tr>
    `).join('');

    kycTableBody.querySelectorAll('.btn-approve-kyc').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const proId = e.currentTarget.dataset.id;
        window.FixupState.updateProviderKyc(proId, 'verified');
        window.FixupToast.show('KYC Approved', `Provider ${proId} is now verified and eligible for dispatches.`, 'success');
        refreshAllAdminViews();
      });
    });

    kycTableBody.querySelectorAll('.btn-revoke-kyc').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const proId = e.currentTarget.dataset.id;
        window.FixupState.updateProviderKyc(proId, 'rejected');
        window.FixupToast.show('KYC Revoked', `Provider ${proId} has been put on verification hold.`, 'warning');
        refreshAllAdminViews();
      });
    });
  }

  // --- Service Catalog Manager ---
  function renderCatalogManager() {
    if (!catalogTableBody) return;
    const services = window.FixupState.getServices();

    catalogTableBody.innerHTML = services.map(s => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${s.image}" style="width: 44px; height: 38px; border-radius: var(--radius-sm); object-fit: cover;" alt="${s.name}">
            <div>
              <div style="font-weight: 800;">${s.name}</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">${s.id}</div>
            </div>
          </div>
        </td>
        <td><span class="fx-badge fx-badge-blue">${s.category}</span></td>
        <td>
          <strong style="color: var(--primary); font-size: 1.05rem;">${window.formatINR(s.basePrice)}</strong>
        </td>
        <td>${s.rating} ★ (${s.reviewsCount})</td>
        <td>${s.addons ? s.addons.length : 0} configured</td>
        <td>
          <button class="fx-btn fx-btn-outline fx-btn-sm btn-edit-price" data-id="${s.id}" data-current="${s.basePrice}">
            <i class="fa-solid fa-pen-to-square"></i> Set Price
          </button>
        </td>
      </tr>
    `).join('');

    catalogTableBody.querySelectorAll('.btn-edit-price').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const current = e.currentTarget.dataset.current;
        const input = prompt(`Enter new base price (in INR) for service ${id}:`, current);
        if (input && !isNaN(input)) {
          const srv = window.FixupState.getServiceById(id);
          if (srv) {
            srv.basePrice = Number(input);
            window.FixupState.log('CATALOG', `Base price for ${srv.name} updated to ₹${srv.basePrice}`);
            window.FixupState.persist();
            window.FixupToast.show('Pricing Updated', `Base price set to ₹${input}. Changes live across all modules.`, 'success');
            refreshAllAdminViews();
          }
        }
      });
    });
  }

  // --- Audit Logs Stream ---
  function renderAuditLogs() {
    if (!logStreamContainer) return;
    const logs = window.FixupState.getLogs();

    logStreamContainer.innerHTML = logs.map(l => `
      <div class="log-entry">
        <span class="log-time">[${l.timestamp}]</span>
        <span class="log-level-${l.level}">[${l.level}]</span>
        <span class="log-msg">${l.msg}</span>
      </div>
    `).join('');
  }

  // --- Add Service Modal ---
  btnOpenAddService?.addEventListener('click', () => {
    addServiceModal?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  });

  closeAddServiceModal?.addEventListener('click', () => {
    addServiceModal?.classList.add('hidden');
    document.body.style.overflow = '';
  });

  addServiceForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('newSrvName').value.trim();
    const category = document.getElementById('newSrvCategory').value;
    const basePrice = Number(document.getElementById('newSrvBasePrice').value) || 299;
    const tagline = document.getElementById('newSrvTagline').value.trim();
    const image = document.getElementById('newSrvImage').value.trim();

    window.FixupState.addService({
      name,
      category,
      basePrice,
      rating: 5.0,
      reviewsCount: 1,
      tagline: tagline || 'Reliable household maintenance guaranteed.',
      image: image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
      badge: 'New Launch',
      addons: [{ name: 'Inspection & Diagnostics', price: 149 }]
    });

    addServiceModal?.classList.add('hidden');
    document.body.style.overflow = '';
    addServiceForm.reset();
    window.FixupToast.show('Service Added to Catalog', `${name} is now bookable by customers.`, 'success');
    refreshAllAdminViews();
  });

  // --- Developer Sandbox REST API Execution ---
  apiEndpointSelect?.addEventListener('change', () => {
    const selected = apiEndpointSelect.value;
    if (selected.startsWith('POST')) {
      apiMethodBadge.textContent = 'POST';
      apiMethodBadge.className = 'fx-badge fx-badge-amber';
    } else {
      apiMethodBadge.textContent = 'GET';
      apiMethodBadge.className = 'fx-badge fx-badge-blue';
    }
  });

  btnExecuteApi?.addEventListener('click', () => {
    const endpoint = apiEndpointSelect.value;
    const startTime = performance.now();

    apiStatusPill.textContent = 'Executing...';
    apiStatusPill.className = 'fx-badge fx-badge-amber';

    setTimeout(() => {
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime + Math.random() * 15 + 10);
      apiLatencyPill.textContent = `${latency} ms`;
      apiStatusPill.textContent = '200 OK';
      apiStatusPill.className = 'fx-badge fx-badge-green';

      let responseData = {};
      if (endpoint === 'GET /api/services') {
        responseData = { status: 'success', total: window.FixupState.getServices().length, data: window.FixupState.getServices() };
      } else if (endpoint === 'GET /api/providers') {
        responseData = { status: 'success', total: window.FixupState.getProviders().length, data: window.FixupState.getProviders() };
      } else if (endpoint === 'GET /api/bookings') {
        responseData = { status: 'success', total: window.FixupState.getBookings().length, data: window.FixupState.getBookings() };
      } else if (endpoint === 'GET /api/metrics') {
        const bookings = window.FixupState.getBookings();
        const gmv = bookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
        responseData = {
          status: 'success',
          gmv,
          commission: Math.round(gmv * 0.15),
          uptime: '99.98%',
          activeWorkers: window.FixupState.getProviders().filter(p => p.status === 'online').length
        };
      } else if (endpoint === 'POST /api/bookings/emergency-dispatch') {
        const demo = window.FixupState.createBooking({
          serviceId: 'srv-elec',
          serviceName: 'Electrical Repairs & Wiring',
          category: 'Electrical',
          customerName: 'Dev Sandbox Tester',
          customerPhone: '+91 99999 00000',
          customerAddress: 'Tower 4, Developer Lab, Noida',
          date: new Date().toISOString().split('T')[0],
          timeSlot: 'Immediate (Within 45 Min)',
          notes: 'REST API simulated emergency load test.',
          isEmergency: true,
          basePrice: 449,
          addons: [],
          totalAmount: 733
        });
        responseData = { status: 'success', message: 'Emergency booking dispatched via API mock.', booking: demo };
      }

      apiResponseCode.textContent = JSON.stringify(responseData, null, 2);
    }, 180);
  });

  // --- Trigger Mock Emergency Button ---
  btnTriggerMockEmergency?.addEventListener('click', () => {
    const newEmergency = window.FixupState.createBooking({
      serviceId: 'srv-plumb',
      serviceName: 'Plumbing & Pipe Leakage Fix',
      category: 'Plumbing',
      customerName: 'Rohan Deshmukh (High Priority)',
      customerPhone: '+91 98888 11223',
      customerAddress: 'Flat 1102, Pinnacle Crest, Express Highway',
      date: new Date().toISOString().split('T')[0],
      timeSlot: 'Emergency Flash Dispatch',
      notes: 'Major pipeline burst in basement! Urgent attention needed.',
      isEmergency: true,
      basePrice: 399,
      addons: [{ name: 'Severe Drain Snaking', price: 299 }],
      totalAmount: 980
    });

    window.FixupToast.show(
      '🚨 Flash Emergency Triggered!',
      `Booking ${newEmergency.id} added. Check Provider Radar and Dispatch Board!`,
      'danger',
      6000
    );
    refreshAllAdminViews();
  });
});
