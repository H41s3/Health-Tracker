# 🔗 Update Your Site URL

## Current Status
Your social media preview is configured, but you need to update the URLs with your actual Netlify site address.

## What's Your Netlify URL?

After deploying, your site URL will be something like:
- `https://your-app-name.netlify.app`
- Or if you added a custom domain: `https://yourdomain.com`

## How to Update

### Step 1: Find Your Netlify URL
1. Go to your Netlify dashboard
2. Click on your site
3. Copy the site URL (e.g., `https://health-tracker-dashboard.netlify.app`)

### Step 2: Update `index.html`
Open `index.html` and replace ALL instances of:
```
https://health-tracker-dashboard.netlify.app/
```

With your actual URL:
```
https://YOUR-ACTUAL-SITE.netlify.app/
```

**Lines to update:**
- Line ~19: `<meta property="og:url" content="..." />`
- Line ~23: `<meta property="og:image" content="..." />`
- Line ~27: `<meta property="twitter:url" content="..." />`
- Line ~30: `<meta property="twitter:image" content="..." />`

### Step 3: Commit and Push
```bash
git add index.html
git commit -m "Update social preview URLs"
git push
```

Netlify will auto-deploy in 2-3 minutes!

---

## Alternative: Use Relative URLs (Advanced)

If you want the URLs to work automatically regardless of domain, you can modify the `index.html` to use JavaScript to set the URLs dynamically, but for now the static approach works great!

---

**Quick Checklist:**
- [ ] Deploy to Netlify
- [ ] Copy your site URL
- [ ] Update URLs in index.html
- [ ] Add og-image.png to public folder
- [ ] Push to GitHub
- [ ] Test preview links!

