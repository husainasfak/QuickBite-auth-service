import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from 'express'
import { AuthController } from '../controller/AuthController'
import { UserService } from '../services/User.service'
import { AppDataSource } from '../config/data-source'
import { User } from '../entity/User'
import logger from '../config/logger'
import registerValidators from '../validators/register.validators'
import { TokenService } from '../services/Token.service'
import { RefreshToken } from '../entity/RefreshToken'
import loginValidators from '../validators/login.validators'
import { CredentialService } from '../services/Credential.service'
import authenticate from '../middlewares/authenticate'
import { AuthRequest } from '../types'

import validateRefreshToken from '../middlewares/validateRefreshToken'

const router = express.Router()
const userRepo = AppDataSource.getRepository(User)
const tokenRepo = AppDataSource.getRepository(RefreshToken)
const userService = new UserService(userRepo)

const tokenService = new TokenService(tokenRepo)
const credentialService = new CredentialService()
const authController = new AuthController(
    userService,
    logger,
    tokenService,
    credentialService,
)

router.post('/register', registerValidators, (async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    await authController.register(req, res, next)
}) as RequestHandler)

router.post('/login', loginValidators, (async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    await authController.login(req, res, next)
}) as RequestHandler)

router.get(
    '/self',
    authenticate as RequestHandler,
    (async (
        req: Request,
        res: Response,
        // next: NextFunction,
    ) => {
        await authController.self(req as AuthRequest, res)
    }) as RequestHandler,
)

router.post(
    '/refresh',
    validateRefreshToken as RequestHandler,
    (async (req: Request, res: Response, next: NextFunction) => {
        await authController.refresh(req as AuthRequest, res, next)
    }) as RequestHandler,
)

export default router
