import request from 'supertest'
import app from '../../src/app'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'

import createJWKSMock from 'mock-jwks'

import { Roles } from '../../src/constants'
import { Tenant } from '../../src/entity/Tenant'
import { User } from '../../src/entity/User'

describe('POST /user', () => {
    let connection: DataSource
    let jwks: ReturnType<typeof createJWKSMock>
    let AdminToken: string
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
        AdminToken = jwks.token({
            sub: '1',
            role: Roles.ADMIN,
        })
    })

    afterAll(async () => {
        await connection.destroy()
    })

    afterEach(() => {
        jwks.stop()
    })
    describe('Given all fields', () => {
        it('should persist the user in DB', async () => {
            // AAA
            // Arrange
            const userData = {
                firstName: 'Rakesh',
                lastName: 'K',
                email: 'rakesh@mern.space',
                password: 'secret',
                tenantId: 1,
            }
            let AdminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })

            // Act
            await request(app)
                .post('/user')
                .set('Cookie', [`accessToken=${AdminToken}`])
                .send(userData)

            // Assert

            const userRepo = connection.getRepository(User)
            const users = await userRepo.find()

            expect(users).toHaveLength(1)
            expect(users[0].email).toBe(userData.email)
        })
        it('should create a user as Manager', async () => {
            // AAA
            // Arrange
            const userData = {
                firstName: 'Rakesh',
                lastName: 'K',
                email: 'rakesh@mern.space',
                password: 'secret',
                tenantId: 1,
            }
            let AdminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })

            // Act
            await request(app)
                .post('/user')
                .set('Cookie', [`accessToken=${AdminToken}`])
                .send(userData)

            // Assert

            const userRepo = connection.getRepository(User)
            const users = await userRepo.find()

            expect(users).toHaveLength(1)
            expect(users[0].role).toBe(Roles.MANAGER)
        })

        it.todo('should return 403 if non admin tries to create a user')
    })
})

// 3A - Arrange, Act, Assert
