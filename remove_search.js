const fs = require('fs');

const files = ['index.html', 'properties.html', 'map.html', 'property-details.html', 'sell.html'];

files.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        // Remove the search block (Small Search in Nav)
        content = content.replace(/\s*<!-- Small Search in Nav -->[\s\S]*?<\/div>/m, (match) => {
            // Only remove the first matching block (the search div)
            // Make sure it's the search pill not other divs
            if (match.includes('Search...') || match.includes('search')) return '';
            return match;
        });
        fs.writeFileSync(file, content);
        console.log('Cleaned ' + file);
    } catch(e) {
        console.error('Error in ' + file, e.message);
    }
});
