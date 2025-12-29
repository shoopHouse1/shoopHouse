import { Router } from 'express';
import { getDownloads, downloadFile } from '../controllers/download.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getDownloads);
router.get('/:token', downloadFile);

export default router;


