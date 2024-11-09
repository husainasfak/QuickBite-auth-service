import { DataSource } from 'typeorm'

export const truncateTable = async (connection: DataSource) => {
    const entities = connection.entityMetadatas

    for (const entity of entities) {
        const repo = connection.getRepository(entity.name)

        await repo.clear()
    }
}
