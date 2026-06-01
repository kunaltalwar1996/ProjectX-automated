import{t as e}from"./auth-BV7-Rypf.js";/* empty css              */function t(e,t=!1){let n=document.getElementById(`admin-toast`);n||(n=document.createElement(`div`),n.id=`admin-toast`,n.style.cssText=`position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(80px);background:#0f172a;color:white;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:600;box-shadow:0 8px 32px rgba(0,0,0,0.2);transition:transform 0.3s;white-space:nowrap;z-index:9999;font-family:Outfit,sans-serif`,document.body.appendChild(n)),n.textContent=e,n.style.background=t?`#ef4444`:`#0f172a`,n.style.transform=`translateX(-50%) translateY(0)`,setTimeout(()=>n.style.transform=`translateX(-50%) translateY(80px)`,3e3)}function n(e){if(!e)return`Never`;let t=new Date(e),n=new Date-t,r=Math.floor(n/6e4),i=Math.floor(n/36e5),a=Math.floor(n/864e5);return n<6e4?`Just now`:r<60?`${r} min${r>1?`s`:``} ago`:i<24?`${i} hour${i>1?`s`:``} ago`:a===1?`Yesterday`:a<7?`${a} days ago`:t.toLocaleDateString()}var r=null;async function i(){let{data:t}=await e.auth.getSession();if(r=t.session,!r){window.location.href=`login.html`;return}let{data:n,error:i}=await e.from(`profiles`).select(`role`).eq(`id`,r.user.id).single();if(i||!n||n.role!==`Admin`&&n.role!==`Employee`){alert(`Access Denied. You must be an authorized Administrator or Employee.`),await e.auth.signOut(),window.location.href=`login.html`;return}a(),s(),u()}window.logout=async()=>{confirm(`Are you sure you want to log out?`)&&(await e.auth.signOut(),localStorage.removeItem(`role`),localStorage.removeItem(`userName`),window.location.href=`login.html`)};async function a(){try{let[{count:t},{count:n},{count:r},{count:i}]=await Promise.all([e.from(`profiles`).select(`*`,{count:`exact`,head:!0}),e.from(`listings`).select(`*`,{count:`exact`,head:!0}),e.from(`profiles`).select(`*`,{count:`exact`,head:!0}).eq(`role`,`Broker`),e.from(`inquiries`).select(`*`,{count:`exact`,head:!0})]);document.getElementById(`stat-total-users`).textContent=Number(t||0).toLocaleString(),document.getElementById(`stat-active-listings`).textContent=Number(n||0).toLocaleString(),document.getElementById(`stat-total-brokers`).textContent=Number(r||0).toLocaleString(),document.getElementById(`stat-total-inquiries`).textContent=Number(i||0).toLocaleString(),document.getElementById(`active-listings-badge`).textContent=`${n||0} Active`}catch(e){console.error(`Failed to load statistics:`,e)}}var o=[];async function s(){let{data:t,error:n}=await e.from(`profiles`).select(`*`).order(`updated_at`,{ascending:!1});if(n){console.error(n);return}o=t||[],c(o),l(o)}function c(i){let o=document.getElementById(`user-table-body`);if(i.length===0){o.innerHTML=`
      <tr class="border-b border-surface-variant bg-surface-bright">
        <td colspan="5" class="py-8 text-center text-on-surface-variant text-sm">
          No matching user accounts found.
        </td>
      </tr>`;return}o.innerHTML=i.map(e=>{let t=(e.full_name||`U`).split(` `).map(e=>e[0]).join(``).substring(0,2).toUpperCase(),r=`bg-primary-fixed text-on-primary-fixed-variant`;e.role===`Admin`?r=`bg-error-container text-on-error-container`:e.role===`Employee`?r=`bg-tertiary-fixed text-on-tertiary-fixed-variant`:e.role===`Broker`&&(r=`bg-secondary-fixed text-on-secondary-fixed-variant`);let i=n(e.updated_at),a=new Date-new Date(e.updated_at)<36e5?`<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-[11px] font-bold uppercase tracking-wide"><span class="w-1.5 h-1.5 rounded-full bg-secondary"></span> Active</span>`:`<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-bold uppercase tracking-wide"><span class="w-1.5 h-1.5 rounded-full bg-outline"></span> Offline</span>`;return`
      <tr class="border-b border-surface-variant hover:bg-surface-container transition-colors">
        <td class="py-3 px-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full ${r} flex items-center justify-center font-bold text-xs">${t}</div>
            <div>
              <div class="font-medium text-on-background">${e.full_name||`Anonymous User`}</div>
              <div class="text-on-surface-variant text-[10px] font-mono tracking-tight">${e.id}</div>
            </div>
          </div>
        </td>
        <td class="py-3 px-4 font-medium">${e.role||`Buyer`}</td>
        <td class="py-3 px-4">${a}</td>
        <td class="py-3 px-4 text-on-surface-variant">${i}</td>
        <td class="py-3 px-4 text-right">
          <button class="delete-user-btn text-outline hover:text-error transition-colors p-1.5 rounded-full hover:bg-error-container/20" data-id="${e.id}" data-name="${e.full_name}" title="Delete User">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </td>
      </tr>
    `}).join(``),document.querySelectorAll(`.delete-user-btn`).forEach(n=>{n.addEventListener(`click`,async()=>{let i=n.getAttribute(`data-id`),o=n.getAttribute(`data-name`);if(i===r.user.id){t(`You cannot delete your own active account!`,!0);return}if(confirm(`Are you sure you want to permanently delete the profile for "${o}"?`)){let{error:n}=await e.from(`profiles`).delete().eq(`id`,i);n?t(n.message,!0):(t(`✓ Successfully deleted profile for ${o}`),s(),a())}})})}window.handleSearch=()=>{let e=document.getElementById(`user-search`).value.toLowerCase().trim();c(e?o.filter(t=>t.full_name&&t.full_name.toLowerCase().includes(e)||t.role&&t.role.toLowerCase().includes(e)||t.id.toLowerCase().includes(e)):o)},document.getElementById(`user-search`).addEventListener(`input`,window.handleSearch);function l(e){let t={Admin:0,Employee:0,Broker:0,Buyer:0};e.forEach(e=>{t[e.role]===void 0?t.Buyer++:t[e.role]++});let n=e.length||1,r=document.getElementById(`platform-breakdown-container`);r.innerHTML=[{name:`Admins`,key:`Admin`,color:`bg-error`,text:`text-error`},{name:`Employees`,key:`Employee`,color:`bg-tertiary`,text:`text-tertiary`},{name:`Brokers`,key:`Broker`,color:`bg-secondary`,text:`text-secondary`},{name:`Buyers`,key:`Buyer`,color:`bg-primary`,text:`text-primary`}].map(e=>{let r=t[e.key],i=Math.round(r/n*100);return`
      <div>
        <div class="flex justify-between items-center mb-1">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full ${e.color}"></span>
            <span class="font-body-md font-semibold text-on-background text-sm">${e.name}</span>
          </div>
          <span class="font-body-sm text-xs font-bold text-on-surface-variant">${r} (${i}%)</span>
        </div>
        <div class="w-full bg-surface-container rounded-full h-2 overflow-hidden">
          <div class="${e.color} h-full transition-all duration-500" style="width: ${i}%"></div>
        </div>
      </div>
    `}).join(``)}async function u(){let{data:n,error:r}=await e.from(`listings`).select(`*`).order(`created_at`,{ascending:!1}).limit(4),i=document.getElementById(`listings-moderation-list`);if(r||!n||n.length===0){i.innerHTML=`
      <div class="text-center py-8 text-on-surface-variant text-sm">
        No active property listings available for moderation.
      </div>`;return}i.innerHTML=n.map(e=>{let t=new Intl.NumberFormat(`en-IN`,{style:`currency`,currency:`INR`,maximumFractionDigits:0}).format(e.price);return`
      <div class="flex items-center justify-between p-3 border border-surface-variant rounded-lg hover:border-outline-variant transition-colors bg-surface-bright">
        <div class="flex items-center gap-3">
          <img src="${e.img||`https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=120&q=80`}" class="w-12 h-12 object-cover rounded-lg border border-outline-variant bg-surface-container" alt="Listing Image"/>
          <div>
            <div class="font-body-md font-medium text-on-background line-clamp-1">${e.title}</div>
            <div class="font-body-sm text-on-surface-variant text-xs">${e.location} • <span class="font-semibold text-primary">${t}</span></div>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="delete-listing-btn w-8 h-8 rounded-full bg-error-container text-on-error-container flex items-center justify-center hover:bg-error hover:text-on-error transition-colors" data-id="${e.id}" data-title="${e.title}" title="Delete Listing">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>
    `}).join(``),document.querySelectorAll(`.delete-listing-btn`).forEach(n=>{n.addEventListener(`click`,async()=>{let r=n.getAttribute(`data-id`),i=n.getAttribute(`data-title`);if(confirm(`Are you sure you want to permanently delete the listing "${i}"?`)){let{error:n}=await e.from(`listings`).delete().eq(`id`,r);n?t(n.message,!0):(t(`✓ Successfully deleted listing "${i}"`),u(),a())}})})}var d=document.getElementById(`create-staff-modal`),f=document.getElementById(`create-staff-inner`);function p(){d.classList.remove(`opacity-0`,`pointer-events-none`),setTimeout(()=>f.classList.remove(`scale-95`),10)}function m(){d.classList.add(`opacity-0`,`pointer-events-none`),f.classList.add(`scale-95`),document.getElementById(`staff-name`).value=``,document.getElementById(`staff-email`).value=``,document.getElementById(`staff-password`).value=``,document.getElementById(`staff-role`).value=`Employee`}document.getElementById(`create-staff-btn`)?.addEventListener(`click`,p),document.getElementById(`close-staff-modal`)?.addEventListener(`click`,m),d?.addEventListener(`click`,e=>{e.target===d&&m()}),document.getElementById(`submit-staff-btn`)?.addEventListener(`click`,async()=>{let e=document.getElementById(`staff-name`).value.trim(),n=document.getElementById(`staff-email`).value.trim(),i=document.getElementById(`staff-password`).value,o=document.getElementById(`staff-role`).value,c=document.getElementById(`submit-staff-btn`);if(!e||!n||!i){t(`Please fill in all fields.`,!0);return}if(i.length<8){t(`Password must be at least 8 characters.`,!0);return}c.disabled=!0,c.textContent=`Creating...`;try{let c=await fetch(`https://xjpqxhbuuevaplvthvsf.supabase.co/functions/v1/create-staff-user`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${r.access_token}`},body:JSON.stringify({full_name:e,email:n,password:i,role:o})}),l=await c.json();if(!c.ok)throw Error(l.error||`Failed to create account.`);t(`✓ ${o} account created for ${n}`),m(),s(),a()}catch(e){t(e.message,!0)}finally{c.disabled=!1,c.textContent=`Create Account`}}),i();