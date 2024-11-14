import express, { RequestHandler } from 'express'
import { TenantController } from '../controller/TenantController'
import { TenantService } from '../services/Tenant.service'
import { AppDataSource } from '../config/data-source'
import { Tenant } from '../entity/Tenant'
import logger from '../config/logger'
import authenticate from '../middlewares/authenticate'
import { Roles } from '../constants'
import { canAccess } from '../middlewares/canAccess'

const router = express.Router()
const tenantRepo = AppDataSource.getRepository(Tenant)
const tenantService = new TenantService(tenantRepo)
const tenantController = new TenantController(tenantService, logger)

router.post(
    '/',
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (async (req, res, next) =>
        tenantController.create(req, res, next)) as RequestHandler,
)

export default router
