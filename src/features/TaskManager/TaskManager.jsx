import React, { useRef, useState } from "react";
import style from "./TaskManager.module.css";
import Navbar from "../../components/Navbar/Navbar";
import DroppableContainer from "./Droppable/DroppableContainer";
import NewTaskModal from "../../components/Newtask/NewTaskModal";
import SeeLogs from "../../components/SeeLogs/SeeLogs";
import TaskDetails from "../../components/TaskDetails/TaskDetails";
//socket.io
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useEffect } from "react";
//dnd kit
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Tasks from "./Tasks/Tasks";

const TaskManager = () => {
  const socketRef = useRef(null);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const idCounter = useRef(0);
  const [tasks, setTasks] = useState([]);
  const [ongoing, setOngoing] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [collapse, setCollapse] = useState(false);
  const [ongoingCollapse, setOngoingCollapse] = useState(false);
  const [completedCollapse, setCompletedCollapse] = useState(false);
   const [seeDetails, setSeeDetails] = useState(false);
   const [selectedTask, setSelectedTask] = useState(null);
   const [seeLogs,setSeeLogs] = useState(false);
  const handleModalClose = () => {
    setShowModal(false);
  };
  //get tasks from backend
  async function fetchTasks() {
    try {
      const response = await fetch("https://taskbackend-jefc.onrender.com/api/task/alltasks", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        console.log("Tasks fetched successfully:", data.data);
        sortTasks(data.data);
      } else {
        console.error("Failed to fetch tasks:", data.message);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }
  function sortTasks(tasks) {
    const todo = [];
    const ongoing = [];
    const completed = [];

    tasks.forEach((task) => {
      if (task.status === "todo") {
        task.id = idCounter.current++;
        todo.push(task);
        
      } else if (task.status === "ongoing") {
        ongoing.push(task);
        task.id = idCounter.current++;
      } else if (task.status === "completed") {
        completed.push(task);
        task.id = idCounter.current++;
      }
      
    });
    console.log("task", todo);
    setTasks(todo);
    setOngoing(ongoing);
    setCompleted(completed);
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }
  //connect to socket.io server
  useEffect(() => {
    socketRef.current = io("https://taskbackend-jefc.onrender.com/", {
      transports: ["websocket"],
      withCredentials: true,
    });


    socketRef.current.on("connect", () => {
      console.log("Connected to socket.io server");
      const userId = localStorage.getItem("userId");
      if (userId) {
        socketRef.current.emit("join", { userId });
      } else {
        console.error("User ID not found in localStorage");
      }
    });

    //ondeletion 
    socketRef.current.on("taskDeleted", () => {
      fetchTasks(); // 
    });

    //on task moved event
    socketRef.current.on("taskMoved", (data) => {
      console.log("Task moved:", data);
      const { task, from, to } = data;

      // Update tasks based on the event
      //remove duplicate task from the source list
      if (!task || !from || !to) {
        console.error("Invalid task move event:", data);
        return;
      }
      if (from === "todo") {
        setTasks((tasks) => tasks.filter((t) => t.id !== task.id));
      } else if (from === "ongoing") {
        setOngoing((ongoing) => ongoing.filter((t) => t.id !== task.id));
      } else if (from === "completed") {
        setCompleted((completed) => completed.filter((t) => t.id !== task.id));
      }

      if (to === "todo") {
        setTasks((tasks) => [...tasks, task]);
      } else if (to === "ongoing") {
        setOngoing((ongoing) => [...ongoing, task]);
      } else if (to === "completed") {
        setCompleted((completed) => [...completed, task]);
      }
    });
    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from socket.io server");
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);
  useEffect(() => {
    checkAuth();
  }, []);
  function handleAddTask() {
    const newTask = {
      id: Date.now(),
      task: `New Task ${Date.now()}`,
      status: "todo",
    };
    setTasks((tasks) => [...tasks, newTask]);
  }
  const getTaskPos = (id) => tasks.findIndex((task) => task.id === id);

  const handleDragEnd = ({ active, over }) => {
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Get all tasks
    const allTasks = [...tasks, ...ongoing, ...completed];

    const draggedTask = allTasks.find((task) => task.id === activeId);
    if (!draggedTask) return;

    let sourceListName = draggedTask.status;
    let destinationListName = over.id;

    // If dropped inside an item, get its container
    if (typeof overId === "number") {
      const overTask = allTasks.find((task) => task.id === overId);
      if (overTask) {
        destinationListName = overTask.status;
      }
    }

    if (sourceListName === destinationListName) {
      // Just reorder within the same list
      const listMap = {
        todo: [...tasks],
        ongoing: [...ongoing],
        completed: [...completed],
      };

      const sourceList = listMap[sourceListName];
      const oldIndex = sourceList.findIndex((task) => task.id === activeId);
      const newIndex = sourceList.findIndex((task) => task.id === overId);

      const reordered = arrayMove(sourceList, oldIndex, newIndex);

      if (sourceListName === "todo") setTasks(reordered);
      else if (sourceListName === "ongoing") setOngoing(reordered);
      else if (sourceListName === "completed") setCompleted(reordered);
    } else {
      // Moving across lists
      let fromList = [];
      let toList = [];

      // Get from & to lists
      if (sourceListName === "todo") fromList = [...tasks];
      if (sourceListName === "ongoing") fromList = [...ongoing];
      if (sourceListName === "completed") fromList = [...completed];

      if (destinationListName === "todo") toList = [...tasks];
      if (destinationListName === "ongoing") toList = [...ongoing];
      if (destinationListName === "completed") toList = [...completed];

      const movingTaskIndex = fromList.findIndex(
        (task) => task.id === activeId
      );
      const [movingTask] = fromList.splice(movingTaskIndex, 1);

      movingTask.status = destinationListName;
      toList.unshift(movingTask); // Add to top of list

      socketRef.current.emit("taskMoved", {
        task: movingTask,
        from: sourceListName,
        to: destinationListName,
      });
      // Update the task's status in the backend
      //logging the task and its new status
      handleUpdateTaskStatus(movingTask._id, destinationListName);
      //if one user movesthe task it will be assigned to it if only its in todo and tries to move it
      //to completed or ongoig
     

      // Update state
      if (sourceListName === "todo") setTasks(fromList);
      if (sourceListName === "ongoing") setOngoing(fromList);
      if (sourceListName === "completed") setCompleted(fromList);

      if (destinationListName === "todo") setTasks(toList);
      if (destinationListName === "ongoing") setOngoing(toList);
      if (destinationListName === "completed") setCompleted(toList);
    }
  };

  
  async function handleUpdateTaskStatus(taskId, newStatus) {
    try {
      const response = await fetch(`https://taskbackend-jefc.onrender.com/api/task/update/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ taskId, newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        console.log("Task status updated successfully:", data.data);
        fetchTasks(); // Refresh tasks after update
      } else {
        console.error("Failed to update task status:", data.message);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  }

  const sensor = useSensors(
    useSensor(PointerSensor,{
      activationConstraint: {
        delay:250,
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  return (
    <div className={style.container}>
      <Navbar />
      <DndContext
        sensors={sensor}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className={style.taskContainer}>
          {/* TODO Box */}
          <div className={style.tbox}>
            <button
              onClick={() => setCollapse(!collapse)}
              className={style.collapseButton}
            >
              {collapse ? "▼" : "▲"}
            </button>
            {collapse ? (
              <div className={style.verticalBox}>
                <h1>TODO Tasks {tasks.length}</h1>
              </div>
            ) : (
              <>
                <h1>TODO</h1>
                <SortableContext
                  items={tasks.map((task) => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <DroppableContainer id="todo" className={style.box}>
                    {tasks.map((task) => (
                      <Tasks setSelectedTask={setSelectedTask} task={task} key={task.id} seeDetails={seeDetails} setSeeDetails={setSeeDetails} />
                    ))}
                  </DroppableContainer>
                </SortableContext>
              </>
            )}
          </div>

          {/* Ongoing Box */}
          <div className={style.tbox}>
            <button
              onClick={() => setOngoingCollapse(!ongoingCollapse)}
              className={style.collapseButton}
            >
              {ongoingCollapse ? "▼" : "▲"}
            </button>
            {ongoingCollapse ? (
              <div className={style.verticalBox}>
                <h1>Ongoing Tasks {ongoing.length}</h1>
              </div>
            ) : (
              <>
                <h1>Ongoing</h1>
                <SortableContext
                  items={ongoing.map((task) => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <DroppableContainer id="ongoing" className={style.box}>
                    {ongoing.map((task) => (
                      <Tasks task={task} setSelectedTask={setSelectedTask} key={task.id} seeDetails={seeDetails} setSeeDetails={setSeeDetails} />
                    ))}
                  </DroppableContainer>
                </SortableContext>
              </>
            )}
          </div>
          <div className={style.tbox}>
            <button
              onClick={() => setCompletedCollapse(!completedCollapse)}
              className={style.collapseButton}
            >
              {completedCollapse ? "▼" : "▲"}
            </button>
            {completedCollapse ? (
              <div className={style.verticalBox}>
                <h1>Completed Tasks {completed.length}</h1>
              </div>
            ) : (
              <>
                <h1>Completed</h1>
                <SortableContext
                  items={completed.map((task) => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <DroppableContainer id="completed" className={style.box}>
                    {completed.map((task) => (
                      <Tasks task={task} setSelectedTask={setSelectedTask} key={task.id} seeDetails={seeDetails} setSeeDetails={setSeeDetails} />
                    ))}
                  </DroppableContainer>
                </SortableContext>
              </>
            )}
          </div>

          {/* Completed Box */}
        </div>
      </DndContext>
      {showModal && (
        <NewTaskModal showModal={showModal} onClose={handleModalClose} fetchTasks={fetchTasks} socketRef={socketRef} />
      )}
      {seeDetails && (<TaskDetails task={selectedTask} socketRef={socketRef} fetchTasks={fetchTasks} seeDetails={seeDetails} setSeeDetails={setSeeDetails} />)}
      {seeLogs && (<SeeLogs setSeeLogs={setSeeLogs} />)}
      <button
        onClick={() => setSeeLogs(true)}
        className={style.seeLogsButton}
      >
        See Logs
      </button>
      <button
        onClick={() => setShowModal(true)}
        className={style.newTaskButton}
      >
        New Task
      </button>
    </div>
  );
} 


export default TaskManager;
