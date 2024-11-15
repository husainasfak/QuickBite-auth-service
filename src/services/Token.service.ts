import { JwtPayload, sign } from 'jsonwebtoken'
import createHttpError from 'http-errors'
import { Config } from '../config'
import { RefreshToken } from '../entity/RefreshToken'
import { User } from '../entity/User'
import { Repository } from 'typeorm'
export class TokenService {
    constructor(private refreshTokenRepo: Repository<RefreshToken>) {}
    generateAccessToken(payload: JwtPayload) {
        let privateKey: string
        try {
            // privateKey = fs.readFileSync(
            //     path.join(__dirname, '../../certs/private.pem'),
            // )
            if (!Config.PRIVATE_KEY) {
                const error = createHttpError(500, 'Could not find SECRET_KEY')

                throw error
            }
            privateKey = Config.PRIVATE_KEY
        } catch (err) {
            const error = createHttpError(
                500,
                'Error while reading private key',
            )

            throw error
        }
        const accessToken = sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '1h',
            issuer: 'auth-service',
        })
        return accessToken
    }

    genrateRefreshToken(payload: JwtPayload) {
        const refreshToken = sign(payload, Config.AUTH_SECRET!, {
            algorithm: 'HS256',
            expiresIn: '1y',
            issuer: 'auth-service',
            jwtid: String(payload.id),
        })
        return refreshToken
    }

    async persistRefreshToken(user: User) {
        // Persist the refresh token
        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365 // 1yr without leap year

        const newRefreshToken = await this.refreshTokenRepo.save({
            user: user,
            expiresAt: new Date(Date.now() + MS_IN_YEAR),
        })
        return newRefreshToken
    }

    async deleteRefreshToken(tokenId: number) {
        return await this.refreshTokenRepo.delete({ id: tokenId })
    }
}
