# Railway Deployment Guide

## Issues Fixed

1. **CORS Configuration**: Updated to allow Railway domain in production
2. **Port Configuration**: Improved PORT environment variable handling
3. **Environment Variables**: Config now properly reads from Railway environment variables
4. **PostgreSQL Support**: Added psycopg2-binary for PostgreSQL databases

## Required Environment Variables in Railway

You **MUST** set these environment variables in your Railway project settings:

### Required Variables:

1. **SECRET_KEY** (Required)
   - A secret key for JWT token signing
   - Generate a secure random string (e.g., use `openssl rand -hex 32`)
   - Example: `your-super-secret-key-change-this-in-production`

2. **DATABASE_URL** (Optional if Railway provides PostgreSQL)
   - If Railway automatically provisions a PostgreSQL database, this will be set automatically
   - If using SQLite: `sqlite:///./sweetshop.db`
   - If using Railway PostgreSQL: Railway will set this automatically

3. **ALGORITHM** (Optional)
   - Default: `HS256`
   - JWT algorithm to use

4. **ACCESS_TOKEN_EXPIRE_MINUTES** (Optional)
   - Default: `30`
   - Token expiration time in minutes

### How to Set Environment Variables in Railway:

1. Go to your Railway project dashboard
2. Click on your service
3. Go to the "Variables" tab
4. Add the required environment variables:
   - `SECRET_KEY` (REQUIRED - generate a secure random string)
   - `ALGORITHM` (optional, defaults to HS256)
   - `ACCESS_TOKEN_EXPIRE_MINUTES` (optional, defaults to 30)

### If Railway Provides PostgreSQL:

Railway typically automatically provisions a PostgreSQL database and sets `DATABASE_URL`. If you see a database service in your Railway project, the `DATABASE_URL` should be automatically available.

### Testing the Deployment:

After setting the environment variables and redeploying:

1. Check Railway logs to ensure the app starts successfully
2. Visit your Railway domain (e.g., `https://your-app.railway.app/`)
3. You should see: `{"message": "Welcome to the Sweet Shop API"}`
4. Test API endpoints at `/api/sweets` or `/api/auth/register`

### Common Issues:

1. **502 Bad Gateway**: Usually means the app crashed on startup
   - Check Railway logs for error messages
   - Ensure all required environment variables are set
   - Verify DATABASE_URL is correct

2. **Database Connection Errors**: 
   - If using Railway PostgreSQL, ensure the database service is running
   - Check that DATABASE_URL is correctly set

3. **CORS Errors**: 
   - The app now allows all origins in production
   - If you need to restrict, set `RAILWAY_PUBLIC_DOMAIN` environment variable

### Generate SECRET_KEY:

You can generate a secure SECRET_KEY using:

```bash
# Linux/Mac
openssl rand -hex 32

# Or use Python
python -c "import secrets; print(secrets.token_hex(32))"
```

Copy the output and set it as the `SECRET_KEY` environment variable in Railway.

