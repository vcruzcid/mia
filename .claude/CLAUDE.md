# MIA Project - Global Claude Instructions

## Project Structure
This is a monorepo containing:
- `mia-react-app/` - React frontend application (production)
- `mia-wordpress/` - WordPress old website files used for reference (development and reference only; used to get information, data, content from the old website to move to the new website)

## Development Rules
- All React development happens in `mia-react-app/`
- WordPress files in `mia-wordpress/` are for reference only
- Production deploys only the React app content

## Git Strategy  
- Main repo: `/mia/` with unified git history
- Development branch: `dev`
- Production branch: `main`

## Build Process
```bash
cd mia-react-app
npm run build      # Creates dist/ folder for deployment
```

## Key Principles
1. Keep WordPress and React concerns separated
2. Only deploy React app to development until instructed to deploy to production
3. Maintain clean git history
4. Use proper .gitignore for security
5. Use available mcp tools