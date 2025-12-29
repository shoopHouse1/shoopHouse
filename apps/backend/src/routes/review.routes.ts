import { Router } from 'express';
import { createReview, getReviews } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createReviewSchema } from '@shoophouse/shared';

const router = Router();

router.get('/', getReviews);
router.post('/', authenticate, validate(createReviewSchema), createReview);

export default router;


