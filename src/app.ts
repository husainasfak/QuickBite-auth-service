import 'reflect-metadata'
import express, { NextFunction, Request, Response } from 'express'
import logger from './config/logger'
import { HttpError } from 'http-errors'
import authRouter from './routes/auth'
import tenantRoutes from './routes/tenant'
import userRoutes from './routes/user'
import cookieParser from 'cookie-parser'
import cors from 'cors'
// import { globalErrorHandler } from './middlewares/globalErrorHandler'
const app = express()
app.use(
    cors({
        origin: ['http://localhost:5173'],
        credentials: true,
    }),
)

app.use(express.static('public'))

app.use(cookieParser())
app.use(express.json())

// app.get('/error', async (req, res, next) => {
//     const err = createHttpError(401, 'Unauth')
//     next(err)
// })
app.get('/', (req, res) => {
    res.status(200).send('Hello')
})

// Routes
app.use('/auth', authRouter)
app.use('/tenant', tenantRoutes)
app.use('/user', userRoutes)

// app.use(globalErrorHandler)
// Global Error Handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message)
    const statusCode = err.statusCode || err.status || 500

    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: '',
                location: '',
            },
        ],
    })
})

export default app
