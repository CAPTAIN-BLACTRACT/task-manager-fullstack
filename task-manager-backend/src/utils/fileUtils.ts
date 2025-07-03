import {fdatasync, promises as fs} from 'fs';
import { Task, User } from '../types';
import path from 'path';
const directory = path.join(__dirname,'..','data');
export const path2 = path.join(directory,'tasks.json');
export const paths = path.join(directory,'users.json');


(async() =>{
    try{
        await fs.mkdir(directory,{recursive:true});
        await fs.access(paths);
    }
    catch(error : any)
    {
        if(error.code=='ENOENT'){
            await fs.writeFile(paths,'[]','utf-8');
        }
        else {
                console.error(`Error during initial file/directory setup: ${error.message}`);
            }
    }
})();
export async function readUsers(paths:string) : Promise<User[]> {

    try{
        const data = await  fs.readFile(paths,'utf-8');
        const jsonData : User[] = JSON.parse(data);
        return jsonData;
    }
    catch(error)
    {
        console.error('Error');
        return [];
    }
    
}

export async function writeUsers(paths:string,user:User[]): Promise<void> {
    
    try{
        const jsonString = JSON.stringify(user,null,2);
        await fs.writeFile(paths,jsonString,'utf-8');
    }
    catch(error)
    {
        console.error('error ${error}');
    }
}

export async function readTasks(path2:string) : Promise<Task[]>{
    
    try
    {   const tsk = await fs.readFile(path2,'utf-8');
        const jsonData : Task[] = JSON.parse(tsk);
        return jsonData;
    }
    catch(error)
    {
        console.error('error');
        return [];
    }
}

export async function writeTasks(path2:string,task:Task[]) : Promise<void>{
   try{
    const jsonString = JSON.stringify(task,null,2);
    await fs.writeFile(path2,jsonString,'utf-8');
   } 
   catch(error)
   {
    console.error('error ${error}');
   }
}