
import { Router } from 'express'

import {
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
import { createQrSchema, updateQrSchema, paginationQuerySchema  } from '../validators/qr.validator.js'

const router = Router()

router.use(authenticate)

router.post('/', validate(createQrSchema), createQr)
router.get('/', validateQuery(paginationQuerySchema), getQrCodes)
router.get('/:id/analytics', getQrAnalyticsController)
router.get('/:id', getQrCode)
router.patch('/:id', validate(updateQrSchema), updateQr)
router.delete('/:id', deleteQr)
export default router
