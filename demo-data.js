// demo-data.js — Realistic Mumbai & Delhi property listings (inspired by real market data)
// Automatically seeds the property grid on properties.html and map.html

const DEMO_LISTINGS = [
  {
    id: 201, title: "Sea-View 3BHK in Worli",
    address: "Sea Breeze Tower, Worli Sea Face, Mumbai",
    location: "Mumbai", type: "Apartment", beds: 3, baths: 3, price: 8.5, intent: "Buy",
    sqft: 1850, date: "2025-05-10", badge: "New Launch", badgeColor: "bg-blue-500",
    img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop",
    coords: [19.0203, 72.8131]
  },
  {
    id: 202, title: "Luxury 4BHK Penthouse – Bandra West",
    address: "Pinnacle Residences, Carter Road, Bandra West, Mumbai",
    location: "Mumbai", type: "Penthouse", beds: 4, baths: 4, price: 22.0, intent: "Buy",
    sqft: 3600, date: "2025-05-02", badge: "Premium", badgeColor: "bg-amber-500",
    img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
    coords: [19.0596, 72.8295]
  },
  {
    id: 203, title: "2BHK Ready Possession – Andheri East",
    address: "Evergreen CHS, J.B. Nagar, Andheri East, Mumbai",
    location: "Mumbai", type: "Apartment", beds: 2, baths: 2, price: 1.85, intent: "Buy",
    sqft: 780, date: "2025-04-28", badge: "Ready to Move", badgeColor: "bg-green-500",
    img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop",
    coords: [19.1136, 72.8697]
  },
  {
    id: 204, title: "Spacious 3BHK – Powai Lake View",
    address: "Hiranandani Gardens, Powai, Mumbai",
    location: "Mumbai", type: "Apartment", beds: 3, baths: 2, price: 4.2, intent: "Buy",
    sqft: 1420, date: "2025-05-07", badge: "Newly Added", badgeColor: "bg-white text-slate-900",
    img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop",
    coords: [19.1176, 72.9060]
  },
  {
    id: 205, title: "1BHK Starter Home – Ghatkopar",
    address: "Sai Complex, LBS Marg, Ghatkopar West, Mumbai",
    location: "Mumbai", type: "Apartment", beds: 1, baths: 1, price: 0.92, intent: "Buy",
    sqft: 460, date: "2025-04-20", badge: "Best Value", badgeColor: "bg-emerald-500",
    img: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800&auto=format&fit=crop",
    coords: [19.0860, 72.9090]
  },
  {
    id: 206, title: "Duplex Villa – Juhu",
    address: "Palm Grove Estate, Juhu Tara Road, Mumbai",
    location: "Mumbai", type: "Villa", beds: 5, baths: 5, price: 38.0, intent: "Buy",
    sqft: 5200, date: "2025-03-15", badge: "Exclusive", badgeColor: "bg-purple-600",
    img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop",
    coords: [19.1026, 72.8270]
  },
  {
    id: 207, title: "Commercial Office – BKC",
    address: "G-Block, Bandra Kurla Complex, Mumbai",
    location: "Mumbai", type: "Office", beds: 0, baths: 2, price: 14.5, intent: "Buy",
    sqft: 3200, date: "2025-05-01", badge: "Commercial", badgeColor: "bg-slate-900",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop",
    coords: [19.0607, 72.8637]
  },
  {
    id: 208, title: "2BHK – Thane West Township",
    address: "Lodha Palava, Dombivli-Palava Link Rd, Thane",
    location: "Mumbai", type: "Apartment", beds: 2, baths: 2, price: 1.1, intent: "Buy",
    sqft: 820, date: "2025-04-10", badge: "Under Construction", badgeColor: "bg-orange-500",
    img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop",
    coords: [19.2183, 72.9781]
  },
  {
    id: 209, title: "Vasant Vihar Bungalow",
    address: "7, Vasant Vihar Colony, New Delhi",
    location: "Delhi", type: "Villa", beds: 6, baths: 6, price: 52.0, intent: "Buy",
    sqft: 8000, date: "2025-05-05", badge: "Exclusive", badgeColor: "bg-purple-600",
    img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop",
    coords: [28.5606, 77.1611]
  },
  {
    id: 210, title: "3BHK – South Delhi, Greater Kailash",
    address: "M-Block Market Lane, Greater Kailash II, Delhi",
    location: "Delhi", type: "Apartment", beds: 3, baths: 3, price: 6.75, intent: "Buy",
    sqft: 1950, date: "2025-04-25", badge: "Ready to Move", badgeColor: "bg-green-500",
    img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop",
    coords: [28.5355, 77.2393]
  },
  {
    id: 301, title: "Modern 2BHK Rental – Cuffe Parade",
    address: "Sea View Towers, Cuffe Parade, Mumbai",
    location: "Mumbai", type: "Apartment", beds: 2, baths: 2, price: 0.024, intent: "Rent",
    sqft: 1100, date: "2025-05-12", badge: "Available Now", badgeColor: "bg-blue-500",
    img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop",
    coords: [18.9152, 72.8131]
  },
  {
    id: 302, title: "Cozy 1BHK – Colaba",
    address: "Garden View Lane, Colaba, Mumbai",
    location: "Mumbai", type: "Apartment", beds: 1, baths: 1, price: 0.008, intent: "Rent",
    sqft: 550, date: "2025-05-11", badge: "Hot Deal", badgeColor: "bg-orange-500",
    img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop",
    coords: [18.9067, 72.8147]
  },
  {
    id: 303, title: "3BHK Furnished – Malabar Hill",
    address: "Ridge Road, Malabar Hill, Mumbai",
    location: "Mumbai", type: "Apartment", beds: 3, baths: 3, price: 0.045, intent: "Rent",
    sqft: 1800, date: "2025-05-09", badge: "Fully Furnished", badgeColor: "bg-green-500",
    img: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&auto=format&fit=crop",
    coords: [18.9548, 72.7985]
  },
  {
    id: 304, title: "Studio Apartment – Hauz Khas",
    address: "Village Market, Hauz Khas, New Delhi",
    location: "Delhi", type: "Studio", beds: 1, baths: 1, price: 0.005, intent: "Rent",
    sqft: 400, date: "2025-05-08", badge: "Student Friendly", badgeColor: "bg-blue-500",
    img: "https://images.unsplash.com/photo-1536376074432-bf121770b440?w=800&auto=format&fit=crop",
    coords: [28.5494, 77.2001]
  },
  {
    id: 305, title: "4BHK Independent Floor – Defence Colony",
    address: "Block A, Defence Colony, New Delhi",
    location: "Delhi", type: "Apartment", beds: 4, baths: 4, price: 0.035, intent: "Rent",
    sqft: 3200, date: "2025-05-07", badge: "Premium Location", badgeColor: "bg-amber-500",
    img: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800&auto=format&fit=crop",
    coords: [28.5727, 77.2345]
  }
];

// Utility: format price in Cr / L / Lac
function formatPrice(crore, intent = "Buy") {
  if (intent === "Rent") {
    const lac = crore * 100;
    if (lac >= 1) return `₹${lac.toFixed(lac % 1 === 0 ? 0 : 1)} Lac<span class="text-[10px] font-normal text-slate-400">/mo</span>`;
    return `₹${(lac * 100000).toLocaleString('en-IN')}<span class="text-[10px] font-normal text-slate-400">/mo</span>`;
  }
  if (crore >= 1) return `₹${crore.toFixed(crore % 1 === 0 ? 0 : 1)} Cr`;
  return `₹${(crore * 100).toFixed(0)} L`;
}

// Build a card HTML string from a listing object
function buildCardHTML(l) {
  return `
    <div class="group cursor-pointer property-card bg-white rounded-3xl border border-slate-200 hover:shadow-xl overflow-hidden transition-all duration-300"
         data-id="${l.id}" data-title="${l.title}" data-location="${l.location}"
         data-type="${l.type}" data-beds="${l.beds}" data-baths="${l.baths}"
         data-price="${l.price}" data-date="${l.date}" data-intent="${l.intent}"
         onclick="window.location.href='/property-details.html?id=${l.id}'">
      <div class="aspect-[16/9] overflow-hidden relative bg-slate-100">
        <img loading="lazy" src="${l.img}"
             class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
             onerror="this.src='https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop'">
        <div class="absolute top-4 left-4 ${l.badgeColor} ${l.badgeColor.includes('bg-white') ? '' : 'text-white'} px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
          ${l.badge}
        </div>
        <div class="absolute top-4 right-[92px] bg-slate-900/80 backdrop-blur text-white px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider">
          For ${l.intent}
        </div>
        <button aria-label="Save Property" class="save-property-btn absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur rounded-full shadow text-slate-400 hover:text-red-500 transition-colors">
          <span class="material-symbols-outlined text-[20px]">favorite</span>
        </button>
        <button aria-label="Share Property" class="share-property-btn absolute top-4 right-[52px] w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur rounded-full shadow text-slate-400 hover:text-blue-500 transition-colors z-10" onclick="event.stopPropagation(); navigator.clipboard.writeText(window.location.origin+'/property-details.html?id=${l.id}').then(()=>{ const t=document.createElement('div'); t.className='fixed bottom-6 right-6 z-[200] bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm'; t.textContent='Link copied!'; document.body.appendChild(t); setTimeout(()=>t.remove(),2000); })">
          <span class="material-symbols-outlined text-[20px]">share</span>
        </button>
      </div>
      <div class="p-5">
        <div class="flex justify-between items-start mb-1">
          <h3 class="text-xl font-black text-slate-900">${formatPrice(l.price, l.intent)}</h3>
          <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-md">${l.type}</span>
        </div>
        <p class="text-slate-500 text-sm font-medium mb-4 truncate">${l.address}</p>
        <div class="flex flex-wrap items-center gap-y-2 gap-x-4 text-slate-400">
          ${l.beds > 0 ? `<div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[18px]">bed</span><span class="text-xs font-black text-slate-900">${l.beds}</span></div>` : ''}
          ${l.baths > 0 ? `<div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[18px]">bathtub</span><span class="text-xs font-black text-slate-900">${l.baths}</span></div>` : ''}
          <div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[18px]">square_foot</span><span class="text-xs font-black text-slate-900">${l.sqft.toLocaleString()} <span class="font-normal text-slate-400">sqft</span></span></div>
        </div>
      </div>
    </div>
  `;
}

// Inject into the property grid
function seedPropertyGrid() {
  const grid = document.getElementById('property-grid');
  if (!grid) return;

  // Clear existing static cards first
  grid.innerHTML = '';

  // Filter based on page if needed
  const urlParams = new URLSearchParams(window.location.search);
  const intentFilter = urlParams.get('intent');

  const filtered = intentFilter 
    ? DEMO_LISTINGS.filter(l => l.intent.toLowerCase() === intentFilter.toLowerCase())
    : DEMO_LISTINGS;

  // Render all demo listings
  filtered.forEach(l => {
    grid.insertAdjacentHTML('beforeend', buildCardHTML(l));
  });

  // Update count text
  const countText = document.getElementById('listings-count-text');
  if (countText) {
    countText.textContent = `Discover ${filtered.length} exceptional listings in Mumbai & Delhi`;
  }
}

// Export for use in other scripts
window.DEMO_LISTINGS = DEMO_LISTINGS;
window.buildCardHTML = buildCardHTML;
window.formatPrice = formatPrice;
window.seedPropertyGrid = seedPropertyGrid;

// Auto-seed on DOM ready
document.addEventListener('DOMContentLoaded', seedPropertyGrid);

