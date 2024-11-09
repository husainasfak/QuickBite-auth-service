import request from 'supertest'
import app from '../../src/app'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { truncateTable } from '../utils'
import { User } from '../../src/entity/User'

describe('POST /auth/register', () => {
    let connection: DataSource
    beforeAll(async () => {
        connection = await AppDataSource.initialize()
    })

    beforeEach(async () => {
        // truncate db
        // Each test must run in isolation
        // so clearning db is must
        await truncateTable(connection)
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
    })

    describe('fields are mission', () => {})
})

// 3A - Arrange, Act, Assert
