const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = [...walk('app'), ...walk('components'), ...walk('lib')];

// Rename lib/supabase.ts to lib/localDb.ts
if (fs.existsSync('lib/supabase.ts')) {
  fs.renameSync('lib/supabase.ts', 'lib/localDb.ts');
  const index = files.indexOf(path.join('lib', 'supabase.ts'));
  if (index !== -1) {
    files[index] = path.join('lib', 'localDb.ts');
  }
}

// Modify each file
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace imports
  content = content.replace(/from\s+['"]@\/lib\/supabase['"]/g, "from '@/lib/localDb'");
  content = content.replace(/import\s+\{\s*supabase\s*\}\s+from/g, "import { db } from");
  
  // Actually, sometimes it's "import { supabase } from '@/lib/supabase'". We handled both above or we can do:
  
  // Replace references
  // Be careful not to replace it inside words, so use word boundary
  content = content.replace(/\bsupabase\./g, "db.");
  
  // Inside lib/localDb.ts, update the export
  if (file.includes('localDb.ts')) {
    content = content.replace(/export const supabase = mockSupabase as any;/g, "export const db = mockSupabase as any;");
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
});

// Remove supabase folder
if (fs.existsSync('supabase')) {
  fs.rmSync('supabase', { recursive: true, force: true });
  console.log('Removed supabase backend folder');
}

console.log('Refactor complete');
