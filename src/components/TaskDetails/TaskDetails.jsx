import React from 'react';
import style from "./TaskDetails.module.css";
import { useEffect } from 'react';
const TaskDetails = ({task, setSeeDetails,fetchTasks,socketRef}) => {
  function closeModal() {
    setSeeDetails(false);
  }
  //delete task 
  async function handleDelete() {
    try {
      const response = await fetch(`http://localhost:3000/api/task/delete/${task._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        fetchTasks && fetchTasks();
         // Refresh tasks if function provided
           if (socketRef && socketRef.current) {
          socketRef.current.emit("taskDeleted", task._id);
        }
        closeModal();
      } else {
        alert('Failed to delete task');
      }
    } catch (error) {
      alert('Error deleting task');
    }
  }
  useEffect(()=>{
    console.log(task);
  })
  return (
    <div className={style.container}>
        {/* close Modal button */}
        <button className={style.closeButton} onClick={closeModal}>X</button>
        <div className={style.modalContainer}>
          <h3 className={style.title}>Task Title  : {task.title}</h3>
          <h3 className={style.title}>Task Description</h3>
          <p className={style.description}>{task.description}</p>
          <h3 className={style.title}>Assigned To:</h3>
      <p className={style.description}>{task.assignTo ? task.assignTo.name : "Unassigned"}</p>

      <button className={style.deleteButton} onClick={handleDelete}>Delete task</button>
        </div>
      
    </div>
  )
}

export default TaskDetails;
