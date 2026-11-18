/**
 * FIXUP BOOKING & DYNAMIC PRICING ENGINE (booking.js)
 * Implements category selection, add-ons, transparent night charges,
 * emergency dispatch, and booking creation.
 */

(function () {
  'use strict';

  function getPrefix() {
    const p = window.location.pathname.replace(/\\/g, '/');
    if (p.includes('/frontend/pages/') || p.includes('/frontend/customer/') || p.includes('/frontend/provider/') || p.includes('/frontend/admin/')) {
      return '../../';
    }
    return './';
  }

  const prefix = getPrefix();

  window.initBookingSystem = function (isEmergencyMode = false) {
    const serviceCategorySelect = document.getElementById('bookCategory');
    const specificServiceSelect = document.getElementById('bookService');
    const addonsContainer = document.getElementById('addonsListContainer');
    const dateInput = document.getElementById('bookDate');
    const timeSlotSelect = document.getElementById('bookTimeSlot');
    const bookingForm = document.getElementById('serviceBookingForm');

    // Price Breakdown DOM
    const priceBaseVal = document.getElementById('priceBaseVal');
    const priceAddonsVal = document.getElementById('priceAddonsVal');
    const priceNightRow = document.getElementById('priceNightRow');
    const priceNightVal = document.getElementById('priceNightVal');
    const priceEmergencyRow = document.getElementById('priceEmergencyRow');
    const priceEmergencyVal = document.getElementById('priceEmergencyVal');
    const priceTaxVal = document.getElementById('priceTaxVal');
    const priceTotalVal = document.getElementById('priceTotalVal');

    // Prefill date with tomorrow or today if emergency
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.min = today;
      dateInput.value = today;
    }

    // Populate services based on category
    function populateServices() {
      const selectedCat = serviceCategorySelect.value;
      const allServices = window.FixupStore.getServices();
      const filtered = selectedCat ? allServices.filter(s => s.category.toLowerCase() === selectedCat.toLowerCase()) : allServices;

      specificServiceSelect.innerHTML = filtered.map(s => `
        <option value="${s.id}" data-base="${s.basePrice}">
          ${s.name} (Starts ₹${s.basePrice})
        </option>
      `).join('');

      renderAddons();
      recalculatePrice();
    }

    function renderAddons() {
      const serviceId = specificServiceSelect.value;
      const service = window.FixupStore.getServiceById(serviceId);
      if (!service || !service.addons || service.addons.length === 0) {
        addonsContainer.innerHTML = '<p style="font-size: 0.85rem; color: var(--text-muted);">No specific add-ons for this category.</p>';
        return;
      }

      addonsContainer.innerHTML = service.addons.map((a, idx) => `
        <label style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--bg-surface-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-bottom: 8px; cursor: pointer;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <input type="checkbox" class="booking-addon-cb" data-name="${a.name}" data-price="${a.price}" style="width: 17px; height: 17px; accent-color: var(--primary);">
            <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary);">${a.name}</span>
          </div>
          <strong style="color: var(--primary); font-size: 0.92rem;">+₹${a.price}</strong>
        </label>
      `).join('');

      addonsContainer.querySelectorAll('.booking-addon-cb').forEach(cb => {
        cb.addEventListener('change', recalculatePrice);
      });
    }

    function recalculatePrice() {
      const serviceId = specificServiceSelect.value;
      const timeSlot = timeSlotSelect ? timeSlotSelect.value : '';

      const selectedAddons = [];
      addonsContainer.querySelectorAll('.booking-addon-cb:checked').forEach(cb => {
        selectedAddons.push({
          name: cb.dataset.name,
          price: Number(cb.dataset.price)
        });
      });

      const calc = window.FixupStore.calculatePrice({
        serviceId,
        addons: selectedAddons,
        timeString: timeSlot,
        isEmergency: isEmergencyMode
      });

      priceBaseVal.textContent = `₹${calc.base}`;
      priceAddonsVal.textContent = `₹${calc.addonsTotal}`;

      // Night Surcharge
      if (calc.isNight) {
        priceNightRow.style.display = 'flex';
        priceNightVal.textContent = `+₹${calc.nightCharge}`;
      } else {
        priceNightRow.style.display = 'none';
      }

      // Emergency Surcharge
      if (calc.isEmergency) {
        priceEmergencyRow.style.display = 'flex';
        priceEmergencyVal.textContent = `+₹${calc.emergencyCharge}`;
      } else {
        priceEmergencyRow.style.display = 'none';
      }

      priceTaxVal.textContent = `₹${calc.taxAndPlatform}`;
      priceTotalVal.textContent = `₹${calc.total}`;

      return calc;
    }

    serviceCategorySelect?.addEventListener('change', populateServices);
    specificServiceSelect?.addEventListener('change', () => {
      renderAddons();
      recalculatePrice();
    });
    timeSlotSelect?.addEventListener('change', recalculatePrice);

    // Initial load
    populateServices();

    // Form Submit
    bookingForm?.addEventListener('submit', (e) => {
      e.preventDefault();

      const session = window.FixupStore.getSession();
      if (!session || session.role !== 'CUSTOMER') {
        window.FixupToast.show('Customer Login Required', 'Please log into your Customer Account to request home services.', 'warning');
        setTimeout(() => {
          window.location.href = `${prefix}frontend/pages/login.html`;
        }, 1200);
        return;
      }

      const serviceId = specificServiceSelect.value;
      const srv = window.FixupStore.getServiceById(serviceId);
      const desc = document.getElementById('bookDesc').value.trim();
      const address = document.getElementById('bookAddress').value.trim();
      const date = dateInput.value;
      const time = timeSlotSelect.value;

      const calc = recalculatePrice();

      const selectedAddons = [];
      addonsContainer.querySelectorAll('.booking-addon-cb:checked').forEach(cb => {
        selectedAddons.push({ name: cb.dataset.name, price: Number(cb.dataset.price) });
      });

      const booking = window.FixupStore.createBooking({
        customerId: session.userId,
        customerName: session.name,
        customerPhone: session.phone || '+91 98111 22334',
        customerAddress: address,
        serviceId: srv.id,
        serviceName: srv.name,
        category: srv.category,
        problemDescription: desc || 'General household maintenance.',
        date,
        timeSlot: time,
        isNight: calc.isNight,
        isEmergency: isEmergencyMode,
        basePrice: calc.base,
        nightCharge: calc.nightCharge,
        emergencyCharge: calc.emergencyCharge,
        addons: selectedAddons,
        taxAndPlatform: calc.taxAndPlatform,
        totalAmount: calc.total
      });

      window.FixupToast.show(
        isEmergencyMode ? '🚨 Emergency Request Dispatched!' : 'Booking Placed Successfully!',
        `Order ${booking.id} created. Assigned to: ${booking.providerName}`,
        'success',
        6000
      );

      setTimeout(() => {
        window.location.href = `${prefix}frontend/customer/dashboard.html`;
      }, 1500);
    });
  };
})();
