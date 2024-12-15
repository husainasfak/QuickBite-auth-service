import { Brackets, Repository } from 'typeorm'
import { User } from '../entity/User'
import { LimitedUserData, UserData, UserQueryParams } from '../types'
import createHttpError from 'http-errors'
import { Roles } from '../constants'
import bcrypt from 'bcryptjs'
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
                role: role ?? Roles.CUSTOMER,
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
            relations: {
                tenant: true,
            },
        })
    }

    async update(
        userId: number,
        { firstName, lastName, role, email, tenantId }: LimitedUserData,
    ) {
        try {
            return await this.userRepo.update(userId, {
                firstName,
                lastName,
                role,
                email,
                tenant: tenantId ? { id: tenantId } : null,
            })
        } catch (err) {
            const error = createHttpError(
                500,
                'Failed to update the user in the database',
            )
            throw error
        }
    }

    async getAll(validatedQuery: UserQueryParams) {
        const queryBuilder = this.userRepo.createQueryBuilder('user')

        if (validatedQuery.q) {
            const searchTerm = `%${validatedQuery.q}%`
            queryBuilder.where(
                new Brackets((qb) => {
                    qb.where(
                        "CONCAT(user.firstName, ' ', user.lastName) ILike :q",
                        { q: searchTerm },
                    ).orWhere('user.email ILike :q', { q: searchTerm })
                }),
            )
        }

        if (validatedQuery.role) {
            queryBuilder.andWhere('user.role = :role', {
                role: validatedQuery.role,
            })
        }

        const result = await queryBuilder
            .leftJoinAndSelect('user.tenant', 'tenant')
            .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
            .take(validatedQuery.perPage)
            .orderBy('user.id', 'DESC')
            .getManyAndCount()
        return result
    }

    async deleteById(userId: number) {
        return await this.userRepo.delete(userId)
    }
}
