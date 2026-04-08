const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(dir);
for(let file of files) {
  if(file.endsWith('.tsx')) {
    let p = path.join(dir, file);
    let c = fs.readFileSync(p, 'utf8');
    let nc = c.replace(/SOUNDRENALINE/g, 'KLIXTICKET')
              .replace(/SOUND<span className="text-outline">RENALINE<\/span>/g, 'KLIX<span className="text-outline">TICKET<\/span>')
              .replace(/SOUND<span className="text-outline">RENALINE\.<\/span>/g, 'KLIX<span className="text-outline">TICKET\.<\/span>');
    if (c !== nc) {
        fs.writeFileSync(p, nc);
        console.log(`Updated ${file}`);
    }
  }
}
