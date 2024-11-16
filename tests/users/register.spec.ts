import request from 'supertest'
import app from '../../src/app'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'

import { User } from '../../src/entity/User'
import { Roles } from '../../src/constants'
import { isJwt } from '../utils'
import { RefreshToken } from '../../src/entity/RefreshToken'

describe('POST /auth/register', () => {
    let connection: DataSource
    beforeAll(async () => {
        connection = await AppDataSource.initialize()
    })

    beforeEach(async () => {
        // truncate db
        // Each test must run in isolation
        // so clearning db is must
        await connection.dropDatabase()
        await connection.synchronize()
    })

    afterAll(async () => {
        await connection.destroy()
    })

    describe('Given all fields', () => {
        // status code
        it('should return the 201 status code', async () => {
            // AAA
            // Arrange
            const userData = {
                firstName: 'Jhon',
                lastName: 'Doe',
                email: 'jd@work.com',
                password: 'secret',
            }

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            // Assert
            expect(response.statusCode).toBe(201)
        })

        // Valid Json
        it('should return valid json', async () => {
            // AAA
            // Arrange
            const userData = {
                firstName: 'Jhon',
                lastName: 'Doe',
                email: 'jd@work.com',
                password: 'secret',
            }

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            // Assert application/json
            expect(
                (response.headers as Record<string, string>)['content-type'],
            ).toEqual(expect.stringContaining('json'))
        })

        it('should persist the user in the db', async () => {
            // AAA
            // Arrange
            const userData = {
                firstName: 'Jhon',
                lastName: 'Doe',
                email: 'jd@work.com',
                password: 'secret',
            }

            // Act
            await request(app).post('/auth/register').send(userData)

            // Assert
            const userRepo = connection.getRepository(User)
            const users = await userRepo.find()
            expect(users).toHaveLength(1)
            expect(users[0].firstName).toBe(userData.firstName)
            expect(users[0].lastName).toBe(userData.lastName)
            expect(users[0].email).toBe(userData.email)
        })

        it('should return id of the created user', async () => {
            // AAA
            // Arrange
            const userData = {
                firstName: 'Jhon',
                lastName: 'Doe',
                email: 'jd@work.com',
                password: 'secret',
            }

            // Act
            const res = await request(app).post('/auth/register').send(userData)

            // Assert
            expect(res.body).toHaveProperty('id')
            const repository = connection.getRepository(User)
            const users = await repository.find()
            expect((res.body as Record<string, string>).id).toBe(users[0].id)
        })

        it('should assign a customer role', async () => {
            // AAA
            // Arrange
            const userData = {
                firstName: 'Jhon',
                lastName: 'Doe',
                email: 'jd@work.com',
                password: 'secret',
            }

            // Act
            const res = await request(app).post('/auth/register').send(userData)

            // Assert
            const repository = connection.getRepository(User)
            const users = await repository.find()
            expect(users[0]).toHaveProperty('role')
            expect(users[0].role).toBe(Roles.CUSTOMER)
        })

        it('should store the hashed password in the db', async () => {
            // AAA
            // Arrange
            const userData = {
                firstName: 'Jhon',
                lastName: 'Doe',
                email: 'jd@work.com',
                password: 'secret',
            }

            // Act
            await request(app).post('/auth/register').send(userData)

            // Assert
            const repository = connection.getRepository(User)
            const users = await repository.find()

            expect(users[0].password).not.toBe(userData.password)

            // check hashed cases
            expect(users[0].password).toHaveLength(60)
            expect(users[0].password).toMatch(/^\$2[a|b]\$\d+\$/)
        })

        it('should return 400 status code if email is already exists', async () => {
            // AAA
            // Arrange
            const userData = {
                firstName: 'Jhon',
                lastName: 'Doe',
                email: 'jd@work.com',
                password: 'secret',
            }
            const repository = connection.getRepository(User)
            await repository.save({ ...userData, role: Roles.CUSTOMER })

            // Act
            const res = await request(app).post('/auth/register').send(userData)

            const users = await repository.find()
            // Assert

            expect(res.statusCode).toBe(400)
            expect(users).toHaveLength(1)
        })

        it('should return the access and refresh token inside  a cookie', async () => {
            // AAA
            // Arrange
            const userData = {
                firstName: 'Jhon',
                lastName: 'Doe',
                email: 'jd@work.com',
                password: 'secret',
            }

            interface Headers {
                ['set-cookie']: string[]
            }
            // Act
            let accessToken: string | null = null
            let refreshToken: string | null = null
            const res = await request(app).post('/auth/register').send(userData)

            // Assert
            const cookies =
                (res.headers as unknown as Headers)['set-cookie'] || []

            cookies.forEach((cookie) => {
                if (cookie.startsWith('accessToken=')) {
                    accessToken = cookie.split(';')[0].split('=')[1]
                }
                if (cookie.startsWith('refreshToken=')) {
                    refreshToken = cookie.split(';')[0].split('=')[1]
                }
            })

            expect(accessToken).not.toBe(null)
            expect(refreshToken).not.toBe(null)
            expect(isJwt(accessToken)).toBeTruthy()
            expect(isJwt(refreshToken)).toBeTruthy()
        })

        it('should store the refresh token in the db', async () => {
            // AAA
            // Arrange
            const userData = {
                firstName: 'Jhon',
                lastName: 'Doe',
                email: 'jd@work.com',
                password: 'secret',
            }

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            // Assert
            const refreshTokenRepo = connection.getRepository(RefreshToken)

            // const refreshToken = await refreshTokenRepo.find()

            // expect(refreshToken).toHaveLength(1)

            const token = await refreshTokenRepo
                .createQueryBuilder('refreshToken')
                .where('refreshToken.id = :userId', {
                    userId: (response.body as Record<string, string>).id,
                })
                .getMany()

            expect(token).toHaveLength(1)
        })
    })

    describe('fields are mission', () => {
        it('should return 400 status code if email field is missing', async () => {
            // Arrange

            const userData = {
                firstname: 'Aman',
                lastName: 'Jazz',

                password: 'secret',
            }

            // Act
            const res = await request(app).post('/auth/register').send(userData)
            const repository = connection.getRepository(User)
            const users = await repository.find()

            // Assert
            expect(res.statusCode).toBe(400)
            expect(users).toHaveLength(0)
        })
    })

    describe('fields are not in proper format', () => {
        it('should trim the email field', async () => {
            // Arrange
            const userData = {
                firstName: 'Rakesh',
                lastName: 'K',
                email: ' rakesh@mern.space ',
                password: 'password',
            }
            // Act
            await request(app).post('/auth/register').send(userData)

            // Assert
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            const user = users[0]
            expect(user.email).toBe('rakesh@mern.space')
        })
    })
})

// 3A - Arrange, Act, Assert
