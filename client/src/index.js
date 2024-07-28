import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ChakraProvider } from '@chakra-ui/react'
import { UserProvider } from './context/UserContext.js';
import AuthProvider from 'react-auth-kit';
import createStore from 'react-auth-kit/createStore';

const root = ReactDOM.createRoot(document.getElementById('root'));
const store = createStore({
  authName:'_auth',
  authType:'cookie',
  cookieDomain: window.location.hostname,
  cookieSecure: false,
});
root.render(
  <React.StrictMode>
    <AuthProvider
      store={store}
    >
      <UserProvider>
        <ChakraProvider>
          <App />
        </ChakraProvider>
      </UserProvider>
    </AuthProvider>


  </React.StrictMode>
);

