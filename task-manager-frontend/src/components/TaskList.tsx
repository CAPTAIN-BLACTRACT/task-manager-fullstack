import React,{useState,useEffect} from "react";
import { getTasks,createTask,updateTask,deleteTask } from "../api";
import './TaskList.css';

interface Task{
    id: string;
    userId: string;
    title: string;
    completed: boolean;
}

interface TaskListProps{
    userId: string;
    token: string;
}

const TaskList : React.FC<TaskListProps> = ({userId,token}) =>{
    const [tasks,setTasks] = useState<Task[]>([]);
    const [newTaskTitle,setNewTaskTitle] = useState<string>('');
    const [loading,setLoading] = useState<boolean>(true);
    const [error , setError] = useState<string | null>(null);

    useEffect(()=>{
    const fetchUserTasks = async () =>{
        setLoading(true);
        setError(null);
        try{
            const data = await getTasks();
            if(data && data.tasks){
                setTasks(data.tasks);
            }
            else if(data.message){
                setError(data.message);
            }
            else{
                setError('failed to fetch tasks');
            }
        }catch(err){
            console.error('failed to fetch tasks ',err);
            setError('failed to fetch tasks');
        }
        finally{
            setLoading(false);
        }
    };

    fetchUserTasks();
},[token]);

const handleCreateTask = async (e: React.FormEvent) =>{
    e.preventDefault();
    if(!newTaskTitle.trim()){
        setError('task title cant be empty');
        return;
    }
    setError(null);
    try{
        const data = await createTask(newTaskTitle);
        if(data && data.task){
            setTasks((prevTasks)=>[...prevTasks,data.task]);
            setNewTaskTitle('');
        }
        else if(data.message){
            setError(data.message);
        }
        else{
            setError('failed to create tasks');
        }
    }catch(err){
        console.error('error while creating task',err);
        setError('failed to create task');
    }
};

const handleUpdateTask = async (taskId:string,completed:boolean)=>{
    setError(null);
    try{
        const data =await updateTask(taskId,{completed});
        if(data && data.task){
            setTasks((prevTasks)=>prevTasks.map((task)=>(task.id===taskId ? data.task:task)));
        }
        else if(data.message){
            setError(data.message);
        }
        else{
            setError('error while updating tasks');
        }
    }catch(err){
        console.error('error updating task',err);
        setError('failed to update task');
    }
};

const handleDeleteTask = async (taskId:string)=>{
    setError(null);
    try{
        const data = await deleteTask(taskId);
        if(data && data.message && data.message.includes('successfully')){
            setTasks((prevTasks)=>prevTasks.filter((task)=>task.id!==taskId));
        }
        else if(data.message){
            setError(data.message);
        }
        else{
            console.error('failed to delete task');
        }
    }
    catch(err){
        console.error('failed to delete task',err);
        setError('failed to delete task');
    }
};

if(loading){
    return <div className="task-list-loading">Loading tasks...</div>;
}

return(
    <div className="task-list-container">
        <h2 className="task-list-title">Your Tasks</h2>
        {error && <p className="task-list-error">{error}</p>}

        <form onSubmit={handleCreateTask} className="task-input-form">
            <input 
            type="text"
            placeholder="Add new task.."
            value={newTaskTitle}
            onChange={(e)=>setNewTaskTitle(e.target.value)}
            className="new-task-input"
            required
            />
            <button type="submit" className="add-task-button">Add Task</button>
        </form>

        {tasks.length===0 ?(
            <p className="no-task-message">No tasks yet. Add one above</p>
        ):(
            <ul className="tasks-list">
                {tasks.map((task)=>(<li key={task.id} className={`task item ${task.completed? 'completed':''}`}>
                    <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={()=>handleUpdateTask(task.id, !task.completed)}
                    className="task-checkbox"
                    />
                    <span   className="task-text">{task.title}</span>
                    <button onClick={()=>handleDeleteTask(task.id)} className="delete-task-button">
                        Delete
                    </button>
                </li>
            ))}
            </ul>
        )}
    </div>
);
}; 
export default TaskList;

