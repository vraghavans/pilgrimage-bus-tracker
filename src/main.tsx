
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Remove the SPA GitHub Pages redirect script from here since it's already in index.html

createRoot(document.getElementById("root")!).render(<App />);
