import express from 'express'
import { AuthController } from '../controller/AuthController'

const router = express.Router()

const authController = new AuthController()
router.post('/register', authController.register.bind(this))

export default router
