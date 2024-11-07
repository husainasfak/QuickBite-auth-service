import request from 'supertest'
import app from '../../src/app'

describe('POST /auth/register', () => {
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
    })

    describe('fields are mission', () => {})
})

// 3A - Arrange, Act, Assert
