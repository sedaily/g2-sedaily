import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 Building for static export...');

const originalConfig = 'next.config.mjs';
const exportConfig = 'next.config.export.mjs';
const backupConfig = 'next.config.mjs.backup';

// Function to delete only specific .txt files (keep robots.txt and all RSC files)
function deleteTxtFiles(dir) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir, { withFileTypes: true });
  files.forEach(file => {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      deleteTxtFiles(fullPath);
    } else if (file.name.endsWith('.txt') && 
               file.name !== 'robots.txt' && 
               file.name !== 'index.txt') {
      // Only delete specific .txt files, not robots.txt or index.txt
      fs.unlinkSync(fullPath);
      console.log(`🗑️  Deleted: ${fullPath}`);
    }
  });
}

try {
  // Backup original config
  if (fs.existsSync(originalConfig)) {
    fs.copyFileSync(originalConfig, backupConfig);
  }

  // Use export config
  fs.copyFileSync(exportConfig, originalConfig);

  // Build
  console.log('📦 Running next build...');
  execSync('next build', { stdio: 'inherit' });

  // Keep all RSC-related files (index.txt) and robots.txt
  console.log('🧹 Cleaning up specific .txt files (keeping RSC files)...');
  deleteTxtFiles('./out');

  console.log('✅ Static export build complete! Check the /out folder.');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} finally {
  // Restore original config
  if (fs.existsSync(backupConfig)) {
    fs.copyFileSync(backupConfig, originalConfig);
    fs.unlinkSync(backupConfig);
  }
}