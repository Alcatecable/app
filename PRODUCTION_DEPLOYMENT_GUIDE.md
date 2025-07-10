# NeuroLint API - Production Deployment Guide

## 🚀 Production-Ready Features

Your NeuroLint API is now **production-grade** with enterprise-level security and reliability:

### ✅ **Security Hardening**
- **Command Injection Protection**: Uses `spawn()` with array arguments
- **Input Validation**: Comprehensive validation with express-validator
- **Rate Limiting**: Tiered rate limiting (API, transform, upload endpoints)
- **CORS Security**: Strict origin validation
- **Security Headers**: Helmet.js with CSP, HSTS, XSS protection
- **File Security**: Secure temp file handling with proper cleanup
- **Request Sanitization**: Dangerous pattern detection and blocking

### ✅ **Operational Excellence**
- **Concurrency Control**: Maximum concurrent operations limiting
- **Request Tracking**: Unique operation IDs for debugging
- **Comprehensive Logging**: Morgan with structured error logging
- **Health Monitoring**: Detailed health checks with system metrics
- **Auto Cleanup**: Automatic temp file cleanup with graceful shutdown
- **Error Handling**: Structured error responses with proper HTTP codes

### ✅ **Performance Optimization**
- **Timeout Protection**: Configurable timeouts for all operations
- **Memory Management**: Efficient temp file handling
- **Request Queuing**: Built-in concurrency limits
- **Graceful Degradation**: Fallback transformations when scripts fail

## 📋 Pre-Deployment Checklist

### 1. **Install Dependencies**
```bash
npm install express-rate-limit express-validator helmet morgan node-cleanup
npm install --save-dev @types/morgan
```

### 2. **Environment Configuration**
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

Key production settings:
- `NODE_ENV=production`
- `TIMEOUT=45000` (45 seconds)
- `MAX_CONCURRENT=3` (for Vercel serverless)
- `RATE_LIMIT=50` (stricter for production)

### 3. **Verify Layer Scripts**
Ensure all layer scripts exist and are executable:
```bash
ls -la fix-layer-*.js
# Should show: fix-layer-1-config.js through fix-layer-6-testing.js
```

### 4. **Test Locally**
```bash
# Start API server
npm run api:dev

# Test health endpoint
curl http://localhost:3001/health

# Test transformation
curl -X POST http://localhost:3001/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"code":"console.log(\"test\")"}'
```

## 🚀 Vercel Deployment

### 1. **Deploy to Vercel**
```bash
# Login to Vercel (if not already)
npx vercel login

# Deploy
npx vercel --prod
```

### 2. **Configure Domain**
In your Vercel dashboard:
1. Go to your project settings
2. Add custom domain: `api.neurolint.dev`
3. Configure DNS to point to Vercel

### 3. **Environment Variables**
Set in Vercel dashboard (automatically configured via `vercel.json`):
- `NODE_ENV=production`
- `TIMEOUT=45000`
- `MAX_CONCURRENT=3`
- `RATE_LIMIT=50`
- `MAX_FILE_SIZE=10mb`

## 📊 Monitoring & Health Checks

### Health Endpoint
```bash
curl https://api.neurolint.dev/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "memory": {
    "rss": 50331648,
    "heapTotal": 18874368,
    "heapUsed": 16777216,
    "external": 1441792
  },
  "activeOperations": 0,
  "tempFiles": 0,
  "version": "1.0.0",
  "environment": "production",
  "tempDirectory": "accessible"
}
```

### Rate Limit Headers
All responses include rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

## 🔐 Security Features

### Input Validation
- Code length: 1 - 1,000,000 characters
- Dangerous pattern detection (eval, Function, etc.)
- File type validation (.js, .jsx, .ts, .tsx, .json, .vue, .svelte)
- Filename security (no path traversal)

### Rate Limiting (per IP)
- **General API**: 100 requests / 15 minutes
- **Transform**: 10 requests / 5 minutes  
- **Upload**: 5 requests / 10 minutes

### Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

## 📈 Performance Monitoring

### Key Metrics to Monitor
1. **Response Times**: Should be < 5 seconds for most operations
2. **Error Rates**: Should be < 1% under normal load
3. **Memory Usage**: Monitor for memory leaks
4. **Active Operations**: Should not exceed `MAX_CONCURRENT`
5. **Temp Files**: Should auto-cleanup every hour

### Alerting Thresholds
- Response time > 10 seconds
- Error rate > 5%
- Memory usage > 512MB (Vercel limit: 1GB)
- Active operations at max for > 5 minutes

## 🛠 Troubleshooting

### Common Issues

**1. Command Injection Errors**
- ✅ **Fixed**: Now uses `spawn()` with array arguments
- Check logs for "Script execution failed" errors

**2. Module System Conflicts**
- ✅ **Fixed**: Removed `"type": "module"` from package.json
- All scripts now use CommonJS consistently

**3. High Memory Usage**
- Monitor temp file cleanup
- Check for memory leaks in transformations
- Vercel auto-kills functions > 1GB memory

**4. Rate Limit Exceeded**
- Normal behavior under high load
- Returns 429 with retry-after headers
- Frontend should implement exponential backoff

**5. Timeout Errors**
- Increase `TIMEOUT` env var if needed
- Check for infinite loops in layer scripts
- Monitor layer execution times

### Debug Mode
Set `NODE_ENV=development` to get:
- Detailed error stacks
- Debug logging
- Less strict rate limiting

## 🔄 Continuous Integration

### GitHub Actions (optional)
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📞 Support & Monitoring

### Health Check URLs
- **Status**: `https://api.neurolint.dev/health`
- **API Test**: `https://api.neurolint.dev/api/v1/analyze` (POST)

### Log Monitoring
Production logs are available in:
- Vercel Dashboard → Functions → Logs
- Real-time: `vercel logs --follow`

### Performance Metrics
- Vercel Analytics (automatic)
- Custom metrics via health endpoint
- Error tracking via structured logging

## 🎯 Success Criteria

Your API is **production-ready** when:

✅ Health check returns 200 OK  
✅ All endpoints respond within timeout  
✅ Rate limiting works correctly  
✅ Security headers are present  
✅ File uploads process successfully  
✅ Error responses are structured  
✅ Temp files cleanup automatically  
✅ Memory usage stays under 512MB  
✅ Frontend integration works  
✅ CORS allows your domain  

## 🚀 Launch Checklist

- [ ] Deploy to Vercel production
- [ ] Configure custom domain (api.neurolint.dev)
- [ ] Test all API endpoints
- [ ] Verify rate limiting
- [ ] Check security headers
- [ ] Monitor initial traffic
- [ ] Set up alerts/monitoring
- [ ] Update frontend to use production API
- [ ] Test end-to-end workflows
- [ ] Document API for users

Your NeuroLint API is now **enterprise-grade** and ready for production traffic! 🎉