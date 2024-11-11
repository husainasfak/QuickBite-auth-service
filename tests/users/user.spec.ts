import request from 'supertest'
import app from '../../src/app'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'

import createJWKSMock from 'mock-jwks'
import { User } from '../../src/entity/User'
import { Roles } from '../../src/constants'

describe('GET /auth/self', () => {
    let connection: DataSource
    let jwks: ReturnType<typeof createJWKSMock>

    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:5555')
        connection = await AppDataSource.initialize()
    })

    beforeEach(async () => {
        // truncate db
        // Each test must run in isolation
        // so clearning db is must
        jwks.start()
        await connection.dropDatabase()
        await connection.synchronize()
    })

    afterEach(() => {
        jwks.stop()
    })

    afterAll(async () => {
        await connection.destroy()
    })

    describe('Given all fields', () => {
        // status code
        it('should return the 200 status code', async () => {
            // AAA
            // Arrange

            const accessToken = jwks.token({
                sub: '123321',
                role: Roles.CUSTOMER,
            })

            // Act
            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken};`])
                .send()

            // Assert
            expect(response.statusCode).toBe(200)
        })

        it('should return the user data', async () => {
            // AAA
            // Arrange
            const userData = {
                firstName: 'Rakesh',
                lastName: 'K',
                email: 'rakesh@mern.space',
                password: 'secret',
            }
            // Register data
            const userRepo = connection.getRepository(User)

            const createdUser = await userRepo.save({
                ...userData,
                role: Roles.CUSTOMER,
            })

            // Generate token

            const accessToken = jwks.token({
                sub: String(createdUser.id),
                role: createdUser.role,
            })

            // Add token to cookie

            // Act
            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken};`])
                .send()

            // Assert
            // Check if user id matches with registered user
            expect((response.body as Record<string, string>).id).toBe(
                createdUser.id,
            )
        })

        it('should not the password field in user data', async () => {
            // AAA
            // Arrange
            const userData = {
                firstName: 'Rakesh',
                lastName: 'K',
                email: 'rakesh@mern.space',
                password: 'secret',
            }
            // Register data
            const userRepo = connection.getRepository(User)

            const createdUser = await userRepo.save({
                ...userData,
                role: Roles.CUSTOMER,
            })

            // Generate token

            const accessToken = jwks.token({
                sub: String(createdUser.id),
                role: createdUser.role,
            })

            // Add token to cookie

            // Act
            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken};`])
                .send()

            // Assert
            // Check if user id matches with registered user
            expect(response.body as Record<string, string>).not.toHaveProperty(
                'password',
            )
        })

        it('should return 401 status if token does not exist', async () => {
            // AAA
            // Arrange
            const userData = {
                firstName: 'Rakesh',
                lastName: 'K',
                email: 'rakesh@mern.space',
                password: 'secret',
            }
            // Register data
            const userRepo = connection.getRepository(User)

            const createdUser = await userRepo.save({
                ...userData,
                role: Roles.CUSTOMER,
            })

            // Act
            const response = await request(app).get('/auth/self').send()

            // Assert
            // Check if user id matches with registered user
            expect(response.statusCode).toBe(401)
        })
    })
})

// 3A - Arrange, Act, Assert
