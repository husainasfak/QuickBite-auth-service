import { Request } from 'express'

export interface UserData {
    firstName: string
    lastName: string
    email: string
    password: string
    role?: string
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

export interface AuthRequest extends Request {
    auth: {
        id?: string
        sub: number
        role: string
        tenant: string
    }
}

export interface IRefreshTokenPayload {
    id: string
}

// Tenant types
export interface ITenant {
    name: string
    address: string
}

export interface TenantRequest extends Request {
    body: ITenant
}

export interface UserRequest extends Request {
    body: UserData
}

export interface LimitedUserData {
    firstName: string
    lastName: string
    role: string
    email: string
    tenantId: number
}

export interface UpdateUserRequest extends Request {
    body: LimitedUserData
}

export interface TenantQueryParams {
    q: string
    perPage: number
    currentPage: number
}

export interface UserQueryParams {
    perPage: number
    currentPage: number
    q: string
    role: string
}
