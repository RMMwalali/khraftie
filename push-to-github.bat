@echo off
echo Pushing to GitHub...
echo.
echo First, create a GitHub repository at: https://github.com/new
echo.
echo Then replace YOUR_USERNAME below with your actual GitHub username
echo.

REM Replace YOUR_USERNAME with your GitHub username
set GITHUB_USER=YOUR_USERNAME
set REPO_NAME=kraftevents-cms

echo Adding remote origin...
git remote add origin https://github.com/%GITHUB_USER%/%REPO_NAME%.git

echo.
echo Pushing to GitHub...
git push -u origin main

echo.
echo Done! Now go to your repository on GitHub and set up the secrets:
echo - PUBLIC_COSMIC_BUCKET_SLUG
echo - PUBLIC_COSMIC_READ_KEY  
echo - FTP_SERVER
echo - FTP_USERNAME
echo - FTP_PASSWORD
echo.
echo See GITHUB_ACTIONS_SETUP.md for detailed instructions.
pause
