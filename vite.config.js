import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { join } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url.startsWith('/api/')) {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const apiPath = url.pathname.replace(/^\/api\//, '');
            const filePath = join(process.cwd(), 'api', `${apiPath}.js`);
            
            try {
              const module = await server.ssrLoadModule(filePath);
              const handler = module.default;
              
              // Mock req.query
              req.query = Object.fromEntries(url.searchParams);
              
              // Mock res methods for compatibility with Vercel handler
              res.status = (code) => {
                res.statusCode = code;
                return res;
              };
              res.json = (data) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              };
              res.send = (data) => {
                res.end(data);
              };
              
              await handler(req, res);
              return;
            } catch (e) {
              console.error(`API Error: ${e.message}`);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: e.message }));
              return;
            }
          }
          next();
        });
      }
    }
  ],
  server: {
    host: true,
    port: 5173
  }
})
