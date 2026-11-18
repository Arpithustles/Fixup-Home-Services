/**
 * FIXUP PLATFORM — SHARED ES6 CORE & REACTIVE STATE MANAGER
 * Powers dynamic cross-module interaction between User, Provider, and Admin.
 */

// Default Seed Data
const DEFAULT_SERVICES = [
  {
    id: 'srv-elec',
    name: 'Electrical Repairs & Wiring',
    category: 'Electrical',
    icon: 'fa-bolt',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    basePrice: 449,
    rating: 4.9,
    reviewsCount: 382,
    badge: 'Popular',
    tagline: 'Safe, certified solutions for short circuits, fans, lights & switchboards.',
    addons: [
      { id: 'ad-fan', name: 'Ceiling Fan Installation', price: 199 },
      { id: 'ad-mcb', name: 'MCB / Fuse Box Replacement', price: 299 },
      { id: 'ad-wire', name: 'Heavy Appliance Wiring Check', price: 249 }
    ]
  },
  {
    id: 'srv-plumb',
    name: 'Plumbing & Pipe Leakage Fix',
    category: 'Plumbing',
    icon: 'fa-faucet-drip',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    basePrice: 399,
    rating: 4.85,
    reviewsCount: 420,
    badge: 'Verified Pros',
    tagline: 'Tap repair, drain blockage clearing, geyser connection & pipe replacements.',
    addons: [
      { id: 'ad-motor', name: 'Water Motor Pump Checkup', price: 349 },
      { id: 'ad-block', name: 'Severe Drain Snaking', price: 299 },
      { id: 'ad-filter', name: 'RO Water Filter Line Fitting', price: 199 }
    ]
  },
  {
    id: 'srv-clean',
    name: 'Deep Home & Kitchen Cleaning',
    category: 'Cleaning',
    icon: 'fa-broom',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    basePrice: 699,
    rating: 4.92,
    reviewsCount: 512,
    badge: 'Top Rated',
    tagline: 'Intensive mechanized scrub, bathroom descaling & germ disinfection.',
    addons: [
      { id: 'ad-balcony', name: 'Balcony Jet Washing', price: 249 },
      { id: 'ad-sofa', name: 'Sofa & Mattress Shampooing', price: 399 },
      { id: 'ad-kitchen', name: 'Chimney Degreasing', price: 349 }
    ]
  },
  {
    id: 'srv-ac',
    name: 'AC Servicing & Gas Charging',
    category: 'Appliance Repair',
    icon: 'fa-snowflake',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
    basePrice: 599,
    rating: 4.88,
    reviewsCount: 290,
    badge: 'Seasonal Pick',
    tagline: 'Deep jet pump cleaning, refrigerant pressure check & cooling coil wash.',
    addons: [
      { id: 'ad-gas', name: 'Freon Gas Refill (Complete)', price: 1499 },
      { id: 'ad-foam', name: 'Antibacterial Foam Wash', price: 299 },
      { id: 'ad-pcb', name: 'Inverter PCB Diagnostic', price: 450 }
    ]
  },
  {
    id: 'srv-carp',
    name: 'Carpentry & Furniture Assembly',
    category: 'Carpentry',
    icon: 'fa-hammer',
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
    basePrice: 499,
    rating: 4.79,
    reviewsCount: 195,
    badge: 'Skilled',
    tagline: 'Door locks, hinges, custom shelves, bed setup and modular hinge alignments.',
    addons: [
      { id: 'ad-lock', name: 'High-Security Door Lock Fit', price: 299 },
      { id: 'ad-align', name: 'Wardrobe Slider Alignment', price: 249 }
    ]
  },
  {
    id: 'srv-paint',
    name: 'Interior & Waterproof Painting',
    category: 'Painting',
    icon: 'fa-paint-roller',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    basePrice: 899,
    rating: 4.91,
    reviewsCount: 160,
    badge: 'Expert Quality',
    tagline: 'Wall putty, damp wall sealing, accent wall styling & smooth emulsion paint.',
    addons: [
      { id: 'ad-damp', name: 'Damp Proof Primer Layer', price: 450 },
      { id: 'ad-texture', name: 'Texture Design Wall (Single)', price: 799 }
    ]
  }
];

const DEFAULT_PROVIDERS = [
  {
    id: 'pro-101',
    name: 'Rajesh Sharma',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80',
    serviceCategory: 'Electrical',
    phone: '+91 98765 43210',
    experienceYears: 8,
    rating: 4.94,
    completedJobs: 412,
    status: 'online', // 'online' or 'offline'
    kycStatus: 'verified', // 'verified', 'pending', 'rejected'
    badge: 'Master Electrician',
    bio: 'Certified industrial & residential wireman. Specializes in rapid emergency triage.',
    earningsToday: 1850,
    location: 'Sector 62, Noida / Delhi NCR'
  },
  {
    id: 'pro-102',
    name: 'Vikram Chawla',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    serviceCategory: 'Plumbing',
    phone: '+91 98123 45678',
    experienceYears: 6,
    rating: 4.88,
    completedJobs: 334,
    status: 'online',
    kycStatus: 'verified',
    badge: 'Drain & Hydro Expert',
    bio: '100% leak-proof guarantee. Equipped with digital pressure gauges & pipe cameras.',
    earningsToday: 1420,
    location: 'Indirapuram & Vaishali'
  },
  {
    id: 'pro-103',
    name: 'Sunita Devi',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    serviceCategory: 'Cleaning',
    phone: '+91 99988 77665',
    experienceYears: 7,
    rating: 4.96,
    completedJobs: 560,
    status: 'online',
    kycStatus: 'verified',
    badge: 'Hygiene Specialist',
    bio: 'Hospital-grade sanitization techniques and eco-friendly organic scrubbing solutions.',
    earningsToday: 2300,
    location: 'South Delhi & Greater Kailash'
  },
  {
    id: 'pro-104',
    name: 'Amit Patel',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    serviceCategory: 'Appliance Repair',
    phone: '+91 97711 22334',
    experienceYears: 5,
    rating: 4.82,
    completedJobs: 210,
    status: 'offline',
    kycStatus: 'verified',
    badge: 'HVAC Specialist',
    bio: 'Former Daikin & Voltas authorized senior engineer. Quick diagnosis for all inverter ACs.',
    earningsToday: 950,
    location: 'Cyber City, Gurugram'
  },
  {
    id: 'pro-105',
    name: 'Mohammad Farooq',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    serviceCategory: 'Carpentry',
    phone: '+91 98222 33445',
    experienceYears: 10,
    rating: 4.91,
    completedJobs: 388,
    status: 'online',
    kycStatus: 'pending', // Pending Admin review!
    badge: 'Master Woodcraftsman',
    bio: 'Fine cabinetry, termite prevention and precision hinge fitting for modern homes.',
    earningsToday: 0,
    location: 'Rohini & Pitampura'
  }
];

const DEFAULT_BOOKINGS = [
  {
    id: 'FX-8941',
    customerName: 'Priya Verma',
    customerPhone: '+91 98111 22334',
    customerAddress: 'Flat 402, Lotus Boulevard, Sector 100, Noida',
    serviceId: 'srv-elec',
    serviceName: 'Electrical Repairs & Wiring',
    category: 'Electrical',
    date: '2026-11-19',
    timeSlot: '10:00 AM - 12:00 PM',
    status: 'in_progress', // 'pending', 'assigned', 'enroute', 'in_progress', 'completed'
    providerId: 'pro-101',
    providerName: 'Rajesh Sharma',
    isEmergency: true,
    basePrice: 449,
    addons: [{ name: 'MCB / Fuse Box Replacement', price: 299 }],
    totalAmount: 898,
    notes: 'Sparking noticed in the main distribution board when AC turns on.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'FX-8942',
    customerName: 'Aman Mehra',
    customerPhone: '+91 98777 66554',
    customerAddress: 'Villa 12, Palm Meadows, Whitefield',
    serviceId: 'srv-plumb',
    serviceName: 'Plumbing & Pipe Leakage Fix',
    category: 'Plumbing',
    date: '2026-11-19',
    timeSlot: '02:00 PM - 04:00 PM',
    status: 'assigned',
    providerId: 'pro-102',
    providerName: 'Vikram Chawla',
    isEmergency: false,
    basePrice: 399,
    addons: [{ name: 'Severe Drain Snaking', price: 299 }],
    totalAmount: 733,
    notes: 'Kitchen sink drain overflow and slow discharge.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'FX-8943',
    customerName: 'Kavita Sengupta',
    customerPhone: '+91 97123 45678',
    customerAddress: 'House 88, B-Block, Defence Colony, New Delhi',
    serviceId: 'srv-clean',
    serviceName: 'Deep Home & Kitchen Cleaning',
    category: 'Cleaning',
    date: '2026-11-18',
    timeSlot: '09:00 AM - 01:00 PM',
    status: 'completed',
    providerId: 'pro-103',
    providerName: 'Sunita Devi',
    isEmergency: false,
    basePrice: 699,
    addons: [{ name: 'Sofa & Mattress Shampooing', price: 399 }],
    totalAmount: 1153,
    notes: 'Pre-festival full deep sanitization.',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

const PLATFORM_QUOTES = [
  { text: "Apke Ghar Ka Har Kaam, Ab Ek Call Pe.", author: "Fixup Core Mission" },
  { text: "A well-cared-for home brings peace of mind to everyone inside it.", author: "Fixup Philosophy" },
  { text: "Skill deserves dignity; households deserve absolute trust and safety.", author: "Arpit Singh & Team" },
  { text: "Quality is not an accident; it is the result of high intention and sincere effort.", author: "Service Excellence" },
  { text: "Transparent pricing and verified professionals — because your home is your sanctuary.", author: "Fixup Promise" }
];

// Reactive Store Class
class FixupStore {
  constructor() {
    this.STORAGE_KEY = 'fixup_platform_state_v1';
    this.init();
    this.setupStorageListener();
  }

  init() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) {
      this.state = {
        services: DEFAULT_SERVICES,
        providers: DEFAULT_PROVIDERS,
        bookings: DEFAULT_BOOKINGS,
        quotes: PLATFORM_QUOTES,
        systemLogs: [
          { timestamp: new Date().toLocaleTimeString(), level: 'INFO', msg: 'Fixup Reactive Core initialized with demo seed data.' },
          { timestamp: new Date(Date.now() - 120000).toLocaleTimeString(), level: 'AUTH', msg: 'Admin security token issued to session.' },
          { timestamp: new Date(Date.now() - 60000).toLocaleTimeString(), level: 'DISPATCH', msg: 'Provider Rajesh Sharma accepted booking FX-8941.' }
        ]
      };
      this.persist();
    } else {
      try {
        this.state = JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing FixupStore state:', e);
        this.reset();
      }
    }
  }

  persist() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    window.dispatchEvent(new CustomEvent('fixup-state-changed', { detail: this.state }));
  }

  setupStorageListener() {
    window.addEventListener('storage', (event) => {
      if (event.key === this.STORAGE_KEY && event.newValue) {
        try {
          this.state = JSON.parse(event.newValue);
          window.dispatchEvent(new CustomEvent('fixup-state-changed', { detail: this.state }));
        } catch (err) {
          console.error('Cross-tab sync error:', err);
        }
      }
    });
  }

  reset() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.init();
    window.dispatchEvent(new CustomEvent('fixup-state-changed', { detail: this.state }));
  }

  // --- Services ---
  getServices() {
    return this.state.services || [];
  }

  getServiceById(id) {
    return this.state.services.find(s => s.id === id);
  }

  addService(service) {
    service.id = 'srv-' + Date.now();
    this.state.services.push(service);
    this.log('CATALOG', `New service added: ${service.name}`);
    this.persist();
    return service;
  }

  // --- Providers ---
  getProviders() {
    return this.state.providers || [];
  }

  getProviderById(id) {
    return this.state.providers.find(p => p.id === id);
  }

  updateProviderStatus(id, newStatus) {
    const pro = this.getProviderById(id);
    if (pro) {
      pro.status = newStatus;
      this.log('PROVIDER', `Provider ${pro.name} is now ${newStatus.toUpperCase()}`);
      this.persist();
    }
  }

  updateProviderKyc(id, kycStatus) {
    const pro = this.getProviderById(id);
    if (pro) {
      pro.kycStatus = kycStatus;
      this.log('KYC', `Provider ${pro.name} KYC updated to: ${kycStatus.toUpperCase()}`);
      this.persist();
    }
  }

  registerProvider(providerData) {
    const newPro = {
      id: 'pro-' + Math.floor(100 + Math.random() * 900),
      avatar: providerData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      rating: 5.0,
      completedJobs: 0,
      earningsToday: 0,
      status: 'online',
      kycStatus: 'pending',
      ...providerData
    };
    this.state.providers.unshift(newPro);
    this.log('ONBOARD', `New Pro registered: ${newPro.name} (${newPro.serviceCategory}). KYC Pending.`);
    this.persist();
    return newPro;
  }

  // --- Bookings ---
  getBookings() {
    return this.state.bookings || [];
  }

  getBookingById(id) {
    return this.state.bookings.find(b => b.id === id);
  }

  createBooking(bookingPayload) {
    const newId = 'FX-' + Math.floor(1000 + Math.random() * 9000);
    // Auto-match best online provider in that category if available
    const matchedPro = this.state.providers.find(
      p => p.serviceCategory.toLowerCase() === bookingPayload.category.toLowerCase() && 
           p.status === 'online' && p.kycStatus === 'verified'
    );

    const booking = {
      id: newId,
      createdAt: new Date().toISOString(),
      status: matchedPro ? 'assigned' : 'pending',
      providerId: matchedPro ? matchedPro.id : null,
      providerName: matchedPro ? matchedPro.name : 'Awaiting Match',
      ...bookingPayload
    };

    this.state.bookings.unshift(booking);
    this.log('BOOKING', `Booking ${newId} placed for ${booking.customerName} (${booking.serviceName}). Total: ₹${booking.totalAmount}`);
    this.persist();
    return booking;
  }

  updateBookingStatus(bookingId, newStatus) {
    const booking = this.getBookingById(bookingId);
    if (booking) {
      const prevStatus = booking.status;
      booking.status = newStatus;
      
      // If completed, add to provider's daily earnings and job count
      if (newStatus === 'completed' && prevStatus !== 'completed' && booking.providerId) {
        const pro = this.getProviderById(booking.providerId);
        if (pro) {
          pro.completedJobs = (pro.completedJobs || 0) + 1;
          pro.earningsToday = (pro.earningsToday || 0) + Math.round(booking.totalAmount * 0.85); // 85% pro share
        }
      }
      
      this.log('STATUS', `Booking ${bookingId} transitioned from ${prevStatus} -> ${newStatus}`);
      this.persist();
      return booking;
    }
    return null;
  }

  assignProviderToBooking(bookingId, providerId) {
    const booking = this.getBookingById(bookingId);
    const pro = this.getProviderById(providerId);
    if (booking && pro) {
      booking.providerId = pro.id;
      booking.providerName = pro.name;
      booking.status = 'assigned';
      this.log('DISPATCH', `Admin assigned ${pro.name} to Booking ${bookingId}`);
      this.persist();
    }
  }

  // --- Logs ---
  log(level, msg) {
    if (!this.state.systemLogs) this.state.systemLogs = [];
    this.state.systemLogs.unshift({
      timestamp: new Date().toLocaleTimeString(),
      level: level.toUpperCase(),
      msg
    });
    if (this.state.systemLogs.length > 50) this.state.systemLogs.pop();
  }

  getLogs() {
    return this.state.systemLogs || [];
  }
}

// Global Store Instance
window.FixupState = new FixupStore();

// Universal Toast Manager
window.FixupToast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'fx-toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(title, message = '', type = 'info', duration = 3800) {
    this.init();
    const toast = document.createElement('div');
    toast.className = `fx-toast toast-${type}`;

    let iconHtml = '<i class="fa-solid fa-circle-info text-info"></i>';
    if (type === 'success') iconHtml = '<i class="fa-solid fa-circle-check text-success"></i>';
    if (type === 'warning') iconHtml = '<i class="fa-solid fa-triangle-exclamation text-warning"></i>';
    if (type === 'danger') iconHtml = '<i class="fa-solid fa-circle-xmark text-danger"></i>';

    toast.innerHTML = `
      <div class="fx-toast-icon">${iconHtml}</div>
      <div class="fx-toast-content">
        <div class="fx-toast-title">${title}</div>
        ${message ? `<div class="fx-toast-message">${message}</div>` : ''}
      </div>
      <button class="fx-toast-close">&times;</button>
    `;

    toast.querySelector('.fx-toast-close').addEventListener('click', () => {
      toast.remove();
    });

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

// Currency Formatter
window.formatINR = function(val) {
  return '₹' + Math.round(Number(val) || 0).toLocaleString('en-IN');
};

// Universal Top Navigation Bar Component
window.renderUniversalNav = function(activeModule = 'home') {
  const existingNav = document.querySelector('.fixup-universal-nav');
  if (existingNav) return;

  // Compute relative path to root or modules
  const isInsideModule = window.location.pathname.includes('/modules/');
  const rootPrefix = isInsideModule ? '../../' : './';
  const modulePrefix = isInsideModule ? '../' : './modules/';

  const nav = document.createElement('nav');
  nav.className = 'fixup-universal-nav';
  nav.innerHTML = `
    <div class="fixup-universal-inner">
      <a href="${rootPrefix}index.html" class="universal-brand">
        <div class="universal-logo-badge">F</div>
        <div>
          <span class="universal-brand-text">Fixup<span style="color: var(--secondary)">.</span></span>
          <span class="universal-brand-tag">3-In-1 Ecosystem</span>
        </div>
      </a>

      <div class="universal-modules">
        <a href="${rootPrefix}index.html" class="universal-module-btn ${activeModule === 'home' ? 'active' : ''}">
          <i class="fa-solid fa-house"></i> Overview Hub
        </a>
        <a href="${modulePrefix}user/index.html" class="universal-module-btn ${activeModule === 'user' ? 'active' : ''}">
          <i class="fa-solid fa-user"></i> Customer App
        </a>
        <a href="${modulePrefix}provider/index.html" class="universal-module-btn ${activeModule === 'provider' ? 'active-pro' : ''}">
          <i class="fa-solid fa-screwdriver-wrench"></i> Provider Desk
        </a>
        <a href="${modulePrefix}admin/index.html" class="universal-module-btn ${activeModule === 'admin' ? 'active-admin' : ''}">
          <i class="fa-solid fa-chart-line"></i> Admin & Dev Console
        </a>
      </div>

      <div class="universal-actions">
        <div class="live-sync-badge">
          <div class="pulse-dot"></div>
          <span>ES6 Live Sync</span>
        </div>
        <button class="btn-reset-demo" title="Reset all demo bookings & provider states" onclick="FixupState.reset(); FixupToast.show('Data Reset', 'Default mock bookings & providers restored.', 'info');">
          <i class="fa-solid fa-arrow-rotate-right"></i> Reset Demo
        </button>
      </div>
    </div>
  `;

  document.body.prepend(nav);
};
