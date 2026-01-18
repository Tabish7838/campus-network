import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { RoleProvider } from './context/RoleContext.jsx';
import './styles/theme.css';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RoleProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </RoleProvider>
    </AuthProvider>
  </React.StrictMode>,
);
