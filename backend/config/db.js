/**
 * FIXUP BACKEND — PERSISTENT JSON DATABASE ENGINE
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'store.json');
const INITIAL_DATA_FILE = path.join(__dirname, '..', 'data', 'initialData.json');

class Database {
  constructor() {
    this.data = { services: [], providers: [], bookings: [], logs: [] };
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else if (fs.existsSync(INITIAL_DATA_FILE)) {
        const initial = fs.readFileSync(INITIAL_DATA_FILE, 'utf-8');
        this.data = JSON.parse(initial);
        this.save();
      }
    } catch (err) {
      console.error('Error initializing database, using defaults:', err.message);
    }
  }

  save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving data to disk:', err.message);
    }
  }

  // Services
  getServices() {
    return this.data.services || [];
  }

  addService(srv) {
    srv.id = 'srv-' + Date.now();
    this.data.services.push(srv);
    this.save();
    return srv;
  }

  updateServicePrice(id, newPrice) {
    const srv = this.data.services.find(s => s.id === id);
    if (srv) {
      srv.basePrice = Number(newPrice);
      this.save();
      return srv;
    }
    return null;
  }

  // Providers
  getProviders() {
    return this.data.providers || [];
  }

  getProviderById(id) {
    return this.data.providers.find(p => p.id === id);
  }

  addProvider(pro) {
    pro.id = 'pro-' + Math.floor(100 + Math.random() * 900);
    pro.status = pro.status || 'online';
    pro.kycStatus = 'pending';
    pro.completedJobs = 0;
    pro.earningsToday = 0;
    pro.rating = 5.0;
    this.data.providers.unshift(pro);
    this.save();
    return pro;
  }

  updateProviderKyc(id, kycStatus) {
    const pro = this.getProviderById(id);
    if (pro) {
      pro.kycStatus = kycStatus;
      this.save();
      return pro;
    }
    return null;
  }

  updateProviderStatus(id, status) {
    const pro = this.getProviderById(id);
    if (pro) {
      pro.status = status;
      this.save();
      return pro;
    }
    return null;
  }

  // Bookings
  getBookings() {
    return this.data.bookings || [];
  }

  getBookingById(id) {
    return this.data.bookings.find(b => b.id === id);
  }

  createBooking(payload) {
    const newId = 'FX-' + Math.floor(1000 + Math.random() * 9000);
    const booking = {
      id: newId,
      createdAt: new Date().toISOString(),
      status: payload.providerId ? 'assigned' : 'pending',
      ...payload
    };
    this.data.bookings.unshift(booking);
    this.save();
    return booking;
  }

  updateBookingStatus(id, newStatus) {
    const b = this.getBookingById(id);
    if (b) {
      b.status = newStatus;
      if (newStatus === 'completed' && b.providerId) {
        const pro = this.getProviderById(b.providerId);
        if (pro) {
          pro.completedJobs = (pro.completedJobs || 0) + 1;
          pro.earningsToday = (pro.earningsToday || 0) + Math.round(b.totalAmount * 0.85);
        }
      }
      this.save();
      return b;
    }
    return null;
  }

  assignProvider(bookingId, providerId) {
    const b = this.getBookingById(bookingId);
    const pro = this.getProviderById(providerId);
    if (b && pro) {
      b.providerId = pro.id;
      b.providerName = pro.name;
      b.status = 'assigned';
      this.save();
      return b;
    }
    return null;
  }
}

module.exports = new Database();
