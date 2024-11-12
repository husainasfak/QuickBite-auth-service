import { NextFunction, Response } from 'express'

import { AuthRequest, RegisterUserRequest } from '../types'
import { UserService } from '../services/User.service'
import { Logger } from 'winston'

import { validationResult } from 'express-validator'
import { JwtPayload } from 'jsonwebtoken'

import { TokenService } from '../services/Token.service'
import createHttpError from 'http-errors'
import { CredentialService } from '../services/Credential.service'

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService,
    ) {}
    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        const result = validationResult(req)

        if (!result.isEmpty()) {
            return res.status(400).json({
                errors: result.array(),
            })
        }

        const { firstName, lastName, email, password } = req.body

        this.logger.debug('New Request to register a user', {
            firstName,
            lastName,
            email,
            password: '************',
        })
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            })
            this.logger.info('User has been created', { id: user.id })

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            }

            const accessToken = this.tokenService.generateAccessToken(payload)

            const savedRefreshToken =
                await this.tokenService.persistRefreshToken(user)

            const refreshToken = this.tokenService.genrateRefreshToken({
                ...payload,
                id: String(savedRefreshToken.id),
            })

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60, // 1h
                httpOnly: true,
            })
            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
                httpOnly: true,
            })

            this.logger.info('User have been registered', { id: user.id })
            res.status(201).json({ id: user.id })
        } catch (err) {
            next(err)
            return
        }
    }
    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
        const result = validationResult(req)

        if (!result.isEmpty()) {
            return res.status(400).json({
                errors: result.array(),
            })
        }

        const { email, password } = req.body

        this.logger.debug('New Request to login a user', {
            email,
            password: '************',
        })

        try {
            // check user email exsits in db
            const user = await this.userService.findByEmail(email)

            if (!user) {
                const error = createHttpError(
                    400,
                    'Email or password does not match',
                )

                next(error)
                return
            }

            // check password

            const passwordMatch = this.credentialService.comparePassword(
                password,
                user.password,
            )

            if (!passwordMatch) {
                const error = createHttpError(
                    400,
                    'Email or password does not match',
                )

                next(error)
                return
            }

            // generate token

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            }

            const accessToken = this.tokenService.generateAccessToken(payload)

            const savedRefreshToken =
                await this.tokenService.persistRefreshToken(user)

            const refreshToken = this.tokenService.genrateRefreshToken({
                ...payload,
                id: String(savedRefreshToken.id),
            })

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60, // 1h
                httpOnly: true,
            })
            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
                httpOnly: true,
            })

            this.logger.info('User have been logged in')
            res.json({ id: user.id })
        } catch (err) {
            next(err)
            return
        }
    }

    async self(req: AuthRequest, res: Response) {
        const { sub } = req.auth
        const user = await this.userService.findById(Number(sub))
        res.json({ ...user, password: undefined })
    }

    async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            // generate token

            const payload: JwtPayload = {
                sub: String(req.auth.sub),
                role: req.auth.role,
            }

            const accessToken = this.tokenService.generateAccessToken(payload)

            // Persist refresh token

            const user = await this.userService.findById(Number(req.auth.sub))

            if (!user) {
                next(createHttpError(400, 'User with the token could not find'))
                return
            }

            const savedRefreshToken =
                await this.tokenService.persistRefreshToken(user)

            // Delete old refresh token - Token rotation
            await this.tokenService.deleteRefreshToken(Number(req.auth.id))

            const refreshToken = this.tokenService.genrateRefreshToken({
                ...payload,
                id: String(savedRefreshToken.id),
            })

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60, // 1h
                httpOnly: true,
            })
            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
                httpOnly: true,
            })

            this.logger.info('User have been logged in')
            res.json({ user: user.id })
        } catch (err) {
            next(err)
            return
        }
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await this.tokenService.deleteRefreshToken(Number(req.auth.id))
            this.logger.info('User has been logged out', { id: req.auth.sub })
            res.clearCookie('accessToken')
            res.clearCookie('refreshToken')

            return res.json({
                success: true,
            })
        } catch (err) {
            next(err)
            return
        }
    }
}
