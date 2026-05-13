import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
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
        sell: 'sell.html',
        terms: 'terms.html',
        privacy: 'privacy.html'
      }
    }
  }
})
