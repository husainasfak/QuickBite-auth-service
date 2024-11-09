import request from 'supertest'
import app from '../../src/app'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'

import { User } from '../../src/entity/User'
import { Roles } from '../../src/constants'

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
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/)
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
    })

    describe('fields are mission', () => {})
})

// 3A - Arrange, Act, Assert
