export interface User
{
    id : string;
    username : string;
    password?: string;
}

export interface Task
{
    id: string;
    userId: string;
    title: string;
    completed: boolean;
}