import app from './app'
import { Config } from './config'
import { AppDataSource } from './config/data-source'
import logger from './config/logger'

const startServer = async () => {
    const PORT = Config.PORT
    try {
        await AppDataSource.initialize()
        logger.info('Database connected')
        // eslint-disable-next-line no-console
        app.listen(PORT, () => logger.info(`Listening at PORT`, { port: PORT }))
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
        process.exit(1)
    }
}

void startServer()
