const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'auth.js');
const propertyImageURL = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80';

if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace all instances of via.placeholder.com with our premium property image
    content = content.replace(/https:\/\/via\.placeholder\.com\/[a-zA-Z0-9?=+_-]+/g, propertyImageURL);

    fs.writeFileSync(filePath, content);
    console.log("Updated auth.js placeholders");
}
