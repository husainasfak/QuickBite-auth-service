import request from 'supertest'
import app from '../../src/app'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'

import createJWKSMock from 'mock-jwks'
import { User } from '../../src/entity/User'
import { Roles } from '../../src/constants'
import { Tenant } from '../../src/entity/Tenant'

describe('GET /tenants', () => {
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
        it('should return a 201 status code', async () => {
            // AAA
            // Arrange
            const tenantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            }

            // Act
            const response = await request(app)
                .post('/tenant')
                .set('Cookie', [`accessToken=${AdminToken}`])
                .send(tenantData)

            // Assert
            // Check if user id matches with registered user
            expect(response.statusCode).toBe(201)
        })

        it('should create a tenant in a db', async () => {
            // AAA
            // Arrange
            const tenantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            }
            // Act
            const response = await request(app)
                .post('/tenant')
                .set('Cookie', [`accessToken=${AdminToken}`])
                .send(tenantData)

            const tenantRepo = connection.getRepository(Tenant)
            const tenant = await tenantRepo.find()
            // Assert

            expect(tenant).toHaveLength(1)
            expect(tenant[0].name).toBe(tenantData.name)
        })

        it('should return 401 if user is not authenticated', async () => {
            // AAA
            // Arrange
            const tenantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            }
            // Act
            const response = await request(app).post('/tenant').send(tenantData)

            // Assert

            expect(response.statusCode).toBe(401)

            const tenantRepo = connection.getRepository(Tenant)
            const tenant = await tenantRepo.find()

            expect(tenant).toHaveLength(0)
        })

        it('should return 403 if user is not an admin', async () => {
            // AAA
            // Arrange

            let ManagerToken = jwks.token({
                sub: '1',
                role: Roles.MANAGER,
            })
            const tenantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            }
            // Act
            const response = await request(app)
                .post('/tenant')
                .set('Cookie', [`accessToken=${ManagerToken}`])
                .send(tenantData)

            // Assert

            expect(response.statusCode).toBe(403)

            const tenantRepo = connection.getRepository(Tenant)
            const tenant = await tenantRepo.find()

            expect(tenant).toHaveLength(0)
        })
    })
})

// 3A - Arrange, Act, Assert
