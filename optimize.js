const fs = require('fs');

const dir = '.';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add preconnect if not exists
    if (!content.includes('preconnect') && content.includes('<head>')) {
        content = content.replace('<head>', '<head>\n<link rel="preconnect" href="https://lh3.googleusercontent.com" crossorigin="anonymous">\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
    }
    
    // Add loading="lazy" to imgs that don't have it
    content = content.replace(/<img (?![^>]*loading=)/g, '<img loading="lazy" decoding="async" ');
    
    fs.writeFileSync(file, content);
});

console.log('Optimized HTML files');
