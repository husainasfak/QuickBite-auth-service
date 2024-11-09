import express from 'express'
import { AuthController } from '../controller/AuthController'
import { UserService } from '../services/User.service'
import { AppDataSource } from '../config/data-source'
import { User } from '../entity/User'

const router = express.Router()
const userRepo = AppDataSource.getRepository(User)
const userService = new UserService(userRepo)
const authController = new AuthController(userService)
router.post('/register', (req, res) => authController.register(req, res))

export default router
