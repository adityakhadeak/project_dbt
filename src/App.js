import { createBrowserRouter, createRoutesFromElements,Route,RouterProvider, } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import RootLayout from './layouts/RootLayout';

function App() {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<RootLayout/>} >
        <Route index element={<Home />} />
        {/* <Route path='/login' element={<Login />} /> */}
      </Route>
    )
  )
  return (
    <RouterProvider router={router} />

  );
}

export default App;
