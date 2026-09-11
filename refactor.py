import json
import os
import shutil

# Merge package.json
with open('package.json', 'r') as f:
    root_pkg = json.load(f)

with open('frontend/package.json', 'r') as f:
    front_pkg = json.load(f)

# Merge dependencies
if 'dependencies' not in root_pkg:
    root_pkg['dependencies'] = {}
root_pkg['dependencies'].update(front_pkg.get('dependencies', {}))

if 'devDependencies' not in root_pkg:
    root_pkg['devDependencies'] = {}
root_pkg['devDependencies'].update(front_pkg.get('devDependencies', {}))

# Update scripts
root_pkg['scripts']['dev'] = "vite"
root_pkg['scripts']['build'] = "npm run compact && tsc -b && vite build"
root_pkg['scripts']['preview'] = "vite preview"
root_pkg['scripts'].pop('dev:frontend', None)
root_pkg['scripts'].pop('build:frontend', None)

with open('package.json', 'w') as f:
    json.dump(root_pkg, f, indent=2)

# Copy configuration files
shutil.move('frontend/index.html', 'index.html')
shutil.move('frontend/vite.config.ts', 'vite.config.ts')
# Rename frontend tsconfig
shutil.move('frontend/tsconfig.json', 'tsconfig.frontend.json')

# We'll update root tsconfig to include references if needed, or just allow it to manage src
with open('tsconfig.json', 'r') as f:
    root_ts = json.load(f)
if "frontend" in root_ts.get("exclude", []):
    root_ts["exclude"].remove("frontend")
with open('tsconfig.json', 'w') as f:
    json.dump(root_ts, f, indent=2)

# Move src files
for item in os.listdir('frontend/src'):
    src_path = os.path.join('frontend/src', item)
    dst_path = os.path.join('src', item)
    shutil.move(src_path, dst_path)

# Move public files if they exist
if os.path.exists('frontend/public') and os.listdir('frontend/public'):
    if not os.path.exists('public'):
        os.makedirs('public')
    for item in os.listdir('frontend/public'):
        shutil.move(os.path.join('frontend/public', item), os.path.join('public', item))

# Remove frontend folder
shutil.rmtree('frontend')

print("Refactoring complete.")
