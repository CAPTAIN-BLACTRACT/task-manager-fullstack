import axios, { AxiosRequestConfig, AxiosRequestHeaders } from 'axios';
import { error } from 'console';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
    baseURL : API_BASE_URL,
    headers:{

        'Content-Type': 'application/json',
    },
});


//axios interceptor
api.interceptors.request.use(
    (config)=>{
        const token =localStorage.getItem('token');
        if(token){
                 config.headers = config.headers || {} as AxiosRequestHeaders;
            (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) =>{
        return Promise.reject(error);
    }
);
export const registerUser = async (username: string , password:string)=>{

    try{
        const response = await api.post('/register',{username,password});
        return response.data;
    }
    catch(error:any){
        if(axios.isAxiosError(error) && error.response){
            console.error('registration error response ',error.response.data);
            return error.response.data;
        }

        else if(axios.isAxiosError(error) && error.request){
            console.error('registration error request ',error.request);
            return{message:'no response from server during registration'};
        }
        else{
            console.error('login error ',error.message);
            return {message:'unexpected error occured during registration'};
        }
    }
};

export const loginUser =  async (username:string,password:string)=>{
   try
    {
        const response = await api.post('/login',{username,password});
        return response.data;
    }
    catch(error:any){
        if(axios.isAxiosError(error) && error.response){
            console.error('login error response ',error.response.data);
            return error.response.data;
        }
        else if(axios.isAxiosError(error) && error.request){
            console.error('login error request',error.request);
            return {message:'no response from server while login'};
        }
        else{
            console.error('login error ',error.message);
            return {message:'unexpected error occured while logoin'};
        }
    }
};

//--task Manageent crud operation apis

export const getTasks= async ()=>{
    try{
        const response = await api.get('/tasks');
        return response.data;
    }
    catch(error:any)
    {
        if(axios.isAxiosError(error) && error.response)
        {
            console.error('get task error response ',error.response.data);
            return error.response.data;
        }
        else{
            console.error('get task error',error);
            return {message:'failed to fetch tasks'};
        }
    }
};

export const createTask = async (title:string)=>{
    try{
        const response = await api.post('/tasks',{title});
        return response.data;
    }
    catch(error:any){
        if(axios.isAxiosError(error) && error.response){
            console.error('create tasks response error',error.response.data);
            return error.response.data;
        }
        else{
            console.error('create tasks erro',error);
            return {message:'failed to create task'};
        }
    }
};


export const updateTask = async (id:string,updateData:{title?:string,completed:boolean})=>{
    try{
        const response = await api.put(`/tasks/${id}`,updateData);
        return response.data;
    }
    catch(error:any){
        if(axios.isAxiosError(error) && error.response){
            console.error('update task error ',error.response.data);
            return error.response.data;
        }
        else{
            console.error('update task error ',error);
            return {message:'failed to update task'};
        }
    }
};

export const deleteTask = async(id:string) =>{
    try{
        const response = await api.delete(`/tasks/${id}`);
        return response.data;
    }
    catch(error:any){
        if(axios.isAxiosError(error) && error.response){
            console.error('delete task error ',error.response.data);
            return error.response.data;
        }
        else{
            console.error('delete task error ',error);
            return {message:'failed to delete task'};
        }
    }
};