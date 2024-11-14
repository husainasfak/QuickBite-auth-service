import { Repository } from 'typeorm'
import { User } from '../entity/User'
import { UserData } from '../types'
import createHttpError from 'http-errors'
import { Roles } from '../constants'
import bcrypt from 'bcrypt'
export class UserService {
    constructor(private userRepo: Repository<User>) {}
    async create({ firstName, lastName, email, password, role }: UserData) {
        // Check duplicate email

        const user = await this.userRepo.findOne({ where: { email } })

        if (user) {
            const error = createHttpError(400, 'Email already exist')
            throw error
        }

        // Hash the password
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        try {
            return await this.userRepo.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: role || Roles.CUSTOMER,
            })
        } catch (err) {
            const error = createHttpError(
                500,
                'Failed to store the user creation in DB',
            )
            throw error
        }
    }

    async findByEmail(email: string) {
        return await this.userRepo.findOne({
            where: {
                email,
            },
        })
    }

    async findById(id: number) {
        return await this.userRepo.findOne({
            where: {
                id,
            },
        })
    }
}
