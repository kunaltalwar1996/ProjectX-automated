var e=[{id:1,title:`Mehdi's house`,address:`Bandra West, Mumbai`,location:`Mumbai`,type:`Apartment`,beds:1,baths:1,price:.45,intent:`Rent`,sqft:4500,date:`2026-05-17`,badge:`Premium`,badgeColor:`bg-amber-500`,img:`https://images.unsplash.com/photo-1600587771525-78b9dba3b914?w=800&auto=format&fit=crop`,coords:[19.0596,72.8295]}];function t(e,t=`Buy`){if(t===`Rent`){let t=e*100;return t>=1?`₹${t.toFixed(t%1==0?0:1)} Lac<span class="text-[10px] font-normal text-slate-400">/mo</span>`:`₹${(t*1e5).toLocaleString(`en-IN`)}<span class="text-[10px] font-normal text-slate-400">/mo</span>`}return e>=1?`₹${e.toFixed(e%1==0?0:1)} Cr`:`₹${(e*100).toFixed(0)} L`}function n(e){return`
    <div class="group cursor-pointer property-card bg-white rounded-3xl border border-slate-200 hover:shadow-xl overflow-hidden transition-all duration-300"
         data-id="${e.id}" data-title="${e.title}" data-location="${e.location}"
         data-type="${e.type}" data-beds="${e.beds}" data-baths="${e.baths}"
         data-price="${e.price}" data-date="${e.date}" data-intent="${e.intent}"
         onclick="window.location.href='/property-details.html?id=${e.id}'">
      <div class="aspect-[16/9] overflow-hidden relative bg-slate-100">
        <img loading="lazy" src="${e.img}"
             class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
             onerror="this.src='https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop'">
        <div class="absolute top-4 left-4 ${e.badgeColor} ${e.badgeColor.includes(`bg-white`)?``:`text-white`} px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
          ${e.badge}
        </div>
        <div class="absolute top-4 right-[92px] bg-slate-900/80 backdrop-blur text-white px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider">
          For ${e.intent}
        </div>
        <button aria-label="Save Property" class="save-property-btn absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur rounded-full shadow text-slate-400 hover:text-red-500 transition-colors">
          <span class="material-symbols-outlined text-[20px]">favorite</span>
        </button>
        <button aria-label="Share Property" class="share-property-btn absolute top-4 right-[52px] w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur rounded-full shadow text-slate-400 hover:text-blue-500 transition-colors z-10" onclick="event.stopPropagation(); navigator.clipboard.writeText(window.location.origin+'/property-details.html?id=${e.id}').then(()=>{ const t=document.createElement('div'); t.className='fixed bottom-6 right-6 z-[200] bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm'; t.textContent='Link copied!'; document.body.appendChild(t); setTimeout(()=>t.remove(),2000); })">
          <span class="material-symbols-outlined text-[20px]">share</span>
        </button>
      </div>
      <div class="p-5">
        <div class="flex justify-between items-start mb-1">
          <h3 class="text-xl font-black text-slate-900">${t(e.price,e.intent)}</h3>
          <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-md">${e.type}</span>
        </div>
        <p class="text-slate-500 text-sm font-medium mb-4 truncate">${e.address}</p>
        <div class="flex flex-wrap items-center gap-y-2 gap-x-4 text-slate-400">
          ${e.beds>0?`<div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[18px]">bed</span><span class="text-xs font-black text-slate-900">${e.beds}</span></div>`:``}
          ${e.baths>0?`<div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[18px]">bathtub</span><span class="text-xs font-black text-slate-900">${e.baths}</span></div>`:``}
          <div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[18px]">square_foot</span><span class="text-xs font-black text-slate-900">${e.sqft.toLocaleString()} <span class="font-normal text-slate-400">sqft</span></span></div>
        </div>
      </div>
    </div>
  `}function r(){let t=document.getElementById(`property-grid`);if(!t)return;t.innerHTML=``;let r=new URLSearchParams(window.location.search).get(`intent`),i=r?e.filter(e=>e.intent.toLowerCase()===r.toLowerCase()):e;i.forEach(e=>{t.insertAdjacentHTML(`beforeend`,n(e))});let a=document.getElementById(`listings-count-text`);a&&(a.textContent=`Discover ${i.length} exceptional listings in Mumbai & Delhi`)}window.DEMO_LISTINGS=e,window.buildCardHTML=n,window.formatPrice=t,window.seedPropertyGrid=r,document.addEventListener(`DOMContentLoaded`,r);