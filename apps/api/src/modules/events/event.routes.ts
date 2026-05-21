import { Router } from 'express';

import { authenticate, authorize } from '../../shared/middleware/auth.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { EventController } from './event.controller.js';
import { EventRepository } from './event.repository.js';
import { EventService } from './event.service.js';
import { createEventSchema, eventQuerySchema } from './event.validation.js';

const router = Router();

const eventRepository = new EventRepository();
const eventService = new EventService(eventRepository);
const eventController = new EventController(eventService);

router.get('/', validate(eventQuerySchema, 'query'), eventController.getEvents);
router.get('/:id', eventController.getEventById);
router.get('/:id/seats', eventController.getEventSeats);

router.post(
  '/',
  authenticate,
  authorize('admin', 'organizer'),
  //validate(createEventSchema),
  eventController.createEvent,
);

router.patch(
  '/:id/publish',
  authenticate,
  authorize('admin', 'organizer'),
  eventController.publishEvent,
);

export default router;
