import React, { useEffect, useState } from 'react';
import style from "./NewTask.module.css";

const NewTaskModal = ({ showModal, onClose, fetchTasks, socketRef }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignTo: '',
  });
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    getAllUsers();
  }, []);

  if (!showModal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");

    const taskData = {
      title: formData.title,
      description: formData.description,
      userId,
      assignTo: formData.assignTo || userId,
    };
    console.log(taskData);

    await createTask(taskData);
    setFormData({ title: '', description: '', assignTo: '' });
    onClose(); // Close the modal
  };

  const createTask = async (taskData) => {
    try {
      const response = await fetch('http://localhost:3000/api/task/newtask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(taskData),
      });

      const data = await response.json();
      if (data.success) {
        fetchTasks();
        socketRef?.current?.emit("newTask", data.task);
      } else {
        console.error('Error creating task:', data.message);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const getAllUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setAllUsers(data.data);
      } else {
        console.error('Error fetching users:', data.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  return (
    <div className={style.container}>
      <button className={style.closeButton} onClick={onClose}>X</button>
      <div className={style.modalContainer}>
        <h2>Create New Task</h2>
        <form onSubmit={handleSubmit}>
          <div className={style.inputGroup}>
            <input
              type="text"
              placeholder="Task Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className={style.inputGroup}>
            <textarea
              placeholder="Task Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            ></textarea>
          </div>
          <div className={style.inputGroup}>
            <label htmlFor="assignTo">Assign to:</label>
            <select
              id="assignTo"
              value={formData.assignTo}
              onChange={(e) => setFormData({ ...formData, assignTo: e.target.value })}
            >
              <option value="">Select User</option>
              {allUsers.map((user) => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>
          </div>
          <button type="submit">Create Task</button>
        </form>
      </div>
    </div>
  );
};

export default NewTaskModal;
