# RainShield Deployment Guide

## Quick Deploy Steps

### 1. Backend (Vercel)
```bash
cd backend
npm install -g vercel
vercel login
vercel --prod
```

### 2. Frontend (Netlify)
```bash
cd frontend
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=build
```

## Alternative: One-Click Deploy

### Backend - Railway
1. Go to railway.app
2. Connect GitHub repo
3. Deploy backend folder
4. Add environment variables from .env

### Frontend - Vercel
1. Go to vercel.com
2. Import GitHub repo
3. Set root directory to "frontend"
4. Deploy

## Environment Variables Needed

### Backend (.env)
- MONGODB_URI=mongodb+srv://palisettysanjaykumar_db_user:StPcfumQIOvDAEtS@urs.h9jrkne.mongodb.net/demo
- JWT_SECRET=your_jwt_secret_here
- PORT=5000

### Frontend (.env.production)
- REACT_APP_API_URL=https://your-deployed-backend-url/api

## Test URLs
After deployment, test these endpoints:
- Frontend: https://your-frontend-url.netlify.app
- Backend API: https://your-backend-url.vercel.app/api/auth/test