import React from 'react';
import styles from "./Task.module.css";
import { useDraggable } from '@dnd-kit/core';
import {CSS} from "@dnd-kit/utilities";
import TaskDetails from '../../../components/TaskDetails/TaskDetails';
import { useState } from 'react';

const Tasks = ({task,seeDetails,setSeeDetails,setSelectedTask}) => {
  const id = task.id;
  const {attributes,listeners,setNodeRef,transform,transition,isDragging}=useDraggable({id});
 
  const dndStyle = {
    transition,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
  };
  function handleClick() {
    setSeeDetails(!seeDetails);
    setSelectedTask(task);
  }

  return (
    <div 
      className={styles.container} 
      onClick={handleClick} 
      ref={setNodeRef} 
      {...attributes} 
      {...listeners} 
      data-dragging={transform ? true : undefined}
      data-status={task.status}
      style={dndStyle}
    >
      <h1>{task.title}</h1>
      <p>{task.status}</p>
      
      
    </div>
  )
}

export default Tasks
