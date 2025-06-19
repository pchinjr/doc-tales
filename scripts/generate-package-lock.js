#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the project root directory
const projectRoot = path.resolve(__dirname, '..');

// Read the root package.json
const rootPackageJson = require(path.join(projectRoot, 'package.json'));

// Read the workspace package.json files
const commonPackageJson = require(path.join(projectRoot, 'packages/common/package.json'));
const backendPackageJson = require(path.join(projectRoot, 'packages/backend/package.json'));
const frontendPackageJson = require(path.join(projectRoot, 'packages/frontend/package.json'));

// Create a temporary package.json with all dependencies
const tempPackageJson = {
  name: rootPackageJson.name,
  version: rootPackageJson.version,
  private: true,
  workspaces: rootPackageJson.workspaces,
  dependencies: {
    ...rootPackageJson.dependencies,
  },
  devDependencies: {
    ...rootPackageJson.devDependencies,
  }
};

// Write the temporary package.json
fs.writeFileSync(
  path.join(projectRoot, 'package.json.temp'),
  JSON.stringify(tempPackageJson, null, 2)
);

try {
  // Rename the temporary file to package.json
  fs.renameSync(
    path.join(projectRoot, 'package.json.temp'),
    path.join(projectRoot, 'package.json')
  );

  console.log('Generated package.json with all dependencies');
  console.log('Now run "npm install" to generate the package-lock.json file');
} catch (error) {
  console.error('Error:', error);
  // Restore the original package.json if there was an error
  if (fs.existsSync(path.join(projectRoot, 'package.json.temp'))) {
    fs.unlinkSync(path.join(projectRoot, 'package.json.temp'));
  }
}
