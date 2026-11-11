import { Router } from 'express'
import { redirectQr } from '../controllers/redirect.controller.js'

const router = Router()

router.get('/:shortCode', redirectQr)

export default router