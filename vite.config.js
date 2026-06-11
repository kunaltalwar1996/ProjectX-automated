import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    {
      name: 'rewrite-signup',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = new URL(req.url, 'http://localhost');
          if (url.pathname === '/signup.html' || url.pathname === '/signup') {
            req.url = '/login.html' + url.search;
          }
          next();
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        properties: 'properties.html',
        map: 'map.html',
        brokerDashboard: 'broker-dashboard.html',
        adminPanel: 'admin-panel.html',
        employeePanel: 'employee-panel.html',
        propertyDetails: 'property-details.html',
        login: 'login.html',
        signup: 'signup.html',
        profile: 'profile.html',
        sell: 'sell.html',
        terms: 'terms.html',
        privacy: 'privacy.html',
        staffLogin: 'staff-login.html'
      }
    }
  }
})
