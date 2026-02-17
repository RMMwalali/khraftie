# GitHub Actions Setup for Cosmic CMS Auto-Deployment

## 🚀 Quick Setup Guide

### 1. Create GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it something like `kraftevents-cms`
3. Don't initialize with README (we already have content)

### 2. Push Your Code to GitHub
```bash
# Add remote repository (replace YOUR_USERNAME/REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/kraftevents-cms.git

# Push to GitHub
git push -u origin main
```

### 3. Set Up GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

#### Cosmic CMS Credentials:
- `PUBLIC_COSMIC_BUCKET_SLUG`: Your Cosmic bucket slug
- `PUBLIC_COSMIC_READ_KEY`: Your Cosmic read key

#### cPanel FTP Credentials:
- `FTP_SERVER`: Your domain (e.g., `yourdomain.com`)
- `FTP_USERNAME`: Your cPanel username
- `FTP_PASSWORD`: Your cPanel password

### 4. How It Works

The GitHub Actions workflow will:

1. **Every 30 minutes**: Check Cosmic CMS for updates
2. **On content changes**: Sync content to JSON files
3. **Auto-build**: Create optimized static site
4. **Auto-deploy**: Upload to your cPanel hosting

### 5. Manual Trigger

You can also trigger a build manually:
1. Go to Actions tab in your GitHub repo
2. Select "Auto Deploy on Content Change"
3. Click "Run workflow"

### 6. Monitor Deployment

- Check the Actions tab in GitHub for build status
- View deployment logs for any errors
- Your site will update automatically when Cosmic content changes

### 7. First Time Setup

After setting up secrets:
1. Push any small change to trigger the first workflow
2. Check that it builds and deploys successfully
3. Test by updating content in Cosmic CMS
4. Within 30 minutes, your site should update automatically

## 🔧 Troubleshooting

### Build Fails:
- Check that all secrets are correctly set
- Verify Cosmic credentials are valid
- Ensure FTP credentials are correct

### FTP Upload Fails:
- Make sure cPanel FTP is enabled
- Check that the server directory path is correct
- Verify FTP username and password

### Content Not Updating:
- Check Cosmic bucket slug and read key
- Verify content types and slugs match
- Check the workflow logs for sync errors

## 📋 Checklist Before Going Live

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] All secrets added to GitHub
- [ ] First workflow runs successfully
- [ ] Site deploys to cPanel
- [ ] Cosmic CMS updates trigger new builds
- [ ] Manual workflow trigger works

## 🎯 Benefits

✅ **Free**: No cost for GitHub Actions (public repos)  
✅ **Automatic**: No manual rebuilds needed  
✅ **Reliable**: Runs every 30 minutes automatically  
✅ **Version Control**: All changes tracked in Git  
✅ **Rollback**: Easy to revert if something breaks  
✅ **Logs**: Full deployment history and debugging  

Your site will now automatically update whenever you publish content in Cosmic CMS!
