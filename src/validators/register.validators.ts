import { body } from 'express-validator'

export default [
    body('email')
        .notEmpty()
        .withMessage('Email is missing')
        .isEmail()
        .withMessage('Email is not valid'),
]
