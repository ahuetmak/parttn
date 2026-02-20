import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../styles/index.css';
import { Toaster } from 'sonner';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster 
      position="top-right"
      theme="dark"
      visibleToasts={4}
      toastOptions={{
        style: {
          background: '#0A0E1A',
          border: '1px solid rgba(0, 242, 166, 0.2)',
          color: '#fff',
        },
        className: 'parth-toast',
      }}
    />
  </React.StrictMode>
);