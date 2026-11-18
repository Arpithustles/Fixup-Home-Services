/**
 * FIXUP CORE DATA STORE & SESSION MANAGER (store.js)
 * Persistent client-side database, strict role enforcement, 72h session management,
 * dynamic pricing engine with night charges, and 15-day recurring KYC engine.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'fixup_enterprise_data_v2';
  const SESSION_KEY = 'fixup_user_session_v2';
  const ADMIN_SESSION_KEY = 'fixup_admin_session_v2';

  // High quality authentic images of real trade professionals
  const SEED_SERVICES = [
    // ── EXISTING PARENT ENTRIES (6) ──────────────────────────────────────
    {
      id: 'srv-plumb',
      name: 'Plumbing & Water System Repair',
      category: 'Plumbing',
      icon: 'fa-faucet-drip',
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
      basePrice: 399,
      rating: 4.88,
      reviewsCount: 420,
      badge: 'Certified Master',
      tagline: 'Pipe leak repairs, tap washer fittings, drain snaking, geyser and overhead tank valves.',
      addons: [
        { id: 'ad-drain', name: 'Severe Drain Blockage Snaking', price: 299 },
        { id: 'ad-motor', name: 'Water Booster Pump Diagnosis', price: 349 },
        { id: 'ad-geyser', name: 'Geyser Inlet/Outlet Fitting Replacement', price: 249 }
      ]
    },
    {
      id: 'srv-elec',
      name: 'Electrical Repair & Wiring',
      category: 'Electrical',
      icon: 'fa-bolt',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      basePrice: 449,
      rating: 4.92,
      reviewsCount: 382,
      badge: 'Popular',
      tagline: 'Short-circuit triage, ceiling fans, switches, wiring replacement and MCB protection.',
      addons: [
        { id: 'ad-fan', name: 'Ceiling Fan Complete Installation', price: 199 },
        { id: 'ad-mcb', name: 'Main Distribution MCB Box Replacement', price: 299 },
        { id: 'ad-earthing', name: 'Earthing & Ground Voltage Health Check', price: 249 }
      ]
    },
    {
      id: 'srv-carp',
      name: 'Carpentry & Furniture Assembly',
      category: 'Carpentry',
      icon: 'fa-hammer',
      image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
      basePrice: 499,
      rating: 4.81,
      reviewsCount: 215,
      badge: 'Craftsman Quality',
      tagline: 'Lock installation, door hinges, drawer sliders, bed assembly and custom wooden shelves.',
      addons: [
        { id: 'ad-lock', name: 'High-Security Door Lock Fitting', price: 299 },
        { id: 'ad-hinge', name: 'Hydraulic Soft-Close Hinge Fitting (Set of 4)', price: 249 }
      ]
    },
    {
      id: 'srv-ac',
      name: 'Air Conditioner Servicing & Repair',
      category: 'AC Repair',
      icon: 'fa-snowflake',
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
      basePrice: 599,
      rating: 4.89,
      reviewsCount: 340,
      badge: 'Seasonal Essential',
      tagline: 'Jet-pump coil wash, gas leak checks, PCB inverter diagnosis and filter sterilization.',
      addons: [
        { id: 'ad-gas', name: 'Complete Freon Gas Recharge (R32/R410A)', price: 1499 },
        { id: 'ad-foam', name: 'Antibacterial Deep Chemical Foam Wash', price: 299 }
      ]
    },
    {
      id: 'srv-clean',
      name: 'Deep Home & Kitchen Cleaning',
      category: 'Cleaning',
      icon: 'fa-broom',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
      basePrice: 699,
      rating: 4.94,
      reviewsCount: 512,
      badge: 'Top Rated',
      tagline: 'Floor mechanized scrubbing, tile descaling, chimney degreasing and germ disinfection.',
      addons: [
        { id: 'ad-balcony', name: 'Balcony High-Pressure Wash', price: 249 },
        { id: 'ad-sofa', name: 'Sofa & Fabric Mattress Shampooing', price: 399 }
      ]
    },
    {
      id: 'srv-paint',
      name: 'Painting & Waterproofing',
      category: 'Painting',
      icon: 'fa-paint-roller',
      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
      basePrice: 899,
      rating: 4.87,
      reviewsCount: 168,
      badge: 'Waterproof Shield',
      tagline: 'Wall putty leveling, damp sealing, premium emulsion coats and accent wall finishes.',
      addons: [
        { id: 'ad-damp', name: 'Primer Anti-Fungal Layer', price: 399 },
        { id: 'ad-texture', name: 'Designer Texture Accent Wall', price: 799 }
      ]
    },

    // ── PLUMBING SUBCATEGORIES ────────────────────────────────────────────
    { id: 'srv-plumb-tap', name: 'Tap Repair', category: 'Plumbing', subcategory: 'Plumbing', basePrice: 299, icon: 'fa-faucet', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80', tagline: 'Fix dripping or broken taps instantly.', rating: 4.85, reviewsCount: 180, badge: 'Quick Fix', addons: [] },
    { id: 'srv-plumb-pipe', name: 'Pipe Leakage Repair', category: 'Plumbing', subcategory: 'Plumbing', basePrice: 349, icon: 'fa-pipe-valve', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', tagline: 'Stop leaks before they damage walls.', rating: 4.87, reviewsCount: 210, badge: 'Most Needed', addons: [] },
    { id: 'srv-plumb-bath', name: 'Bathroom Plumbing', category: 'Plumbing', subcategory: 'Plumbing', basePrice: 449, icon: 'fa-bath', image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80', tagline: 'Complete bathroom plumbing fixes.', rating: 4.82, reviewsCount: 155, badge: 'Popular', addons: [] },
    { id: 'srv-plumb-kitchen', name: 'Kitchen Plumbing', category: 'Plumbing', subcategory: 'Plumbing', basePrice: 399, icon: 'fa-kitchen-set', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80', tagline: 'Sink, pipe and drain fixes for kitchens.', rating: 4.80, reviewsCount: 120, badge: 'Essential', addons: [] },
    { id: 'srv-plumb-tank', name: 'Water Tank Cleaning', category: 'Plumbing', subcategory: 'Plumbing', basePrice: 599, icon: 'fa-water', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80', tagline: 'Thorough overhead/underground tank cleaning.', rating: 4.90, reviewsCount: 200, badge: 'Health Shield', addons: [] },
    { id: 'srv-plumb-drain', name: 'Drainage Cleaning', category: 'Plumbing', subcategory: 'Plumbing', basePrice: 349, icon: 'fa-sink', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', tagline: 'Unblock drains and sewer lines quickly.', rating: 4.84, reviewsCount: 175, badge: 'Emergency Ready', addons: [] },
    { id: 'srv-plumb-toilet', name: 'Toilet Repair', category: 'Plumbing', subcategory: 'Plumbing', basePrice: 299, icon: 'fa-toilet', image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80', tagline: 'Flush, seat, cistern and commode repairs.', rating: 4.78, reviewsCount: 140, badge: 'Quick Fix', addons: [] },
    { id: 'srv-plumb-motor', name: 'Water Motor Repair', category: 'Plumbing', subcategory: 'Plumbing', basePrice: 499, icon: 'fa-pump-soap', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80', tagline: 'Fix and service water pump motors.', rating: 4.86, reviewsCount: 130, badge: 'Specialist', addons: [] },

    // ── ELECTRICAL SUBCATEGORIES ──────────────────────────────────────────
    { id: 'srv-elec-fan', name: 'Fan Installation', category: 'Electrical', subcategory: 'Electrical', basePrice: 199, icon: 'fa-fan', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80', tagline: 'Ceiling, table and exhaust fan installation.', rating: 4.88, reviewsCount: 220, badge: 'Most Booked', addons: [] },
    { id: 'srv-elec-switch', name: 'Switchboard Repair', category: 'Electrical', subcategory: 'Electrical', basePrice: 249, icon: 'fa-toggle-on', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80', tagline: 'Fix faulty switches and sockets safely.', rating: 4.85, reviewsCount: 190, badge: 'Safe & Certified', addons: [] },
    { id: 'srv-elec-wiring', name: 'Wiring and Rewiring', category: 'Electrical', subcategory: 'Electrical', basePrice: 799, icon: 'fa-plug', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80', tagline: 'Full home wiring and rewiring services.', rating: 4.91, reviewsCount: 160, badge: 'Expert Work', addons: [] },
    { id: 'srv-elec-light', name: 'Light Installation', category: 'Electrical', subcategory: 'Electrical', basePrice: 199, icon: 'fa-lightbulb', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80', tagline: 'LED, CFL and decorative light fitting.', rating: 4.86, reviewsCount: 200, badge: 'Quick', addons: [] },
    { id: 'srv-elec-mcb', name: 'MCB and Fuse Repair', category: 'Electrical', subcategory: 'Electrical', basePrice: 349, icon: 'fa-bolt', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80', tagline: 'MCB box and fuse line protection repair.', rating: 4.92, reviewsCount: 250, badge: 'Safety First', addons: [] },
    { id: 'srv-elec-inverter', name: 'Inverter Installation', category: 'Electrical', subcategory: 'Electrical', basePrice: 499, icon: 'fa-battery-full', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80', tagline: 'Home inverter and battery setup.', rating: 4.83, reviewsCount: 110, badge: 'Power Backup', addons: [] },
    { id: 'srv-elec-inspect', name: 'Electrical Inspection', category: 'Electrical', subcategory: 'Electrical', basePrice: 399, icon: 'fa-magnifying-glass', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80', tagline: 'Full home electrical safety audit.', rating: 4.90, reviewsCount: 135, badge: 'Safety Audit', addons: [] },
    { id: 'srv-elec-short', name: 'Short Circuit Repair', category: 'Electrical', subcategory: 'Electrical', basePrice: 449, icon: 'fa-triangle-exclamation', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80', tagline: 'Emergency short circuit diagnosis & fix.', rating: 4.94, reviewsCount: 180, badge: 'Emergency', addons: [] },

    // ── CARPENTRY SUBCATEGORIES ───────────────────────────────────────────
    { id: 'srv-carp-furn', name: 'Furniture Repair', category: 'Carpentry', subcategory: 'Carpentry', basePrice: 399, icon: 'fa-chair', image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80', tagline: 'Repair chairs, tables and wooden furniture.', rating: 4.82, reviewsCount: 160, badge: 'Popular', addons: [] },
    { id: 'srv-carp-door', name: 'Door Installation', category: 'Carpentry', subcategory: 'Carpentry', basePrice: 699, icon: 'fa-door-open', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80', tagline: 'Wooden and metal door fitting.', rating: 4.86, reviewsCount: 140, badge: 'Expert', addons: [] },
    { id: 'srv-carp-lock', name: 'Lock and Handle Repair', category: 'Carpentry', subcategory: 'Carpentry', basePrice: 299, icon: 'fa-lock', image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80', tagline: 'Door lock, handle and latch repairs.', rating: 4.80, reviewsCount: 195, badge: 'Quick Fix', addons: [] },
    { id: 'srv-carp-ward', name: 'Wardrobe Repair', category: 'Carpentry', subcategory: 'Carpentry', basePrice: 499, icon: 'fa-box', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80', tagline: 'Wardrobe hinges, tracks and frame repair.', rating: 4.84, reviewsCount: 120, badge: 'Popular', addons: [] },
    { id: 'srv-carp-bed', name: 'Bed Repair', category: 'Carpentry', subcategory: 'Carpentry', basePrice: 449, icon: 'fa-bed', image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80', tagline: 'Bed frame, slat and headboard fixes.', rating: 4.78, reviewsCount: 95, badge: 'Comfort Fix', addons: [] },
    { id: 'srv-carp-modular', name: 'Modular Furniture Assembly', category: 'Carpentry', subcategory: 'Carpentry', basePrice: 599, icon: 'fa-screwdriver-wrench', image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80', tagline: 'IKEA and modular furniture assembly.', rating: 4.89, reviewsCount: 175, badge: 'Most Booked', addons: [] },
    { id: 'srv-carp-shelf', name: 'Shelf Installation', category: 'Carpentry', subcategory: 'Carpentry', basePrice: 349, icon: 'fa-layer-group', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80', tagline: 'Wall-mounted shelves and brackets.', rating: 4.83, reviewsCount: 130, badge: 'Quick', addons: [] },

    // ── AC & APPLIANCE SUBCATEGORIES ──────────────────────────────────────
    { id: 'srv-ac-service', name: 'AC Servicing', category: 'AC Repair', subcategory: 'AC & Appliance', basePrice: 399, icon: 'fa-snowflake', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80', tagline: 'Complete AC deep clean and service.', rating: 4.90, reviewsCount: 380, badge: 'Seasonal Must', addons: [] },
    { id: 'srv-ac-install', name: 'AC Installation', category: 'AC Repair', subcategory: 'AC & Appliance', basePrice: 999, icon: 'fa-wind', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80', tagline: 'Split and window AC installation.', rating: 4.88, reviewsCount: 250, badge: 'Expert', addons: [] },
    { id: 'srv-ac-gas', name: 'AC Gas Refilling', category: 'AC Repair', subcategory: 'AC & Appliance', basePrice: 1499, icon: 'fa-gas-pump', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80', tagline: 'R32/R410A gas top-up and leak check.', rating: 4.87, reviewsCount: 195, badge: 'Cooling Fix', addons: [] },
    { id: 'srv-app-fridge', name: 'Refrigerator Repair', category: 'AC Repair', subcategory: 'AC & Appliance', basePrice: 499, icon: 'fa-box-open', image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=800&q=80', tagline: 'Cooling, compressor and door seal fixes.', rating: 4.85, reviewsCount: 210, badge: 'Appliance Pro', addons: [] },
    { id: 'srv-app-washer', name: 'Washing Machine Repair', category: 'AC Repair', subcategory: 'AC & Appliance', basePrice: 449, icon: 'fa-shirt', image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80', tagline: 'Front-load and top-load machine repairs.', rating: 4.82, reviewsCount: 188, badge: 'Popular', addons: [] },
    { id: 'srv-app-micro', name: 'Microwave Repair', category: 'AC Repair', subcategory: 'AC & Appliance', basePrice: 349, icon: 'fa-fire', image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=800&q=80', tagline: 'Microwave heating element and turntable fix.', rating: 4.78, reviewsCount: 142, badge: 'Quick Fix', addons: [] },
    { id: 'srv-app-geyser', name: 'Geyser Repair', category: 'AC Repair', subcategory: 'AC & Appliance', basePrice: 399, icon: 'fa-temperature-high', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', tagline: 'Water heater element and thermostat repair.', rating: 4.86, reviewsCount: 165, badge: 'Hot Water Fix', addons: [] },
    { id: 'srv-app-tv', name: 'Television Repair', category: 'AC Repair', subcategory: 'AC & Appliance', basePrice: 499, icon: 'fa-tv', image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=800&q=80', tagline: 'Smart TV, LED screen and board repairs.', rating: 4.80, reviewsCount: 120, badge: 'Tech Expert', addons: [] },

    // ── CLEANING SUBCATEGORIES ────────────────────────────────────────────
    { id: 'srv-clean-full', name: 'Full Home Cleaning', category: 'Cleaning', subcategory: 'Cleaning', basePrice: 999, icon: 'fa-house', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80', tagline: 'Complete home top-to-bottom scrubbing.', rating: 4.95, reviewsCount: 520, badge: 'Top Rated', addons: [] },
    { id: 'srv-clean-bath', name: 'Bathroom Cleaning', category: 'Cleaning', subcategory: 'Cleaning', basePrice: 399, icon: 'fa-bath', image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80', tagline: 'Tiles, grout, commode and drain cleaning.', rating: 4.90, reviewsCount: 310, badge: 'Hygienic', addons: [] },
    { id: 'srv-clean-kitchen', name: 'Kitchen Deep Cleaning', category: 'Cleaning', subcategory: 'Cleaning', basePrice: 699, icon: 'fa-utensils', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80', tagline: 'Chimney, burner, sink and countertop deep clean.', rating: 4.92, reviewsCount: 400, badge: 'Degreaser Pro', addons: [] },
    { id: 'srv-clean-sofa', name: 'Sofa Cleaning', category: 'Cleaning', subcategory: 'Cleaning', basePrice: 499, icon: 'fa-couch', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80', tagline: 'Foam shampoo and stain removal for sofas.', rating: 4.88, reviewsCount: 220, badge: 'Fabric Care', addons: [] },
    { id: 'srv-clean-carpet', name: 'Carpet Cleaning', category: 'Cleaning', subcategory: 'Cleaning', basePrice: 599, icon: 'fa-rug', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80', tagline: 'Professional carpet steam and shampoo cleaning.', rating: 4.86, reviewsCount: 195, badge: 'Deep Clean', addons: [] },
    { id: 'srv-clean-tank', name: 'Water Tank Cleaning', category: 'Cleaning', subcategory: 'Cleaning', basePrice: 599, icon: 'fa-water', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80', tagline: 'Sanitize overhead and underground tanks.', rating: 4.91, reviewsCount: 200, badge: 'Health Shield', addons: [] },
    { id: 'srv-clean-move', name: 'Move-in / Move-out Cleaning', category: 'Cleaning', subcategory: 'Cleaning', basePrice: 1499, icon: 'fa-truck-moving', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80', tagline: 'Full apartment cleaning for new or vacated homes.', rating: 4.93, reviewsCount: 280, badge: 'Relocation Pro', addons: [] },

    // ── PAINTING SUBCATEGORIES ────────────────────────────────────────────
    { id: 'srv-paint-full', name: 'Full Home Painting', category: 'Painting', subcategory: 'Painting', basePrice: 2999, icon: 'fa-paint-roller', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80', tagline: 'Complete interior/exterior home painting.', rating: 4.88, reviewsCount: 160, badge: 'Premium Finish', addons: [] },
    { id: 'srv-paint-wall', name: 'Wall Painting', category: 'Painting', subcategory: 'Painting', basePrice: 999, icon: 'fa-paintbrush', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80', tagline: 'Single or multiple wall emulsion painting.', rating: 4.85, reviewsCount: 140, badge: 'Popular', addons: [] },
    { id: 'srv-paint-texture', name: 'Texture Painting', category: 'Painting', subcategory: 'Painting', basePrice: 1499, icon: 'fa-palette', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80', tagline: 'Designer texture and stencil wall art.', rating: 4.90, reviewsCount: 120, badge: 'Designer', addons: [] },
    { id: 'srv-paint-waterproof', name: 'Waterproofing', category: 'Painting', subcategory: 'Painting', basePrice: 1999, icon: 'fa-droplet-slash', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80', tagline: 'Terrace and bathroom waterproofing treatment.', rating: 4.87, reviewsCount: 95, badge: 'Damp Shield', addons: [] },
    { id: 'srv-paint-putty', name: 'Wall Repair and Putty', category: 'Painting', subcategory: 'Painting', basePrice: 699, icon: 'fa-trowel', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80', tagline: 'Crack fill, putty leveling and priming.', rating: 4.82, reviewsCount: 110, badge: 'Foundation Fix', addons: [] },
    { id: 'srv-paint-wood', name: 'Wood Polishing', category: 'Painting', subcategory: 'Painting', basePrice: 799, icon: 'fa-tree', image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80', tagline: 'Furniture and door wood polish and varnish.', rating: 4.84, reviewsCount: 105, badge: 'Craftsman', addons: [] },

    // ── OTHER SERVICES ────────────────────────────────────────────────────
    { id: 'srv-pest', name: 'Pest Control', category: 'Other Services', subcategory: 'Other Services', basePrice: 799, icon: 'fa-bug-slash', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80', tagline: 'Cockroach, termite and rodent treatment.', rating: 4.88, reviewsCount: 260, badge: 'Health Guard', addons: [] },
    { id: 'srv-ro', name: 'RO Water Purifier Service', category: 'Other Services', subcategory: 'Other Services', basePrice: 399, icon: 'fa-filter', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80', tagline: 'RO filter change and purifier maintenance.', rating: 4.85, reviewsCount: 180, badge: 'Pure Water', addons: [] },
    { id: 'srv-cctv', name: 'CCTV Installation', category: 'Other Services', subcategory: 'Other Services', basePrice: 1499, icon: 'fa-video', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80', tagline: 'Home and office CCTV camera setup.', rating: 4.86, reviewsCount: 135, badge: 'Security Pro', addons: [] },
    { id: 'srv-wifi', name: 'Internet and Wi-Fi Setup', category: 'Other Services', subcategory: 'Other Services', basePrice: 499, icon: 'fa-wifi', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80', tagline: 'Router setup, range extenders and troubleshoot.', rating: 4.82, reviewsCount: 155, badge: 'Tech Expert', addons: [] },
    { id: 'srv-shift', name: 'Home Shifting Assistance', category: 'Other Services', subcategory: 'Other Services', basePrice: 1999, icon: 'fa-truck-moving', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80', tagline: 'Packing, moving and unpacking assistance.', rating: 4.80, reviewsCount: 98, badge: 'Reliable', addons: [] },
    { id: 'srv-handyman', name: 'General Handyman Services', category: 'Other Services', subcategory: 'Other Services', basePrice: 299, icon: 'fa-wrench', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80', tagline: 'Miscellaneous small repairs and fixes.', rating: 4.78, reviewsCount: 200, badge: 'All-Rounder', addons: [] }
  ];

  // Seeded verified service providers with 15-day recurring KYC verification dates
  const now = Date.now();
  const dayMs = 86400000;

  const SEED_PROVIDERS = [
    {
      id: 'pro-101',
      username: 'rajesh_sharma',
      passwordHash: 'rajesh123',
      name: 'Rajesh Sharma',
      email: 'rajesh.sharma@fixup.in',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80',
      serviceCategory: 'Electrical',
      secondaryCategory: 'Appliance Repair',
      experienceYears: 8,
      rating: 4.94,
      reviewsCount: 240,
      completedJobs: 412,
      pendingJobs: 2,
      assignedJobs: 1,
      feedbackPoints: 980,
      status: 'online', // 'online' or 'offline'
      kycStatus: 'verified', // 'verified', 'pending_admin_approval', 'rejected'
      lastKycDate: new Date(now - 3 * dayMs).toISOString(),
      nextKycDate: new Date(now + 12 * dayMs).toISOString(), // 12 days left in 15-day cycle
      earnings: {
        total: 184500,
        last7Days: 8650,
        last30Days: 34200,
        last6Months: 172000,
        today: 1850
      },
      payoutDetails: {
        upiId: 'rajesh.sharma@okaxis',
        bankAccount: 'HDFC0001234 - ****4412'
      },
      loyalCustomers: [
        { name: 'Priya Verma', bookingsCount: 6, totalSpent: 4280, lastDate: '2026-11-14' },
        { name: 'Aman Mehra', bookingsCount: 4, totalSpent: 3100, lastDate: '2026-11-02' },
        { name: 'Dr. Sameer Kapoor', bookingsCount: 3, totalSpent: 2850, lastDate: '2026-10-28' },
        { name: 'Kavita Sengupta', bookingsCount: 3, totalSpent: 2490, lastDate: '2026-10-15' },
        { name: 'Vikrant Roy', bookingsCount: 2, totalSpent: 1800, lastDate: '2026-09-30' }
      ]
    },
    {
      id: 'pro-102',
      username: 'vikram_plumb',
      passwordHash: 'vikram123',
      name: 'Vikram Chawla',
      email: 'vikram.chawla@fixup.in',
      phone: '+91 98123 45678',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      serviceCategory: 'Plumbing',
      experienceYears: 6,
      rating: 4.88,
      reviewsCount: 185,
      completedJobs: 334,
      pendingJobs: 1,
      assignedJobs: 1,
      feedbackPoints: 890,
      status: 'online',
      kycStatus: 'verified',
      lastKycDate: new Date(now - 7 * dayMs).toISOString(),
      nextKycDate: new Date(now + 8 * dayMs).toISOString(), // 8 days left
      earnings: {
        total: 142000,
        last7Days: 6800,
        last30Days: 29500,
        last6Months: 138000,
        today: 1420
      },
      payoutDetails: { upiId: 'vikram.plumbing@ybl' },
      loyalCustomers: [
        { name: 'Aman Mehra', bookingsCount: 5, totalSpent: 3800, lastDate: '2026-11-10' },
        { name: 'Suman Joshi', bookingsCount: 3, totalSpent: 2400, lastDate: '2026-10-25' }
      ]
    },
    {
      id: 'pro-103',
      username: 'sunita_cleaning',
      passwordHash: 'sunita123',
      name: 'Sunita Devi',
      email: 'sunita.devi@fixup.in',
      phone: '+91 99988 77665',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      serviceCategory: 'Cleaning',
      experienceYears: 7,
      rating: 4.96,
      reviewsCount: 310,
      completedJobs: 560,
      pendingJobs: 0,
      assignedJobs: 0,
      feedbackPoints: 1150,
      status: 'online',
      kycStatus: 'verified',
      lastKycDate: new Date(now - 14 * dayMs).toISOString(),
      nextKycDate: new Date(now + 1 * dayMs).toISOString(), // 1 day left — KYC verification due soon!
      earnings: {
        total: 215000,
        last7Days: 9200,
        last30Days: 39800,
        last6Months: 205000,
        today: 2300
      },
      payoutDetails: { upiId: 'sunita.cleaning@paytm' },
      loyalCustomers: [
        { name: 'Kavita Sengupta', bookingsCount: 8, totalSpent: 7400, lastDate: '2026-11-15' },
        { name: 'Mrs. Neha Bansal', bookingsCount: 4, totalSpent: 3600, lastDate: '2026-10-20' }
      ]
    },
    {
      id: 'pro-104',
      username: 'farooq_carpenter',
      passwordHash: 'farooq123',
      name: 'Mohammad Farooq',
      email: 'm.farooq@fixup.in',
      phone: '+91 98222 33445',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
      serviceCategory: 'Carpentry',
      experienceYears: 10,
      rating: 4.91,
      reviewsCount: 145,
      completedJobs: 388,
      pendingJobs: 1,
      assignedJobs: 0,
      feedbackPoints: 920,
      status: 'online',
      kycStatus: 'pending_admin_approval', // Pending verification
      lastKycDate: new Date(now - 1 * dayMs).toISOString(),
      nextKycDate: new Date(now + 14 * dayMs).toISOString(),
      earnings: { total: 98000, last7Days: 0, last30Days: 14000, last6Months: 92000, today: 0 },
      payoutDetails: { upiId: 'farooq.craft@okaxis' },
      loyalCustomers: []
    }
  ];

  // Seeded customer accounts
  const SEED_CUSTOMERS = [
    {
      id: 'cust-201',
      username: 'priya_verma',
      passwordHash: 'priya123',
      name: 'Priya Verma',
      email: 'priya.verma@gmail.com',
      phone: '+91 98111 22334',
      dob: '1993-06-15',
      address: 'Flat 402, Lotus Boulevard, Sector 100',
      city: 'Noida',
      pincode: '201304',
      isVerified: true
    },
    {
      id: 'cust-202',
      username: 'aman_mehra',
      passwordHash: 'aman123',
      name: 'Aman Mehra',
      email: 'aman.mehra@gmail.com',
      phone: '+91 98777 66554',
      dob: '1990-11-22',
      address: 'House 14B, Indirapuram',
      city: 'Ghaziabad',
      pincode: '201014',
      isVerified: true
    }
  ];

  // Seeded bookings with visual 5-step status
  const SEED_BOOKINGS = [
    {
      id: 'FX-9101',
      customerId: 'cust-201',
      customerName: 'Priya Verma',
      customerPhone: '+91 98111 22334',
      customerAddress: 'Flat 402, Lotus Boulevard, Sector 100, Noida',
      serviceId: 'srv-elec',
      serviceName: 'Electrical Repair & Wiring',
      category: 'Electrical',
      problemDescription: 'Main MCB switch trips whenever heavy kitchen appliances turn on.',
      date: '2026-11-19',
      timeSlot: '10:00 AM - 12:00 PM',
      isNight: false,
      isEmergency: true,
      statusStep: 4, // 1: Placed, 2: Assigned, 3: Accepted, 4: In Progress, 5: Completed
      status: 'in_progress', // 'pending', 'assigned', 'accepted', 'in_progress', 'completed'
      providerId: 'pro-101',
      providerName: 'Rajesh Sharma',
      basePrice: 449,
      nightCharge: 0,
      emergencyCharge: 350,
      addons: [{ name: 'Main Distribution MCB Box Replacement', price: 299 }],
      taxAndPlatform: 55,
      totalAmount: 1153,
      createdAt: new Date(now - 7200000).toISOString()
    },
    {
      id: 'FX-9102',
      customerId: 'cust-202',
      customerName: 'Aman Mehra',
      customerPhone: '+91 98777 66554',
      customerAddress: 'House 14B, Indirapuram, Ghaziabad',
      serviceId: 'srv-plumb',
      serviceName: 'Plumbing & Water System Repair',
      category: 'Plumbing',
      problemDescription: 'Severe kitchen pipeline backflow and drainage choke.',
      date: '2026-11-19',
      timeSlot: '09:00 PM - 11:00 PM',
      isNight: true,
      isEmergency: false,
      statusStep: 2,
      status: 'assigned',
      providerId: 'pro-102',
      providerName: 'Vikram Chawla',
      basePrice: 399,
      nightCharge: 100,
      emergencyCharge: 0,
      addons: [{ name: 'Severe Drain Blockage Snaking', price: 299 }],
      taxAndPlatform: 40,
      totalAmount: 838,
      createdAt: new Date(now - 14400000).toISOString()
    },
    {
      id: 'FX-9103',
      customerId: 'cust-201',
      customerName: 'Priya Verma',
      customerPhone: '+91 98111 22334',
      customerAddress: 'Flat 402, Lotus Boulevard, Sector 100, Noida',
      serviceId: 'srv-clean',
      serviceName: 'Deep Home & Kitchen Cleaning',
      category: 'Cleaning',
      problemDescription: 'Full apartment festive sanitization.',
      date: '2026-11-15',
      timeSlot: '09:00 AM - 01:00 PM',
      isNight: false,
      isEmergency: false,
      statusStep: 5,
      status: 'completed',
      providerId: 'pro-103',
      providerName: 'Sunita Devi',
      basePrice: 699,
      nightCharge: 0,
      emergencyCharge: 0,
      addons: [{ name: 'Sofa & Fabric Mattress Shampooing', price: 399 }],
      taxAndPlatform: 55,
      totalAmount: 1153,
      rating: 5,
      reviewText: 'Flawless cleaning! Sunita and her assistant cleaned every tile spotlessly.',
      createdAt: new Date(now - 3 * dayMs).toISOString()
    }
  ];

  // Seeded reviews
  const SEED_REVIEWS = [
    {
      id: 'rev-1',
      authorName: 'Priya Verma',
      location: 'Noida Sector 100',
      rating: 5,
      serviceName: 'Deep Home Cleaning',
      date: '3 days ago',
      content: 'Fixup has been a lifesaver. The cleaning team came with mechanized single-disc scrubbers and left our kitchen and bathrooms spotless.'
    },
    {
      id: 'rev-2',
      authorName: 'Aman Mehra',
      location: 'Ghaziabad',
      rating: 5,
      serviceName: 'Plumbing Repair',
      date: '1 week ago',
      content: 'Transparent pricing upfront with no haggling. Vikram fixed a blocked sewer line in 45 minutes using specialized snake cameras.'
    },
    {
      id: 'rev-3',
      authorName: 'Kavita Sengupta',
      location: 'Defence Colony, New Delhi',
      rating: 5,
      serviceName: 'Electrical MCB Diagnostic',
      date: '2 weeks ago',
      content: 'The 60-minute emergency request works! Had a midnight fuse blowout and Rajesh reached in 30 minutes. Extremely polite and verified.'
    }
  ];

  class Store {
    constructor() {
      this.init();
      this.checkSessionExpiration();
    }

    init() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.data = {
          services: SEED_SERVICES,
          providers: SEED_PROVIDERS,
          customers: SEED_CUSTOMERS,
          bookings: SEED_BOOKINGS,
          reviews: SEED_REVIEWS,
          config: {
            nightStartHour: 20, // 8:00 PM
            nightEndHour: 6,    // 6:00 AM
            nightSurchargeRate: 1.25, // +25%
            emergencySurcharge: 350,  // +₹350
            platformCommissionRate: 0.15, // 15%
            kycCycleDays: 15,
            cancellationPolicy: {
              moreThan24h: 0,              // 0% charge
              h12to24: 5,                  // 5% charge
              h3to12: 10,                  // 10% charge
              lessThan3h: 20,              // 20% charge
              afterProviderTravelling: 30, // 30% charge
              emergencyFlatFee: 100        // ₹100 flat for emergency cancellations
            }
          },
          otps: {} // Store active OTPs
        };
        this.save();
      } else {
        try {
          this.data = JSON.parse(raw);

          // Migration: ensure config exists
          if (!this.data.config) this.data.config = {};

          // Migration: add cancellationPolicy if missing
          if (!this.data.config.cancellationPolicy) {
            this.data.config.cancellationPolicy = {
              moreThan24h: 0,
              h12to24: 5,
              h3to12: 10,
              lessThan3h: 20,
              afterProviderTravelling: 30,
              emergencyFlatFee: 100
            };
            this.save();
          }

          // Migration: expand services if old data only has the 6 parent entries
          if (!this.data.services || this.data.services.length < 10) {
            this.data.services = SEED_SERVICES;
            this.save();
          }
        } catch (e) {
          console.error('State parse error, re-initializing:', e);
          localStorage.removeItem(STORAGE_KEY);
          this.init();
        }
      }
    }

    save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      window.dispatchEvent(new CustomEvent('fixup-store-updated', { detail: this.data }));
    }

    // --- Session Management (72 Hours) ---
    checkSessionExpiration() {
      const session = this.getSession();
      if (session) {
        const nowTime = Date.now();
        // 72 hours = 72 * 3600 * 1000 = 259,200,000 ms
        const MAX_AGE = 72 * 3600 * 1000;
        if (nowTime - session.loginTimestamp > MAX_AGE) {
          console.warn('Session expired after 72 hours. Logging out.');
          this.clearSession();
        }
      }
    }

    getSession() {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    }

    setSession(user, role) {
      const session = {
        userId: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: role, // 'CUSTOMER' or 'SERVICE_PROVIDER'
        loginTimestamp: Date.now(),
        expiresAt: Date.now() + 72 * 3600 * 1000
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      window.dispatchEvent(new CustomEvent('fixup-auth-changed', { detail: session }));
      return session;
    }

    clearSession() {
      localStorage.removeItem(SESSION_KEY);
      window.dispatchEvent(new CustomEvent('fixup-auth-changed', { detail: null }));
    }

    // Admin Session
    getAdminSession() {
      return localStorage.getItem(ADMIN_SESSION_KEY) === 'authenticated';
    }

    setAdminSession(auth) {
      if (auth) localStorage.setItem(ADMIN_SESSION_KEY, 'authenticated');
      else localStorage.removeItem(ADMIN_SESSION_KEY);
    }

    // --- Role Guards ---
    requireRole(expectedRole, redirectUrl) {
      const session = this.getSession();
      if (!session || session.role !== expectedRole) {
        window.location.href = redirectUrl || '/frontend/pages/login.html';
        return false;
      }
      return true;
    }

    requireAdmin(redirectUrl) {
      if (!this.getAdminSession()) {
        window.location.href = redirectUrl || '/frontend/admin/login.html';
        return false;
      }
      return true;
    }

    // --- Services ---
    getServices() {
      return this.data.services || [];
    }

    getServiceById(id) {
      return (this.data.services || []).find(s => s.id === id);
    }

    // --- Providers ---
    getProviders() {
      return this.data.providers || [];
    }

    getProviderById(id) {
      return (this.data.providers || []).find(p => p.id === id);
    }

    updateProviderStatus(id, newStatus) {
      const pro = this.getProviderById(id);
      if (pro) {
        pro.status = newStatus;
        this.save();
      }
    }

    updateProviderKyc(id, kycStatus) {
      const pro = this.getProviderById(id);
      if (pro) {
        pro.kycStatus = kycStatus;
        if (kycStatus === 'verified') {
          pro.lastKycDate = new Date().toISOString();
          pro.nextKycDate = new Date(Date.now() + 15 * dayMs).toISOString(); // Reset 15 days
        }
        this.save();
      }
    }

    // --- Customer Bookings ---
    getBookings() {
      return this.data.bookings || [];
    }

    getBookingById(id) {
      return (this.data.bookings || []).find(b => b.id === id);
    }

    getBookingsForCustomer(customerId) {
      return (this.data.bookings || []).filter(b => b.customerId === customerId);
    }

    getBookingsForProvider(providerId) {
      return (this.data.bookings || []).filter(b => b.providerId === providerId);
    }

    createBooking(payload) {
      const newId = 'FX-' + Math.floor(1000 + Math.random() * 9000);
      
      // Auto-assign nearest verified online provider in category if available
      const availablePro = this.getProviders().find(
        p => p.serviceCategory.toLowerCase() === payload.category.toLowerCase() &&
             p.status === 'online' && p.kycStatus === 'verified'
      );

      const booking = {
        id: newId,
        createdAt: new Date().toISOString(),
        statusStep: availablePro ? 2 : 1, // 1: Placed, 2: Assigned
        status: availablePro ? 'assigned' : 'pending',
        providerId: availablePro ? availablePro.id : null,
        providerName: availablePro ? availablePro.name : 'Matching Verified Pro...',
        ...payload
      };

      this.data.bookings.unshift(booking);
      this.save();
      return booking;
    }

    updateBookingStatus(bookingId, newStatus, stepNumber) {
      const b = this.getBookingById(bookingId);
      if (b) {
        b.status = newStatus;
        if (stepNumber) b.statusStep = stepNumber;
        
        // If completed, credit earnings to provider
        if (newStatus === 'completed' && b.providerId) {
          const pro = this.getProviderById(b.providerId);
          if (pro) {
            pro.completedJobs = (pro.completedJobs || 0) + 1;
            const proShare = Math.round(b.totalAmount * 0.85); // 85% pro split
            pro.earnings.total += proShare;
            pro.earnings.last7Days += proShare;
            pro.earnings.last30Days += proShare;
            pro.earnings.today += proShare;
          }
        }

        this.save();
        return b;
      }
      return null;
    }

    // --- Dynamic Pricing Engine ---
    calculatePrice({ serviceId, addons = [], timeString = '', isEmergency = false }) {
      const srv = this.getServiceById(serviceId);
      const base = srv ? srv.basePrice : 399;

      let addonsTotal = 0;
      addons.forEach(a => { addonsTotal += (Number(a.price) || 0); });

      // Check Night Surcharge (between 20:00 & 06:00)
      let isNight = false;
      if (timeString) {
        // e.g. "21:00" or "09:00 PM"
        const upper = timeString.toUpperCase();
        if (upper.includes('PM')) {
          const hr = parseInt(upper);
          if (hr >= 8 && hr !== 12) isNight = true; // 8 PM - 11 PM
        } else if (upper.includes('AM')) {
          const hr = parseInt(upper);
          if (hr < 6 || hr === 12) isNight = true; // 12 AM - 6 AM
        }
      } else {
        const currHour = new Date().getHours();
        if (currHour >= 20 || currHour < 6) isNight = true;
      }

      const nightCharge = isNight ? Math.round(base * 0.25) : 0;
      const emergencyCharge = isEmergency ? 350 : 0;
      const subtotal = base + addonsTotal + nightCharge + emergencyCharge;
      const taxAndPlatform = Math.round(subtotal * 0.05); // 5% GST and Trust Guarantee
      const total = subtotal + taxAndPlatform;

      return {
        base,
        addonsTotal,
        isNight,
        nightCharge,
        isEmergency,
        emergencyCharge,
        subtotal,
        taxAndPlatform,
        total
      };
    }

    // --- OTP Verification Engine ---
    generateOtp(email) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      this.data.otps[email] = {
        code,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
        attempts: 0
      };
      this.save();
      console.log(`[FIXUP OTP ENGINE] 📧 Verification OTP for ${email}: ${code}`);
      return code;
    }

    verifyOtp(email, enteredCode) {
      const record = this.data.otps[email];
      if (!record) return { success: false, message: 'OTP not requested or expired.' };
      if (Date.now() > record.expiresAt) return { success: false, message: 'OTP has expired. Please request a new one.' };
      if (record.attempts >= 3) return { success: false, message: 'Maximum verification attempts exceeded.' };

      record.attempts++;
      if (record.code === enteredCode.trim()) {
        delete this.data.otps[email];
        this.save();
        return { success: true, message: 'Email successfully verified!' };
      }
      return { success: false, message: 'Invalid OTP code. Please check and re-enter.' };
    }

    // --- 15-Day Recurring KYC Countdown ---
    getKycRemainingTime(nextKycDateString) {
      if (!nextKycDateString) return { days: 15, hours: 0, minutes: 0, seconds: 0, isDue: false };
      const diff = new Date(nextKycDateString).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isDue: true };

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      return { days, hours, minutes, seconds, isDue: false };
    }

    // --- Cancellation Engine ---
    calculateCancellationFee(bookingId) {
      const booking = this.getBookingById(bookingId);
      if (!booking) return null;
      const policy = this.data.config.cancellationPolicy || { moreThan24h: 0, h12to24: 5, h3to12: 10, lessThan3h: 20, afterProviderTravelling: 30 };

      // Calculate hours until booking
      const bookingDateTime = new Date(booking.date + 'T' + (booking.timeSlot.split(' - ')[0] || '09:00'));
      const hoursUntil = (bookingDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

      let pct = 0;
      let tier = '';
      if (booking.status === 'in_progress' || booking.status === 'completed') {
        return { eligible: false, reason: 'Service is already in progress or completed.' };
      }
      if (booking.status === 'cancelled') {
        return { eligible: false, reason: 'Already cancelled.' };
      }
      if (hoursUntil > 24) { pct = policy.moreThan24h; tier = 'More than 24 hours before'; }
      else if (hoursUntil > 12) { pct = policy.h12to24; tier = '12\u201324 hours before'; }
      else if (hoursUntil > 3) { pct = policy.h3to12; tier = '3\u201312 hours before'; }
      else if (hoursUntil >= 0) { pct = policy.lessThan3h; tier = 'Less than 3 hours before'; }
      else { pct = policy.afterProviderTravelling; tier = 'After scheduled time \u2014 provider may be en route'; }

      const amount = booking.totalAmount || 0;
      const charge = parseFloat(((amount * pct) / 100).toFixed(2));
      const refund = parseFloat((amount - charge).toFixed(2));
      return { eligible: true, tier, percentage: pct, bookingAmount: amount, charge, refund };
    }

    cancelBooking(bookingId, { reason, comments = '', cancelledBy = 'CUSTOMER' }) {
      const booking = this.getBookingById(bookingId);
      if (!booking) return { success: false, message: 'Booking not found.' };
      if (['completed', 'cancelled'].includes(booking.status)) {
        return { success: false, message: 'This booking cannot be cancelled.' };
      }

      const feeCalc = this.calculateCancellationFee(bookingId);
      if (!feeCalc || !feeCalc.eligible) {
        return { success: false, message: feeCalc ? feeCalc.reason : 'Cannot calculate fee.' };
      }

      booking.status = 'cancelled';
      booking.statusStep = 0;
      booking.cancellationDetails = {
        reason,
        comments,
        cancelledBy,
        timestamp: new Date().toISOString(),
        tier: feeCalc.tier,
        percentage: feeCalc.percentage,
        feeCharged: feeCalc.charge,
        refundAmount: feeCalc.refund
      };

      this.save();
      return { success: true, booking, feeCalc };
    }

    getCancelledBookings() {
      return (this.data.bookings || []).filter(b => b.status === 'cancelled');
    }

    updateCancellationPolicy(policy) {
      this.data.config.cancellationPolicy = { ...this.data.config.cancellationPolicy, ...policy };
      this.save();
    }
  }

  window.FixupStore = new Store();
})();
