import express, { RequestHandler } from 'express'

// import logger from '../config/logger'
import authenticate from '../middlewares/authenticate'
import { Roles } from '../constants'
import { canAccess } from '../middlewares/canAccess'
import { UserController } from '../controller/userController'
import { UserService } from '../services/User.service'
import { AppDataSource } from '../config/data-source'
import { User } from '../entity/User'
import logger from '../config/logger'
import listUsersValidators from '../validators/list-users.validators'
import updateUserValidators from '../validators/updateUser.validators'

const router = express.Router()
const userRepo = AppDataSource.getRepository(User)
const userService = new UserService(userRepo)
const userController = new UserController(userService, logger)

router.post(
    '/',
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (async (req, res, next) =>
        userController.create(req, res, next)) as RequestHandler,
)

router.patch(
    '/:id',
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    updateUserValidators,
    (async (req, res, next) =>
        userController.update(req, res, next)) as RequestHandler,
)

router.get(
    '/',
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    listUsersValidators,
    (async (req, res, next) =>
        userController.getAll(req, res, next)) as RequestHandler,
)

router.get(
    '/:id',
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (async (req, res, next) =>
        userController.getOne(req, res, next)) as RequestHandler,
)

router.delete(
    '/:id',
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (async (req, res, next) =>
        userController.destroy(req, res, next)) as RequestHandler,
)

export default router
