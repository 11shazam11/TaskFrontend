import React from 'react';
import style from './App.module.css';
import Navbar from './components/Navbar/Navbar.jsx';
import Landing from './features/Landing/Landing.jsx';
import TaskManager from './features/TaskManager/TaskManager.jsx';
import {createBrowserRouter, Outlet, RouterProvider} from "react-router-dom";
import {DndContext,closestCorners} from "@dnd-kit/core";

// Futuristic Particles Component
const FuturisticParticles = () => {
  return (
    <div className="particles">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${4 + Math.random() * 4}s`
          }}
        />
      ))}
    </div>
  );
};

const App = () => {
  
  const routes = createBrowserRouter([
    {path:"/",element:<Landing/>},
    {path:"/tasks",element:<TaskManager/>},
  ])
  return (
    <>
      <FuturisticParticles />
      <RouterProvider router={routes}>
        <Outlet/>
      </RouterProvider>
    </>
    
  )
}

export default App;
