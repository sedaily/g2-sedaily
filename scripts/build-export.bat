@echo off
echo 🚀 Building for static export...

:: Backup original config
copy next.config.mjs next.config.mjs.backup

:: Use export config
copy next.config.export.mjs next.config.mjs

:: Build
call next build

:: Restore original config
copy next.config.mjs.backup next.config.mjs
del next.config.mjs.backup

echo ✅ Static export build complete! Check the /out folder.