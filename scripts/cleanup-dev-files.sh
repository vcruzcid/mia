#!/bin/bash

# Script to clean up development and test files before committing
# This ensures a clean codebase for production

echo "🧹 Cleaning up development files..."

# Remove the dev test page
if [ -f "src/pages/DevTestPage.tsx" ]; then
    echo "Removing DevTestPage.tsx..."
    rm src/pages/DevTestPage.tsx
fi

# Remove dev test spec
if [ -f "tests/dev-test.spec.ts" ]; then
    echo "Removing dev-test.spec.ts..."
    rm tests/dev-test.spec.ts
fi

# Remove dev test route from App.tsx
if [ -f "src/App.tsx" ]; then
    echo "Removing dev test route from App.tsx..."
    # Create a temporary file without the dev test route
    sed '/import.*DevTestPage/d; /dev-test.*element/d' src/App.tsx > src/App.tsx.tmp
    mv src/App.tsx.tmp src/App.tsx
fi

echo "✅ Cleanup complete! Ready for commit."
