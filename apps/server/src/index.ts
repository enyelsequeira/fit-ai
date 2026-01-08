import { createContext } from "@fit-ai/api/context";
import { appRouter } from "@fit-ai/api/routers/index";
import { auth } from "@fit-ai/auth";
import { env } from "@fit-ai/env/server";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIGenerator } from "@orpc/openapi";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// OpenAPI Generator for spec generation
const openAPIGenerator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

// Serve OpenAPI JSON specification
app.get("/openapi.json", async (c) => {
  const spec = await openAPIGenerator.generate(appRouter, {
    info: {
      title: "Fit AI API",
      version: "1.0.0",
      description: `API for the Fit AI fitness tracking application.

## Authentication

This API uses **cookie-based session authentication** via better-auth.

### How to authenticate:

1. **Sign Up**: \`POST /api/auth/sign-up/email\` with \`{ email, password, name }\`
2. **Sign In**: \`POST /api/auth/sign-in/email\` with \`{ email, password }\`
3. **Sign Out**: \`POST /api/auth/sign-out\`

The session cookie is automatically set on successful sign-in. Include cookies in subsequent requests.

### Testing with curl:

\`\`\`bash
# Sign in and save cookies
curl -X POST 'http://localhost:3000/api/auth/sign-in/email' \\
  -H 'Content-Type: application/json' \\
  -d '{"email": "user@example.com", "password": "password"}' \\
  -c cookies.txt

# Use cookies for authenticated requests
curl 'http://localhost:3000/api/workouts' -b cookies.txt
\`\`\`
`,
    },
    servers: [{ url: "/api", description: "API Server" }],
    security: [{ cookieAuth: [] }],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "better-auth.session_token",
          description: "Session cookie set by better-auth on sign-in",
        },
      },
    },
  });
  return c.json(spec);
});

// Serve Swagger UI at /docs
app.get("/docs", swaggerUI({ url: "/openapi.json" }));

// Serve Scalar API Reference at /reference (modern alternative to Swagger UI)
app.get("/reference", (c) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Fit AI API Reference</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="https://orpc.dev/icon.svg" />
        <style>
          .auth-banner {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 24px;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
            line-height: 1.5;
          }
          .auth-banner h3 {
            margin: 0 0 8px 0;
            font-size: 16px;
          }
          .auth-banner code {
            background: rgba(255,255,255,0.2);
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 13px;
          }
          .auth-banner a {
            color: #fff;
            text-decoration: underline;
          }
          .auth-form {
            margin-top: 12px;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            align-items: center;
          }
          .auth-form input {
            padding: 8px 12px;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            width: 200px;
          }
          .auth-form button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            background: white;
            color: #764ba2;
            font-weight: 600;
            cursor: pointer;
            font-size: 14px;
          }
          .auth-form button:hover {
            background: #f0f0f0;
          }
          .auth-status {
            margin-left: auto;
            padding: 6px 12px;
            border-radius: 4px;
            background: rgba(255,255,255,0.2);
          }
          .auth-status.authenticated {
            background: rgba(34, 197, 94, 0.3);
          }
        </style>
      </head>
      <body>
        <div class="auth-banner">
          <h3>🔐 Authentication Required for Protected Endpoints</h3>
          <p>This API uses <strong>cookie-based session authentication</strong>. Sign in below to test protected endpoints.</p>
          <div class="auth-form">
            <input type="email" id="email" placeholder="Email" value="test@example.com" />
            <input type="password" id="password" placeholder="Password" value="Password123!" />
            <button onclick="signIn()">Sign In</button>
            <button onclick="signUp()">Sign Up</button>
            <button onclick="signOut()">Sign Out</button>
            <span id="auth-status" class="auth-status">Checking...</span>
          </div>
        </div>
        <div id="app"></div>
        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
        <script>
          // Check auth status on load
          async function checkAuth() {
            try {
              const res = await fetch('/api/user/check', { credentials: 'include' });
              const data = await res.json();
              const statusEl = document.getElementById('auth-status');
              if (data.authenticated) {
                statusEl.textContent = '✓ Authenticated';
                statusEl.classList.add('authenticated');
              } else {
                statusEl.textContent = '✗ Not authenticated';
                statusEl.classList.remove('authenticated');
              }
            } catch (e) {
              document.getElementById('auth-status').textContent = '? Unknown';
            }
          }
          
          async function signIn() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
              const res = await fetch('/api/auth/sign-in/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
              });
              const data = await res.json();
              if (res.ok) {
                alert('Signed in successfully! You can now test protected endpoints.');
                checkAuth();
              } else {
                alert('Sign in failed: ' + (data.message || data.error || 'Unknown error'));
              }
            } catch (e) {
              alert('Sign in error: ' + e.message);
            }
          }
          
          async function signUp() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
              const res = await fetch('/api/auth/sign-up/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name: 'Test User' }),
                credentials: 'include'
              });
              const data = await res.json();
              if (res.ok) {
                alert('Signed up successfully! You are now logged in.');
                checkAuth();
              } else {
                alert('Sign up failed: ' + (data.message || data.error || 'Unknown error'));
              }
            } catch (e) {
              alert('Sign up error: ' + e.message);
            }
          }
          
          async function signOut() {
            try {
              await fetch('/api/auth/sign-out', {
                method: 'POST',
                credentials: 'include'
              });
              alert('Signed out successfully!');
              checkAuth();
            } catch (e) {
              alert('Sign out error: ' + e.message);
            }
          }
          
          // Initialize
          checkAuth();
          
          Scalar.createApiReference('#app', {
            url: '/openapi.json',
            theme: 'default',
            withDefaultFonts: true,
            // Enable credentials for all requests (sends cookies)
            defaultHttpClient: {
              targetKey: 'javascript',
              clientKey: 'fetch',
            },
          })
        </script>
      </body>
    </html>
  `;
  return c.html(html);
});

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

export const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

app.use("/*", async (c, next) => {
  const context = await createContext({ context: c });

  const rpcResult = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context: context,
  });

  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response);
  }

  const apiResult = await apiHandler.handle(c.req.raw, {
    prefix: "/api",
    context: context,
  });

  if (apiResult.matched) {
    return c.newResponse(apiResult.response.body, apiResult.response);
  }

  await next();
});

app.get("/", (c) => {
  return c.text("OK");
});

export default app;
