
import { Router } from 'express'

import {
  bulkManageQr,
  createQr,
  getQrCodes,
  getQrCode,
  updateQr,
  deleteQr,
  getQrAnalyticsController
} from '../controllers/qr.controller.js'

import authenticate from '../middleware/auth.middleware.js'
import validate from '../middleware/validate.middleware.js'
import validateQuery from '../middleware/validate-query.middleware.js'
import {
  analyticsQuerySchema,
  bulkQrSchema,
  createQrSchema,
  paginationQuerySchema,
  updateQrSchema,
} from '../validators/qr.validator.js'

const router = Router()

router.use(authenticate)

router.post('/bulk', validate(bulkQrSchema), bulkManageQr)
router.post('/', validate(createQrSchema), createQr)
router.get('/', validateQuery(paginationQuerySchema), getQrCodes)
router.get('/:id/analytics', validateQuery(analyticsQuerySchema), getQrAnalyticsController)
router.get('/:id', getQrCode)
router.patch('/:id', validate(updateQrSchema), updateQr)
router.delete('/:id', deleteQr)
export default router
