import { Booking, Service, Customer, Employee } from '@prisma/client';

/**
 * Booking event names
 */
export enum BookingEvent {
  CREATED = 'booking.created',
  CONFIRMED = 'booking.confirmed',
  CANCELLED = 'booking.cancelled',
  RESCHEDULED = 'booking.rescheduled',
  COMPLETED = 'booking.completed',
  REMINDER_DUE = 'booking.reminder.due',
}

/**
 * Booking with related entities for event payloads
 */
export interface BookingWithDetails extends Booking {
  service: Service;
  customer: Customer;
  employee?: Employee | null;
}

/**
 * Base payload for booking events
 */
export interface BookingEventPayload {
  booking: BookingWithDetails;
  tenantId: string;
}

/**
 * Payload for booking created event
 */
export interface BookingCreatedPayload extends BookingEventPayload {
  depositRequired: boolean;
}

/**
 * Payload for booking cancelled event
 */
export interface BookingCancelledPayload extends BookingEventPayload {
  cancelledBy: 'customer' | 'business' | 'system';
  reason?: string;
}

/**
 * Payload for booking rescheduled event
 */
export interface BookingRescheduledPayload extends BookingEventPayload {
  previousDate: Date;
  previousStartTime: string;
}
