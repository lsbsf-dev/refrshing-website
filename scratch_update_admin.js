const fs = require('fs');
const path = require('path');

function replaceInAdminFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInAdminFiles(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('ACTIVE_EVENT_ID')) {
        content = content.replace(/import\s+{\s*ACTIVE_EVENT_ID\s*}\s+from\s+"@\/lib\/firebase\/app";/g, 'import { useAdminEvent } from "@/hooks/useAdminEvent";');
        
        // Add the hook inside the component
        const componentRegex = /export\s+default\s+function\s+\w+\(\)\s*{/;
        if (componentRegex.test(content) && !content.includes('useAdminEvent()')) {
           content = content.replace(componentRegex, `$&
  const { eventId: ACTIVE_EVENT_ID } = useAdminEvent();`);
        }
        
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

replaceInAdminFiles(path.join(__dirname, 'src/app/(admin)'));
