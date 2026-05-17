const fs = require('fs');

let content = fs.readFileSync('properties.html', 'utf8');

// Replace Navbar completely
const navbarOld = `<nav class="fixed top-0 w-full z-50 bg-slate-50 border-b border-slate-200 h-16 flex items-center">
    <div class="max-w-[1280px] mx-auto px-6 w-full flex items-center justify-between">
      <a href="/index.html" class="text-xl font-black tracking-tighter text-on-background">EstatePro</a>
      <div class="hidden md:flex items-center gap-8">
        <a href="/properties.html" class="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Buy</a>
        <a href="/map.html" class="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Rent</a>
        <a href="/sell.html" class="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Sell</a>
      </div>
      <div class="flex items-center gap-4">
        <button class="text-on-surface-variant hover:text-primary transition-colors">
          <span class="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </div>
  </nav>`;

const navbarNew = `<nav class="fixed top-0 w-full z-50 bg-white border-b border-slate-200 shadow-sm h-16 shrink-0 flex items-center">
    <div class="max-w-[1280px] mx-auto px-6 w-full flex items-center justify-between gap-8">
      <!-- Brand -->
      <div class="flex items-center gap-2">
        <a href="/index.html" class="text-xl font-black tracking-tighter text-slate-900">ProjectX</a>
      </div>
      <!-- Small Search in Nav -->
      <div class="hidden md:flex flex-1 max-w-xs items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-2">
        <span class="material-symbols-outlined text-slate-400 mr-2 text-[18px]">search</span>
        <input class="bg-transparent border-none focus:ring-0 text-xs w-full placeholder-slate-400 text-slate-700 outline-none" placeholder="Search..." type="text" />
      </div>
      <!-- Navigation Links -->
      <div class="hidden md:flex items-center gap-8">
        <a class="text-[13px] font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest border-b-2 border-slate-900 pb-1" href="/properties.html">Buy</a>
        <a class="text-[13px] font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest pb-1" href="/map.html">Rent</a>
        <a class="text-[13px] font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest pb-1" href="/sell.html">Sell</a>
      </div>
      <!-- Trailing Actions -->
      <div class="flex items-center gap-4">
        <button class="hidden lg:flex text-slate-400 hover:text-slate-900 transition-colors">
          <span class="material-symbols-outlined text-[20px]">notifications</span>
        </button>
        <button class="text-slate-400 hover:text-slate-900 transition-colors">
          <span class="material-symbols-outlined text-[20px]">language</span>
        </button>
        <button class="bg-slate-900 text-white px-5 py-2 rounded font-bold text-xs hover:bg-slate-800 transition-colors uppercase tracking-wider ml-2">
          Dashboard
        </button>
      </div>
    </div>
  </nav>`;

content = content.replace(navbarOld, navbarNew);

// Replace Title
content = content.replace('<title>EstatePro - Premium Listings</title>', '<title>ProjectX - Buy</title>');

// Replace Body class
content = content.replace('<body class="estate-admin-theme bg-background text-on-background font-[\'Inter\'] antialiased min-h-screen flex flex-col">', '<body class="bg-[#f8f9fa] text-slate-900 font-[\'Inter\'] antialiased min-h-screen flex flex-col">');

// Global Replacements for design tokens
const tokenMap = {
  'bg-surface-container-low': 'bg-white',
  'bg-surface-container-lowest': 'bg-slate-50',
  'bg-surface-container': 'bg-white',
  'border-outline-variant': 'border-slate-200',
  'text-on-surface-variant': 'text-slate-500',
  'text-on-surface': 'text-slate-900',
  'text-on-background': 'text-slate-900',
  'text-primary': 'text-slate-900',
  'bg-primary': 'bg-slate-900',
  'text-on-primary': 'text-white',
  'focus:ring-primary-fixed': 'focus:ring-slate-900',
  'hover:border-primary': 'hover:border-slate-900',
  'hover:text-primary': 'hover:text-slate-900'
};

for (const [oldToken, newToken] of Object.entries(tokenMap)) {
  content = content.split(oldToken).join(newToken);
}

// Fix Property Cards to match Map style
// We'll just replace the cards HTML block since it's hard to regex properly
const newCards = `
          <div id="property-grid" class="grid grid-cols-0.5 md:grid-cols-2 gap-10">
            <!-- Listing 1 -->
            <div class="group cursor-pointer property-card bg-white rounded-3xl border border-slate-200 hover:shadow-xl overflow-hidden transition-all duration-300" data-id="101" data-title="Marine Drive Penthouse" data-location="Mumbai" data-type="Penthouse" data-beds="4" data-baths="3.5" data-price="28.5" data-date="2025-05-01">
              <div class="aspect-[16/9] overflow-hidden relative bg-slate-100">
                <img loading="lazy" src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                <div class="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">Newly Added</div>
                <button aria-label="Save Property" class="save-property-btn absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur rounded-full shadow text-slate-400 hover:text-error transition-colors">
                  <span class="material-symbols-outlined text-[20px]">favorite</span>
                </button>
              </div>
              <div class="p-5">
                <div class="flex justify-between items-start mb-1">
                  <h3 class="text-xl font-black text-slate-900">₹28.5 Cr</h3>
                </div>
                <p class="text-slate-500 text-sm font-medium mb-4 truncate">1000 Marine Drive, Penthouse B, Mumbai</p>
                <div class="flex flex-wrap items-center gap-y-2 gap-x-4 text-slate-400">
                  <div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[18px]">bed</span><span class="text-xs font-black text-slate-900">4</span></div>
                  <div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[18px]">bathtub</span><span class="text-xs font-black text-slate-900">3.5</span></div>
                  <div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[18px]">square_foot</span><span class="text-xs font-black text-slate-900">4,200 <span class="font-normal text-slate-400">sqft</span></span></div>
                </div>
              </div>
            </div>

            <!-- Listing 2 -->
            <div class="group cursor-pointer property-card bg-white rounded-3xl border border-slate-200 hover:shadow-xl overflow-hidden transition-all duration-300" data-id="102" data-title="BKC Corporate Suite" data-location="Mumbai" data-type="Office" data-beds="0" data-baths="0" data-price="11.5" data-date="2025-04-15">
              <div class="aspect-[16/9] overflow-hidden relative bg-slate-100">
                <img loading="lazy" src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                <div class="absolute top-4 left-4 bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">Commercial</div>
                <button aria-label="Save Property" class="save-property-btn absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur rounded-full shadow text-slate-400 hover:text-error transition-colors">
                  <span class="material-symbols-outlined text-[20px]">favorite</span>
                </button>
              </div>
              <div class="p-5">
                <div class="flex justify-between items-start mb-1">
                  <h3 class="text-xl font-black text-slate-900">₹11.5 Cr</h3>
                </div>
                <p class="text-slate-500 text-sm font-medium mb-4 truncate">45 BKC Corporate Park, Suite 200, Mumbai</p>
                <div class="flex flex-wrap items-center gap-y-2 gap-x-4 text-slate-400">
                  <div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[18px]">bed</span><span class="text-xs font-black text-slate-900">0</span></div>
                  <div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[18px]">bathtub</span><span class="text-xs font-black text-slate-900">0</span></div>
                  <div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[18px]">square_foot</span><span class="text-xs font-black text-slate-900">4,500 <span class="font-normal text-slate-400">sqft</span></span></div>
                </div>
              </div>
            </div>

            <!-- Listing 3 -->
            <div class="group cursor-pointer property-card bg-white rounded-3xl border border-slate-200 hover:shadow-xl overflow-hidden transition-all duration-300" data-id="103" data-title="Vasant Vihar Mansion" data-location="Delhi" data-type="Villa" data-beds="5" data-baths="6" data-price="42.0" data-date="2025-04-20">
              <div class="aspect-[16/9] overflow-hidden relative bg-slate-100">
                <img loading="lazy" src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                <div class="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">Exclusive</div>
                <button aria-label="Save Property" class="save-property-btn absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur rounded-full shadow text-slate-400 hover:text-error transition-colors">
                  <span class="material-symbols-outlined text-[20px]">favorite</span>
                </button>
              </div>
              <div class="p-5">
                <div class="flex justify-between items-start mb-1">
                  <h3 class="text-xl font-black text-slate-900">₹42.0 Cr</h3>
                </div>
                <p class="text-slate-500 text-sm font-medium mb-4 truncate">88 Vasant Vihar Estate, New Delhi</p>
                <div class="flex flex-wrap items-center gap-y-2 gap-x-4 text-slate-400">
                  <div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[18px]">bed</span><span class="text-xs font-black text-slate-900">5</span></div>
                  <div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[18px]">bathtub</span><span class="text-xs font-black text-slate-900">6</span></div>
                  <div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[18px]">square_foot</span><span class="text-xs font-black text-slate-900">1.2 <span class="font-normal text-slate-400">Acre</span></span></div>
                </div>
              </div>
            </div>
          </div>`;

const gridStart = '<div id="property-grid" class="grid grid-cols-1 md:grid-cols-2 gap-10">';
const gridEndIndex = content.indexOf('<!-- Pagination (Static) -->');
if (gridEndIndex !== -1) {
  const gridStartIndex = content.indexOf(gridStart);
  if (gridStartIndex !== -1) {
    content = content.substring(0, gridStartIndex) + newCards + '\n          ' + content.substring(gridEndIndex);
  }
}

// Update Footer to ProjectX footer
const newFooter = `  <footer class="bg-white py-12 px-6 mt-auto">
    <div class="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8 border-t border-slate-200 pt-8">
      <div class="text-lg font-black tracking-tighter text-slate-900">ProjectX</div>
      <div class="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <a href="/index.html" class="hover:text-slate-900 transition-colors">About Us</a>
        <a href="/terms.html" class="hover:text-slate-900 transition-colors">Terms of Service</a>
        <a href="/privacy.html" class="hover:text-slate-900 transition-colors">Privacy Policy</a>
        <a href="#" class="hover:text-slate-900 transition-colors">Cookie Settings</a>
        <a href="#" class="hover:text-slate-900 transition-colors">Contact Support</a>
        <a href="#" class="hover:text-slate-900 transition-colors">Sitemap</a>
      </div>
      <div class="text-[10px] font-medium text-slate-400 text-center md:text-right uppercase tracking-wider">
        © 2026 ProjectX.<br class="md:hidden"> ALL RIGHTS RESERVED.
      </div>
    </div>
  </footer>
`;

const fStartIndex = content.indexOf('<footer');
if (fStartIndex !== -1) {
  content = content.substring(0, fStartIndex) + newFooter + '</body>\n</html>';
}

fs.writeFileSync('properties.html', content);
console.log('Fixed properties.html');
