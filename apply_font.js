const fs = require('fs');

// 1. Update tailwind.config.js
let tailwindConfig = fs.readFileSync('tailwind.config.js', 'utf8');
tailwindConfig = tailwindConfig.replace(/"Inter"/g, '"Outfit"');
fs.writeFileSync('tailwind.config.js', tailwindConfig);

// 2. Update HTML files
const htmlFiles = ['index.html', 'properties.html', 'map.html', 'property-details.html', 'sell.html', 'login.html', 'staff-login.html', 'admin-panel.html', 'employee-panel.html', 'broker-dashboard.html'];

htmlFiles.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        
        // Update font link
        content = content.replace(/family=Inter:wght@[^&"']*/g, 'family=Outfit:wght@300;400;500;600;700;800;900');
        
        // Some might have font-['Inter']
        content = content.replace(/font-\['Inter'\]/g, "font-['Outfit']");
        
        fs.writeFileSync(file, content);
        console.log('Updated ' + file);
    } catch(e) {
        console.log('Could not process ' + file);
    }
});
