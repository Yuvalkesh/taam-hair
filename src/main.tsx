import React from 'react'
import ReactDOM from 'react-dom/client'
import 'nes.css/css/nes.min.css'
import 'leaflet/dist/leaflet.css'
import './styles/global.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
