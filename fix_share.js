const fs = require('fs');

function addShareToCards(file) {
    let content = fs.readFileSync(file, 'utf8');
    const shareBtn = `<button aria-label="Share Property" class="share-property-btn absolute top-4 right-[52px] w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur rounded-full shadow text-slate-400 hover:text-blue-500 transition-colors z-10" onclick="event.stopPropagation();">
                  <span class="material-symbols-outlined text-[20px]">share</span>
                </button>`;
    content = content.replace(/(<button aria-label="Save Property".*?<\/button>)/gs, "$1\n                " + shareBtn);
    fs.writeFileSync(file, content);
}

addShareToCards('properties.html');
addShareToCards('map.html');

function addShareToDetails(file) {
    let content = fs.readFileSync(file, 'utf8');
    const shareBtn = `<button id="share-listing-btn" class="mt-4 flex items-center justify-center md:justify-end gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm w-full md:w-auto" onclick="navigator.clipboard.writeText(window.location.href).then(() => showToast('Listing link copied to clipboard!'))">
  <span class="material-symbols-outlined text-[18px]">share</span> Share Listing
</button>`;
    content = content.replace(/(<span class="text-sm font-bold text-slate-500">Est. ₹5.8L\/mo<\/span>\s*<\/div>)/s, "$1\n" + shareBtn);
    fs.writeFileSync(file, content);
}

addShareToDetails('property-details.html');
