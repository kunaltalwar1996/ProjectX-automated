const fs = require('fs');
const path = require('path');

const filesToFix = [
    'login.html',
    'staff-login.html',
    'sell.html'
];

const propertyImageURL = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80';

filesToFix.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace any Google URLs with the property image
        content = content.replace(/https:\/\/lh3\.googleusercontent\.com\/aida-public\/[a-zA-Z0-9_-]+/g, propertyImageURL);

        fs.writeFileSync(filePath, content);
        console.log("Updated " + file);
    }
});
