// import { body } from 'express-validator'

import { checkSchema } from 'express-validator'

// export default [
//     body('email')
//         .trim()
//         .notEmpty()
//         .withMessage('Email is missing')
//         .isEmail()
//         .withMessage('Email is not valid'),
// ]

export default checkSchema({
    email: {
        errorMessage: 'Email is missing',
        notEmpty: true,
        trim: true,
    },
})
