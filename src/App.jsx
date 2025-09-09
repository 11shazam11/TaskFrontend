import React from 'react';
import style from './App.module.css';
import Navbar from './components/Navbar/Navbar.jsx';
import Landing from './features/Landing/Landing.jsx';
import TaskManager from './features/TaskManager/TaskManager.jsx';
import {createBrowserRouter, Outlet, RouterProvider} from "react-router-dom";
import {DndContext,closestCorners} from "@dnd-kit/core";

const App = () => {
  
  const routes = createBrowserRouter([
    {path:"/",element:<Landing/>},
    {path:"/tasks",element:<TaskManager/>},
  ])
  return (
    <RouterProvider router={routes}>
      <Outlet/>
      <h1>ABhay dhumane</h1>
    </RouterProvider>
    
  )
}

export default App;
