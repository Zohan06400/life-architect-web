# Life Architect - Web Deployment Guide

## Quick Start (Local Development)

### Prerequisites
- Node.js 16+ installed
- npm or yarn

### Steps

1. **Install dependencies**
```bash
cd life-architect-web
npm install
```

2. **Install Tailwind CSS**
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

3. **Start development server**
```bash
npm start
```

4. **Open in browser**
```
http://localhost:3000
```

---

## Deployment Options

### Option 1: Vercel (Recommended - Free & Easy)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel auto-detects React and deploys!

**Or use Vercel CLI:**
```bash
npm install -g vercel
vercel
```

### Option 2: Netlify (Free)

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Build command: `npm run build`
6. Publish directory: `build`

**Or drag & drop:**
```bash
npm run build
# Then drag the 'build' folder to Netlify
```

### Option 3: GitHub Pages (Free)

1. Install gh-pages:
```bash
npm install -D gh-pages
```

2. Add to package.json:
```json
{
  "homepage": "https://yourusername.github.io/life-architect",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

3. Deploy:
```bash
npm run deploy
```

### Option 4: Firebase Hosting (Free tier)

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
```

2. Select "build" as public directory
3. Configure as single-page app: Yes

4. Deploy:
```bash
npm run build
firebase deploy
```

### Option 5: AWS Amplify

1. Go to AWS Amplify Console
2. Connect your Git repository
3. Amplify auto-detects build settings
4. Deploy!

---

## Build for Production

```bash
npm run build
```

This creates an optimized `build` folder ready for deployment.

---

## Environment Variables (Optional)

Create a `.env` file for any configuration:
```
REACT_APP_NAME=Life Architect
REACT_APP_VERSION=1.0.0
```

---

## PWA Support

The app is PWA-ready! Users can "Add to Home Screen" on mobile devices for an app-like experience.

To enable full PWA:
1. Add icons (logo192.png, logo512.png) to the `public` folder
2. Create a service worker for offline support

---

## Custom Domain

Most hosting platforms support custom domains:

1. **Vercel**: Settings → Domains → Add
2. **Netlify**: Domain Settings → Add custom domain
3. **GitHub Pages**: Settings → Pages → Custom domain

---

## Troubleshooting

### Blank page after deployment
- Check if `homepage` in package.json matches your URL
- Ensure build completed without errors

### Styles not loading
- Verify Tailwind is properly configured
- Check that index.css imports Tailwind directives

### LocalStorage not persisting
- Check browser privacy settings
- Ensure HTTPS is enabled (required for some browsers)

---

## File Structure

```
life-architect-web/
├── public/
│   ├── index.html
│   ├── manifest.json
│   ├── favicon.ico
│   └── logo192.png
├── src/
│   ├── App.jsx          # Main application
│   ├── index.js         # Entry point
│   └── index.css        # Styles + Tailwind
├── package.json
├── tailwind.config.js
└── README.md
```

---

## Support

The app uses localStorage for data persistence. All data stays on the user's device - no backend required!

Enjoy your Life Architect! 🚀
