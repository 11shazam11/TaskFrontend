import React from 'react';
import style from './Navbar.module.css';
const Navbar = () => {
  const userName = localStorage.getItem("userName") || "Guest";
  const userEmail = localStorage.getItem("userEmail") || "No Email";
  return (
    <div className={style.navbar}>
      <div className={style.logo}>
        <img src="/logo.png" alt="Logo" />
      </div>
      <div className={style.links}>
        <div className={style.onlineUsers}><h3>Online Users</h3></div>
        <div className={style.userProfile}><h3>{userName}</h3></div>

      </div>
    </div>
  )
}

export default Navbar;
