import React, { useState }  from "react";
import './AuthForm.css';
import { resourceLimits } from "worker_threads";

interface AuthFormProps{
    type : 'register'|'login';
    onSubmit:(username:string,password:string)=>Promise<{token?:string,message?:string}>;
}

const AuthForm : React.FC<AuthFormProps>= ({type,onSubmit}) => {
    const [username , setUsername ] = useState<string>(''); 
    const [password,setPassword] = useState<string>('');
    const [message , setMessage] = useState<string>('');
    const [loading , setLoading] = useState<boolean>(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setMessage('');
        setLoading(true);

        try{
            const result = await onSubmit(username,password);

            if(result.token){
                setMessage(`Successfully ${type==='register' ? 'registered and logged in ':'logged in'}`);
                setUsername('');
                setPassword('');
            }else if(result.message){
                setMessage(result.message);
            }
            else{
                setMessage('unkown error occured');
            }
        } catch(error){
            console.error('auth form error',error);
            setMessage('network error or server unavailable');
        }
        finally{
            setLoading(false);
        }
    };

    return(
        <div className="auth-form-wrapper">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2 className="auth-form-title">{type==='register'?'Register' :'Login '}</h2>

                {}
                {message && (
                    <p className={`auth-form-message ${message.includes('successfully')?'success':'error'}`}>
                        {message}
                    </p>
                )}

                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input 
                    type="text"
                    id="username"
                    className="form-input"
                    value={username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=> setUsername(e.target.value)}
                    required 
                    disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                    type="password"
                    id="password"
                    className="form-input"
                    value={password}
                    onChange={(e:React.ChangeEvent<HTMLInputElement>)=>setPassword(e.target.value)}
                    required
                    disabled= {loading}
                    />
                    </div>

                    <button type="submit" className="submit-button" disabled={loading}>

                        {loading? 'processing':(type==='register'? 'Register':'Login')}
                    </button>
                
            </form>
        </div>
    );

};
export default AuthForm;