import { NextFunction, Response } from 'express'
import { TenantService } from '../services/Tenant.service'
import { TenantRequest } from '../types'
import { Logger } from 'winston'

export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {}
    async create(req: TenantRequest, res: Response, next: NextFunction) {
        const { name, address } = req.body
        this.logger.debug('Request for creating tenant', req.body)
        try {
            const tenant = await this.tenantService.create({ name, address })
            this.logger.info(`Tenant has be created as named ${tenant.name}`, {
                id: tenant.id,
            })
            return res.status(201).json({ id: tenant.id })
        } catch (err) {
            next(err)
        }
    }
}
