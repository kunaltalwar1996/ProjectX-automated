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

const buyerPages = ['index.html', 'properties.html', 'map.html', 'property-details.html', 'sell.html', 'profile.html'];
const guestPages  = ['index.html', 'properties.html', 'map.html', 'property-details.html', 'sell.html'];

const roleHomePage = {
    'Admin':    'admin-panel.html',
    'Employee': 'employee-panel.html',
    'Broker':   'broker-dashboard.html',
    'Buyer':    'index.html',
    'Guest':    'index.html'
};

const roleAllowedPages = {
    'Admin':    ['admin-panel.html', 'employee-panel.html', 'broker-dashboard.html', 'properties.html', 'map.html', 'property-details.html', 'profile.html'],
    'Employee': ['employee-panel.html', 'broker-dashboard.html', 'properties.html', 'map.html', 'property-details.html'],
    'Broker':   ['broker-dashboard.html', 'properties.html', 'map.html', 'property-details.html'],
    'Buyer':    buyerPages,
    'Guest':    guestPages
};

// ─── Global Auth Guard (synchronous) ──────────────────────────────────────────

const isLoginPage = currentPage === 'login.html' || currentPage === 'staff-login.html';

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
    // ── Login Page UI Logic ──
    if (isLoginPage) {
        const roleButtons = document.querySelectorAll('#role-tabs button');
        const formTitle   = document.getElementById('form-title');
        const nameField   = document.getElementById('name-field') || document.getElementById('broker-name-field');
        const nameLabel   = document.getElementById('name-label');
        const modeText    = document.getElementById('mode-text');
        const toggleBtn   = document.getElementById('toggle-mode-btn');
        const signInBtn   = document.getElementById('sign-in-btn');
        let selectedRole  = 'Buyer';
        let isSignUp      = false;

        function updateUI() {
            if (formTitle) {
                formTitle.textContent = isSignUp ? `Join as ${selectedRole}` : `${selectedRole} Sign In`;
            }
            if (signInBtn) {
                signInBtn.textContent = isSignUp ? 'Create Account' : 'Sign In';
            }
            if (modeText) {
                modeText.innerHTML = isSignUp 
                    ? `Already have an account? <button id="toggle-mode-btn" type="button" class="font-bold text-slate-900 hover:underline ml-1">Sign In</button>`
                    : `Don't have an account? <button id="toggle-mode-btn" type="button" class="font-bold text-slate-900 hover:underline ml-1">Sign Up</button>`;
                
                // Re-bind click event since we replaced innerHTML
                document.getElementById('toggle-mode-btn').onclick = (e) => {
                    e.preventDefault();
                    isSignUp = !isSignUp;
                    updateUI();
                };
            }
            if (nameField) {
                if (isSignUp) {
                    nameField.style.display = 'block';
                    if (nameLabel) nameLabel.textContent = selectedRole === 'Broker' ? 'Company/Full Name' : 'Full Name';
                } else {
                    nameField.style.display = (selectedRole === 'Broker') ? 'block' : 'none';
                    if (nameLabel) nameLabel.textContent = 'Company/Full Name';
                }
            }
        }

        function resetRoleTabs() {
            roleButtons.forEach(b => {
                b.className = 'flex-1 py-2 px-3 text-center font-label-caps text-label-caps rounded role-tab-inactive hover:text-on-surface transition-colors';
            });
        }

        function selectRole(role) {
            selectedRole = role;
            resetRoleTabs();
            
            const btn = Array.from(roleButtons).find(b => b.textContent.trim() === role);
            if (btn) {
                btn.className = 'flex-1 py-2 px-3 text-center font-label-caps text-label-caps rounded bg-white text-slate-900 shadow-sm transition-all scale-105 font-bold';
            }

            updateUI();
        }

        roleButtons.forEach(btn => {
            btn.onclick = () => selectRole(btn.textContent.trim());
        });

        // Initialize toggle if it exists initially
        if (toggleBtn) {
            toggleBtn.onclick = (e) => {
                e.preventDefault();
                isSignUp = !isSignUp;
                updateUI();
            };
        }

        // Handle URL parameters for role selection
        const urlParams = new URLSearchParams(window.location.search);
        const urlRole = urlParams.get('role');
        if (urlRole) selectRole(urlRole);
        else selectRole(currentPage === 'staff-login.html' ? 'Admin' : 'Buyer');

        // Sign In button
        if (signInBtn) {
            signInBtn.onclick = (e) => {
                e.preventDefault();
                const name = document.getElementById('input-name')?.value?.trim() || '';
                
                if (isSignUp && !name) {
                    showToast('Please enter your name to create an account.');
                    return;
                }
                
                if (isSignUp) {
                    if (selectedRole === 'Buyer') {
                        localStorage.setItem('showWelcome', name);
                    } else {
                        showToast('Account created successfully!');
                    }
                }
                
                window.login(selectedRole, name ? name : null);
            };
        }

        // Guest button
        const guestBtn = document.getElementById('guest-btn');
        if (guestBtn) {
            guestBtn.onclick = (e) => {
                e.preventDefault();
                window.login('Guest');
            };
        }

        return;
    }

    // ── Global Header Visibility ──
    function updateHeaderVisibility() {
        const isStaff = ['Admin', 'Employee', 'Broker'].includes(userRole);
        
        // ── Auth / Navigation Logic ──
        document.querySelectorAll('a, button').forEach(el => {
            const text = el.textContent.trim();
            
            // Dashboard button: show only for staff
            if (text === 'Dashboard') {
                el.style.display = isStaff ? 'flex' : 'none';
                if (isStaff) {
                    el.href = toAppUrl(roleHomePage[userRole] || 'index.html');
                }
            }
            
            // Filter other staff-only links if they exist
            if (text === 'Agents' || text === 'Invest') {
                // If it's a top nav link, we might want to keep it for Buyers but hide for Guest if requested
                // For now, follow the prompt: "Dashboard button is hidden for Buyers and Guests"
            }
        });

        // Account icon logic
        const accountBtn = Array.from(document.querySelectorAll('button, a')).find(b => 
            b.querySelector('.material-symbols-outlined')?.textContent.trim() === 'account_circle' || 
            b.textContent.trim() === 'account_circle'
        );

        if (accountBtn) {
            const isGuest = userRole === 'Guest' || !userRole;
            
            // Re-style the button based on state
            if (isGuest) {
                accountBtn.innerHTML = '<span class="font-bold text-xs uppercase tracking-wider px-2">Sign In</span>';
                accountBtn.title = 'Sign In to EstatePro';
                accountBtn.onclick = (e) => { e.preventDefault(); navigateTo('login.html'); };
            } else if (userRole === 'Buyer') {
                accountBtn.innerHTML = '<span class="material-symbols-outlined text-[24px]">account_circle</span>';
                accountBtn.title = `Signed in as ${userRole} — Go to Profile`;
                accountBtn.onclick = (e) => { e.preventDefault(); navigateTo('profile.html'); };
            } else {
                accountBtn.innerHTML = '<span class="material-symbols-outlined text-[24px]">logout</span>';
                accountBtn.title = `Signed in as ${userRole} — Click to sign out`;
                accountBtn.onclick = (e) => {
                    e.preventDefault();
                    if (confirm('Are you sure you want to sign out?')) window.logout();
                };
            }
        }
    }

    updateHeaderVisibility();


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

    // ── Buyer Property Details ──
    if (currentPage === 'property-details.html') {
        // Handled in initBuyerPageInteractions
    }

    if (buyerPages.includes(currentPage)) {
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
        <tr class="border-b border-surface-variant hover:bg-surface-container transition-colors group" data-id="${l.id}">
          <td class="p-4">
            <div class="flex items-center gap-3">
              <img src="${l.img || 'https://via.placeholder.com/48?text=House'}" alt="Property" class="w-12 h-12 rounded object-cover shadow-sm border border-outline-variant">
              <div>
                <p class="font-medium text-primary">${escHtml(l.title)}</p>
                <p class="text-on-surface-variant text-xs">${escHtml(l.location)}</p>
              </div>
            </div>
          </td>
          <td class="p-4">
            <span class="${l.status === 'Active' ? 'bg-secondary-fixed text-on-secondary-fixed-variant' : 'bg-surface-container-high text-on-surface-variant'} px-2 py-1 rounded-full text-xs font-medium">${l.status}</span>
          </td>
          <td class="p-4 font-medium">${escHtml(l.price)}</td>
          ${showViews ? `<td class="p-4">${l.views.toLocaleString()}</td>` : ''}
          <td class="p-4 text-right">
            <div class="flex justify-end gap-2">
              <button onclick="shareListing(${l.id})" class="p-1.5 text-on-surface-variant hover:text-primary rounded hover:bg-surface-container" title="Share">
                <span class="material-symbols-outlined text-[20px]">share</span>
              </button>
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

function shareListing(id) {
    const url = window.location.origin + '/property-details.html?id=' + id;
    navigator.clipboard.writeText(url).then(() => {
        showToast('Listing link copied to clipboard!');
    }).catch(() => {
        showToast('Failed to copy link.');
    });
}

window.shareListing = shareListing;

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
        listings.push({ id: newId, title, location, price, status, views, img: '' });
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
      <div class="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-outline-variant">
        <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-low">
          <h3 id="modal-title" class="font-h3 text-h3 text-primary">Add New Listing</h3>
          <button onclick="closeListingModal()" class="text-slate-400 hover:text-slate-700 transition-colors">
            <span class="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <input type="hidden" id="modal-id"/>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Property Title *</label>
            <input id="modal-prop-title" type="text" placeholder="e.g. 12 Marine Drive, Penthouse" class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-transparent"/>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Location *</label>
            <input id="modal-location" type="text" placeholder="e.g. Bandra West, Mumbai" class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-transparent"/>
          </div>
          <div class="flex gap-4">
            <div class="flex-1">
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Price *</label>
              <input id="modal-price" type="text" placeholder="e.g. ₹12.5 Cr" class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-transparent"/>
            </div>
            <div class="flex-1">
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</label>
              <select id="modal-status" class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed">
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Views</label>
            <input id="modal-views" type="number" placeholder="0" class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-transparent"/>
          </div>
        </div>
        <div class="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex justify-end gap-3">
          <button onclick="closeListingModal()" class="px-5 py-2 rounded-lg border border-outline-variant text-on-surface-variant text-sm font-medium hover:bg-surface-container transition-colors">Cancel</button>
          <button onclick="saveListingForm()" class="px-5 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:opacity-90 transition-opacity">Save Listing</button>
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
        <div onclick="openInquiry(${i.id})" class="p-3 hover:bg-surface-container rounded-lg cursor-pointer transition-colors border-b border-surface-variant last:border-0 relative ${!i.read ? 'bg-primary-fixed/5' : ''}">
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
      <div class="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-outline-variant">
        <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-low">
          <h3 class="font-h3 text-h3 text-primary">Inquiry Details</h3>
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
          <div class="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
            <p id="inquiry-modal-message" class="text-sm text-slate-700 leading-relaxed italic">"Interested in viewing 123 Luxury Lane this weekend if possible."</p>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Reply Message</label>
            <textarea id="inquiry-modal-reply" class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed" rows="3" placeholder="Type broker reply..."></textarea>
          </div>
          <div class="flex flex-col gap-2 pt-2">
            <button id="reply-inquiry-btn" class="w-full bg-primary text-on-primary py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity">Send Reply</button>
            <button id="schedule-viewing-btn" class="w-full border border-outline-variant text-on-surface-variant py-2.5 rounded-lg font-semibold hover:bg-surface-container transition-colors">Schedule Viewing</button>
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
        'About Us': 'index.html',
        'Terms of Service': 'terms.html',
        'Privacy Policy': 'privacy.html',
        'Cookie Settings': 'privacy.html',
        'Contact Support': 'login.html',
        'Sitemap': 'index.html'
    };

    document.querySelectorAll('a').forEach((a) => {
        const label = a.textContent.trim();
        if (navMap[label]) a.setAttribute('href', toAppUrl(navMap[label]));
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
    // ── [Search Bar Navigation] ──
    const searchInput = document.getElementById('location-search');
    const searchBtn = document.getElementById('search-btn');
    const resultsContainer = document.getElementById('search-results');
    let debounceTimer;

    if (searchBtn && searchInput) {
        searchBtn.onclick = () => {
            const val = searchInput.value.trim();
            navigateTo(`map.html${val ? `?q=${encodeURIComponent(val)}` : ''}`);
        };

        // Enter key support
        searchInput.onkeypress = (e) => {
            if (e.key === 'Enter') searchBtn.click();
        };

        // OpenStreetMap Autocomplete
        if (resultsContainer) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                const query = e.target.value.trim();
                if (query.length < 3) {
                    resultsContainer.classList.add('hidden');
                    return;
                }
                
                debounceTimer = setTimeout(() => {
                    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=IN&limit=5`)
                        .then(res => res.json())
                        .then(data => {
                            resultsContainer.innerHTML = '';
                            if (data.length === 0) {
                                resultsContainer.innerHTML = '<div class="p-4 text-sm text-slate-500 font-medium">No locations found in India.</div>';
                            } else {
                                data.forEach(item => {
                                    const div = document.createElement('div');
                                    div.className = 'px-6 py-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors flex items-center gap-3';
                                    div.innerHTML = `<span class="material-symbols-outlined text-slate-400 text-[20px]">location_on</span><span class="text-sm font-medium text-slate-700 truncate" title="${item.display_name}">${item.display_name}</span>`;
                                    div.onclick = () => {
                                        searchInput.value = item.display_name.split(',')[0];
                                        resultsContainer.classList.add('hidden');
                                        navigateTo(`map.html?lat=${item.lat}&lng=${item.lon}&q=${encodeURIComponent(item.display_name)}`);
                                    };
                                    resultsContainer.appendChild(div);
                                });
                            }
                            resultsContainer.classList.remove('hidden');
                            resultsContainer.classList.add('flex');
                        })
                        .catch(err => console.error('Nominatim error:', err));
                }, 300);
            });

            // Hide dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
                    resultsContainer.classList.add('hidden');
                    resultsContainer.classList.remove('flex');
                }
            });
        }
    }

    // ── [Featured Cards Navigation] ──
    document.querySelectorAll('article, section .group.cursor-pointer').forEach((card) => {
        card.addEventListener('click', () => navigateTo('property-details.html'));
    });
}

function initBuyerListingsPage() {
    // ── [Data Initialization] ──
    let savedProperties = [];
    try {
        savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    } catch (e) { savedProperties = []; }

    const propertyGrid = document.getElementById('property-grid');
    const cards = Array.from(document.querySelectorAll('.property-card'));
    const countText = document.getElementById('listings-count-text');

    // ── [Helper: Update Visible Count] ──
    const updateCount = () => {
        const visibleCount = cards.filter(c => c.style.display !== 'none').length;
        if (countText) countText.textContent = `Showing ${visibleCount} exceptional listings in Mumbai & Delhi`;
    };

    // ── [Helper: Load Saved State] ──
    const syncSavedHearts = () => {
        cards.forEach(card => {
            const id = card.dataset.id;
            const btn = card.querySelector('.save-property-btn');
            const icon = btn?.querySelector('.material-symbols-outlined');
            if (savedProperties.includes(id)) {
                if (icon) icon.style.fontVariationSettings = "'FILL' 1";
                btn?.classList.add('text-error');
            } else {
                if (icon) icon.style.fontVariationSettings = "'FILL' 0";
                btn?.classList.remove('text-error');
            }
        });
    };
    syncSavedHearts();

    // ── [Search & Filter Logic] ──
    const applyFilters = () => {
        const query = document.getElementById('listing-search-input')?.value.toLowerCase() || '';
        const selectedTypes = Array.from(document.querySelectorAll('input[name="type"]:checked')).map(i => i.value);
        const minPrice = parseFloat(document.getElementById('price-min')?.value) || 0;
        const maxPrice = parseFloat(document.getElementById('price-max')?.value) || Infinity;
        
        const activeBeds = document.querySelector('button[data-filter="beds"].bg-primary')?.dataset.value || 0;
        const activeBaths = document.querySelector('button[data-filter="baths"].bg-primary')?.dataset.value || 0;

        cards.forEach(card => {
            const title = card.dataset.title.toLowerCase();
            const location = card.dataset.location.toLowerCase();
            const type = card.dataset.type;
            const beds = parseFloat(card.dataset.beds);
            const baths = parseFloat(card.dataset.baths);
            const price = parseFloat(card.dataset.price);

            const matchesSearch = !query || title.includes(query) || location.includes(query);
            const matchesType = selectedTypes.length === 0 || selectedTypes.includes(type);
            const matchesBeds = beds >= parseFloat(activeBeds);
            const matchesBaths = baths >= parseFloat(activeBaths);
            const matchesPrice = price >= minPrice && price <= maxPrice;

            if (matchesSearch && matchesType && matchesBeds && matchesBaths && matchesPrice) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
        updateCount();
    };

    // ── [Sort Logic] ──
    const sortCards = () => {
        const sortVal = document.getElementById('sort-dropdown')?.value;
        const sortedCards = [...cards].sort((a, b) => {
            if (sortVal === 'price-low') return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
            if (sortVal === 'price-high') return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
            if (sortVal === 'newest') return new Date(b.dataset.date) - new Date(a.dataset.date);
            return 0; // recommended/default
        });
        
        if (propertyGrid) {
            propertyGrid.innerHTML = '';
            sortedCards.forEach(c => propertyGrid.appendChild(c));
        }
    };

    // ── [Event Listeners] ──
    document.getElementById('find-homes-btn')?.addEventListener('click', applyFilters);
    document.getElementById('listing-search-input')?.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') applyFilters();
    });

    document.querySelectorAll('input[name="type"], #price-min, #price-max').forEach(el => {
        el.addEventListener('change', applyFilters);
    });

    document.querySelectorAll('button[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            const filterType = btn.dataset.filter;
            document.querySelectorAll(`button[data-filter="${filterType}"]`).forEach(b => {
                b.classList.remove('bg-primary', 'text-on-primary');
            });
            btn.classList.add('bg-primary', 'text-on-primary');
            applyFilters();
        });
    });

    document.getElementById('clear-all-filters')?.addEventListener('click', () => {
        document.getElementById('listing-search-input').value = '';
        document.querySelectorAll('input[name="type"]').forEach(i => i.checked = false);
        document.getElementById('price-min').value = '';
        document.getElementById('price-max').value = '';
        document.querySelectorAll('button[data-filter]').forEach(b => b.classList.remove('bg-primary', 'text-on-primary'));
        applyFilters();
        showToast('All filters cleared.');
    });

    document.getElementById('sort-dropdown')?.addEventListener('change', sortCards);

    // ── [Grid/List Toggle] ──
    const gridBtn = document.getElementById('view-grid');
    const listBtn = document.getElementById('view-list');
    if (gridBtn && listBtn && propertyGrid) {
        gridBtn.onclick = () => {
            propertyGrid.className = 'grid grid-cols-1 md:grid-cols-2 gap-10';
            gridBtn.classList.add('bg-white', 'shadow-sm', 'text-primary');
            listBtn.classList.remove('bg-white', 'shadow-sm', 'text-primary');
            cards.forEach(c => c.classList.remove('flex', 'gap-6', 'items-center'));
            showToast('Switched to Grid View');
        };
        listBtn.onclick = () => {
            propertyGrid.className = 'grid grid-cols-1 gap-8';
            listBtn.classList.add('bg-white', 'shadow-sm', 'text-primary');
            gridBtn.classList.remove('bg-white', 'shadow-sm', 'text-primary');
            cards.forEach(c => c.classList.add('flex', 'gap-6', 'items-center'));
            showToast('Switched to List View');
        };
    }

    // ── [Card Interactions] ──
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.save-property-btn')) return;
            if (e.target.closest('.share-property-btn')) {
                const url = window.location.origin + '/property-details.html?id=' + (card.dataset.id || '');
                navigator.clipboard.writeText(url).then(() => {
                    showToast('Link copied to clipboard!');
                }).catch(() => {
                    showToast('Failed to copy link.');
                });
                return;
            }
            navigateTo('property-details.html');
        });

        const saveBtn = card.querySelector('.save-property-btn');
        saveBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = card.dataset.id;
            const index = savedProperties.indexOf(id);
            if (index > -1) {
                savedProperties.splice(index, 1);
                showToast('Removed from saved properties.');
            } else {
                savedProperties.push(id);
                showToast('Property saved to your favorites.');
            }
            localStorage.setItem('savedProperties', JSON.stringify(savedProperties));
            syncSavedHearts();
        });
    });

    // ── [Pagination] ──
    document.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.onclick = () => showToast('Pagination is demo-only in this build.');
    });

    // Handle initial search from URL
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    if (q) {
        const input = document.getElementById('listing-search-input');
        if (input) {
            input.value = q;
            applyFilters();
        }
    }
}

function initBuyerMapPage() {
    console.log('Initializing Map with India bounds...');
    if (typeof L === 'undefined') {
        console.error('Leaflet is not loaded!');
        return;
    }

    const indiaBounds = L.latLngBounds(
        L.latLng(6.5, 68.1), // Southwest
        L.latLng(35.6, 97.4)  // Northeast
    );

    const urlParams = new URLSearchParams(window.location.search);
    const latParam = urlParams.get('lat');
    const lngParam = urlParams.get('lng');
    const qParam = urlParams.get('q');
    
    let initialCenter = [19.0760, 72.8777]; // Mumbai Center
    let initialZoom = 13;

    if (latParam && lngParam) {
        initialCenter = [parseFloat(latParam), parseFloat(lngParam)];
        initialZoom = 15;
    }

    const map = L.map('map', {
        center: initialCenter,
        zoom: initialZoom,
        maxBounds: indiaBounds,
        maxBoundsViscosity: 1.0, 
        zoomControl: false
    });
    
    // Toast the searched location if available
    if (qParam) {
        setTimeout(() => {
            if (typeof showToast === 'function') showToast(`Showing results near ${escHtml(qParam.split(',')[0])}`);
        }, 800);
    }
    
    // Set dynamic minZoom so user cannot zoom out larger than India
    map.setMinZoom(map.getBoundsZoom(indiaBounds));

    // Add Zoom Control to bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add Tile Layer (Limited to India bounds)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; EstatePro India',
        subdomains: 'abcd',
        maxZoom: 18,
        bounds: indiaBounds // This prevents loading tiles outside India bounds
    }).addTo(map);

    // Set map background to match the "empty" areas
    document.getElementById('map').style.background = '#ebebeb'; // Typical map gray



    // Load Listings from DEMO_LISTINGS
    const listings = window.DEMO_LISTINGS || [];
    
    // Use coordinates from demo data
    const markersData = listings.filter(l => l.coords).map(l => {
        return { ...l, lat: l.coords[0], lng: l.coords[1] };
    });

    const markers = [];
    let activeListingId = null;
    let isProgrammaticMove = false; // to prevent updateSidebar on flyTo

    function selectListing(id, fromMap = false) {
        activeListingId = id;
        
        const markerObj = markers.find(m => m.data.id == id);
        
        if (!fromMap && markerObj) {
            isProgrammaticMove = true;
            map.flyTo([markerObj.data.lat, markerObj.data.lng], 15, { animate: true, duration: 0.5 });
            markerObj.marker.openPopup();
            setTimeout(() => { isProgrammaticMove = false; }, 600); // Wait for flyTo
        }

        updateSidebar(); // Re-render sidebar to apply active styles
        
        // Highlight active pin
        document.querySelectorAll('.custom-price-pin').forEach(el => el.classList.remove('active-pin'));
        const pinEl = document.getElementById(`pin-${id}`);
        if (pinEl) pinEl.classList.add('active-pin');

        if (fromMap) {
            setTimeout(() => {
                const cardEl = document.getElementById(`card-${id}`);
                if (cardEl) {
                    cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    }

    markersData.forEach(p => {
        const icon = L.divIcon({
            className: 'bg-transparent border-none', // Leaflet container
            html: `<div class="custom-price-pin cursor-pointer" style="transform: translate(-50%, -100%); margin-top: -5px;" id="pin-${p.id}">${escHtml(p.price)}${p.intent === 'Rent' ? '' : ' Cr'}</div>`,
            iconSize: [0, 0],
            iconAnchor: [0, 0]
        });

        const marker = L.marker([p.lat, p.lng], { icon }).addTo(map);
        
        marker.bindPopup(`
            <div class="p-2 min-w-[150px]">
                <h4 class="font-bold text-sm text-slate-900">${window.formatPrice ? window.formatPrice(p.price, p.intent) : p.price}</h4>
                <p class="text-xs font-medium text-slate-500 mt-0.5">${escHtml(p.title)}</p>
                <div class="flex items-center gap-2 mt-2 text-slate-600 text-[10px] font-bold">
                    <span>${p.beds} BEDS</span> &bull; <span>${p.baths} BATHS</span>
                </div>
                <button onclick="window.location.href='property-details.html?id=${p.id}'" class="mt-3 w-full bg-slate-900 text-white px-3 py-1.5 rounded text-[10px] uppercase font-bold hover:bg-slate-800 transition-colors">View Details</button>
            </div>
        `, { closeButton: false, offset: [0, -35] });

        marker.on('click', () => {
            selectListing(p.id, true);
        });

        markers.push({ marker, data: p });
    });

    const sidebarContainer = document.querySelector('.overflow-y-auto.p-6');
    const matchesCountEl = document.querySelector('#map-listings-count');

    window.toggleMapFavorite = function(e, id) {
        e.stopPropagation(); // prevent card click
        let saved = JSON.parse(localStorage.getItem('savedProperties') || '[]');
        if (saved.includes(id)) {
            saved = saved.filter(savedId => savedId != id);
            if (typeof showToast === 'function') showToast('Removed from favorites');
        } else {
            saved.push(id);
            if (typeof showToast === 'function') showToast('Added to favorites');
        }
        localStorage.setItem('savedProperties', JSON.stringify(saved));
        updateSidebar(); 
    };

    window.clickSidebarCard = function(id) {
        selectListing(id, false);
    };

    function updateSidebar() {
        if (isProgrammaticMove) return;

        const bounds = map.getBounds();
        const visibleListings = markersData.filter(p => bounds.contains([p.lat, p.lng]));
        
        if (matchesCountEl) {
            matchesCountEl.textContent = `${visibleListings.length} MATCHES FOUND`;
        }

        if (!sidebarContainer) return;

        if (visibleListings.length === 0) {
            sidebarContainer.innerHTML = '<p class="text-slate-500 text-center mt-10">No properties found in this map area. Zoom out or pan to see more.</p>';
            return;
        }

        let saved = JSON.parse(localStorage.getItem('savedProperties') || '[]');

        sidebarContainer.innerHTML = visibleListings.map(l => {
            const isSaved = saved.includes(l.id);
            const isActive = activeListingId == l.id;
            const activeClasses = isActive ? 'ring-4 ring-slate-900 shadow-2xl scale-[1.02]' : 'border-slate-100 hover:shadow-xl';
            
            return `
            <div id="card-${l.id}" class="listing-card cursor-pointer bg-white rounded-3xl border ${activeClasses} overflow-hidden transition-all duration-300" onclick="clickSidebarCard(${l.id})">
              <div class="aspect-[16/9] overflow-hidden relative bg-slate-100">
                <img loading="lazy" src="${l.img || 'https://via.placeholder.com/400x225?text=House'}" class="w-full h-full object-cover transition-transform duration-700 ${isActive ? '' : 'group-hover:scale-105'}">
                <div class="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">${escHtml(l.badge || l.intent)}</div>
              </div>
              <div class="p-5">
                <div class="flex justify-between items-start mb-1">
                  <h3 class="text-xl font-black text-slate-900">${window.formatPrice ? window.formatPrice(l.price, l.intent) : l.price}</h3>
                  <button class="transition-colors ${isSaved ? 'text-red-500' : 'text-slate-200 hover:text-red-500'}" onclick="toggleMapFavorite(event, ${l.id})">
                    <span class="material-symbols-outlined text-[24px]" style="font-variation-settings: 'FILL' ${isSaved ? '1' : '0'};">favorite</span>
                  </button>
                </div>
                <p class="text-slate-500 text-sm font-medium mb-4 truncate">${escHtml(l.title)}, ${escHtml(l.location)}</p>
                <div class="flex flex-wrap items-center gap-y-2 gap-x-4 text-slate-400">
                  <div class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[18px]">bed</span>
                    <span class="text-xs font-black text-slate-900">${l.beds}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[18px]">bathtub</span>
                    <span class="text-xs font-black text-slate-900">${l.baths}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[18px]">square_foot</span>
                    <span class="text-xs font-black text-slate-900">${l.sqft.toLocaleString()} <span class="font-normal text-slate-400">sqft</span></span>
                  </div>
                </div>
              </div>
            </div>
            `;
        }).join('');

        // Apply active pin class safely
        document.querySelectorAll('.custom-price-pin').forEach(el => el.classList.remove('active-pin'));
        if (activeListingId) {
            const pinEl = document.getElementById(`pin-${activeListingId}`);
            if (pinEl) pinEl.classList.add('active-pin');
        }
    }

    map.on('moveend', updateSidebar);
    
    // Deselect if clicking on empty map area
    map.on('click', (e) => {
        // if user clicked on a marker, the click event on the marker fires, but we don't want this map click to override it
        // Leaflet fires marker click, then map click usually if not stopped. 
        // We handle that by checking event target or just relying on marker click stopping propagation.
    });
    
    setTimeout(updateSidebar, 100);

    // ── [Map Search Bar Navigation] ──
    const searchInput = document.getElementById('map-location-search');
    const searchBtn = document.getElementById('map-search-btn');
    const resultsContainer = document.getElementById('map-search-results');
    let debounceTimer;

    if (searchBtn && searchInput) {
        searchBtn.onclick = () => {
            const val = searchInput.value.trim();
            if (val) {
                 fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&countrycodes=IN&limit=1`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.length > 0) {
                            const item = data[0];
                            map.flyTo([item.lat, item.lon], 15, { animate: true, duration: 1 });
                            if (typeof showToast === 'function') showToast(`Showing results near ${item.display_name.split(',')[0]}`);
                        }
                    });
            }
        };

        // Enter key support
        searchInput.onkeypress = (e) => {
            if (e.key === 'Enter') searchBtn.click();
        };

        // OpenStreetMap Autocomplete
        if (resultsContainer) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                const query = e.target.value.trim();
                if (query.length < 3) {
                    resultsContainer.classList.add('hidden');
                    return;
                }
                
                debounceTimer = setTimeout(() => {
                    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=IN&limit=5`)
                        .then(res => res.json())
                        .then(data => {
                            resultsContainer.innerHTML = '';
                            if (data.length === 0) {
                                resultsContainer.innerHTML = '<div class="p-4 text-sm text-slate-500 font-medium">No locations found in India.</div>';
                            } else {
                                data.forEach(item => {
                                    const div = document.createElement('div');
                                    div.className = 'px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors flex items-center gap-3';
                                    div.innerHTML = `<span class="material-symbols-outlined text-slate-400 text-[18px]">location_on</span><span class="text-xs font-medium text-slate-700 truncate" title="${item.display_name}">${item.display_name}</span>`;
                                    div.onclick = () => {
                                        searchInput.value = item.display_name.split(',')[0];
                                        resultsContainer.classList.add('hidden');
                                        map.flyTo([item.lat, item.lon], 15, { animate: true, duration: 1 });
                                        if (typeof showToast === 'function') showToast(`Showing results near ${item.display_name.split(',')[0]}`);
                                    };
                                    resultsContainer.appendChild(div);
                                });
                            }
                            resultsContainer.classList.remove('hidden');
                            resultsContainer.classList.add('flex');
                        })
                        .catch(err => console.error('Nominatim error:', err));
                }, 300);
            });

            // Hide dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
                    resultsContainer.classList.add('hidden');
                    resultsContainer.classList.remove('flex');
                }
            });
        }
    }
}

function initBuyerDetailsPage() {
    // ── [Photo Overlay Toast] ──
    const photoBtn = Array.from(document.querySelectorAll('span, div')).find((s) => s.textContent.includes('View All 24 Photos'))?.closest('div');
    if (photoBtn) {
        photoBtn.classList.add('cursor-pointer');
        photoBtn.addEventListener('click', () => showToast('Pagination is demo-only in this build.'));
    }

    // Inquiry form validation and submission
    const form = document.getElementById('buyer-inquiry-form');
    const submitBtn = document.getElementById('contact-agent-btn');
    
    if (form && submitBtn) {
        submitBtn.onclick = (e) => {
            e.preventDefault();
            const firstName = document.getElementById('buyer-first-name')?.value?.trim();
            const email = document.getElementById('buyer-email')?.value?.trim();
            const message = document.getElementById('buyer-message')?.value?.trim();

            if (!firstName || !email || !message) {
                showToast('Please fill in required fields: First Name, Email, and Message.');
                return;
            }

            const phone = document.getElementById('buyer-phone')?.value?.trim();
            const fullName = `${firstName} ${document.getElementById('buyer-last-name')?.value || ''}`.trim();
            const type = document.getElementById('inquiry-type')?.value || 'Inquiry';
            
            // Consolidate message with phone if provided
            const finalMessage = phone ? `${message} (Contact: ${phone})` : message;

            // Save to localStorage
            const inquiries = getInquiries();
            inquiries.unshift({
                id: Date.now(),
                name: fullName,
                time: formatTimeLabel(),
                message: finalMessage,
                type: type,
                read: false,
                brokerReply: ''
            });
            saveInquiries(inquiries);

            showToast('Inquiry submitted successfully. Broker will contact you soon.');
            form.reset();
        };
    }
}

function initSellPage() {
    const form = document.getElementById('valuation-form');
    if (!form) return;

    form.onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('val-name')?.value?.trim();
        const email = document.getElementById('val-email')?.value?.trim();
        const address = document.getElementById('val-address')?.value?.trim();

        if (!name || !email || !address) {
            showToast('Please fill in all required fields.');
            return;
        }

        showToast('Valuation request submitted. Our team will contact you within 24 hours.');
        form.reset();
    };
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

// ─── Global Navbar Search ─────────────────────────────────────────────────────
document.querySelectorAll('input[placeholder="Search..."]').forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            if (query) {
                // If we are already on properties page, just fill the local search and trigger click
                if (window.location.pathname.includes('properties.html')) {
                    const pageSearch = document.getElementById('listing-search-input');
                    const btn = document.getElementById('find-homes-btn');
                    if (pageSearch && btn) {
                        pageSearch.value = query;
                        btn.click();
                        return;
                    }
                }
                // Otherwise navigate to properties page
                navigateTo(`properties.html?q=${encodeURIComponent(query)}`);
            }
        }
    });

    // ── Global Buyer Welcome Modal ──
    if (userRole === 'Buyer' && !isLoginPage) {
        const showWelcome = localStorage.getItem('showWelcome');
        if (showWelcome) {
            // Clear immediately so it never appears again, even if user navigates away without clicking
            localStorage.removeItem('showWelcome');

            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 opacity-0 transition-opacity duration-500';
            modal.innerHTML = `
                <div class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform scale-95 transition-transform duration-500 text-center">
                    <div class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span class="material-symbols-outlined text-4xl">celebration</span>
                    </div>
                    <h2 class="text-3xl font-black text-slate-900 mb-2 tracking-tight">Welcome, ${showWelcome}!</h2>
                    <p class="text-slate-500 mb-8 font-medium">Your buyer account is ready. Explore premium properties, save your favorites, and contact top brokers instantly.</p>
                    <button id="close-welcome" class="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors shadow-lg active:scale-[0.98]">
                        Start Exploring
                    </button>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Small delay so CSS transition plays correctly on first paint
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    modal.classList.remove('opacity-0');
                    modal.querySelector('div').classList.remove('scale-95');
                });
            });

            document.getElementById('close-welcome').onclick = () => {
                modal.classList.add('opacity-0');
                modal.querySelector('div').classList.add('scale-95');
                setTimeout(() => modal.remove(), 400);
            };
        }
    }
});
