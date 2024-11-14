import express, { RequestHandler } from 'express'

// import logger from '../config/logger'
import authenticate from '../middlewares/authenticate'
import { Roles } from '../constants'
import { canAccess } from '../middlewares/canAccess'
import { UserController } from '../controller/userController'
import { UserService } from '../services/User.service'
import { AppDataSource } from '../config/data-source'
import { User } from '../entity/User'

const router = express.Router()
const userRepo = AppDataSource.getRepository(User)
const userService = new UserService(userRepo)
const userController = new UserController(userService)

router.post(
    '/',
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (async (req, res, next) =>
        userController.create(req, res, next)) as RequestHandler,
)

export default router
