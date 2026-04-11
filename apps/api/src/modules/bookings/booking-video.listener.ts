import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { VideoIntegrationService } from '../video-integration/video-integration.service';
import { AppLoggerService } from '../../common/logger';
import { BookingEvent, BookingVideoNeededPayload, BookingVideoCreatedPayload } from '../../common/events';

@Injectable()
export class BookingVideoListener {
  constructor(
    private readonly prisma: PrismaService,
    private readonly videoIntegrationService: VideoIntegrationService,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext('BookingVideoListener');
  }

  @OnEvent(BookingEvent.VIDEO_NEEDED, { async: true })
  async handleVideoNeeded(payload: BookingVideoNeededPayload): Promise<void> {
    try {
      const videoData = await this.videoIntegrationService.createMeeting(
        payload.tenantId,
        {
          topic: `${payload.serviceName} - ${payload.customerName}`,
          startTime: `${payload.date}T${payload.startTime}:00`,
          duration: payload.duration,
        },
      );

      if (videoData) {
        await this.prisma.booking.update({
          where: { id: payload.bookingId },
          data: {
            bookingMode: payload.bookingMode || 'online',
            videoProvider: videoData.provider,
            videoMeetingId: videoData.meetingId,
            videoJoinUrl: videoData.joinUrl,
          },
        });

        this.logger.log('Video meeting created async', {
          bookingId: payload.bookingId,
          tenantId: payload.tenantId,
          provider: videoData.provider,
        });

        // Emit event so notification module sends the video link email
        this.eventEmitter.emit(BookingEvent.VIDEO_CREATED, {
          bookingId: payload.bookingId,
          tenantId: payload.tenantId,
          videoJoinUrl: videoData.joinUrl,
          videoProvider: videoData.provider,
        } as BookingVideoCreatedPayload);
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to create video meeting for booking=${payload.bookingId}: ${error?.message}`,
      );
    }
  }
}
