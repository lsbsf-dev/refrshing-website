const fs = require('fs');
const path = require('path');

function replaceInPublicFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInPublicFiles(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // If it still has ACTIVE_EVENT_ID but doesn't have the injection, inject it
      if (content.includes('ACTIVE_EVENT_ID') && !content.includes('const ACTIVE_EVENT_ID =')) {
        
        // Find the export default function line
        const componentRegex = /export\s+default\s+function\s+\w+\s*\([^)]*\)\s*{/;
        if (componentRegex.test(content)) {
           content = content.replace(componentRegex, `$&
  const __params = require("next/navigation").useParams();
  const ACTIVE_EVENT_ID = __params?.eventId as string;`);
           fs.writeFileSync(fullPath, content);
           console.log(`Fixed ${fullPath}`);
        } else {
           console.log(`Could not fix ${fullPath} - no export default function found`);
        }
      }
    }
  }
}

replaceInPublicFiles(path.join(__dirname, 'src/app/(public)/[eventId]'));
