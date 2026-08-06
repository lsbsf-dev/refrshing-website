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
      if (content.includes('ACTIVE_EVENT_ID')) {
        content = content.replace(/import\s+{\s*ACTIVE_EVENT_ID\s*}\s+from\s+"@\/lib\/firebase\/app";/g, 'import { useParams } from "next/navigation";');
        
        // Add the hook inside the component
        const componentRegex = /export\s+default\s+function\s+\w+\(\)\s*{/;
        if (componentRegex.test(content) && !content.includes('useParams()')) {
           content = content.replace(componentRegex, `$&
  const params = useParams();
  const ACTIVE_EVENT_ID = params?.eventId as string;`);
        }
        
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

replaceInPublicFiles(path.join(__dirname, 'src/app/(public)/[eventId]'));
