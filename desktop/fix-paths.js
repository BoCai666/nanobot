// Fix paths in index.html for Tauri
import fs from 'fs';
import path from 'path';

const indexPath = path.join(process.cwd(), 'build', 'index.html');

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf-8');
  
  // Fix href and src attributes
  html = html.replace(/href="\//g, 'href="./');
  html = html.replace(/src="\//g, 'src="./');
  // Fix import statements
  html = html.replace(/import\("\//g, 'import("./');
  
  fs.writeFileSync(indexPath, html);
  console.log('✅ Fixed paths in build/index.html');
} else {
  console.log('❌ build/index.html not found');
}
