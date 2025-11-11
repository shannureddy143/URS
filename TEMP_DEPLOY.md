# 🚀 2-Hour Demo Deployment

## Quick Deploy (5 minutes)

### Option 1: Render (Recommended)
1. Go to render.com
2. Sign up with GitHub
3. Create new "Web Service"
4. Connect this repository
5. Use these settings:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: Add variables from backend/.env

### Option 2: Railway (Fastest)
1. Go to railway.app
2. "Deploy from GitHub"
3. Select this repo
4. Auto-deploys in 2 minutes

### Option 3: Vercel (Frontend) + Railway (Backend)
```bash
# Backend
railway login
railway deploy

# Frontend  
vercel --prod
```

## Demo Credentials
- **Email**: test@cu.edu.in
- **Password**: password123
- **Wallet**: ₹300 (pre-loaded)

## Demo Features
✅ Login/Register
✅ Wallet Management  
✅ Multiple Umbrella Selection
✅ GPS Tracking
✅ Payment System
✅ Drop-off Location Selection

## Auto-Shutdown
The demo will automatically shut down after 2 hours to save resources.

## Live URLs (After Deploy)
- **Frontend**: https://rainshield-frontend.onrender.com
- **Backend**: https://rainshield-backend.onrender.com/api