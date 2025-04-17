import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'antd/dist/reset.css';
import './index.css';

// Add global styles
const style = document.createElement('style');
style.textContent = `
  body {
    margin: 0;
    padding: 0;
    background-color: #f0f2f5;
  }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
