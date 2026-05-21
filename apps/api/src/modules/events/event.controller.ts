import type { Request, Response } from 'express';

import { asyncWrapper } from '../../core/utils/asyncWrapper.js';
import { sendCreated, sendSuccess } from '../../core/utils/apiResponse.js';
import type { EventService } from './event.service.js';

export class EventController {
  constructor(private readonly eventService: EventService) {}

  getEvents = asyncWrapper(async (req: Request, res: Response) => {
    const result = await this.eventService.getEvents(req.query);
    sendSuccess(res, result);
  });

  getEventById = asyncWrapper(async (req: Request, res: Response) => {
    const event = await this.eventService.getEventById(req.params['id']!);
    sendSuccess(res, event);
  });

  createEvent = asyncWrapper(async (req: Request, res: Response) => {
    console.log('req>>>', req.body);
    const event = await this.eventService.createEvent(req.body, req.user!.userId);
    sendCreated(res, event, 'Event created successfully');
  });

  getEventSeats = asyncWrapper(async (req: Request, res: Response) => {
    const seats = await this.eventService.getEventSeats(req.params['id']!);
    sendSuccess(res, seats);
  });

  publishEvent = asyncWrapper(async (req: Request, res: Response) => {
    const event = await this.eventService.publishEvent(req.params['id']!, req.user!.userId);
    sendSuccess(res, event, 'Event published successfully');
  });
}
