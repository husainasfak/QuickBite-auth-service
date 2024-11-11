import { Request } from 'express'

export interface UserData {
    firstName: string
    lastName: string
    email: string
    password: string
}
export interface RegisterUserRequest extends Request {
    body: UserData
}

export interface TokenPayload {
    sub: string
    role: string
}

export type AuthCookie = {
    accessToken: string
    refreshToken: string
}


export interface AuthRequest extends Request{
    auth:{
        sub:number;
        role:string
    }
}