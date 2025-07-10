---
sidebar_position: 1
---

# API Overview

The NeuroLint REST API provides programmatic access to our powerful code analysis and transformation engine. Build NeuroLint into your applications, CI/CD pipelines, and custom workflows with enterprise-grade reliability and performance.

## Base URL

All API requests are made to:

```
https://api.neurolint.dev
```

## Authentication

NeuroLint uses API key authentication. Include your API key in the `Authorization` header:

```bash
Authorization: Bearer YOUR_API_KEY
```

### Getting Your API Key

1. **Sign up** at [app.neurolint.dev](https://app.neurolint.dev)
2. Navigate to **Settings → API Keys**
3. Click **"Generate New API Key"**
4. Copy and securely store your key

:::warning Security Notice
Keep your API key secure! Never expose it in client-side code or public repositories.
:::

## Core Endpoints

### 🔍 **Analysis Endpoint**

Analyze code for issues and improvements without applying changes:

```http
POST /api/v1/analyze
```

**Perfect for:**
- Code quality checks in CI/CD
- Real-time analysis in editors
- Generating reports and metrics
- Validating code before deployment

### ⚡ **Transform Endpoint** 

Analyze and automatically apply improvements to your code:

```http
POST /api/v1/transform
```

**Perfect for:**
- Automated code improvements
- Legacy code modernization
- Batch processing multiple files
- Integration with build tools

### 📋 **Layers Endpoint**

Get information about available analysis layers:

```http
GET /api/v1/layers
```

### 🔧 **Enterprise Endpoints**

Advanced endpoints for enterprise features:

```http
POST /api/v1/enterprise/batch
GET  /api/v1/enterprise/reports
POST /api/v1/enterprise/custom-rules
```

## Quick Start Example

Here's a complete example to get you started:

<div className="terminal">
<div className="terminal-content">

```bash
# Analyze a React component
curl -X POST https://api.neurolint.dev/api/v1/analyze \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function Component() { return <div>Hello</div>; }",
    "filePath": "src/Component.tsx",
    "layers": [1, 2, 3, 4]
  }'
```

</div>
</div>

**Response:**

```json
{
  "success": true,
  "analysis": {
    "filesAnalyzed": 1,
    "issuesFound": 2,
    "layersUsed": [1, 2, 3, 4],
    "executionTime": 147
  },
  "layers": [
    {
      "id": 3,
      "name": "Component Best Practices",
      "status": "success",
      "issues": [
        {
          "type": "missing-key-prop",
          "severity": "warning",
          "line": 1,
          "message": "Consider adding key prop if this is inside a map",
          "suggestion": "Add key={item.id} prop for better performance"
        }
      ]
    }
  ],
  "recommendations": {
    "suggestedLayers": [1, 2, 3],
    "confidence": 0.85,
    "reasoning": "React component detected with potential key prop issues"
  }
}
```

## Request Format

All POST requests should include a JSON body with these common fields:

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `code` | string | The source code to analyze/transform |
| `filePath` | string | File path (helps with context) |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `layers` | array | `[1,2,3,4]` | Which layers to execute |
| `language` | string | `auto` | Code language (`javascript`, `typescript`, `jsx`, `tsx`) |
| `smartMode` | boolean | `false` | Enable automatic layer selection |
| `options` | object | `{}` | Additional configuration options |

### Example Request Body

```json
{
  "code": "const items = data.map(item => <div>{item.name}</div>);",
  "filePath": "src/components/ItemList.tsx",
  "layers": [2, 3, 4],
  "language": "tsx",
  "smartMode": true,
  "options": {
    "preserveFormatting": true,
    "addComments": true,
    "strictMode": false
  }
}
```

## Response Format

All API responses follow a consistent structure:

### Success Response

```json
{
  "success": true,
  "data": {
    // Endpoint-specific data
  },
  "meta": {
    "requestId": "req_1234567890",
    "executionTime": 145,
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "INVALID_SYNTAX",
    "message": "Unable to parse code: Unexpected token '}'",
    "details": {
      "line": 5,
      "column": 12,
      "suggestion": "Check for missing opening bracket"
    }
  },
  "meta": {
    "requestId": "req_1234567890",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Rate Limits

NeuroLint enforces rate limits to ensure fair usage:

| Plan | Requests/Hour | Requests/Day | Burst Limit |
|------|---------------|--------------|-------------|
| **Free** | 100 | 1,000 | 10/min |
| **Pro** | 1,000 | 10,000 | 50/min |
| **Enterprise** | Unlimited | Unlimited | Custom |

### Rate Limit Headers

Every response includes rate limit information:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1642248600
X-RateLimit-Retry-After: 3600
```

## Error Codes

Common error codes and their meanings:

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_API_KEY` | 401 | API key is missing or invalid |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INVALID_SYNTAX` | 400 | Code contains syntax errors |
| `UNSUPPORTED_LANGUAGE` | 400 | Language not supported |
| `LAYER_NOT_FOUND` | 400 | Invalid layer ID specified |
| `INTERNAL_ERROR` | 500 | Server error (rare) |

## SDKs and Libraries

Official SDKs for popular languages:

### JavaScript/TypeScript

```bash
npm install @neurolint/sdk
```

```javascript
import { NeuroLintClient } from '@neurolint/sdk';

const client = new NeuroLintClient({
  apiKey: process.env.NEUROLINT_API_KEY
});

const result = await client.analyze({
  code: 'function hello() { return "world"; }',
  filePath: 'src/hello.js',
  layers: [1, 2, 3]
});
```

### Python

```bash
pip install neurolint-python
```

```python
from neurolint import NeuroLintClient

client = NeuroLintClient(api_key="your_api_key")

result = client.analyze(
    code='function hello() { return "world"; }',
    file_path='src/hello.js',
    layers=[1, 2, 3]
)
```

### cURL Examples

<div className="terminal">
<div className="terminal-content">

```bash
# Analysis only
curl -X POST https://api.neurolint.dev/api/v1/analyze \
  -H "Authorization: Bearer $NEUROLINT_API_KEY" \
  -H "Content-Type: application/json" \
  -d @request.json

# Transform code
curl -X POST https://api.neurolint.dev/api/v1/transform \
  -H "Authorization: Bearer $NEUROLINT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "console.log(\"hello\")",
    "filePath": "src/test.js",
    "layers": [2]
  }'
```

</div>
</div>

## Performance & Reliability

### Response Times
- **Average**: <100ms for small files (<10KB)
- **P95**: <250ms for medium files (10-100KB)  
- **P99**: <500ms for large files (100KB+)

### Availability
- **SLA**: 99.9% uptime guarantee
- **Global CDN**: Optimized routing worldwide
- **Auto-scaling**: Handles traffic spikes automatically

### Best Practices

1. **Cache results** when possible to reduce API calls
2. **Use batch endpoints** for processing multiple files
3. **Implement retry logic** with exponential backoff
4. **Monitor rate limits** and adjust request frequency
5. **Validate code locally** before sending to API

## Webhooks (Coming Soon)

Subscribe to events and get notified when:
- Analysis completes for large batch jobs
- Custom rules are updated
- Rate limits are approaching
- Service status changes

## Next Steps

Ready to integrate NeuroLint into your application?

1. **[Authentication Guide](/api/authentication)** - Set up API keys and security
2. **[Analyze Endpoint](/api/analyze)** - Detailed analysis documentation
3. **[Transform Endpoint](/api/transform)** - Code transformation guide
4. **[Error Handling](/api/errors)** - Comprehensive error reference
5. **[Enterprise Features](/api/enterprise)** - Advanced capabilities

## Support

Need help with the API?

- **📖 Documentation** - Complete reference materials
- **💬 Developer Forum** - [forum.neurolint.dev](https://forum.neurolint.dev)
- **📧 API Support** - [api-support@neurolint.dev](mailto:api-support@neurolint.dev)
- **🐛 Bug Reports** - [GitHub Issues](https://github.com/Alcatecable)

---

**Ready to build with NeuroLint?** Start with the [Authentication Guide](/api/authentication) or dive straight into the [Analyze Endpoint](/api/analyze) documentation.