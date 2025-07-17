import React, { useState, useEffect } from 'react';
import styles from './SeeLogs.module.css';

const SeeLogs = ({setSeeLogs}) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('https://taskbackend-jefc.onrender.com/api/task/logs', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setLogs(data.data);
          
        } else {
          throw new Error(data.message || 'Failed to fetch logs');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching logs.');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading logs...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

   return (
    <div className={styles.container}>
      <div className={styles.modalContainer}>
        <button className={styles.closeButton} onClick={() => setSeeLogs(false)}>×</button>
        <h2>Task Logs</h2>
        {logs.length === 0 ? (
          <p>No logs available.</p>
        ) : (
          <ul className={styles.logList}>
            {logs.map((log) => (
              <li key={log._id} className={styles.logItem}>
                <p><strong>Task Title:</strong> {log.taskId.title}</p>
                <p><strong>User Name:</strong> {log.userId.name}</p>
                <p><strong>Old Status:</strong> {log.oldStatus}</p>
                <p><strong>New Status:</strong> {log.newStatus}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SeeLogs;
