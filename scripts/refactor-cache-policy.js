#!/usr/bin/env node

/**
 * This script refactors the codebase to use the new cache policy approach.
 * It updates imports, replaces old fetch options with the new syntax,
 * and modifies client.fetch calls to use the new policy parameter.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript and TSX files in the core directory
const getAllFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (
      (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) && 
      !filePath.includes('node_modules') &&
      !filePath.includes('dist') &&
      !filePath.includes('.next')
    ) {
      fileList.push(filePath);
    }
  });

  return fileList;
};

// Main refactoring function
const refactorFiles = () => {
  const coreDir = path.resolve(process.cwd(), 'core');
  const files = getAllFiles(coreDir);
  let modifiedCount = 0;

  files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Skip the client/index.ts file as it's the source of the new approach
    if (filePath.includes('client/index.ts')) {
      return;
    }

    // 1. Update imports
    const oldImport = /import\s+{([^}]*)cache-policy([^}]*)}(\s+from\s+['"]~\/client\/cache-policy['"];?)/g;
    if (oldImport.test(content)) {
      // Extract the imported items
      const importMatch = content.match(oldImport);
      if (importMatch) {
        const importedItems = importMatch[0].match(/import\s+{([^}]*)}/)[1];
        
        // Check which items are imported
        const hasRevalidate = /\brevalidate\b/.test(importedItems);
        const hasTags = /\bTAGS\b/.test(importedItems);
        const hasShopperCachePolicy = /\bshopperCachePolicy\b/.test(importedItems);
        const hasDoNotCachePolicy = /\bdoNotCachePolicyWithEntityTags\b/.test(importedItems);
        
        // Create new import statement
        let newImports = [];
        if (hasRevalidate) newImports.push('revalidate');
        if (hasTags) newImports.push('TAGS');
        if (hasShopperCachePolicy) newImports.push('shopperCache');
        if (hasDoNotCachePolicy) newImports.push('doNotCache');
        
        if (newImports.length > 0) {
          // Replace the old import with the new one
          content = content.replace(
            oldImport, 
            `import { ${newImports.join(', ')} } from '~/client';`
          );
          modified = true;
        }
      }
    }

    // 2. Replace shopperCachePolicy with shopperCache
    const shopperCachePolicyRegex = /shopperCachePolicy\(([^)]*)\)/g;
    if (shopperCachePolicyRegex.test(content)) {
      content = content.replace(shopperCachePolicyRegex, (match, args) => {
        const argParts = args.split(',').map(arg => arg.trim());
        const customerAccessToken = argParts[0];
        const entityType = argParts[1] !== 'undefined' ? argParts[1] : undefined;
        const cacheForCustomer = argParts[2] === 'true';
        
        let newArgs = `{ customerAccessToken: ${customerAccessToken}`;
        if (entityType && entityType !== 'undefined') {
          newArgs += `, entityType: ${entityType}`;
        }
        if (cacheForCustomer) {
          newArgs += `, cacheForCustomer: true`;
        }
        newArgs += ' }';
        
        return `shopperCache(${newArgs})`;
      });
      modified = true;
    }

    // 3. Replace doNotCachePolicyWithEntityTags with doNotCache
    const doNotCachePolicyRegex = /doNotCachePolicyWithEntityTags\(([^)]*)\)/g;
    if (doNotCachePolicyRegex.test(content)) {
      content = content.replace(doNotCachePolicyRegex, (match, args) => {
        const argParts = args.split(',').map(arg => arg.trim());
        let newArgs = '';
        
        // Check if it's an object parameter
        if (args.includes('{')) {
          newArgs = args;
        } else {
          // Convert to object parameter
          const entityType = argParts[0];
          const entityId = argParts[1];
          
          newArgs = '{ ';
          if (entityType && entityType !== 'undefined') {
            newArgs += `entityType: ${entityType}`;
          }
          if (entityId && entityId !== 'undefined') {
            if (newArgs.length > 2) newArgs += ', ';
            newArgs += `entityId: ${entityId}`;
          }
          newArgs += ' }';
        }
        
        return `doNotCache(${newArgs})`;
      });
      modified = true;
    }

    // 4. Update client.fetch calls to use policy parameter instead of fetchOptions
    const clientFetchRegex = /client\.fetch\(\s*{([^}]*)fetchOptions:\s*([^,}]*),?([^}]*)}\s*\)/g;
    if (clientFetchRegex.test(content)) {
      content = content.replace(clientFetchRegex, (match, before, fetchOptions, after) => {
        return `client.fetch({ ${before}policy: ${fetchOptions},${after}})`;
      });
      modified = true;
    }

    // Save the modified file
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Modified: ${filePath}`);
      modifiedCount++;
    }
  });

  console.log(`\nRefactoring complete. Modified ${modifiedCount} files.`);
};

// Run the refactoring
refactorFiles(); 