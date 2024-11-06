import request from 'supertest'
import app from './src/app'



void describe('App', () => {
    void it('Should return 200 status', async () => {
       const res =  await request(app).get('/').send()
       expect(res.statusCode).toBe(200)
    })
})
