const fs = require('fs');

let loginHtml = fs.readFileSync('login.html', 'utf8');

// Update Sign In button
loginHtml = loginHtml.replace('Continue to Dashboard', 'Sign In');

// Update body to relative
loginHtml = loginHtml.replace('<body class="bg-background text-on-background font-body-md antialiased min-h-screen flex flex-col">', '<body class="bg-background text-on-background font-body-md antialiased min-h-screen flex flex-col relative">');

// Add staff portal icon to login.html
if (!loginHtml.includes('staff-login.html')) {
    loginHtml = loginHtml.replace('</head>\n<body class="bg-background text-on-background font-body-md antialiased min-h-screen flex flex-col relative">', `</head>\n<body class="bg-background text-on-background font-body-md antialiased min-h-screen flex flex-col relative">\n  <!-- Staff Portal Icon -->\n  <a href="/staff-login.html" class="absolute top-6 right-6 z-50 text-slate-400 hover:text-slate-900 bg-white/50 hover:bg-white rounded-full p-2 backdrop-blur transition-all shadow-sm flex items-center justify-center" title="Staff Portal">\n    <span class="material-symbols-outlined text-[24px]">admin_panel_settings</span>\n  </a>`);
}

// Prepare staff-login.html by modifying loginHtml
let staffLoginHtml = loginHtml.replace('href="/staff-login.html"', 'href="/login.html"');
staffLoginHtml = staffLoginHtml.replace('title="Staff Portal"', 'title="User Portal"');
staffLoginHtml = staffLoginHtml.replace('admin_panel_settings', 'person');
staffLoginHtml = staffLoginHtml.replace('<title>EstatePro - Sign In</title>', '<title>EstatePro - Staff Sign In</title>');

// Set Tabs for staff-login.html
const staffTabs = `
        <button class="flex-1 py-2.5 px-3 text-center text-[10px] font-black uppercase tracking-widest rounded-lg role-tab-inactive hover:text-slate-900 transition-colors">Admin</button>
        <button class="flex-1 py-2.5 px-3 text-center text-[10px] font-black uppercase tracking-widest rounded-lg role-tab-inactive hover:text-slate-900 transition-colors">Employee</button>
`;
staffLoginHtml = staffLoginHtml.replace(/<div id="role-tabs".*?<\/div>/s, `<div id="role-tabs" class="flex p-1 bg-slate-100 rounded-xl gap-1">` + staffTabs + `      </div>`);

// Set Tabs for login.html
const userTabs = `
        <button class="flex-1 py-2.5 px-3 text-center text-[10px] font-black uppercase tracking-widest rounded-lg role-tab-inactive hover:text-slate-900 transition-colors">Buyer</button>
        <button class="flex-1 py-2.5 px-3 text-center text-[10px] font-black uppercase tracking-widest rounded-lg role-tab-inactive hover:text-slate-900 transition-colors">Broker</button>
`;
loginHtml = loginHtml.replace(/<div id="role-tabs".*?<\/div>/s, `<div id="role-tabs" class="flex p-1 bg-slate-100 rounded-xl gap-1">` + userTabs + `      </div>`);

fs.writeFileSync('login.html', loginHtml);
fs.writeFileSync('staff-login.html', staffLoginHtml);
console.log('Login pages updated successfully');
