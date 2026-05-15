const fs = require('fs');
const files = ['index.html', 'properties.html', 'map.html', 'sell.html', 'property-details.html', 'login.html'];

const trailingHtml = `<!-- Trailing Actions -->
      <div class="flex items-center gap-4">
        <button class="text-slate-500 hover:text-slate-900 transition-colors">
          <span class="material-symbols-outlined text-[24px]">account_circle</span>
        </button>
        <button class="bg-slate-900 text-white px-5 py-2 rounded-lg font-bold text-xs hover:bg-slate-800 transition-colors uppercase tracking-wider ml-2">
          Dashboard
        </button>
      </div>`;

files.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        // Replace everything from <!-- Trailing Actions --> to the end of the <nav> element
        content = content.replace(/<!-- Trailing Actions -->[\s\S]*?<\/div>\s*<\/div>\s*<\/nav>/, trailingHtml + '\n    </div>\n  </nav>');
        fs.writeFileSync(file, content);
        console.log('Fixed ' + file);
    } catch(e) {
        console.error(e);
    }
});
