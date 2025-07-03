import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';

dotenv.config();

//decoding userpayload
interface DecodedUserPayload{
    id: string;
    username:string;
}
//define an interface with full jwt payload
interface JwtPayloadUser extends jwt.JwtPayload{
    user: DecodedUserPayload;
}

//augment request 
declare global{
    namespace Express {
        interface Request{
            user?: DecodedUserPayload;
        }
    }
}

const authenticateJWT = (req : Request,res : Response,next: NextFunction)=>{
    const authHeader = req.headers.authorization;

    if(authHeader && authHeader.startsWith('Bearer ')){
        const token =authHeader.split(' ')[1];
        const jwtSecret = process.env.JWT_SECRET ;
        if(!jwtSecret){
            console.error('server error, jwt secret key doesnt exist');
            return res.status(500).json({message:'server configuration error'});
        }
        jwt.verify(token,jwtSecret,(err:JsonWebTokenError | null, decoded: string | jwt.JwtPayload| undefined) =>{
            if(err){
                console.warn('jwt verification failed',err.message);

                if(err.name==='TokenExpiredError'){
                    return res.status(401).json({message:'token expired'});
                }
                return res.status(403).json({message:'Invalid token'});
            }

            if(typeof decoded === 'object' && decoded !== null && decoded !== undefined && "user" in decoded){
                const userPayload = (decoded as JwtPayloadUser).user;

                req.user = {
                    id: userPayload.id,
                    username: userPayload.username
                };
                next();
            }else{
                console.warn('jwt token isnt in expected format');
                return res.status(403).json({message:'malformed user token'});

            }
        });
    }
    else{
       return res.status(401).json({message:'no token provided'});
    }
};

export default authenticateJWT;