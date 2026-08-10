const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, '../src/app/(admin)/admin'),
  path.join(__dirname, '../src/components/admin')
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Backgrounds
  content = content.replace(/bg-white dark:bg-\[\#181612\]/g, 'bg-surface');
  content = content.replace(/bg-white dark:bg-\[\#14120E\]/g, 'bg-surface-alt');
  content = content.replace(/bg-zinc-50 dark:bg-white\/5/g, 'bg-surface-muted');
  content = content.replace(/bg-zinc-100 dark:bg-white\/10/g, 'bg-surface-hover');
  content = content.replace(/bg-\[\#FAF9F6\] dark:bg-\[\#181612\]/g, 'bg-surface');
  
  // Text
  content = content.replace(/text-\[\#0B0907\] dark:text-\[\#FCFAF6\]/g, 'text-foreground');
  content = content.replace(/text-\[\#1C1A17\] dark:text-\[\#FCFAF6\]/g, 'text-foreground');
  content = content.replace(/text-\[\#0B0907\] dark:text-white/g, 'text-foreground');
  content = content.replace(/text-black\/60 dark:text-white\/60/g, 'text-foreground-muted');
  content = content.replace(/text-zinc-600 dark:text-white\/70/g, 'text-foreground-muted');
  content = content.replace(/text-zinc-600 dark:text-zinc-400/g, 'text-foreground-muted');
  content = content.replace(/text-zinc-500 dark:text-zinc-400/g, 'text-foreground-muted');
  
  // Borders
  content = content.replace(/border-black\/10 dark:border-white\/10/g, 'border-border');
  content = content.replace(/border-black\/15 dark:border-white\/15/g, 'border-border-strong');
  content = content.replace(/border-zinc-300 dark:border-white\/10/g, 'border-border');
  content = content.replace(/border-zinc-200 dark:border-white\/10/g, 'border-border');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

targetDirs.forEach(walkDir);
console.log("Refactoring complete.");
