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

const router = express.Router()
const userRepo = AppDataSource.getRepository(User)
const userService = new UserService(userRepo)
const authController = new AuthController(userService, logger)
router.post('/register', registerValidators, (async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    await authController.register(req, res, next)
}) as RequestHandler)

export default router
