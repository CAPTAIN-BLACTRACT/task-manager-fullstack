// Import the express in typescript file
import express from 'express';
import { readUsers,writeUsers,paths, readTasks , writeTasks, path2} from './utils/fileUtils';
import bcrypt from 'bcryptjs';
import {Task, User} from './types';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import authenticateJWT from './middleware/auth';
import cors from 'cors';


dotenv.config();

// Initialize the express engine
const app: express.Application = express();

app.use(express.json());
app.use(cors());


// Take a port 3000 for running server.
const port: number = 3000;
//POST  /register route
app.post('/register', async (req, res) =>{
    const {username,password} = req.body;

    //basic validation
    if(!username  || !password)
    {
        return res.status(400).json({message: 'All fields are required'});
    }

    //checking if user exists
    try{
        const users: User[] = await readUsers(paths);

        if(users.some(user =>user.username === username)){
            return res.status(409).json({message: 'user exists'});
        }
        //password hashing
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password,saltRounds);
        //creating new user
        const newUser :  User = {
            id:Date.now().toString(),
            username,
            password : hashedPassword,
        };
        users.push(newUser);
        await writeUsers(paths,users);
        return res.status(201).json({ message: 'User registered successfully!' });
    }
    catch(error)
    {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }

});


//Handling logoin request
app.post('/login', async (req , res)=>{
    const {username,password} = req.body;

    if(!username || !password){
        return res.status(400).json({message:'all are necessary'});
    }

    try{
        const users: User[]= await readUsers(paths);

        const user = users.find(u=>u.username === username);

        if(!user){
            return res.status(400).json({message:'no user found'});
        }

        if(user.password===undefined){
            console.error(`User ${user.username} found but has no password `);
            return res.status(500).json({message:'user data corrupted'});
        }
        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.status(400).json({message:'wrong credentials'});
        }

       const jwtSecret = process.env.JWT_SECRET ;

       if(!jwtSecret){
        console.error('jwt secret not found');
        return res.status(500).json({message:'server configuration error'});
       }

       const payload = {
        user:{
            id : user.id,
            username: user.username,
        },
       };

       jwt.sign(
        payload,
        jwtSecret,
        {expiresIn: '1h'},
        (err,token)=> {
            if(err){
                console.error('error signing jwt',err);
                throw err;
            }
            res.json({token});
        }
    );
    }catch(error){
        console.error('login error',error);
        res.status(500).json({message:'server error'});
    }



});

//handling '/tasks' 
app.post('/tasks',authenticateJWT, async (req,res)=>{
    if(!req.user){
        return res.status(401).json({message:'Unauthorized'});
    }

    const userId = req.user.id;
    const {title}= req.body;

    if(!title || typeof title !== 'string' || title.trim()===''){
        return res.status(400).json({message:'title no found'});
    }
    try{

        const tasks : Task[] = await readTasks(path2);
        const newTaskId = Date.now().toString();

        const newTask : Task = {
            id: newTaskId,
            userId: userId,
            title:title.trim(),
            completed:false,
            //createdAt:Date.now(),
        };

        tasks.push(newTask);

        await writeTasks(path2,tasks);

        return res.status(201).json({message:'file written successfully',task:newTask});
    } catch(error){
        console.error("error while creating :",error);
        res.status(500).json({message:'internal server error during creating task'});
    }

});

//handling put tasks
app.put('/tasks/:id',authenticateJWT, async (req , res)=>{
    if(!req.user){
        return res.status(401).json({message:'unauthorized'});
    }

    const taskId = req.params.id;
    const userId = req.user.id;
    const {title,completed}= req.body;


    if(title === undefined && completed=== undefined){
        return res.status(400).json({message:'Atleast one param must be provided'});
    }
    if(title!== undefined && (typeof title !== 'string' || title.trim()==='')){
        return res.status(400).json({message:'title must be non empty string if provided'});
    }
    if(completed !== undefined && typeof completed !== 'boolean'){
        return res.status(400).json({message:'completed must be of boolean type'});
    }

    try{

        const tasks: Task[] = await readTasks(path2);

        //find index of task to update

        const taskIndex = tasks.findIndex(task => task.id===taskId);

        if(taskIndex===-1){
            return res.status(403).json({message:'task not found'});
        }

        const taskToUpdate = tasks[taskIndex];

        if(taskToUpdate.userId != userId){
            return res.status(403).json({message:'forbidden'});
        }
        if(title != undefined){
            taskToUpdate.title = title.trim();
        }
        if(completed != undefined){
            taskToUpdate.completed = completed;
        }

        tasks[taskIndex]= taskToUpdate;

        await writeTasks(path2,tasks);

        return res.status(200).json({message:'task updated successfully', task: taskToUpdate})
    }
    catch(error){
        console.error('error updating task', error);
        res.status(500).json({message:'internal server error'});
    }
});
//hadnling get /task
app.get('/tasks',authenticateJWT, async (req , res)=>{

    if(!req.user){
        return res.status(401).json({message:'unauthorized'});
    }
    const userId = req.user.id;
    try{
        const allTasks : Task[] = await readTasks(path2);

        const userTasks = allTasks.filter(task=> task.userId===userId);

        return res.status(200).json({tasks:userTasks});
    }
    catch(error){
        console.error('error fetching tasks',error);
        res.status(500).json({message:'internal server error'});
    }
});
//handling delete tasks 
app.delete('/tasks/:id',authenticateJWT,async(req,res)=>{
    if(!req.user){
        return res.status(401).json({message:'not authorized'});
    }

    const taskId = req.params.id;
    const userId = req.user.id;

    try{
        let tasks:Task[] = await readTasks(path2);

        const taskIndex = tasks.findIndex(task=> task.id===taskId);

        if(taskIndex===-1){
            return res.status(404).json({message:'task not found'});
        }
        const taskToDelete = tasks[taskIndex];

        if(taskToDelete.userId !== userId){
            return res.status(403).json({message:'user not authorizes'});
        }

        tasks = tasks.filter(task=> task.id !== taskId);

        await writeTasks(path2,tasks);

        return res.status(200).json({message:'task deleted successfully'});
    }
    catch(error){
        console.error('error while deleting',error);
        res.status(500).json({message:'internal server error while deleting'});
    }
});
// Handling '/' Request
app.get('/', (_req, _res) => {
    _res.send("TypeScript With Express");
});

// Server setup
app.listen(port, () => {
    console.log(`TypeScript with Express 
         http://localhost:${port}/`);
});
