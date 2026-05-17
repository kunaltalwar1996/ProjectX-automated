const fs = require('fs');
const path = require('path');

const filesToFix = [
    'properties.html',
    'map.html',
    'index.html',
    'fix_properties.js',
    'employee-panel.html',
    'broker-dashboard.html',
    'property-details.html',
    'admin-panel.html',
    'demo-data.js',
    'auth.js'
];

const propertyImageURL = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80';
const profileImageURL = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80';

filesToFix.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Manual replacement for profile images first:
        content = content.replace(/src="https:\/\/lh3\.googleusercontent\.com\/aida-public\/[a-zA-Z0-9_-]+"(?=.*?alt="Broker)/gi, 'src="' + profileImageURL + '"');
        content = content.replace(/(alt="Broker.*?)src="https:\/\/lh3\.googleusercontent\.com\/aida-public\/[a-zA-Z0-9_-]+"/gi, '$1src="' + profileImageURL + '"');
        // Handle property-details broker image
        content = content.replace(/src="https:\/\/lh3\.googleusercontent\.com\/aida-public\/[a-zA-Z0-9_-]+".*?alt="Broker Sarah Jenkins"/gi, 'src="' + profileImageURL + '" alt="Broker Sarah Jenkins"');
        // Handle admin-panel and broker-dashboard profile image
        content = content.replace(/(id="broker-profile-img".*?)src="https:\/\/lh3\.googleusercontent\.com\/aida-public\/[a-zA-Z0-9_-]+"/gi, '$1src="' + profileImageURL + '"');

        // Replace any remaining Google URLs with the property image
        content = content.replace(/https:\/\/lh3\.googleusercontent\.com\/aida-public\/[a-zA-Z0-9_-]+/g, propertyImageURL);

        fs.writeFileSync(filePath, content);
        console.log("Updated " + file);
    }
});
