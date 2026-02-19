@echo off
echo Deploying to Vercel...

REM Check if Vercel CLI is installed
npx vercel --version >nul 2>&1
if errorlevel 1 (
    echo Installing Vercel CLI...
    npm install -g vercel
)

REM Build the project
echo Building project...
npm run build

if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)

REM Deploy to Vercel
echo Deploying to Vercel...
npx vercel --prod

echo Deployment complete!
pause
