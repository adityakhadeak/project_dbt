import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider, } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import RootLayout from './layouts/RootLayout';
import Login from './pages/Login';
import RequireAuth from '@auth-kit/react-router/RequireAuth'
function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<RootLayout />} >
        <Route index element={<RequireAuth fallbackPath="/login">
          <Home />
        </RequireAuth>} />
        <Route path='/login' element={<Login />} />
      </Route>
    )
  )
  return (
    <RouterProvider router={router} />

  );
}

export default App;
