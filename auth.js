const currentPath = window.location.pathname;
let currentPage = currentPath.split('/').pop() || 'index.html';
if (!currentPage.includes('.')) currentPage += '.html'; // Handle Vite-style paths without extensions

const appBasePath = currentPath.endsWith('/')
    ? currentPath
    : currentPath.slice(0, currentPath.lastIndexOf('/') + 1);
const userRole = localStorage.getItem('role');
let activeInquiryId = null;

function toAppUrl(page) {
    if (page.startsWith('http')) return page;
    if (page.startsWith('/')) return `${appBasePath}${page.replace(/^\/+/, '')}`;
    return `${appBasePath}${page}`;
}

window.toAppUrl = toAppUrl;

function navigateTo(page) {
    window.location.replace(toAppUrl(page));
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 right-6 z-[200] bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2200);
}

// ─── Route Maps ───────────────────────────────────────────────────────────────

const buyerPages = ['index.html', 'properties.html', 'map.html', 'property-details.html', 'sell.html'];

const roleHomePage = {
    'Admin':    'admin-panel.html',
    'Employee': 'employee-panel.html',
    'Broker':   'broker-dashboard.html',
    'Buyer':    'index.html',
    'Guest':    'index.html'
};

const roleAllowedPages = {
    'Admin':    ['admin-panel.html', 'employee-panel.html', 'broker-dashboard.html', 'properties.html', 'map.html', 'property-details.html'],
    'Employee': ['employee-panel.html', 'broker-dashboard.html', 'properties.html', 'map.html', 'property-details.html'],
    'Broker':   ['broker-dashboard.html', 'properties.html', 'map.html', 'property-details.html'],
    'Buyer':    buyerPages,
    'Guest':    buyerPages
};

// ─── Global Auth Guard (synchronous) ──────────────────────────────────────────

const isLoginPage = currentPage === 'login.html';

if (!isLoginPage) {
    if (!userRole) {
        navigateTo('login.html');
    } else {
        const allowed = roleAllowedPages[userRole];
        if (allowed && !allowed.includes(currentPage)) {
            navigateTo(roleHomePage[userRole]);
        }
    }
}

// ─── Exported functions ───────────────────────────────────────────────────────

window.login = function(role, name) {
    localStorage.setItem('role', role);
    if (name) localStorage.setItem('userName', name);
    navigateTo(roleHomePage[role] || 'index.html');
};

window.logout = function() {
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    // Keep listings in localStorage so they persist across logins unless explicitly cleared
    navigateTo('login.html');
};

// ─── DOM-ready handlers ───────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    normalizeInternalLinks();

    // ══════════════════════════════════════════════
    //  LOGIN PAGE
    // ══════════════════════════════════════════════
    if (isLoginPage) {
        const roleButtons = document.querySelectorAll('#role-tabs button');
        const roleTabsContainer = document.getElementById('role-tabs');
        const returnStandardBtn = document.getElementById('return-standard-btn');
        const formTitle = document.getElementById('form-title');
        const nameField = document.getElementById('broker-name-field');
        let selectedRole = 'Broker';

        function resetRoleTabs() {
            roleButtons.forEach(b => { b.className = 'flex-1 py-2 px-3 text-center font-label-caps text-label-caps rounded role-tab-inactive hover:text-on-surface transition-colors'; });
        }

        function selectRole(role) {
            selectedRole = role;
            if (formTitle) formTitle.textContent = selectedRole + ' Sign In';
            if (nameField) nameField.style.display = selectedRole === 'Broker' ? 'block' : 'none';
            
            resetRoleTabs();
            roleButtons.forEach(btn => {
                if (btn.textContent.trim() === role) {
                    btn.className = 'flex-1 py-2 px-3 text-center font-label-caps text-label-caps rounded role-tab-active transition-all';
                }
            });

            const isStaff = ['Admin', 'Employee'].includes(role);
            if (isStaff) {
                roleTabsContainer?.classList.add('hidden');
                roleTabsContainer?.classList.remove('flex');
                returnStandardBtn?.classList.remove('hidden');
                returnStandardBtn?.classList.add('flex');
            } else {
                roleTabsContainer?.classList.remove('hidden');
                roleTabsContainer?.classList.add('flex');
                returnStandardBtn?.classList.add('hidden');
                returnStandardBtn?.classList.remove('flex');
            }
        }

        // URL parameter support
        const urlParams = new URLSearchParams(window.location.search);
        const urlRole = urlParams.get('role');
        if (urlRole) selectRole(urlRole);

        // Role tab switching
        roleButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                selectRole(btn.textContent.trim());
            });
        });
        
        // Show name field by default since Broker is default active
        if (!urlRole && nameField) nameField.style.display = 'block';

        // Staff modal logic
        const staffBtn = document.getElementById('staff-login-btn');
        const staffModal = document.getElementById('staff-modal');
        const closeStaffModal = document.getElementById('close-staff-modal');
        const staffRoleBtns = document.querySelectorAll('.staff-role-btn');

        if (staffBtn && staffModal) {
            staffBtn.addEventListener('click', () => {
                staffModal.classList.remove('hidden');
                staffModal.classList.add('flex');
            });
        }
        
        if (closeStaffModal && staffModal) {
            closeStaffModal.addEventListener('click', () => {
                staffModal.classList.add('hidden');
                staffModal.classList.remove('flex');
            });
        }

        staffRoleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const role = btn.querySelector('span').textContent.trim();
                selectRole(role);
                staffModal.classList.add('hidden');
                staffModal.classList.remove('flex');
            });
        });

        if (returnStandardBtn) {
            returnStandardBtn.addEventListener('click', () => {
                selectRole('Broker');
            });
        }

        // Sign In button
        const signInBtn = document.getElementById('sign-in-btn');
        if (signInBtn) {
            signInBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const name = document.getElementById('input-name')?.value?.trim() || '';
                window.login(selectedRole, selectedRole === 'Broker' && name ? name : null);
            });
        }

        // "Just browsing? Enter as a Guest" button
        const guestBtn = document.getElementById('guest-btn');
        if (guestBtn) {
            guestBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.login('Guest');
            });
        }

        return; // Nothing else to do on login page
    }

    // ══════════════════════════════════════════════
    //  ALL OTHER PAGES
    // ══════════════════════════════════════════════

    // ── Find trailing actions reliably via account_circle button ──
    const accountCircleBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.querySelector('span.material-symbols-outlined')?.textContent.trim() === 'account_circle'
    );
    const trailingActions = accountCircleBtn?.parentElement || null;

    // account_circle → logout
    if (accountCircleBtn) {
        const displayRole = userRole === 'Guest' ? 'Guest' : userRole;
        accountCircleBtn.title = `Signed in as ${displayRole} — Click to sign out`;
        accountCircleBtn.onclick = (e) => { e.preventDefault(); window.logout(); };
    }

    // ── Staff Login Icon & Modal ──
    const staffLoginIcon = document.createElement('button');
    staffLoginIcon.className = 'text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-full hover:bg-slate-50';
    staffLoginIcon.title = 'Staff Portal Access';
    staffLoginIcon.innerHTML = '<span class="material-symbols-outlined text-[24px]">admin_panel_settings</span>';
    
    // Create Staff Modal
    const staffModal = document.createElement('div');
    staffModal.id = 'header-staff-modal';
    staffModal.className = 'hidden fixed inset-0 z-[200] items-center justify-center bg-black/50 backdrop-blur-sm';
    staffModal.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden border border-slate-200">
        <div class="px-6 py-6 text-center">
          <div class="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-[32px]">shield_person</span>
          </div>
          <h3 class="text-xl font-bold text-slate-900 mb-2">Staff Access</h3>
          <p class="text-sm text-slate-500 mb-6">Choose your portal to continue to secure login.</p>
          <div class="space-y-3">
            <button onclick="window.location.href=toAppUrl('login.html?role=Admin')" class="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <span class="material-symbols-outlined">security</span> Login as Admin
            </button>
            <button onclick="window.location.href=toAppUrl('login.html?role=Employee')" class="w-full border border-slate-200 text-slate-900 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
              <span class="material-symbols-outlined">badge</span> Login as Employee
            </button>
          </div>
          <button id="close-header-staff-modal" class="mt-6 text-sm text-slate-400 hover:text-slate-600 transition-colors">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(staffModal);
    
    staffLoginIcon.onclick = () => {
        staffModal.classList.remove('hidden');
        staffModal.classList.add('flex');
    };
    
    const closeBtn = staffModal.querySelector('#close-header-staff-modal');
    if (closeBtn) closeBtn.onclick = () => {
        staffModal.classList.add('hidden');
        staffModal.classList.remove('flex');
    };
    staffModal.onclick = (e) => { if (e.target === staffModal) closeBtn.click(); };

    if (trailingActions) {
        // Remove existing staff icons if any
        trailingActions.querySelector('[title="Staff Portal Access"]')?.remove();
        // Insert before account icon
        trailingActions.insertBefore(staffLoginIcon, accountCircleBtn);
    }

    // ── Hide 'Invest' and 'Agents' nav links for mass majority (Buyers/Guests) ──
    const isStaff = ['Admin', 'Employee', 'Broker'].includes(userRole);
    if (!isStaff) {
        document.querySelectorAll('nav a, header nav a').forEach(link => {
            const text = link.textContent.trim();
            if (text === 'Invest' || text === 'Agents') {
                link.style.display = 'none';
            }
        });
    }

    // ── Dashboard button: show only for staff ──
    document.querySelectorAll('button, a').forEach(btn => {
        if (btn.textContent.trim() === 'Dashboard') {
            if (!isStaff) {
                btn.style.display = 'none';
            } else {
                btn.onclick = (e) => {
                    e.preventDefault();
                    window.location.href = roleHomePage[userRole];
                };
            }
        }
    });

    // ── Logout handled via account circle click ──

    // ── Broker Dashboard: populate name + wire listings manager ──
    if (userRole === 'Broker' && currentPage === 'broker-dashboard.html') {
        const brokerName = localStorage.getItem('userName');
        if (brokerName) {
            const nameEl = document.getElementById('broker-company-name');
            if (nameEl) nameEl.textContent = brokerName;

            const greeting = document.querySelector('main header p');
            if (greeting) greeting.textContent = `Welcome back, ${brokerName}. Here is your portfolio performance.`;
        }

        // Sidebar Logout
        const sidebarLogout = document.getElementById('sidebar-logout-btn');
        if (sidebarLogout) sidebarLogout.addEventListener('click', window.logout);

        // Sidebar Add Listing
        const sidebarAddBtn = document.getElementById('sidebar-add-listing-btn');
        if (sidebarAddBtn) sidebarAddBtn.addEventListener('click', () => openListingModal(null));

        // Sidebar Navigation Interactivity
        const sidebarLinks = document.querySelectorAll('#broker-sidebar a');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Active state management
                sidebarLinks.forEach(l => {
                    l.classList.remove('bg-white', 'text-slate-900', 'shadow-sm', 'ring-1', 'ring-slate-200');
                    l.classList.add('text-slate-500', 'hover:bg-slate-100', 'hover:text-slate-900');
                });
                link.classList.add('bg-white', 'text-slate-900', 'shadow-sm', 'ring-1', 'ring-slate-200');
                link.classList.remove('text-slate-500', 'hover:bg-slate-100', 'hover:text-slate-900');

                // Section handling
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = 'tab-' + href.substring(1).replace('-section', '');
                    
                    // Hide all tabs
                    document.querySelectorAll('.tab-content').forEach(tab => {
                        tab.classList.add('hidden');
                        tab.classList.remove('block');
                    });
                    
                    // Show target tab
                    const targetEl = document.getElementById(targetId);
                    if (targetEl) {
                        targetEl.classList.remove('hidden');
                        targetEl.classList.add('block');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                }
            });
        });

        // Header Actions
        const downloadBtn = Array.from(document.querySelectorAll('header button')).find(b => 
            b.querySelector('.material-symbols-outlined')?.textContent.trim() === 'download'
        );
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                const report = {
                    generatedAt: new Date().toISOString(),
                    broker: localStorage.getItem('userName') || 'Broker',
                    listings: getListings(),
                    inquiries: getInquiries()
                };
                const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'estatepro-broker-report.json';
                a.click();
                URL.revokeObjectURL(url);
                showToast('Portfolio report downloaded.');
            });
        }

        const dateFilter = document.querySelector('header .relative button');
        if (dateFilter) {
            const ranges = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days'];
            let rangeIdx = 1;
            dateFilter.addEventListener('click', () => {
                rangeIdx = (rangeIdx + 1) % ranges.length;
                const textNodes = Array.from(dateFilter.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
                const rangeTextNode = textNodes.find(n => n.textContent.trim().length > 0);
                if (rangeTextNode) rangeTextNode.textContent = ` ${ranges[rangeIdx]} `;
                showToast(`Filter changed to ${ranges[rangeIdx]}`);
            });
        }

        // View All Buttons
        const viewAllListings = document.getElementById('view-all-listings-btn');
        if (viewAllListings) {
            viewAllListings.addEventListener('click', () => {
                document.getElementById('nav-listings')?.click();
            });
        }

        const viewAllMessages = document.getElementById('view-all-messages-btn');
        if (viewAllMessages) {
            viewAllMessages.addEventListener('click', () => {
                document.getElementById('nav-messages')?.click();
            });
        }

        const saveSettingsBtn = document.getElementById('save-settings-btn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                showToast('Settings saved successfully.');
            });
        }

        // Init managers
        initListingsManager();
        initInquiriesManager();
    }

    // ── Buyer Property Details: chat with broker ──
    if ((userRole === 'Buyer' || userRole === 'Guest') && currentPage === 'property-details.html') {
        initBuyerBrokerChat();
    }

    if (userRole === 'Buyer' || userRole === 'Guest') {
        initBuyerPageInteractions();
    }

    if (userRole === 'Admin' && currentPage === 'admin-panel.html') {
        initAdminPanelInteractions();
    }

    if (userRole === 'Employee' && currentPage === 'employee-panel.html') {
        initEmployeePanelInteractions();
    }
});

// ══════════════════════════════════════════════════════
//  BROKER LISTINGS MANAGER (localStorage-based CRUD)
// ══════════════════════════════════════════════════════

function getListings() {
    try {
        return JSON.parse(localStorage.getItem('brokerListings') || '[]');
    } catch { return []; }
}

function saveListings(listings) {
    localStorage.setItem('brokerListings', JSON.stringify(listings));
}

function initListingsManager() {
    const existing = getListings();
    if (existing.length === 0) {
        saveListings([
            { id: 1, title: '123 Luxury Lane',      location: 'Bandra West, Mumbai', status: 'Active',  price: '₹45.0 Cr', views: 12405, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtFpQYRSppJ6sqbxs8Iu94YSglHE4Q1LlZz9YaFu6_cn7m6z1b00jN5PpD5V3pXuYgIk5kmQkpnz4S8tkKYlDb0gmKN12JVv7DtRv_etOI2W5F9-V3kHJKYLJCUPBCiXuxd5j0kSxbDfkI4pHhD3oW5kxlUTZoelrGCPVRn-Ro7s8FeSUuN8X8CUUP82do2Y7QDz10DmZOUH_HP_74py6RfyCBYd5ZyAT7b_cwk4Q9jwG0P7gucpzHE12poCfoKKFeX3FcJk-H-IuT' },
            { id: 2, title: '456 Downtown Penthouse', location: 'Worli, Mumbai',       status: 'Pending', price: '₹12.5 Cr', views: 8192,  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5PH9zTdt7fBHB5wWdbe5T0WqRZXy3xFhVsGM9HKVjeZjnqowJ9Kh11c_xySKcB0_XN7C-5DIUC25R0GV6MBNzEe4cLypRdBl5pzrXpOEC4er6AQd7LUHmFBeROO0hToj1s8guJS75UAd93b8c0SgIA-CHKe27-RV0QW1fv54c1sZOieuqffxJxx3A5OngPYfxZcr523sx57MQ3ssTAgGbH3mM_KQK80bgPoLl-pZHLhYCLzUAsGCyvOsSCwpre9H0548OVDvJ9nmX' },
            { id: 3, title: '789 Suburban Retreat',  location: 'Vasant Vihar, Delhi', status: 'Active',  price: '₹8.5 Cr',  views: 3420,   img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDsIh_VGkTjkLZ8bYOomQOE0dPfDiyLuwJofgAcFlqe10PUbL4FdEASejD_hskf2MTiqvfzliArLCipWWKrKiiqaC16IL6aa2Qj-fItCrhIcV6vWksyPGXls9uWgy9_cd_em9YinsPh5msJb8bW257V9HzvSpmkgyuMpzJFhBUDjUVYa1ELzc6Y4n7Bb8pbxPT8q_JaHzwyqsHsAeK-_YiNxqh1pPWBt8ZN8bZj9lKsrcm2fx1AEebFfrV0D7VOBGKpWyCX8apt1OY' }
        ]);
    }
    renderListings();
    injectListingModal();
}

function renderListings() {
    const listings = getListings();
    
    // Render widget (max 3)
    const tbodyWidget = document.getElementById('listings-tbody-widget');
    if (tbodyWidget) {
        tbodyWidget.innerHTML = generateListingsHTML(listings.slice(0, 3), false);
    }
    
    // Render full
    const tbodyFull = document.getElementById('listings-tbody-full');
    if (tbodyFull) {
        tbodyFull.innerHTML = generateListingsHTML(listings, true);
    }
}

function generateListingsHTML(listings, showViews) {
    if (!listings.length) return '<tr><td colspan="5" class="p-8 text-center text-slate-400">No listings found. Click "Add Listing" to start.</td></tr>';
    
    return listings.map(l => `
        <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors group" data-id="${l.id}">
          <td class="p-4">
            <div class="flex items-center gap-3">
              <img src="${l.img || 'https://via.placeholder.com/48?text=House'}" alt="Property" class="w-12 h-12 rounded object-cover shadow-sm border border-slate-200">
              <div>
                <p class="font-medium text-primary">${escHtml(l.title)}</p>
                <p class="text-on-surface-variant text-xs">${escHtml(l.location)}</p>
              </div>
            </div>
          </td>
          <td class="p-4">
            <span class="${l.status === 'Active' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant'} px-2 py-1 rounded-full text-xs font-medium">${l.status}</span>
          </td>
          <td class="p-4 font-medium">${escHtml(l.price)}</td>
          ${showViews ? `<td class="p-4">${l.views.toLocaleString()}</td>` : ''}
          <td class="p-4 text-right">
            <div class="flex justify-end gap-2">
              <button onclick="openListingModal(${l.id})" class="p-1.5 text-on-surface-variant hover:text-primary rounded hover:bg-surface-container" title="Edit">
                <span class="material-symbols-outlined text-[20px]">edit</span>
              </button>
              <button onclick="deleteListing(${l.id})" class="p-1.5 text-on-surface-variant hover:text-error rounded hover:bg-error-container" title="Delete">
                <span class="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </div>
          </td>
        </tr>
    `).join('');
}

function deleteListing(id) {
    if (!confirm('Delete this listing?')) return;
    saveListings(getListings().filter(l => l.id !== id));
    renderListings();
}

window.deleteListing = deleteListing;

function openListingModal(id) {
    const modal = document.getElementById('listing-modal');
    const listing = id ? getListings().find(l => l.id === id) : null;

    document.getElementById('modal-title').textContent   = listing ? 'Edit Listing' : 'Add New Listing';
    document.getElementById('modal-id').value            = listing ? listing.id : '';
    document.getElementById('modal-prop-title').value    = listing ? listing.title    : '';
    document.getElementById('modal-location').value      = listing ? listing.location  : '';
    document.getElementById('modal-price').value         = listing ? listing.price     : '';
    document.getElementById('modal-status').value        = listing ? listing.status    : 'Active';
    document.getElementById('modal-views').value         = listing ? listing.views     : '0';

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

window.openListingModal = openListingModal;

function closeListingModal() {
    const modal = document.getElementById('listing-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

window.closeListingModal = closeListingModal;

function saveListingForm() {
    const id       = document.getElementById('modal-id').value;
    const title    = document.getElementById('modal-prop-title').value.trim();
    const location = document.getElementById('modal-location').value.trim();
    const price    = document.getElementById('modal-price').value.trim();
    const status   = document.getElementById('modal-status').value;
    const views    = parseInt(document.getElementById('modal-views').value) || 0;

    if (!title || !location || !price) {
        alert('Please fill in all required fields.');
        return;
    }

    let listings = getListings();
    if (id) {
        listings = listings.map(l => l.id == id ? { ...l, title, location, price, status, views } : l);
    } else {
        const newId = Date.now();
        listings.push({ id: newId, title, location, price, status, views });
    }

    saveListings(listings);
    renderListings();
    closeListingModal();
}

window.saveListingForm = saveListingForm;

function injectListingModal() {
    if (document.getElementById('listing-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'listing-modal';
    modal.className = 'hidden fixed inset-0 z-[100] items-center justify-center bg-black/50 backdrop-blur-sm';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 id="modal-title" class="text-lg font-bold text-slate-900">Add New Listing</h3>
          <button onclick="closeListingModal()" class="text-slate-400 hover:text-slate-700 transition-colors">
            <span class="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <input type="hidden" id="modal-id"/>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Property Title *</label>
            <input id="modal-prop-title" type="text" placeholder="e.g. 12 Marine Drive, Penthouse" class="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"/>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Location *</label>
            <input id="modal-location" type="text" placeholder="e.g. Bandra West, Mumbai" class="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"/>
          </div>
          <div class="flex gap-4">
            <div class="flex-1">
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Price *</label>
              <input id="modal-price" type="text" placeholder="e.g. ₹12.5 Cr" class="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"/>
            </div>
            <div class="flex-1">
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</label>
              <select id="modal-status" class="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Views</label>
            <input id="modal-views" type="number" placeholder="0" class="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"/>
          </div>
        </div>
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button onclick="closeListingModal()" class="px-5 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-100 transition-colors">Cancel</button>
          <button onclick="saveListingForm()" class="px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity">Save Listing</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeListingModal(); });
}

// ══════════════════════════════════════════════════════
//  BROKER INQUIRIES MANAGER
// ══════════════════════════════════════════════════════

function getInquiries() {
    try {
        return JSON.parse(localStorage.getItem('brokerInquiries') || '[]');
    } catch { return []; }
}

function saveInquiries(inquiries) {
    localStorage.setItem('brokerInquiries', JSON.stringify(inquiries));
}

function formatTimeLabel() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function initInquiriesManager() {
    const existing = getInquiries();
    if (existing.length === 0) {
        saveInquiries([
            { id: 1, name: 'Sarah Jenkins', time: '10:42 AM', message: 'Interested in viewing 123 Luxury Lane this weekend.', type: 'Viewing Request', read: false, brokerReply: '' },
            { id: 2, name: 'Michael Chen', time: 'Yesterday', message: 'Are there any similar properties in the downtown area?', type: 'Question', read: false, brokerReply: '' },
            { id: 3, name: 'David & Emma Ross', time: 'Mon', message: 'We would like to make an offer on 789 Suburban Retreat.', type: 'Offer Intent', read: true, brokerReply: '' },
            { id: 4, name: 'Jessica Alvarez', time: 'Nov 12', message: 'Thank you for the tour yesterday, we will think about it.', type: 'Follow-up', read: true, brokerReply: '' }
        ]);
    }
    renderInquiries();
    injectInquiryModal();
}

function renderInquiries() {
    const inquiries = getInquiries();
    const unreadCount = inquiries.filter(i => !i.read).length;
    const badge = document.getElementById('new-inquiries-badge');
    
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = `${unreadCount} New`;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    const html = inquiries.length ? inquiries.map(i => `
        <div onclick="openInquiry(${i.id})" class="p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border-b border-slate-100 last:border-0 relative ${!i.read ? 'bg-primary-fixed/5' : ''}">
          ${!i.read ? '<div class="absolute left-2 top-4 w-2 h-2 rounded-full bg-primary animate-pulse"></div>' : ''}
          <div class="ml-4">
            <div class="flex justify-between items-start mb-1">
              <h4 class="font-body-md text-body-md ${!i.read ? 'font-bold' : 'font-semibold'} text-primary">${escHtml(i.name)}</h4>
              <span class="text-xs text-on-surface-variant">${escHtml(i.time)}</span>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant truncate mb-2">${escHtml(i.message)}</p>
            ${i.brokerReply ? `<p class="font-body-sm text-[12px] text-secondary truncate mb-2">Broker: ${escHtml(i.brokerReply)}</p>` : ''}
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold uppercase tracking-wider ${i.type === 'Offer Intent' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container text-on-surface-variant'} px-1.5 py-0.5 rounded">${i.type}</span>
            </div>
          </div>
        </div>
    `).join('') : '<div class="p-8 text-center text-slate-400 text-sm">No inquiries yet.</div>';
    
    // Render widget (max 3)
    const listWidget = document.getElementById('inquiries-list-widget');
    if (listWidget) {
        // Just slice the HTML string logic for simplicity since we want all in the widget too.
        listWidget.innerHTML = html;
    }
    
    // Render full
    const listFull = document.getElementById('inquiries-list-full');
    if (listFull) {
        listFull.innerHTML = html;
    }
}

function openInquiry(id) {
    let inquiries = getInquiries();
    const inquiry = inquiries.find(i => i.id === id);
    if (!inquiry) return;

    // Mark as read
    inquiries = inquiries.map(i => i.id === id ? { ...i, read: true } : i);
    saveInquiries(inquiries);
    renderInquiries();

    // Show modal
    const modal = document.getElementById('inquiry-details-modal');
    document.getElementById('inquiry-modal-name').textContent = inquiry.name;
    document.getElementById('inquiry-modal-type').textContent = inquiry.type;
    document.getElementById('inquiry-modal-message').textContent = inquiry.message;
    document.getElementById('inquiry-modal-time').textContent = inquiry.time;
    document.getElementById('inquiry-modal-reply').value = inquiry.brokerReply || '';
    activeInquiryId = id;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

window.openInquiry = openInquiry;

function closeInquiryModal() {
    const modal = document.getElementById('inquiry-details-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

window.closeInquiryModal = closeInquiryModal;

function injectInquiryModal() {
    if (document.getElementById('inquiry-details-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'inquiry-details-modal';
    modal.className = 'hidden fixed inset-0 z-[100] items-center justify-center bg-black/50 backdrop-blur-sm';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 class="text-lg font-bold text-slate-900">Inquiry Details</h3>
          <button onclick="closeInquiryModal()" class="text-slate-400 hover:text-slate-700 transition-colors">
            <span class="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex justify-between items-start">
            <div>
              <h4 id="inquiry-modal-name" class="text-xl font-bold text-primary">Sarah Jenkins</h4>
              <p id="inquiry-modal-type" class="text-xs font-bold uppercase tracking-widest text-on-surface-variant mt-1">Viewing Request</p>
            </div>
            <span id="inquiry-modal-time" class="text-xs text-slate-400">10:42 AM</span>
          </div>
          <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p id="inquiry-modal-message" class="text-sm text-slate-700 leading-relaxed italic">"Interested in viewing 123 Luxury Lane this weekend if possible."</p>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Reply Message</label>
            <textarea id="inquiry-modal-reply" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" rows="3" placeholder="Type broker reply..."></textarea>
          </div>
          <div class="flex flex-col gap-2 pt-2">
            <button id="reply-inquiry-btn" class="w-full bg-primary text-white py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity">Send Reply</button>
            <button id="schedule-viewing-btn" class="w-full border border-slate-200 text-slate-600 py-2.5 rounded-lg font-semibold hover:bg-slate-50 transition-colors">Schedule Viewing</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeInquiryModal(); });

    const replyBtn = document.getElementById('reply-inquiry-btn');
    if (replyBtn) {
        replyBtn.addEventListener('click', () => {
            const reply = document.getElementById('inquiry-modal-reply')?.value?.trim();
            if (!activeInquiryId || !reply) {
                showToast('Please enter a reply message.');
                return;
            }
            const updated = getInquiries().map(i => i.id === activeInquiryId ? { ...i, brokerReply: reply, read: true } : i);
            saveInquiries(updated);
            renderInquiries();
            showToast('Reply sent to buyer.');
        });
    }

    const scheduleBtn = document.getElementById('schedule-viewing-btn');
    if (scheduleBtn) {
        scheduleBtn.addEventListener('click', () => {
            showToast('Viewing request marked for scheduling.');
        });
    }
}

function initBuyerBrokerChat() {
    const chatBtn = document.getElementById('contact-agent-btn');
    const form = document.getElementById('buyer-inquiry-form');
    if (!chatBtn || !form) return;

    chatBtn.addEventListener('click', () => {
        const firstName = document.getElementById('buyer-first-name')?.value?.trim();
        const lastName = document.getElementById('buyer-last-name')?.value?.trim();
        const email = document.getElementById('buyer-email')?.value?.trim();
        const phone = document.getElementById('buyer-phone')?.value?.trim();
        const type = document.getElementById('inquiry-type')?.value?.trim() || 'Chat';
        const message = document.getElementById('buyer-message')?.value?.trim();

        if (!firstName || !email || !message) {
            showToast('Add name, email, and message to chat.');
            return;
        }

        const fullName = `${firstName} ${lastName || ''}`.trim();
        const channelDetails = [email, phone].filter(Boolean).join(' | ');
        const finalMessage = `${message}${channelDetails ? ` (${channelDetails})` : ''}`;

        const inquiries = getInquiries();
        inquiries.unshift({
            id: Date.now(),
            name: fullName,
            time: formatTimeLabel(),
            message: finalMessage,
            type,
            read: false,
            brokerReply: ''
        });
        saveInquiries(inquiries);

        form.reset();
        showToast('Message sent to broker. They can now reply in Leads.');
    });
}

function initBuyerPageInteractions() {
    wireCommonLinks();

    if (currentPage === 'index.html') {
        initBuyerHomePage();
    } else if (currentPage === 'properties.html') {
        initBuyerListingsPage();
    } else if (currentPage === 'map.html') {
        initBuyerMapPage();
    } else if (currentPage === 'property-details.html') {
        initBuyerDetailsPage();
    } else if (currentPage === 'sell.html') {
        initSellPage();
    }
}

function wireCommonLinks() {
    const navMap = {
        'About Us': '/index.html',
        'Terms of Service': '/terms.html',
        'Privacy Policy': '/privacy.html',
        'Cookie Settings': '/privacy.html',
        'Contact Support': '/login.html',
        'Sitemap': '/index.html'
    };

    document.querySelectorAll('a').forEach((a) => {
        const label = a.textContent.trim();
        if (navMap[label]) a.setAttribute('href', navMap[label]);
    });
}

function normalizeInternalLinks() {
    document.querySelectorAll('a[href^="/"]').forEach((link) => {
        const href = link.getAttribute('href');
        if (!href || href === '/') {
            link.setAttribute('href', toAppUrl('index.html'));
            return;
        }
        link.setAttribute('href', toAppUrl(href));
    });
}

function initBuyerHomePage() {
    const searchButtons = Array.from(document.querySelectorAll('button')).filter((b) => b.textContent.includes('Search'));
    searchButtons.forEach((btn) => {
        btn.addEventListener('click', () => navigateTo('properties.html'));
    });

    document.querySelectorAll('article, section .group.cursor-pointer').forEach((card) => {
        card.addEventListener('click', () => navigateTo('property-details.html'));
    });
}

function initBuyerListingsPage() {
    const listingCards = document.querySelectorAll('main .group.cursor-pointer');
    listingCards.forEach((card) => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('button[aria-label="Save Property"]')) return;
            navigateTo('property-details.html');
        });
    });

    document.querySelectorAll('button[aria-label="Save Property"]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const icon = btn.querySelector('.material-symbols-outlined');
            const isSaved = icon?.style?.fontVariationSettings?.includes("'FILL' 1");
            if (icon) {
                icon.style.fontVariationSettings = isSaved ? "'FILL' 0" : "'FILL' 1";
            }
            btn.classList.toggle('text-error', !isSaved);
            showToast(isSaved ? 'Removed from saved properties.' : 'Saved property.');
        });
    });

    const searchBtn = Array.from(document.querySelectorAll('button')).find((b) => ['Search', 'Apply Filters'].includes(b.textContent.trim()));
    if (searchBtn) searchBtn.addEventListener('click', () => showToast('Search filters applied.'));

    const clearBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.trim() === 'Clear All');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.querySelectorAll('aside input').forEach((input) => {
                if (input.type === 'checkbox') input.checked = false;
                else input.value = '';
            });
            document.querySelectorAll('aside select').forEach((sel) => { sel.selectedIndex = 0; });
            showToast('Filters cleared.');
        });
    }

    const sortSelect = document.querySelector('main select');
    if (sortSelect) sortSelect.addEventListener('change', () => showToast(`Sorted: ${sortSelect.value.replace('Sort by: ', '')}`));

    const gridBtn = document.querySelector('button[aria-label="Grid View"]');
    const listBtn = document.querySelector('button[aria-label="List View"]');
    const grid = document.querySelector('main .grid');
    if (gridBtn && listBtn && grid) {
        gridBtn.addEventListener('click', () => {
            grid.className = 'flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-gutter';
            gridBtn.classList.add('bg-surface-container-lowest', 'text-primary');
            listBtn.classList.remove('bg-surface-container-lowest', 'text-primary');
            showToast('Grid view enabled.');
        });
        listBtn.addEventListener('click', () => {
            grid.className = 'flex-1 grid grid-cols-1 gap-gutter';
            listBtn.classList.add('bg-surface-container-lowest', 'text-primary');
            gridBtn.classList.remove('bg-surface-container-lowest', 'text-primary');
            showToast('List view enabled.');
        });
    }

    document.querySelectorAll('nav button').forEach((btn) => {
        if (btn.textContent.trim().match(/^\d+$/) || btn.querySelector('.material-symbols-outlined')) {
            btn.addEventListener('click', () => showToast('Pagination is demo-only in this build.'));
        }
    });
}

function initBuyerMapPage() {
    document.querySelectorAll('article, main .group').forEach((card) => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            navigateTo('property-details.html');
        });
    });

    document.querySelectorAll('section button').forEach((btn) => {
        const txt = btn.textContent.trim();
        if (txt.includes('₹') || txt.includes('Price') || txt.includes('Beds') || txt.includes('Home Type') || txt.includes('Draw')) {
            btn.addEventListener('click', () => showToast('Map filter updated.'));
        }
    });
}

function initBuyerDetailsPage() {
    const photoBtn = Array.from(document.querySelectorAll('span')).find((s) => s.textContent.includes('View All 24 Photos'))?.closest('div');
    if (photoBtn) photoBtn.addEventListener('click', () => showToast('Full photo gallery will open in next iteration.'));
}

function initSellPage() {
    const form = document.querySelector('form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        form.reset();
        showToast('Valuation request submitted.');
    });
}

function initAdminPanelInteractions() {
    document.querySelectorAll('button').forEach((button) => {
        const text = button.textContent.trim();
        const title = button.getAttribute('title');
        if (title === 'Approve') {
            button.addEventListener('click', () => {
                button.closest('tr, .flex')?.remove();
                showToast('Broker verification approved.');
            });
        } else if (title === 'Reject') {
            button.addEventListener('click', () => {
                button.closest('tr, .flex')?.remove();
                showToast('Broker verification rejected.');
            });
        } else if (text === 'Load More Queue Items') {
            button.addEventListener('click', () => showToast('All queue items are currently loaded.'));
        } else if (text.includes('View All Users')) {
            button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        } else if (text.includes('Export')) {
            button.addEventListener('click', () => showToast('Admin report prepared for export.'));
        } else if (text.includes('Invite')) {
            button.addEventListener('click', () => showToast('Invite workflow opened.'));
        }
    });
}

function initEmployeePanelInteractions() {
    document.querySelectorAll('button').forEach((button) => {
        const text = button.textContent.trim();
        if (text === 'Approve') {
            button.addEventListener('click', () => {
                button.closest('article, div')?.classList.add('opacity-60');
                showToast('Listing approved.');
            });
        } else if (text === 'Flag') {
            button.addEventListener('click', () => showToast('Listing flagged for review.'));
        } else if (text === 'Remove') {
            button.addEventListener('click', () => {
                button.closest('article, div')?.remove();
                showToast('Listing removed from queue.');
            });
        } else if (text === 'View All') {
            button.addEventListener('click', () => showToast('All assigned items are visible.'));
        }
    });
}

function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
