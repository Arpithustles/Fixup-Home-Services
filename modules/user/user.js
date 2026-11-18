/**
 * MODULE 1: USER / CUSTOMER PORTAL LOGIC (user.js)
 * ES6 dynamic controller with cross-tab reactive state sync.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inject Universal Nav
  window.renderUniversalNav('user');

  // Module State
  let activeCategory = 'all';
  let searchQuery = '';
  let selectedServiceForBooking = null;

  // DOM Elements
  const servicesGrid = document.getElementById('servicesGrid');
  const categoryFilters = document.getElementById('categoryFilters');
  const serviceSearchInput = document.getElementById('serviceSearchInput');
  const activeBookingsList = document.getElementById('activeBookingsList');
  const dynamicQuoteText = document.getElementById('dynamicQuoteText');
  const dynamicQuoteAuthor = document.getElementById('dynamicQuoteAuthor');

  // Booking Modal Elements
  const bookingModal = document.getElementById('bookingModal');
  const bookingForm = document.getElementById('bookingForm');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalServiceName = document.getElementById('modalServiceName');
  const modalBasePrice = document.getElementById('modalBasePrice');
  const modalAddonsList = document.getElementById('modalAddonsList');
  const modalEmergencyCheck = document.getElementById('modalEmergencyCheck');
  const modalSubtotalText = document.getElementById('modalSubtotalText');
  const modalTaxText = document.getElementById('modalTaxText');
  const modalTotalText = document.getElementById('modalTotalText');

  // Estimator Elements
  const estCategory = document.getElementById('estCategory');
  const estQuantity = document.getElementById('estQuantity');
  const estQuantityVal = document.getElementById('estQuantityVal');
  const estUrgency = document.getElementById('estUrgency');
  const estResult = document.getElementById('estResult');
  const estBookBtn = document.getElementById('estBookBtn');

  // Initial Renderings
  renderServices();
  renderBookings();
  setupQuoteRotator();
  setupEstimator();

  // Listen to State Changes across tabs
  window.addEventListener('fixup-state-changed', () => {
    renderBookings();
    renderServices();
  });

  // --- Category Filters ---
  categoryFilters?.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      categoryFilters.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.dataset.cat;
      renderServices();
    });
  });

  // --- Search Input ---
  serviceSearchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderServices();
  });

  // --- Render Services Catalog ---
  function renderServices() {
    if (!servicesGrid) return;
    const services = window.FixupState.getServices();

    const filtered = services.filter(srv => {
      const matchesCat = activeCategory === 'all' || srv.category.toLowerCase() === activeCategory.toLowerCase();
      const matchesSearch = !searchQuery || 
        srv.name.toLowerCase().includes(searchQuery) || 
        srv.tagline.toLowerCase().includes(searchQuery) ||
        srv.category.toLowerCase().includes(searchQuery);
      return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
      servicesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background: white; border-radius: var(--radius-lg); border: 1px dashed var(--border);">
          <i class="fa-solid fa-magnifying-glass" style="font-size: 2.5rem; color: #94a3b8; margin-bottom: 12px;"></i>
          <h3 style="font-size: 1.3rem; margin-bottom: 6px;">No services found</h3>
          <p style="color: var(--text-muted);">Try a different search term or category filter.</p>
        </div>
      `;
      return;
    }

    servicesGrid.innerHTML = filtered.map(srv => `
      <div class="service-card" data-id="${srv.id}">
        <div class="service-card-img-wrap">
          <img src="${srv.image}" alt="${srv.name}" class="service-card-img" loading="lazy">
          <div class="service-card-tag">${srv.badge || srv.category}</div>
          <div class="service-card-rating">
            <i class="fa-solid fa-star"></i>
            <span>${srv.rating} (${srv.reviewsCount})</span>
          </div>
        </div>
        <div class="service-card-body">
          <h3 class="service-card-title">${srv.name}</h3>
          <p class="service-card-desc">${srv.tagline}</p>
          <div class="service-card-footer">
            <div class="service-price-block">
              <span class="service-price-label">Starts at</span>
              <span class="service-price-value">${window.formatINR(srv.basePrice)}</span>
            </div>
            <button class="fx-btn fx-btn-primary fx-btn-sm btn-open-booking" data-id="${srv.id}">
              <i class="fa-solid fa-calendar-check"></i> Book Now
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Attach Click Events to Book Now Buttons
    servicesGrid.querySelectorAll('.btn-open-booking').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const srvId = e.currentTarget.dataset.id;
        openBookingModal(srvId);
      });
    });
  }

  // --- Booking Modal Logic ---
  function openBookingModal(serviceId, preselectedAddon = null) {
    const srv = window.FixupState.getServiceById(serviceId);
    if (!srv) return;
    selectedServiceForBooking = srv;

    modalServiceName.textContent = srv.name;
    modalBasePrice.textContent = window.formatINR(srv.basePrice);

    // Populate Add-ons
    modalAddonsList.innerHTML = (srv.addons || []).map((addon, idx) => `
      <label class="addon-selector-item" for="addon-${idx}">
        <div style="display: flex; align-items: center; gap: 10px;">
          <input type="checkbox" id="addon-${idx}" class="modal-addon-checkbox" 
                 data-name="${addon.name}" data-price="${addon.price}">
          <div>
            <div style="font-weight: 700; font-size: 0.94rem;">${addon.name}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">Recommended add-on</div>
          </div>
        </div>
        <strong style="color: var(--primary); font-size: 0.95rem;">+${window.formatINR(addon.price)}</strong>
      </label>
    `).join('');

    // Preselect date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateInput = document.getElementById('modalBookingDate');
    if (dateInput) {
      dateInput.value = tomorrow.toISOString().split('T')[0];
      dateInput.min = new Date().toISOString().split('T')[0];
    }

    // Attach recompute listeners to checkboxes & emergency check
    modalAddonsList.querySelectorAll('.modal-addon-checkbox').forEach(cb => {
      cb.addEventListener('change', calculateModalTotal);
    });
    modalEmergencyCheck.addEventListener('change', calculateModalTotal);

    calculateModalTotal();
    bookingModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeBookingModal() {
    bookingModal.classList.add('hidden');
    document.body.style.overflow = '';
    bookingForm.reset();
    selectedServiceForBooking = null;
  }

  modalCloseBtn?.addEventListener('click', closeBookingModal);
  bookingModal?.addEventListener('click', (e) => {
    if (e.target === bookingModal) closeBookingModal();
  });

  function calculateModalTotal() {
    if (!selectedServiceForBooking) return { total: 0 };
    const base = selectedServiceForBooking.basePrice;
    
    let addonsTotal = 0;
    const selectedAddons = [];
    modalAddonsList.querySelectorAll('.modal-addon-checkbox:checked').forEach(cb => {
      const price = Number(cb.dataset.price) || 0;
      addonsTotal += price;
      selectedAddons.push({ name: cb.dataset.name, price });
    });

    const isEmergency = modalEmergencyCheck.checked;
    const emergencyCharge = isEmergency ? 250 : 0;
    const subtotal = base + addonsTotal + emergencyCharge;
    const taxAndPlatform = Math.round(subtotal * 0.05);
    const total = subtotal + taxAndPlatform;

    modalSubtotalText.textContent = window.formatINR(subtotal);
    modalTaxText.textContent = window.formatINR(taxAndPlatform);
    modalTotalText.textContent = window.formatINR(total);

    return { base, addons: selectedAddons, isEmergency, subtotal, taxAndPlatform, total };
  }

  // Handle Booking Form Submit
  bookingForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!selectedServiceForBooking) return;

    const calc = calculateModalTotal();
    const customerName = document.getElementById('modalCustomerName').value.trim();
    const customerPhone = document.getElementById('modalCustomerPhone').value.trim();
    const customerAddress = document.getElementById('modalCustomerAddress').value.trim();
    const bookingDate = document.getElementById('modalBookingDate').value;
    const timeSlot = document.getElementById('modalTimeSlot').value;
    const notes = document.getElementById('modalNotes').value.trim();

    const newBooking = window.FixupState.createBooking({
      serviceId: selectedServiceForBooking.id,
      serviceName: selectedServiceForBooking.name,
      category: selectedServiceForBooking.category,
      customerName,
      customerPhone,
      customerAddress,
      date: bookingDate,
      timeSlot,
      notes: notes || 'No special instructions.',
      isEmergency: calc.isEmergency,
      basePrice: calc.base,
      addons: calc.addons,
      totalAmount: calc.total
    });

    closeBookingModal();
    window.FixupToast.show(
      'Service Booked Successfully!',
      `Booking ID: ${newBooking.id}. Assigned Pro: ${newBooking.providerName}`,
      'success',
      5000
    );

    // Scroll to active bookings section
    document.getElementById('active-bookings-section')?.scrollIntoView({ behavior: 'smooth' });
    renderBookings();
  });

  // --- Render Active Bookings ---
  function renderBookings() {
    if (!activeBookingsList) return;
    const bookings = window.FixupState.getBookings();

    if (bookings.length === 0) {
      activeBookingsList.innerHTML = `
        <div style="text-align: center; padding: 36px; color: var(--text-muted);">
          <i class="fa-solid fa-calendar-xmark" style="font-size: 2.2rem; margin-bottom: 10px;"></i>
          <p>No active service bookings. Choose a service above to schedule your first fix!</p>
        </div>
      `;
      return;
    }

    activeBookingsList.innerHTML = bookings.map(b => {
      // Step indices: pending (1), assigned (2), enroute (3), in_progress (4), completed (5)
      const steps = ['Requested', 'Assigned', 'En Route', 'In Progress', 'Completed'];
      const statusMap = {
        'pending': 1,
        'assigned': 2,
        'enroute': 3,
        'in_progress': 4,
        'completed': 5
      };
      const currentStep = statusMap[b.status] || 1;
      const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

      return `
        <div class="booking-ticket" id="ticket-${b.id}">
          <div class="booking-ticket-header">
            <div>
              <span class="booking-ticket-id">${b.id} — ${b.serviceName}</span>
              ${b.isEmergency ? '<span class="fx-badge fx-badge-red" style="margin-left: 8px;"><i class="fa-solid fa-triangle-exclamation"></i> Emergency 60-Min</span>' : ''}
            </div>
            <div>
              <span class="status-badge status-${b.status}">
                <i class="fa-solid fa-circle-dot"></i> Status: ${b.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          <!-- Multi-Step Timeline Tracker -->
          <div class="timeline-tracker">
            <div class="timeline-progress-bar" style="width: ${progressPercent}%;"></div>
            ${steps.map((label, index) => {
              const stepNum = index + 1;
              let stepClass = '';
              if (stepNum < currentStep) stepClass = 'completed';
              else if (stepNum === currentStep) stepClass = 'active';
              return `
                <div class="timeline-step ${stepClass}">
                  <div class="timeline-node">
                    ${stepNum < currentStep ? '<i class="fa-solid fa-check"></i>' : stepNum}
                  </div>
                  <span class="timeline-label">${label}</span>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Booking Details Grid -->
          <div class="booking-details-grid">
            <div>
              <div class="detail-item-label">Scheduled Date & Slot</div>
              <div class="detail-item-val"><i class="fa-regular fa-clock text-primary"></i> ${b.date} (${b.timeSlot})</div>
            </div>
            <div>
              <div class="detail-item-label">Assigned Professional</div>
              <div class="detail-item-val"><i class="fa-solid fa-user-shield text-success"></i> ${b.providerName || 'Matching Soon...'}</div>
            </div>
            <div>
              <div class="detail-item-label">Address / Landmark</div>
              <div class="detail-item-val"><i class="fa-solid fa-location-dot text-danger"></i> ${b.customerAddress}</div>
            </div>
            <div>
              <div class="detail-item-label">Estimated Bill</div>
              <div class="detail-item-val" style="color: var(--primary); font-size: 1.15rem;">${window.formatINR(b.totalAmount)}</div>
            </div>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-top: 14px;">
            <div style="font-size: 0.86rem; color: var(--text-muted);">
              <strong>Customer:</strong> ${b.customerName} (${b.customerPhone}) | <em>Notes:</em> "${b.notes}"
            </div>
            <div style="display: flex; gap: 8px;">
              ${b.status !== 'completed' ? `
                <button class="fx-btn fx-btn-outline fx-btn-sm btn-simulate-step" data-id="${b.id}" data-current="${b.status}" title="Advance to next step to test reactive updates">
                  <i class="fa-solid fa-forward-step"></i> Simulate Next Step
                </button>
              ` : `
                <button class="fx-btn fx-btn-success fx-btn-sm" onclick="FixupToast.show('Invoice Downloaded', 'Digital GST Invoice downloaded for booking ${b.id}', 'success');">
                  <i class="fa-solid fa-file-invoice"></i> Download Invoice
                </button>
              `}
              <button class="fx-btn fx-btn-sm" style="background: #f1f5f9; color: var(--text-secondary);" onclick="FixupToast.show('Support Dispatch', 'Live support connected for ${b.id}. Agent joining...', 'info');">
                <i class="fa-solid fa-headset"></i> Need Help?
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach simulate step buttons
    activeBookingsList.querySelectorAll('.btn-simulate-step').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const current = e.currentTarget.dataset.current;
        const nextMap = {
          'pending': 'assigned',
          'assigned': 'enroute',
          'enroute': 'in_progress',
          'in_progress': 'completed'
        };
        const next = nextMap[current] || 'completed';
        window.FixupState.updateBookingStatus(id, next);
        window.FixupToast.show('Booking Status Advanced', `${id} is now ${next.toUpperCase()}`, 'info');
        renderBookings();
      });
    });
  }

  // --- Dynamic Quote Rotator ---
  function setupQuoteRotator() {
    const quotes = window.FixupState.state.quotes || [];
    if (!quotes.length || !dynamicQuoteText) return;
    let quoteIndex = 0;

    function showQuote(idx) {
      const q = quotes[idx % quotes.length];
      dynamicQuoteText.style.opacity = 0;
      setTimeout(() => {
        dynamicQuoteText.textContent = q.text;
        dynamicQuoteAuthor.textContent = `— ${q.author}`;
        dynamicQuoteText.style.opacity = 1;
      }, 300);
    }

    showQuote(0);
    setInterval(() => {
      quoteIndex++;
      showQuote(quoteIndex);
    }, 7000);
  }

  // --- Interactive Estimator ---
  function setupEstimator() {
    if (!estCategory || !estQuantity || !estUrgency || !estResult) return;

    function recomputeEstimate() {
      const catRate = Number(estCategory.value) || 399;
      const count = Number(estQuantity.value) || 1;
      const urgencyMult = Number(estUrgency.value) || 1.0;
      estQuantityVal.textContent = count;

      const base = catRate * count;
      const calculated = Math.round(base * urgencyMult * 1.05); // 5% fee
      estResult.textContent = window.formatINR(calculated);
    }

    estCategory.addEventListener('change', recomputeEstimate);
    estQuantity.addEventListener('input', recomputeEstimate);
    estUrgency.addEventListener('change', recomputeEstimate);
    recomputeEstimate();

    estBookBtn?.addEventListener('click', () => {
      const selectedOption = estCategory.options[estCategory.selectedIndex];
      const serviceId = selectedOption.dataset.serviceId || 'srv-elec';
      openBookingModal(serviceId);
    });
  }

  // Expose helper to book from reminders
  window.scheduleServiceReminder = function(serviceId) {
    openBookingModal(serviceId);
  };
});
