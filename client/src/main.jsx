/**
 * =============================================================================
 * MyNaati Frontend — React Entry Point
 * =============================================================================
 * 
 * Mounts the root App component into the DOM.
 * Imports the global stylesheet for all component styling.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
