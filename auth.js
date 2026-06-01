import { supabase } from './lib/supabase.js';

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

function showToast(message, isError = false) {
    const existingToast = document.querySelector('.global-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'global-toast fixed bottom-6 right-6 z-[250] bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 transition-all duration-300 transform translate-y-0 opacity-100';
    if (isError) {
        toast.classList.remove('bg-slate-900');
        toast.classList.add('bg-red-600');
    }
    
    const iconName = isError ? 'error' : 'check_circle';
    const iconColor = isError ? 'text-white' : 'text-green-400';
    
    toast.innerHTML = `<span class="material-symbols-outlined ${iconColor} text-[18px]">${iconName}</span><span>${message}</span>`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.remove('opacity-100');
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 2200);
}

window.showToast = showToast;

const leetMap = {
    'a': '[a@44*]',
    'b': '[b8*]',
    'c': '[c(k*]',
    'd': '[d*]',
    'e': '[e3*]',
    'f': '[f*]',
    'g': '[g9*]',
    'h': '[h*]',
    'i': '[i1!*|]',
    'j': '[j*]',
    'k': '[k*]',
    'l': '[l1|*]',
    'm': '[m*]',
    'n': '[n*]',
    'o': '[o0*]',
    'p': '[p*]',
    'q': '[q*]',
    'r': '[r*]',
    'z': '[z*]',
    's': '[s$5*]',
    't': '[t7*]',
    'u': '[uv*]',
    'v': '[v*]',
    'w': '[w*]',
    'x': '[x*]',
    'y': '[y*]'
};

function makePattern(word, boundaryStart = false, boundaryEnd = false, notPrecededByS = false) {
    const parts = [];
    for (let i = 0; i < word.length; i++) {
        const char = word[i];
        const pattern = leetMap[char] || char;
        parts.push(pattern);
    }
    const separator = '[@*#%!$_\\-\\s.\\d]*';
    let innerPattern = parts.join(separator);
    
    if (notPrecededByS) {
        innerPattern = '(?<![sS])' + innerPattern;
    }
    
    let patternStr = innerPattern;
    if (boundaryStart) patternStr = '\\b' + patternStr;
    if (boundaryEnd) patternStr = patternStr + '\\b';
    
    return new RegExp(patternStr, 'i');
}

const substringWords = [
    'fuck', 'shit', 'bitch', 'cunt', 'pussy', 'whore', 'slut', 'faggot', 'bastard', 'chink', 'retard',
    'asshole', 'badass', 'dumbass', 'jackass'
];

const standaloneWords = [
    'ass', 'asses', 'dick', 'dicks'
];

const patterns = [
    ...substringWords.map(w => makePattern(w, false, false, w === 'nigger')),
    makePattern('nigger', false, false, true),
    ...standaloneWords.map(w => makePattern(w, true, true))
];

function hasProfanity(text) {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return patterns.some(regex => regex.test(lowerText));
}

window.hasProfanity = hasProfanity;


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
    'Employee': ['employee-panel.html', 'broker-dashboard.html', 'properties.html', 'map.html', 'property-details.html', 'profile.html'],
    'Broker':   ['broker-dashboard.html', 'properties.html', 'map.html', 'property-details.html', 'profile.html'],
    'Buyer':    buyerPages,
    'Guest':    guestPages
};

// ─── Global Auth Guard (synchronous) ──────────────────────────────────────────

// ─── Global Auth Guard (asynchronous) ──────────────────────────────────────────

const isLoginPage = currentPage === 'login.html' || currentPage === 'staff-login.html';

async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    
    // For Guest access, we check if they have a 'Guest' role in localStorage
    // or if they are on a guest-allowed page.
    const localRole = localStorage.getItem('role');

    const isGuestPage = guestPages.includes(currentPage);

    if (!session && localRole !== 'Guest' && !isLoginPage) {
        if (isGuestPage) {
            localStorage.setItem('role', 'Guest');
        } else {
            navigateTo('login.html');
            return;
        }
    }

    let role = localRole;
    if (!session && isGuestPage) {
        role = 'Guest';
        localStorage.setItem('role', 'Guest');
    }

    if (session) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        if (profile) {
            role = profile.role;
            const activeRole = localStorage.getItem('role');
            if (role === 'Admin' && (activeRole === 'Broker' || activeRole === 'Employee' || activeRole === 'Admin')) {
                role = activeRole;
            } else {
                localStorage.setItem('role', role); // Sync for sync checks
            }
        }
    }

    if (isLoginPage) {
        if (session && role) {
            navigateTo(roleHomePage[role] || 'index.html');
        }
    } else {
        const allowed = roleAllowedPages[role || 'Guest'];
        if (allowed && !allowed.includes(currentPage)) {
            navigateTo(roleHomePage[role || 'Guest']);
        } else {
            if (typeof updateHeaderVisibility === 'function') {
                updateHeaderVisibility();
            }
        }
    }
}

checkAuth();

// ─── Exported functions ───────────────────────────────────────────────────────

window.login = async function(role, name, targetRole = null) {
    if (role === 'Guest') {
        localStorage.setItem('role', 'Guest');
        navigateTo(roleHomePage['Guest']);
        return;
    }
    // For other roles, we expect Supabase session to handle it
    // But we'll keep the role in localStorage for synchronous checks if needed
    localStorage.setItem('role', targetRole || role);
    if (name) localStorage.setItem('userName', name);
    
    // Admin can bypass to different dashboards depending on selected role
    if (role === 'Admin' && targetRole && roleHomePage[targetRole]) {
        navigateTo(roleHomePage[targetRole]);
    } else {
        navigateTo(roleHomePage[role] || 'index.html');
    }
};

window.logout = async function() {
    await supabase.auth.signOut();
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
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
        const urlParams   = new URLSearchParams(window.location.search);
        let isSignUp      = urlParams.get('mode') === 'signup';

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
                    nameField.style.display = 'none';
                }
            }
        }

        function resetRoleTabs() {
            roleButtons.forEach(b => {
                b.className = 'flex-1 py-2.5 px-3 text-center text-[10px] font-black uppercase tracking-widest rounded-lg role-tab-inactive hover:text-slate-900 transition-colors';
            });
        }

        function selectRole(role) {
            selectedRole = role;
            resetRoleTabs();
            
            const btn = Array.from(roleButtons).find(b => b.textContent.trim() === role);
            if (btn) {
                btn.className = 'flex-1 py-2.5 px-3 text-center text-[10px] font-black uppercase tracking-widest rounded-lg role-tab-active font-bold scale-105 transition-all';
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
        const urlRole = urlParams.get('role');
        if (urlRole) selectRole(urlRole);
        else selectRole(currentPage === 'staff-login.html' ? 'Admin' : 'Buyer');

        // Handle Enter key in form
        const authForm = document.querySelector('form');
        if (authForm) {
            authForm.onsubmit = (e) => {
                e.preventDefault();
                if (signInBtn && !signInBtn.disabled) signInBtn.click();
            };
        }

        // Sign In button
        if (signInBtn) {
            signInBtn.onclick = async (e) => {
                e.preventDefault();
                const email = document.getElementById('input-email')?.value?.trim();
                const password = document.getElementById('input-password')?.value?.trim();
                const name = document.getElementById('input-name')?.value?.trim() || '';
                
                if (!email || !password) {
                    showToast('Please enter both email and password.');
                    return;
                }

                if (isSignUp && !name) {
                    showToast('Please enter your name to create an account.');
                    return;
                }

                signInBtn.disabled = true;
                signInBtn.textContent = 'Processing...';

                try {
                    if (isSignUp) {
                        const { data, error } = await supabase.auth.signUp({
                            email,
                            password,
                        });
                        if (error) throw error;
                        
                        if (data.user) {
                            // Create profile
                            const { error: profileError } = await supabase.from('profiles').insert({
                                id: data.user.id,
                                full_name: name,
                                role: selectedRole
                            });
                            if (profileError) throw profileError;
                        }

                        showToast('Account created successfully!');
                        
                        if (data.session) {
                            // Automatically sign in if email confirmation is disabled
                            window.login(selectedRole, name);
                            return;
                        }

                        isSignUp = false;
                        updateUI();
                    } else {
                        const { data, error } = await supabase.auth.signInWithPassword({
                            email,
                            password
                        });
                        if (error) throw error;

                        // Fetch profile to get role
                        const { data: profile, error: profileError } = await supabase
                            .from('profiles')
                            .select('role, full_name')
                            .eq('id', data.user.id)
                            .single();
                        
                        if (profileError) throw profileError;

                        let matched = (profile.role === selectedRole);
                        if (!matched && profile.role === 'Admin' && (selectedRole === 'Broker' || selectedRole === 'Employee' || selectedRole === 'Admin')) {
                            matched = true;
                        }
                        if (!matched) {
                            await supabase.auth.signOut();
                            throw new Error(`This account is registered as a ${profile.role}. Please select the correct role above.`);
                        }

                        window.login(profile.role, profile.full_name, selectedRole);
                    }
                } catch (err) {
                    console.error('Authentication error:', err);
                    // Detailed error message if available
                    let msg = err.message || 'Authentication failed.';
                    if (err.status === 400 && msg.toLowerCase().includes('invalid')) {
                        msg = 'Invalid email or password format. Please check your details.';
                    }
                    showToast(msg);
                } finally {
                    signInBtn.disabled = false;
                    signInBtn.textContent = isSignUp ? 'Create Account' : 'Sign In';
                }
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
        const currentRole = localStorage.getItem('role') || 'Guest';
        const isStaff = ['Admin', 'Employee', 'Broker'].includes(currentRole);
        
        // Find the trailing actions container by looking for the standard navigation items
        const accountIcon = Array.from(document.querySelectorAll('.material-symbols-outlined')).find(el => 
            el.textContent.trim() === 'account_circle' || 
            el.textContent.trim() === 'logout'
        );
        let container = accountIcon ? accountIcon.closest('.flex.items-center.gap-4') : null;
        
        // Fallback query if standard icon isn't found (e.g. already replaced with Sign In button)
        if (!container) {
            const signInBtn = Array.from(document.querySelectorAll('button, a')).find(el => 
                el.textContent.trim().includes('Sign In') || el.textContent.trim().includes('Sign Up')
            );
            if (signInBtn) {
                container = signInBtn.closest('.flex.items-center.gap-4');
            }
        }

        if (container) {
            if (currentRole === 'Guest') {
                container.innerHTML = `
                    <button onclick="window.location.href=window.toAppUrl('login.html')" class="text-slate-600 hover:text-slate-900 transition-colors font-bold text-xs uppercase tracking-wider px-3 py-2">
                        Sign In
                    </button>
                    <button onclick="window.location.href=window.toAppUrl('login.html?mode=signup')" class="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-bold text-xs hover:bg-slate-800 transition-colors uppercase tracking-wider shadow-sm ml-2">
                        Sign Up
                    </button>
                `;
            } else if (currentRole === 'Buyer') {
                container.innerHTML = `
                    <button onclick="window.location.href=window.toAppUrl('profile.html')" class="text-slate-500 hover:text-slate-900 transition-colors flex items-center" title="Signed in as Buyer — Go to Profile">
                        <span class="material-symbols-outlined text-[24px]">account_circle</span>
                    </button>
                    <button onclick="if(confirm('Are you sure you want to sign out?')) window.logout()" class="text-slate-500 hover:text-slate-900 transition-colors flex items-center ml-2" title="Sign Out">
                        <span class="material-symbols-outlined text-[24px]">logout</span>
                    </button>
                `;
            } else {
                container.innerHTML = `
                    <a href="${window.toAppUrl(roleHomePage[currentRole] || 'index.html')}" class="bg-slate-900 text-white px-5 py-2 rounded-lg font-bold text-xs hover:bg-slate-800 transition-colors uppercase tracking-wider shadow-sm mr-2 flex items-center">
                        Dashboard
                    </a>
                    <button onclick="if(confirm('Are you sure you want to sign out?')) window.logout()" class="text-slate-500 hover:text-slate-900 transition-colors flex items-center" title="Signed in as ${currentRole} — Sign Out">
                        <span class="material-symbols-outlined text-[24px]">logout</span>
                    </button>
                `;
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

        // Retrieve and apply the uploaded avatar from broker_avatar_${userId} localStorage key
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                const cachedAvatar = localStorage.getItem(`broker_avatar_${session.user.id}`);
                if (cachedAvatar) {
                    const profileImgEl = document.getElementById('broker-profile-img');
                    if (profileImgEl) {
                        profileImgEl.src = cachedAvatar;
                    }
                }
            }
        });

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
                        tab.classList.remove('block', 'flex');
                    });
                    
                    // Show target tab
                    const targetEl = document.getElementById(targetId);
                    if (targetEl) {
                        targetEl.classList.remove('hidden');
                        if (targetId === 'tab-messages') {
                            targetEl.classList.add('flex');
                            if (typeof initBrokerChat === 'function') initBrokerChat();
                        } else {
                            targetEl.classList.add('block');
                        }
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
            downloadBtn.addEventListener('click', async () => {
                const { data: { user } } = await supabase.auth.getUser();
                let listings = await getListings();
                if (user) {
                    listings = listings.filter(l => l.broker_id === user.id);
                }
                const inquiries = await getInquiries();
                const report = {
                    generatedAt: new Date().toISOString(),
                    broker: localStorage.getItem('userName') || 'Broker',
                    listings: listings,
                    inquiries: inquiries
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

async function getListings() {
    const { data, error } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
    if (error) {
        console.error('Error fetching listings:', error);
        return [];
    }
    return data;
}

async function saveListings(listings) {
    // This function is no longer needed in its old form as we save individual items
}

async function initListingsManager() {
    await renderListings();
    injectListingModal();
}

async function renderListings() {
    const { data: { user } } = await supabase.auth.getUser();
    let listings = await getListings();
    
    // Filter listings so the broker only sees and manages their own listings
    if (user) {
        listings = listings.filter(l => l.broker_id === user.id);
    }
    
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
              <img src="${l.img || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'}" alt="Property" class="w-12 h-12 rounded object-cover shadow-sm border border-outline-variant">
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
          ${showViews ? `<td class="p-4">${(l.views || 0).toLocaleString()}</td>` : ''}
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

async function deleteListing(id) {
    if (!confirm('Delete this listing?')) return;
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) {
        showToast('Error deleting listing: ' + error.message);
    } else {
        showToast('Listing deleted.');
        await renderListings();
    }
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

async function openListingModal(id) {
    const modal = document.getElementById('listing-modal');
    
    // Reset any validation warnings
    const errorBanner = document.getElementById('modal-validation-error');
    if (errorBanner) {
        errorBanner.classList.add('hidden');
        errorBanner.classList.remove('flex');
        const textSpan = errorBanner.querySelector('span:last-child');
        if (textSpan) textSpan.textContent = 'Please fill in all fields with valid information before saving.';
    }
    const inputsToReset = [
        'modal-prop-title', 'modal-location', 'modal-price', 
        'modal-intent', 'modal-type', 'modal-status', 
        'modal-beds', 'modal-baths', 'modal-sqft', 
        'modal-lat', 'modal-lng'
    ];
    inputsToReset.forEach(inputId => {
        const el = document.getElementById(inputId);
        if (el) {
            el.classList.remove('border-red-500', 'ring-2', 'ring-red-100');
            el.classList.add('border-outline-variant');
        }
    });
    const uploadZoneEl = document.getElementById('modal-upload-zone');
    if (uploadZoneEl) {
        uploadZoneEl.classList.remove('border-red-500', 'bg-red-50/20');
        uploadZoneEl.classList.add('border-slate-200');
    }

    let listing = null;
    if (id) {
        const { data, error } = await supabase.from('listings').select('*').eq('id', id).single();
        if (error) {
            showToast('Error fetching listing: ' + error.message);
            return;
        }
        listing = data;
    }

    document.getElementById('modal-title').textContent   = listing ? 'Edit Listing' : 'Add New Listing';
    document.getElementById('modal-id').value            = listing ? listing.id : '';
    document.getElementById('modal-prop-title').value    = listing ? listing.title    : '';
    document.getElementById('modal-location').value      = listing ? listing.location  : '';
    document.getElementById('modal-price').value         = listing ? listing.price     : '';
    document.getElementById('modal-intent').value        = listing ? listing.intent    : 'Buy';
    document.getElementById('modal-type').value          = listing ? listing.type      : 'Apartment';
    document.getElementById('modal-status').value        = listing ? listing.status    : 'Active';
    document.getElementById('modal-beds').value          = listing ? listing.beds      : '0';
    document.getElementById('modal-baths').value         = listing ? listing.baths     : '0';
    document.getElementById('modal-sqft').value          = listing ? listing.sqft      : '0';
    document.getElementById('modal-views').value         = listing ? listing.views     : '0';
    document.getElementById('modal-lat').value           = listing ? (listing.lat || '') : '';
    document.getElementById('modal-lng').value           = listing ? (listing.lng || '') : '';
    const imgUrl = listing ? (listing.img || '') : '';
    document.getElementById('modal-img').value = imgUrl;

    const previewEl = document.getElementById('modal-image-preview');
    const previewImg = document.getElementById('modal-preview-img');
    const uploadZone = document.getElementById('modal-upload-zone');
    const fileInput = document.getElementById('modal-file-input');

    if (previewEl && previewImg && uploadZone) {
        if (imgUrl) {
            previewImg.src = imgUrl;
            previewEl.classList.remove('hidden');
            uploadZone.classList.add('hidden');
        } else {
            previewEl.classList.add('hidden');
            uploadZone.classList.remove('hidden');
            if (fileInput) fileInput.value = '';
        }
    }

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

async function saveListingForm() {
    const id       = document.getElementById('modal-id').value;
    const titleEl    = document.getElementById('modal-prop-title');
    const locationEl = document.getElementById('modal-location');
    const priceEl    = document.getElementById('modal-price');
    const intentEl   = document.getElementById('modal-intent');
    const typeEl     = document.getElementById('modal-type');
    const statusEl   = document.getElementById('modal-status');
    const bedsEl     = document.getElementById('modal-beds');
    const bathsEl    = document.getElementById('modal-baths');
    const sqftEl     = document.getElementById('modal-sqft');
    const latEl      = document.getElementById('modal-lat');
    const lngEl      = document.getElementById('modal-lng');
    const uploadZone = document.getElementById('modal-upload-zone');
    const imgEl      = document.getElementById('modal-img');

    const title    = titleEl.value.trim();
    const location = locationEl.value.trim();
    const price    = parseFloat(priceEl.value) || 0;
    const intent   = intentEl.value;
    const type     = typeEl.value;
    const status   = statusEl.value;
    const beds     = parseInt(bedsEl.value) || 0;
    const baths    = parseFloat(bathsEl.value) || 0;
    const sqft     = parseInt(sqftEl.value) || 0;
    const views    = parseInt(document.getElementById('modal-views').value) || 0;
    const lat      = parseFloat(latEl.value) || null;
    const lng      = parseFloat(lngEl.value) || null;
    const img      = imgEl.value.trim();

    // Reset styles
    [titleEl, locationEl, priceEl, intentEl, typeEl, statusEl, bedsEl, bathsEl, sqftEl, latEl, lngEl].forEach(el => {
        if (el) {
            el.classList.remove('border-red-500', 'ring-2', 'ring-red-100');
            el.classList.add('border-outline-variant');
        }
    });
    if (uploadZone) {
        uploadZone.classList.remove('border-red-500', 'bg-red-50/20');
        uploadZone.classList.add('border-slate-200');
    }

    let hasErrors = false;
    function markInvalid(el) {
        if (el) {
            el.classList.remove('border-outline-variant');
            el.classList.add('border-red-500', 'ring-2', 'ring-red-100');
            hasErrors = true;
        }
    }

    if (title === '') markInvalid(titleEl);
    if (location === '') markInvalid(locationEl);
    if (img === '') {
        if (uploadZone) {
            uploadZone.classList.remove('border-slate-200');
            uploadZone.classList.add('border-red-500', 'bg-red-50/20');
        }
        hasErrors = true;
    }
    if (priceEl.value.trim() === '' || price <= 0) markInvalid(priceEl);
    if (intent === '') markInvalid(intentEl);
    if (type === '') markInvalid(typeEl);
    if (status === '') markInvalid(statusEl);
    if (bedsEl.value.trim() === '' || beds < 0) markInvalid(bedsEl);
    if (bathsEl.value.trim() === '' || baths < 0) markInvalid(bathsEl);
    if (sqftEl.value.trim() === '' || sqft <= 0) markInvalid(sqftEl);
    if (latEl.value.trim() === '' || isNaN(lat) || lat < -90 || lat > 90) markInvalid(latEl);
    if (lngEl.value.trim() === '' || isNaN(lng) || lng < -180 || lng > 180) markInvalid(lngEl);

    let profanityFound = false;
    if (window.hasProfanity && (window.hasProfanity(title) || window.hasProfanity(location))) {
        profanityFound = true;
        if (window.hasProfanity(title)) markInvalid(titleEl);
        if (window.hasProfanity(location)) markInvalid(locationEl);
    }

    const errorBanner = document.getElementById('modal-validation-error');
    if (profanityFound) {
        if (errorBanner) {
            const textSpan = errorBanner.querySelector('span:last-child');
            if (textSpan) textSpan.textContent = 'Offensive language detected. Please refrain from using cuss words.';
            errorBanner.classList.remove('hidden');
            errorBanner.classList.add('flex');
            errorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        showToast('Offensive language detected in input fields.');
        return;
    }

    if (hasErrors) {
        if (errorBanner) {
            const textSpan = errorBanner.querySelector('span:last-child');
            if (textSpan) textSpan.textContent = 'Please fill in all fields with valid information before saving.';
            errorBanner.classList.remove('hidden');
            errorBanner.classList.add('flex');
            errorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        showToast('Please correct the highlighted fields before saving.');
        return;
    } else {
        if (errorBanner) {
            errorBanner.classList.add('hidden');
            errorBanner.classList.remove('flex');
        }
    }

    const { data: { user } } = await supabase.auth.getUser();
    const listingData = { 
        title, location, price, intent, type, status, beds, baths, sqft, views, lat, lng, img,
        broker_id: user ? user.id : null
    };

    let result;
    if (id) {
        result = await supabase.from('listings').update(listingData).eq('id', id);
    } else {
        result = await supabase.from('listings').insert([listingData]);
    }

    if (result.error) {
        showToast('Error saving listing: ' + result.error.message);
    } else {
        showToast('Listing saved successfully.');
        await renderListings();
        closeListingModal();
    }
}

window.saveListingForm = saveListingForm;

function injectListingModal() {
    if (document.getElementById('listing-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'listing-modal';
    modal.className = 'hidden fixed inset-0 z-[100] items-center justify-center bg-black/50 backdrop-blur-sm';
    modal.innerHTML = `
      <div class="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden border border-outline-variant">
        <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-low">
          <h3 id="modal-title" class="font-h3 text-h3 text-primary">Add New Listing</h3>
          <button onclick="closeListingModal()" class="text-slate-400 hover:text-slate-700 transition-colors">
            <span class="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>
        <div class="p-6 overflow-y-auto max-h-[70vh]">
          <div id="modal-validation-error" class="hidden mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">warning</span>
            <span>Please fill in all fields with valid information before saving.</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="hidden" id="modal-id"/>
            <input type="hidden" id="modal-views"/>
            <div class="md:col-span-2">
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Property Title *</label>
              <input id="modal-prop-title" type="text" placeholder="e.g. 12 Marine Drive, Penthouse" class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-transparent"/>
            </div>
            <div class="md:col-span-2 relative">
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Location *</label>
              <div class="relative">
                <input id="modal-location" type="text" autocomplete="off" placeholder="e.g. Bandra West, Mumbai" class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-transparent"/>
                <div id="modal-location-results" class="absolute left-0 right-0 mt-1 bg-surface-container-lowest rounded-lg shadow-xl border border-outline-variant hidden flex-col max-h-60 overflow-y-auto z-50"></div>
              </div>
            </div>
            <div class="md:col-span-2">
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Property Media (Image) *</label>
              <div id="modal-upload-zone" class="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary hover:bg-slate-50/50 transition-all flex flex-col items-center justify-center gap-2 bg-surface-container-low">
                <span class="material-symbols-outlined text-[32px] text-slate-400">cloud_upload</span>
                <p class="text-sm font-medium text-slate-600">Drag & drop your property photo here, or <span class="text-primary font-bold">browse</span></p>
                <p class="text-xs text-slate-400">Supports PNG, JPG, JPEG up to 10MB</p>
              </div>
              <input type="file" id="modal-file-input" class="hidden" accept="image/*" />
              <div id="modal-upload-progress" class="hidden w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div class="bg-primary h-1.5 rounded-full animate-pulse" style="width: 100%"></div>
              </div>
              <div id="modal-image-preview" class="hidden mt-3 relative rounded-lg overflow-hidden border border-outline-variant aspect-[16/9] w-full max-h-48 bg-slate-50">
                <img id="modal-preview-img" src="" alt="Preview" class="w-full h-full object-cover"/>
                <button type="button" id="modal-remove-img" class="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition-colors flex items-center justify-center" title="Remove Photo">
                  <span class="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
              <input type="hidden" id="modal-img" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Price *</label>
              <input id="modal-price" type="number" step="0.01" placeholder="e.g. 12.5" class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-transparent"/>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Intent *</label>
              <select id="modal-intent" class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed">
                <option value="Buy">Buy</option>
                <option value="Rent">Rent</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Property Type *</label>
              <select id="modal-type" class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed">
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Office">Office</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status *</label>
              <select id="modal-status" class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed">
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Bedrooms *</label>
              <input id="modal-beds" type="number" placeholder="0" class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed"/>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Bathrooms *</label>
              <input id="modal-baths" type="number" step="0.5" placeholder="0" class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed"/>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">SqFt *</label>
              <input id="modal-sqft" type="number" placeholder="0" class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed"/>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Latitude *</label>
              <input id="modal-lat" type="number" step="any" placeholder="19.0760" class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed"/>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Longitude *</label>
              <input id="modal-lng" type="number" step="any" placeholder="72.8777" class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed"/>
            </div>
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

    // File upload event listeners
    const uploadZone = document.getElementById('modal-upload-zone');
    const fileInput = document.getElementById('modal-file-input');
    const progressEl = document.getElementById('modal-upload-progress');
    const previewEl = document.getElementById('modal-image-preview');
    const previewImg = document.getElementById('modal-preview-img');
    const removeBtn = document.getElementById('modal-remove-img');
    const imgUrlInput = document.getElementById('modal-img');

    if (uploadZone && fileInput) {
        uploadZone.onclick = () => fileInput.click();

        uploadZone.ondragover = (e) => {
            e.preventDefault();
            uploadZone.classList.add('border-primary', 'bg-slate-50');
        };

        uploadZone.ondragleave = () => {
            uploadZone.classList.remove('border-primary', 'bg-slate-50');
        };

        uploadZone.ondrop = (e) => {
            e.preventDefault();
            uploadZone.classList.remove('border-primary', 'bg-slate-50');
            const file = e.dataTransfer.files[0];
            if (file) handleUpload(file);
        };

        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) handleUpload(file);
        };
    }

    async function handleUpload(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        progressEl.classList.remove('hidden');
        uploadZone.classList.add('opacity-50', 'pointer-events-none');

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `listing-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data, error } = await supabase.storage
                .from('properties')
                .upload(filePath, file, { cacheControl: '3600', upsert: true });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('properties')
                .getPublicUrl(filePath);

            imgUrlInput.value = publicUrl;
            
            previewImg.src = publicUrl;
            previewEl.classList.remove('hidden');
            uploadZone.classList.add('hidden');
            showToast('Property photo uploaded successfully!');
        } catch (err) {
            console.error('Upload error:', err);
            showToast('Failed to upload image: ' + err.message);
        } finally {
            progressEl.classList.add('hidden');
            uploadZone.classList.remove('opacity-50', 'pointer-events-none');
        }
    }

    if (removeBtn) {
        removeBtn.onclick = () => {
            imgUrlInput.value = '';
            previewImg.src = '';
            previewEl.classList.add('hidden');
            uploadZone.classList.remove('hidden');
            fileInput.value = '';
        };
    }

    // Location Autocomplete with OpenStreetMap (Nominatim)
    const modalLocationInput = document.getElementById('modal-location');
    const modalLocationResults = document.getElementById('modal-location-results');

    if (modalLocationInput && modalLocationResults) {
        let debounceTimer;
        modalLocationInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value.trim();
            if (query.length < 3) {
                modalLocationResults.innerHTML = '';
                modalLocationResults.classList.add('hidden');
                modalLocationResults.classList.remove('flex');
                return;
            }
            debounceTimer = setTimeout(() => {
                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=IN&limit=5`)
                    .then(res => res.json())
                    .then(data => {
                        modalLocationResults.innerHTML = '';
                        if (data.length === 0) {
                            modalLocationResults.innerHTML = '<div class="p-4 text-sm text-slate-500 font-medium bg-surface-container-lowest text-on-surface">No locations found.</div>';
                        } else {
                            data.forEach(item => {
                                const div = document.createElement('div');
                                div.className = 'px-4 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors flex items-center gap-3 bg-white text-slate-700 text-left';
                                div.innerHTML = `
                                    <span class="material-symbols-outlined text-slate-400 text-[18px] shrink-0">location_on</span>
                                    <div class="flex flex-col min-w-0">
                                        <span class="text-sm font-semibold truncate text-slate-800">${item.display_name.split(',')[0]}</span>
                                        <span class="text-[10px] text-slate-400 truncate">${item.display_name}</span>
                                    </div>
                                `;
                                div.onclick = () => {
                                    const parts = item.display_name.split(',');
                                    const formattedLocation = parts.slice(0, 3).map(s => s.trim()).join(', ');
                                    modalLocationInput.value = formattedLocation;
                                    
                                    const latEl = document.getElementById('modal-lat');
                                    const lngEl = document.getElementById('modal-lng');
                                    if (latEl) latEl.value = item.lat;
                                    if (lngEl) lngEl.value = item.lon;

                                    modalLocationResults.innerHTML = '';
                                    modalLocationResults.classList.add('hidden');
                                    modalLocationResults.classList.remove('flex');
                                };
                                modalLocationResults.appendChild(div);
                            });
                        }
                        modalLocationResults.classList.remove('hidden');
                        modalLocationResults.classList.add('flex');
                    })
                    .catch(err => {
                        console.error('Error fetching locations:', err);
                    });
            }, 300);
        });

        // Hide results when clicking outside
        document.addEventListener('click', (e) => {
            if (!modalLocationInput.contains(e.target) && !modalLocationResults.contains(e.target)) {
                modalLocationResults.innerHTML = '';
                modalLocationResults.classList.add('hidden');
                modalLocationResults.classList.remove('flex');
            }
        });
    }
}

// ══════════════════════════════════════════════════════
//  BROKER INQUIRIES MANAGER
// ══════════════════════════════════════════════════════

async function getInquiries() {
    const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
    if (error) {
        console.error('Error fetching inquiries:', error);
        return [];
    }
    return data;
}

async function initInquiriesManager() {
    await renderInquiries();
    injectInquiryModal();
}

async function renderInquiries() {
    const inquiries = await getInquiries();
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
              <span class="text-xs text-on-surface-variant">${new Date(i.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant truncate mb-2">${escHtml(i.message)}</p>
            ${i.broker_reply ? `<p class="font-body-sm text-[12px] text-secondary truncate mb-2">Broker: ${escHtml(i.broker_reply)}</p>` : ''}
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold uppercase tracking-wider ${i.type === 'Offer Intent' ? 'bg-secondary-fixed text-on-secondary-fixed-variant' : 'bg-surface-container text-on-surface-variant'} px-1.5 py-0.5 rounded">${i.type}</span>
            </div>
          </div>
        </div>
    `).join('') : '<div class="p-8 text-center text-slate-400 text-sm">No inquiries yet.</div>';
    
    const listWidget = document.getElementById('inquiries-list-widget');
    if (listWidget) listWidget.innerHTML = html;
    const listFull = document.getElementById('inquiries-list-full');
    if (listFull) listFull.innerHTML = html;
}

async function openInquiry(id) {
    const { data: inquiry, error } = await supabase.from('inquiries').select('*').eq('id', id).single();
    if (error || !inquiry) return;

    if (!inquiry.read) {
        await supabase.from('inquiries').update({ read: true }).eq('id', id);
        await renderInquiries();
    }

    const modal = document.getElementById('inquiry-details-modal');
    document.getElementById('inquiry-modal-name').textContent = inquiry.name;
    document.getElementById('inquiry-modal-type').textContent = inquiry.type;
    document.getElementById('inquiry-modal-message').textContent = inquiry.message;
    document.getElementById('inquiry-modal-time').textContent = new Date(inquiry.created_at).toLocaleTimeString();
    document.getElementById('inquiry-modal-reply').value = inquiry.broker_reply || '';
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
        replyBtn.addEventListener('click', async () => {
            const reply = document.getElementById('inquiry-modal-reply')?.value?.trim();
            if (!activeInquiryId || !reply) {
                showToast('Please enter a reply message.');
                return;
            }
            if (window.hasProfanity && window.hasProfanity(reply)) {
                showToast('Offensive language detected. Please refrain from using cuss words.');
                return;
            }
            const { error } = await supabase.from('inquiries').update({ broker_reply: reply, read: true }).eq('id', activeInquiryId);
            if (error) {
                showToast('Error sending reply: ' + error.message);
            } else {
                await renderInquiries();
                showToast('Reply sent to buyer.');
            }
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

async function initBuyerHomePage() {
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
        searchInput.onkeypress = (e) => { if (e.key === 'Enter') searchBtn.click(); };

        if (resultsContainer) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                const query = e.target.value.trim();
                if (query.length < 3) { resultsContainer.classList.add('hidden'); return; }
                debounceTimer = setTimeout(() => {
                    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=IN&limit=5`)
                        .then(res => res.json())
                        .then(data => {
                            resultsContainer.innerHTML = '';
                            if (data.length === 0) {
                                resultsContainer.innerHTML = '<div class="p-4 text-sm text-slate-500 font-medium">No locations found.</div>';
                            } else {
                                data.forEach(item => {
                                    const div = document.createElement('div');
                                    div.className = 'px-6 py-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex items-center gap-3';
                                    div.innerHTML = `<span class="material-symbols-outlined text-slate-400 text-[20px]">location_on</span><span class="text-sm font-medium text-slate-700 truncate">${item.display_name}</span>`;
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
                        });
                }, 300);
            });
        }
    }

    // ── [Featured Cards from Supabase] ──
    const featuredGrid = document.querySelector('section.py-20 .grid');
    if (featuredGrid) {
        const listings = await getListings();
        const top3 = listings.slice(0, 3);
        
        if (top3.length > 0) {
            featuredGrid.innerHTML = `
                <!-- Main Featured (2 cols) -->
                <div onclick="window.location.href='property-details.html?id=${top3[0].id}'"
                     class="md:col-span-2 bg-white border border-slate-200 flex flex-col md:flex-row shadow-sm cursor-pointer hover:shadow-lg transition-all">
                  <div class="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden">
                    <img src="${top3[0].img || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'}" class="w-full h-full object-cover">
                    <div class="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">Just Listed</div>
                  </div>
                  <div class="w-full md:w-1/2 p-8 flex flex-col justify-center">
                    <h3 class="text-2xl font-black text-slate-900 mb-2">₹${top3[0].price}${top3[0].intent === 'Rent' ? '' : ' Cr'}</h3>
                    <p class="text-sm font-bold text-slate-500 mb-6">${escHtml(top3[0].title)}, ${escHtml(top3[0].location)}</p>
                    <div class="flex items-center gap-6 pt-6 border-t border-slate-100">
                      <div class="flex items-center gap-2 text-slate-400"><span class="material-symbols-outlined text-[18px]">bed</span><span class="text-xs font-black text-slate-900">${top3[0].beds}</span></div>
                      <div class="flex items-center gap-2 text-slate-400"><span class="material-symbols-outlined text-[18px]">bathtub</span><span class="text-xs font-black text-slate-900">${top3[0].baths}</span></div>
                      <div class="flex items-center gap-2 text-slate-400"><span class="material-symbols-outlined text-[18px]">square_foot</span><span class="text-xs font-black text-slate-900">${(top3[0].sqft || 0).toLocaleString()}</span></div>
                    </div>
                  </div>
                </div>
                ${top3.slice(1).map(l => `
                <div onclick="window.location.href='property-details.html?id=${l.id}'"
                     class="bg-white border border-slate-200 flex flex-col shadow-sm cursor-pointer hover:shadow-lg transition-all">
                  <div class="h-48 relative overflow-hidden">
                    <img src="${l.img || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'}" class="w-full h-full object-cover">
                    <div class="absolute top-4 left-4 bg-white/90 backdrop-blur px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest text-slate-900">${l.type}</div>
                  </div>
                  <div class="p-6 flex-1 flex flex-col">
                    <h3 class="text-lg font-black text-slate-900 mb-1">₹${l.price}${l.intent === 'Rent' ? '' : ' Cr'}</h3>
                    <p class="text-xs font-bold text-slate-500 mb-4 truncate">${escHtml(l.title)}</p>
                    <div class="flex items-center gap-4 mt-auto pt-4 border-t border-slate-50">
                      <div class="flex items-center gap-1.5 text-slate-400"><span class="material-symbols-outlined text-[14px]">bed</span><span class="text-[10px] font-black text-slate-900">${l.beds}</span></div>
                      <div class="flex items-center gap-1.5 text-slate-400"><span class="material-symbols-outlined text-[14px]">square_foot</span><span class="text-[10px] font-black text-slate-900">${(l.sqft || 0).toLocaleString()}</span></div>
                    </div>
                  </div>
                </div>
                `).join('')}
                <!-- Dynamic Insight (keep as static design for aesthetics) -->
                <div class="md:col-span-2 bg-slate-900 text-white p-10 relative overflow-hidden group min-h-[240px] flex items-center">
                  <div class="relative z-10">
                    <h3 class="text-3xl font-black mb-4">Data-Driven <span class="text-cyan-400">Insights.</span></h3>
                    <p class="text-sm text-slate-400 mb-8 max-w-md">Our proprietary engine analyzes market trends across Mumbai & Delhi to identify high-yield opportunities.</p>
                    <button onclick="window.location.href='map.html'" class="bg-cyan-500 text-slate-900 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-cyan-400 transition-colors">Explore Heatmap</button>
                  </div>
                  <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-[80px]"></div>
                </div>
            `;
        }
    }
}

async function initBuyerListingsPage() {
    const propertyGrid = document.getElementById('property-grid');
    if (!propertyGrid) return;

    // ── [Fetch & Render from Supabase] ──
    const listings = await getListings();
    
    propertyGrid.innerHTML = listings.map(l => `
        <div class="group cursor-pointer property-card bg-white rounded-3xl border border-slate-200 hover:shadow-xl overflow-hidden transition-all duration-300" 
             data-id="${l.id}" data-title="${escHtml(l.title)}" data-location="${escHtml(l.location)}" 
             data-type="${l.type}" data-beds="${l.beds}" data-baths="${l.baths}" data-price="${l.price}" data-date="${l.created_at}">
          <div class="aspect-[16/9] overflow-hidden relative bg-slate-100">
            <img loading="lazy" src="${l.img || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
            <div class="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">${l.intent}</div>
            <button aria-label="Save Property" class="save-property-btn absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur rounded-full shadow text-slate-400 hover:text-error transition-colors">
              <span class="material-symbols-outlined text-[20px]">favorite</span>
            </button>
            <button aria-label="Share Property" class="share-property-btn absolute top-4 right-[52px] w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur rounded-full shadow text-slate-400 hover:text-blue-500 transition-colors z-10" onclick="event.stopPropagation();">
              <span class="material-symbols-outlined text-[20px]">share</span>
            </button>
          </div>
          <div class="p-5">
            <div class="flex justify-between items-start mb-1">
              <h3 class="text-xl font-black text-slate-900">₹${l.price}${l.intent === 'Rent' ? '' : ' Cr'}</h3>
            </div>
            <p class="text-slate-500 text-sm font-medium mb-4 truncate">${escHtml(l.title)}, ${escHtml(l.location)}</p>
            <div class="flex flex-wrap items-center gap-y-2 gap-x-4 text-slate-400">
              <div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[18px]">bed</span><span class="text-xs font-black text-slate-900">${l.beds}</span></div>
              <div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[18px]">bathtub</span><span class="text-xs font-black text-slate-900">${l.baths}</span></div>
              <div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[18px]">square_foot</span><span class="text-xs font-black text-slate-900">${(l.sqft || 0).toLocaleString()} <span class="font-normal text-slate-400">sqft</span></span></div>
            </div>
          </div>
        </div>
    `).join('');

    // ── [Data Initialization] ──
    let savedProperties = [];
    try {
        savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    } catch (e) { savedProperties = []; }

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
            navigateTo(`property-details.html?id=${card.dataset.id}`);
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

async function initBuyerMapPage() {
    console.log('Initializing Map with Supabase data...');
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
    
    if (qParam) {
        setTimeout(() => {
            if (typeof showToast === 'function') showToast(`Showing results near ${escHtml(qParam.split(',')[0])}`);
        }, 800);
    }
    
    map.setMinZoom(map.getBoundsZoom(indiaBounds));
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; ProjectX India',
        subdomains: 'abcd',
        maxZoom: 18,
        bounds: indiaBounds
    }).addTo(map);

    document.getElementById('map').style.background = '#ebebeb';

    // Load Listings from Supabase
    const listings = await getListings();
    
    // Filter to those with coordinates
    const markersData = listings.filter(l => l.lat !== null && l.lng !== null).map(l => {
        return { ...l, lat: parseFloat(l.lat), lng: parseFloat(l.lng) };
    });

    const withoutCoords = listings.filter(l => l.lat === null || l.lng === null);

    const markers = [];
    let activeListingId = null;
    let isProgrammaticMove = false;

    function selectListing(id, fromMap = false) {
        activeListingId = id;
        const markerObj = markers.find(m => m.data.id == id);
        
        if (!fromMap && markerObj) {
            isProgrammaticMove = true;
            map.flyTo([markerObj.data.lat, markerObj.data.lng], 15, { animate: true, duration: 0.5 });
            markerObj.marker.openPopup();
            setTimeout(() => { isProgrammaticMove = false; }, 600);
        }

        updateSidebar();
        
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
            className: 'bg-transparent border-none',
            html: `<div class="custom-price-pin cursor-pointer" style="transform: translate(-50%, -100%); margin-top: -5px;" id="pin-${p.id}">${p.price}${p.intent === 'Rent' ? '' : ' Cr'}</div>`,
            iconSize: [0, 0],
            iconAnchor: [0, 0]
        });

        const marker = L.marker([p.lat, p.lng], { icon }).addTo(map);
        
        marker.bindPopup(`
            <div class="p-2 min-w-[150px]">
                <h4 class="font-bold text-sm text-slate-900">₹${p.price}${p.intent === 'Rent' ? '' : ' Cr'}</h4>
                <p class="text-xs font-medium text-slate-500 mt-0.5">${escHtml(p.title)}</p>
                <div class="flex items-center gap-2 mt-2 text-slate-600 text-[10px] font-bold">
                    <span>${p.beds} BEDS</span> &bull; <span>${p.baths} BATHS</span>
                </div>
                <button onclick="window.location.href='property-details.html?id=${p.id}'" class="mt-3 w-full bg-slate-900 text-white px-3 py-1.5 rounded text-[10px] uppercase font-bold hover:bg-slate-800 transition-colors">View Details</button>
            </div>
        `, { closeButton: false, offset: [0, -35] });

        marker.on('click', () => selectListing(p.id, true));
        markers.push({ marker, data: p });
    });

    const sidebarContainer = document.querySelector('.overflow-y-auto.p-6');
    const matchesCountEl = document.querySelector('#map-listings-count');

    window.toggleMapFavorite = function(e, id) {
        e.stopPropagation();
        let saved = JSON.parse(localStorage.getItem('savedProperties') || '[]');
        if (saved.includes(id)) {
            saved = saved.filter(savedId => savedId != id);
            showToast('Removed from favorites');
        } else {
            saved.push(id);
            showToast('Added to favorites');
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
            sidebarContainer.innerHTML = '<p class="text-slate-500 text-center mt-10">No properties found in this area.</p>';
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
                <img loading="lazy" src="${l.img || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'}" class="w-full h-full object-cover transition-transform duration-700 ${isActive ? '' : 'group-hover:scale-105'}">
                <div class="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">${escHtml(l.intent)}</div>
              </div>
              <div class="p-5">
                <div class="flex justify-between items-start mb-1">
                  <h3 class="text-xl font-black text-slate-900">₹${l.price}${l.intent === 'Rent' ? '' : ' Cr'}</h3>
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
                    <span class="text-xs font-black text-slate-900">${(l.sqft || 0).toLocaleString()} <span class="font-normal text-slate-400">sqft</span></span>
                  </div>
                </div>
              </div>
            </div>
            `;
        }).join('');

        document.querySelectorAll('.custom-price-pin').forEach(el => el.classList.remove('active-pin'));
        if (activeListingId) {
            const pinEl = document.getElementById(`pin-${activeListingId}`);
            if (pinEl) pinEl.classList.add('active-pin');
        }
    }

    map.on('moveend', updateSidebar);
    setTimeout(updateSidebar, 100);

    // Geocode missing coordinates on the fly to support legacy listings
    withoutCoords.forEach((l, index) => {
        setTimeout(() => {
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(l.location)}&countrycodes=IN&limit=1`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.length > 0) {
                        const item = data[0];
                        const lat = parseFloat(item.lat);
                        const lng = parseFloat(item.lon);
                        
                        const updatedListing = { ...l, lat, lng };
                        markersData.push(updatedListing);
                        
                        const icon = L.divIcon({
                            className: 'bg-transparent border-none',
                            html: `<div class="custom-price-pin cursor-pointer" style="transform: translate(-50%, -100%); margin-top: -5px;" id="pin-${l.id}">${l.price}${l.intent === 'Rent' ? '' : ' Cr'}</div>`,
                            iconSize: [0, 0],
                            iconAnchor: [0, 0]
                        });
                        
                        const marker = L.marker([lat, lng], { icon }).addTo(map);
                        marker.bindPopup(`
                            <div class="p-2 min-w-[150px]">
                                <h4 class="font-bold text-sm text-slate-900">₹${l.price}${l.intent === 'Rent' ? '' : ' Cr'}</h4>
                                <p class="text-xs font-medium text-slate-500 mt-0.5">${escHtml(l.title)}</p>
                                <div class="flex items-center gap-2 mt-2 text-slate-600 text-[10px] font-bold">
                                    <span>${l.beds} BEDS</span> &bull; <span>${l.baths} BATHS</span>
                                </div>
                                <button onclick="window.location.href='property-details.html?id=${l.id}'" class="mt-3 w-full bg-slate-900 text-white px-3 py-1.5 rounded text-[10px] uppercase font-bold hover:bg-slate-800 transition-colors">View Details</button>
                            </div>
                        `, { closeButton: false, offset: [0, -35] });
                        
                        marker.on('click', () => selectListing(l.id, true));
                        markers.push({ marker, data: updatedListing });
                        
                        updateSidebar();
                    }
                })
                .catch(err => console.error('On-the-fly geocoding failed:', err));
        }, index * 1000); // 1-second delay between requests to comply with Nominatim's strict rate limits
    });

    // Map Search
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
                            showToast(`Showing results near ${item.display_name.split(',')[0]}`);
                        }
                    });
            }
        };
        searchInput.onkeypress = (e) => { if (e.key === 'Enter') searchBtn.click(); };

        if (resultsContainer) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                const query = e.target.value.trim();
                if (query.length < 3) { resultsContainer.classList.add('hidden'); return; }
                
                debounceTimer = setTimeout(() => {
                    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=IN&limit=5`)
                        .then(res => res.json())
                        .then(data => {
                            resultsContainer.innerHTML = '';
                            if (data.length === 0) {
                                resultsContainer.innerHTML = '<div class="p-4 text-sm text-slate-500 font-medium">No locations found.</div>';
                            } else {
                                data.forEach(item => {
                                    const div = document.createElement('div');
                                    div.className = 'px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors flex items-center gap-3';
                                    div.innerHTML = `<span class="material-symbols-outlined text-slate-400 text-[18px]">location_on</span><span class="text-xs font-medium text-slate-700 truncate" title="${item.display_name}">${item.display_name}</span>`;
                                    div.onclick = () => {
                                        searchInput.value = item.display_name.split(',')[0];
                                        resultsContainer.classList.add('hidden');
                                        map.flyTo([item.lat, item.lon], 15, { animate: true, duration: 1 });
                                        showToast(`Showing results near ${item.display_name.split(',')[0]}`);
                                    };
                                    resultsContainer.appendChild(div);
                                });
                            }
                            resultsContainer.classList.remove('hidden');
                            resultsContainer.classList.add('flex');
                        });
                }, 300);
            });
            document.addEventListener('click', (e) => {
                if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
                    resultsContainer.classList.add('hidden');
                }
            });
        }
    }
}

async function initBuyerDetailsPage() {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return;

    // Fetch from Supabase
    const { data: l, error } = await supabase.from('listings').select('*').eq('id', id).single();
    if (error || !l) {
        showToast('Property not found.');
        return;
    }

    // Fetch and populate actual broker profile from Supabase
    let brokerName = 'Mehdi Ali'; // Default fallback
    let brokerRole = 'ProjectX Executive Partner';
    let brokerImg = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'; // professional default image
    
    if (l.broker_id) {
        const { data: brokerProfile } = await supabase.from('profiles').select('*').eq('id', l.broker_id).single();
        if (brokerProfile) {
            if (brokerProfile.full_name) {
                brokerName = brokerProfile.full_name;
            }
            if (brokerProfile.role) {
                brokerRole = `${brokerProfile.role}, ProjectX`;
            }
        }
    }
    
    const brokerNameEl = document.getElementById('detail-broker-name');
    if (brokerNameEl) {
        if (l.broker_id) {
            brokerNameEl.innerHTML = `<a href="/profile.html?id=${l.broker_id}" target="_blank" class="hover:text-slate-600 hover:underline flex items-center gap-1 transition-colors">
                ${escHtml(brokerName)}
                <span class="material-symbols-outlined text-[16px] inline-block font-normal">open_in_new</span>
            </a>`;
        } else {
            brokerNameEl.textContent = brokerName;
        }
    }
    
    const brokerRoleEl = document.getElementById('detail-broker-role');
    if (brokerRoleEl) brokerRoleEl.textContent = brokerRole;

    const brokerImgEl = document.getElementById('detail-broker-img');
    if (brokerImgEl) {
        if (brokerName.toLowerCase().includes('mehdi')) {
            brokerImgEl.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'; // handsome male avatar for Mehdi
        } else {
            brokerImgEl.src = brokerImg;
        }
        if (l.broker_id) {
            brokerImgEl.classList.add('cursor-pointer', 'hover:opacity-95', 'transition-opacity');
            brokerImgEl.onclick = () => {
                window.open(`/profile.html?id=${l.broker_id}`, '_blank');
            };
        }
    }

    // Update page title
    document.title = `${l.title} — EstatePro`;

    // Hero image
    const heroImg = document.querySelector('.hero-img');
    if (heroImg) heroImg.src = l.img || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80';

    // Price
    const priceEl = document.getElementById('detail-price');
    if (priceEl) priceEl.innerHTML = `₹${l.price}${l.intent === 'Rent' ? '' : ' Cr'}`;

    // Title & address
    const titleEl = document.getElementById('detail-title');
    if (titleEl) titleEl.textContent = l.title;
    const addrEl = document.getElementById('detail-address');
    if (addrEl) addrEl.innerHTML = `<span class="material-symbols-outlined text-[20px]">location_on</span> ${l.location}`;

    // Stats
    const bedsEl = document.getElementById('detail-beds');
    if (bedsEl) bedsEl.textContent = l.beds;
    const bathsEl = document.getElementById('detail-baths');
    if (bathsEl) bathsEl.textContent = l.baths;
    const sqftEl = document.getElementById('detail-sqft');
    if (sqftEl) sqftEl.textContent = (l.sqft || 0).toLocaleString();
    const typeEl = document.getElementById('detail-type');
    if (typeEl) typeEl.textContent = l.type;

    // Description
    const descEl = document.getElementById('detail-desc');
    if (descEl) {
        descEl.innerHTML = `<p>This exquisite ${l.type.toLowerCase()} located in ${l.location} offers a premium living experience with ${l.beds} spacious bedrooms and ${l.baths} modern bathrooms. Spanning ${(l.sqft || 0).toLocaleString()} sqft, the property features high-end finishes, abundant natural light, and breathtaking views.</p>
        <p>Perfect for those seeking luxury and comfort, this home includes state-of-the-art amenities and is situated in a prime neighborhood with easy access to the city's best attractions.</p>`;
    }

    // ── [Photo Overlay Toast] ──
    const photoBtn = Array.from(document.querySelectorAll('span, div')).find((s) => s.textContent.includes('View All 24 Photos'))?.closest('div');
    if (photoBtn) {
        photoBtn.classList.add('cursor-pointer');
        photoBtn.addEventListener('click', () => showToast('Additional photos are demo-only in this build.'));
    }

    // Inquiry vs Chat logic
    const { data: { user } } = await supabase.auth.getUser();
    const role = localStorage.getItem('role');
    
    const form = document.getElementById('buyer-inquiry-form');
    const chatSection = document.getElementById('buyer-chat-section');
    const submitBtn = document.getElementById('contact-agent-btn');

    if (user && role === 'Buyer') {
        if (form) form.classList.add('hidden');
        if (chatSection) {
            chatSection.classList.remove('hidden');
            chatSection.classList.add('flex');
            initBuyerChat(user.id, l.broker_id, l.id, brokerName);
        }
    } else {
        // Fallback to inquiry form for guests/others
        if (form && submitBtn) {
            submitBtn.onclick = async (e) => {
                e.preventDefault();
                const firstName = document.getElementById('buyer-first-name')?.value?.trim();
                const email = document.getElementById('buyer-email')?.value?.trim();
                const message = document.getElementById('buyer-message')?.value?.trim();

                if (!firstName || !email || !message) {
                    showToast('Please fill in required fields: First Name, Email, and Message.');
                    return;
                }

                if (window.hasProfanity && (window.hasProfanity(firstName) || window.hasProfanity(fullName) || window.hasProfanity(message))) {
                    showToast('Offensive language detected. Please refrain from using cuss words.');
                    return;
                }

                const phone = document.getElementById('buyer-phone')?.value?.trim();
                const fullName = `${firstName} ${document.getElementById('buyer-last-name')?.value || ''}`.trim();
                const type = document.getElementById('inquiry-type')?.value || 'Inquiry';
                const finalMessage = phone ? `${message} (Contact: ${phone})` : message;

                const { error } = await supabase.from('inquiries').insert([{
                    name: fullName,
                    message: finalMessage,
                    type: type,
                    read: false,
                    listing_id: l.id,
                    broker_id: l.broker_id
                }]);

                if (error) {
                    showToast('Error submitting inquiry: ' + error.message);
                } else {
                    showToast('Inquiry submitted successfully. Broker will contact you soon.');
                    form.reset();
                }
            };
        }
    }
}

let buyerChatChannel = null;
async function initBuyerChat(buyerId, brokerId, listingId, brokerName = 'Broker') {
    activeChatNames[buyerId] = localStorage.getItem('userName') || 'You';
    activeChatNames[brokerId] = brokerName;

    const msgsEl = document.getElementById('buyer-chat-messages');
    const input = document.getElementById('buyer-chat-input');
    const sendBtn = document.getElementById('buyer-chat-send');

    if (!msgsEl || !input || !sendBtn) return;

    if (!buyerId || !brokerId || !listingId) {
        msgsEl.innerHTML = '<div class="text-center text-slate-400 font-medium my-auto absolute inset-0 flex items-center justify-center">Chat is unavailable for this listing (missing broker/buyer details).</div>';
        input.disabled = true;
        sendBtn.disabled = true;
        return;
    }

    msgsEl.innerHTML = '<div class="text-center text-slate-500 my-auto">Loading...</div>';

    const fetchMsgs = async () => {
        const { data: msgs, error } = await supabase
            .from('messages')
            .select('*')
            .eq('buyer_id', buyerId)
            .eq('broker_id', brokerId)
            .eq('listing_id', listingId)
            .order('created_at', { ascending: true });

        if (error) {
            msgsEl.innerHTML = `<div class="text-error">${error.message}</div>`;
            return;
        }

        msgsEl.innerHTML = '';
        if (msgs.length === 0) {
            msgsEl.innerHTML = '<div class="text-center text-slate-400 font-medium my-auto absolute inset-0 flex items-center justify-center">Start a conversation!</div>';
        } else {
            msgs.forEach(m => window.renderMessage(m, buyerId, msgsEl));
            msgsEl.scrollTop = msgsEl.scrollHeight;
        }
    };

    await fetchMsgs();

    sendBtn.onclick = async () => {
        const content = input.value.trim();
        if (!content) return;
        if (window.hasProfanity && window.hasProfanity(content)) {
            showToast('Offensive language detected. Please refrain from using cuss words.');
            return;
        }
        input.value = '';
        input.disabled = true;
        sendBtn.disabled = true;

        const { error } = await supabase.from('messages').insert([{
            buyer_id: buyerId,
            broker_id: brokerId,
            listing_id: listingId,
            sender_id: buyerId,
            content: content
        }]);

        if (error) showToast('Failed to send message: ' + error.message);

        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
    };

    input.onkeypress = (e) => {
        if (e.key === 'Enter') sendBtn.click();
    };

    if (buyerChatChannel) supabase.removeChannel(buyerChatChannel);
    buyerChatChannel = supabase.channel(`buyer_chat_${buyerId}_${brokerId}_${listingId}`)
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `listing_id=eq.${listingId}` 
        }, payload => {
            if (payload.new.buyer_id === buyerId && payload.new.broker_id === brokerId) {
                if (msgsEl.innerHTML.includes('Start a conversation!')) msgsEl.innerHTML = '';
                window.renderMessage(payload.new, buyerId, msgsEl);
                msgsEl.scrollTop = msgsEl.scrollHeight;
            }
        })
        .subscribe();
}

function initSellPage() {
    const form = document.getElementById('valuation-form');
    if (!form) return;

    form.onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('val-name')?.value?.trim();
        const email = document.getElementById('val-email')?.value?.trim();
        const address = document.getElementById('val-address')?.value?.trim();
        const phone = document.getElementById('val-phone')?.value?.trim();

        if (!name || !email || !address) {
            showToast('Please fill in all required fields.');
            return;
        }

        if (window.hasProfanity && (window.hasProfanity(name) || window.hasProfanity(address) || window.hasProfanity(phone))) {
            showToast('Offensive language detected. Please refrain from using cuss words.');
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

// ─── Realtime Chat Logic ─────────────────────────────────────────────────────
let currentChatConversation = null;
let chatChannel = null;
let activeChatNames = {};

window.initBrokerChat = async function initBrokerChat() {
    const listEl = document.getElementById('chat-list');
    if (!listEl) return;
    listEl.innerHTML = '<div class="p-4 text-center text-slate-500 font-medium">Loading conversations...</div>';

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: messages, error } = await supabase
        .from('messages')
        .select('buyer_id, listing_id, created_at')
        .eq('broker_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        listEl.innerHTML = `<div class="p-4 text-error">${error.message}</div>`;
        return;
    }

    const uniqueMap = new Map();
    messages?.forEach(m => {
        const key = `${m.buyer_id}-${m.listing_id}`;
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, m);
        }
    });

    const uniqueConversations = Array.from(uniqueMap.values());

    if (uniqueConversations.length === 0) {
        listEl.innerHTML = '<div class="p-4 text-center text-slate-500 font-medium">No conversations yet.</div>';
        return;
    }

    // Fetch listing titles and buyer profiles
    const buyerIds = [...new Set(uniqueConversations.map(c => c.buyer_id))];
    const listingIds = [...new Set(uniqueConversations.map(c => c.listing_id))];

    const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', buyerIds);
    const { data: listings } = await supabase.from('listings').select('id, title').in('id', listingIds);

    profiles?.forEach(p => {
        activeChatNames[p.id] = p.full_name;
    });
    activeChatNames[user.id] = localStorage.getItem('userName') || 'You';

    listEl.innerHTML = '';
    uniqueConversations.forEach(c => {
        const buyer = profiles?.find(p => p.id === c.buyer_id);
        const listing = listings?.find(l => l.id === c.listing_id);
        const name = buyer?.full_name || 'Buyer';
        const letter = name.charAt(0).toUpperCase();
        
        // Premium HSL matching palette
        const colors = [
            'bg-slate-900 text-white',
            'bg-indigo-900 text-indigo-100',
            'bg-blue-900 text-blue-100',
            'bg-emerald-900 text-emerald-100',
            'bg-teal-900 text-teal-100'
        ];
        const colorIdx = (name.charCodeAt(0) || 0) % colors.length;
        const colorClass = colors[colorIdx];

        const div = document.createElement('div');
        div.className = 'p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-all flex items-center gap-3 group';
        div.innerHTML = `
            <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${colorClass} shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                ${letter}
            </div>
            <div class="min-w-0 flex-1">
                <div class="font-bold text-slate-800 text-sm truncate group-hover:text-slate-900 transition-colors">${escHtml(name)}</div>
                <div class="text-xs text-slate-400 font-medium mt-0.5 truncate flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px] text-slate-300">domain</span>
                    ${escHtml(listing?.title || 'Property')}
                </div>
            </div>
            <span class="material-symbols-outlined text-slate-300 text-[16px] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">chevron_right</span>
        `;
        div.onclick = () => window.loadChatMessages(c.buyer_id, user.id, c.listing_id, name, listing?.title || 'Property');
        listEl.appendChild(div);
    });
};

window.loadChatMessages = async function loadChatMessages(buyerId, brokerId, listingId, buyerName, listingTitle) {
    currentChatConversation = { buyerId, brokerId, listingId };
    activeChatNames[buyerId] = buyerName;
    activeChatNames[brokerId] = localStorage.getItem('userName') || 'You';
    
    document.getElementById('chat-header').innerHTML = `
        <div>
            <a href="/profile.html?id=${buyerId}" target="_blank" class="text-lg font-bold text-slate-900 hover:text-slate-600 transition-colors flex items-center gap-1.5 hover:underline">
                ${escHtml(buyerName)}
                <span class="material-symbols-outlined text-[18px]">open_in_new</span>
            </a>
            <div class="text-xs font-medium text-slate-500">${listingTitle}</div>
        </div>
    `;

    const msgsEl = document.getElementById('chat-messages');

    if (!buyerId || !brokerId || !listingId) {
        msgsEl.innerHTML = '<div class="text-center text-error mt-4 font-medium">Invalid chat details (missing broker or buyer).</div>';
        return;
    }

    msgsEl.innerHTML = '<div class="text-center text-slate-500 mt-4 font-medium">Loading messages...</div>';

    const { data: { user } } = await supabase.auth.getUser();

    const fetchMsgs = async () => {
        const { data: msgs, error } = await supabase
            .from('messages')
            .select('*')
            .eq('buyer_id', buyerId)
            .eq('broker_id', brokerId)
            .eq('listing_id', listingId)
            .order('created_at', { ascending: true });

        if (error) {
            msgsEl.innerHTML = `<div class="text-error">Error: ${error.message}</div>`;
            return;
        }

        msgsEl.innerHTML = '';
        if (msgs.length === 0) {
            msgsEl.innerHTML = '<div class="text-center text-slate-400 mt-10 font-medium">No messages yet. Say hi!</div>';
        } else {
            msgs.forEach(m => window.renderMessage(m, user.id, msgsEl));
            msgsEl.scrollTop = msgsEl.scrollHeight;
        }
    };

    await fetchMsgs();

    // Enable input
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    input.disabled = false;
    sendBtn.disabled = false;

    sendBtn.onclick = async () => {
        const content = input.value.trim();
        if (!content) return;
        if (window.hasProfanity && window.hasProfanity(content)) {
            showToast('Offensive language detected. Please refrain from using cuss words.');
            return;
        }
        input.value = '';
        input.disabled = true;
        sendBtn.disabled = true;

        const { error } = await supabase.from('messages').insert([{
            buyer_id: buyerId,
            broker_id: brokerId,
            listing_id: listingId,
            sender_id: user.id,
            content: content
        }]);

        if (error) showToast('Failed to send message: ' + error.message);

        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
    };

    input.onkeypress = (e) => {
        if (e.key === 'Enter') sendBtn.click();
    };

    // Set up real-time listener
    if (chatChannel) supabase.removeChannel(chatChannel);

    chatChannel = supabase.channel(`chat_${buyerId}_${brokerId}_${listingId}`)
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `listing_id=eq.${listingId}` 
        }, payload => {
            // Need to make sure it belongs to this conversation
            if (payload.new.buyer_id === buyerId && payload.new.broker_id === brokerId) {
                // If it was the first message, clear the "No messages yet" text
                if (msgsEl.innerHTML.includes('No messages yet')) msgsEl.innerHTML = '';
                window.renderMessage(payload.new, user.id, msgsEl);
                msgsEl.scrollTop = msgsEl.scrollHeight;
            }
        })
        .subscribe();
};

function formatMsgTime(dateStr) {
    if (!dateStr) return 'Just now';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Just now';
    
    const now = new Date();
    const diffMs = now - d;
    if (diffMs < 30000) return 'Just now'; // less than 30s
    
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const dateOptions = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
    
    if (d.toDateString() === now.toDateString()) {
        return d.toLocaleTimeString([], timeOptions);
    }
    
    return d.toLocaleDateString([], dateOptions);
}

window.renderMessage = function renderMessage(m, currentUserId, container) {
    const isMe = m.sender_id === currentUserId;
    const senderName = isMe ? 'You' : (activeChatNames[m.sender_id] || 'Buyer');
    const timeStr = formatMsgTime(m.created_at);

    const msgWrapper = document.createElement('div');
    msgWrapper.className = `flex flex-col gap-1 w-full ${isMe ? 'items-end' : 'items-start'}`;

    // Premium header
    const header = document.createElement('div');
    header.className = 'flex items-center gap-1.5 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest';
    
    let senderHTML = `<span>${escHtml(senderName)}</span>`;
    if (!isMe && m.sender_id) {
        senderHTML = `<a href="/profile.html?id=${m.sender_id}" target="_blank" class="hover:text-slate-800 hover:underline flex items-center gap-0.5 transition-colors">
            ${escHtml(senderName)}
            <span class="material-symbols-outlined text-[10px] inline-block font-normal">open_in_new</span>
        </a>`;
    }
    
    header.innerHTML = `${senderHTML}<span class="text-[8px] text-slate-300">•</span><span>${timeStr}</span>`;

    // Bubble
    const bubble = document.createElement('div');
    bubble.className = `max-w-[75%] px-4 py-3 rounded-2xl text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md ${
        isMe 
        ? 'bg-slate-900 text-white rounded-tr-none border border-slate-800' 
        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
    }`;
    bubble.textContent = m.content;

    msgWrapper.appendChild(header);
    msgWrapper.appendChild(bubble);
    container.appendChild(msgWrapper);
};

