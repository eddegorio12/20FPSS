import { google } from 'googleapis';
import prisma from '@/lib/prisma';
import { Schedule, Topic, TopicPart, Section, TeacherProfile, User } from '@prisma/client';

type FullSchedule = Schedule & {
  topic: Topic;
  topicPart: TopicPart | null;
  section: Section;
  teacher: TeacherProfile & { user: User };
};

export class CalendarSyncService {
  private static async getOAuth2Client(userId: string) {
    const account = await prisma.account.findFirst({
      where: { userId, provider: 'google' },
    });

    if (!account || !account.refresh_token) {
      throw new Error(`No Google account or refresh token found for user ${userId}`);
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      refresh_token: account.refresh_token,
      access_token: account.access_token,
    });

    return oauth2Client;
  }

  private static buildEventPayload(schedule: FullSchedule) {
    const summary = `Class: ${schedule.topic.name}${schedule.topicPart ? ' - ' + schedule.topicPart.name : ''} (${schedule.section.name})`;
    const description = `Teacher: ${schedule.teacher.user.name}\nSection: ${schedule.section.name}\nNotes: ${schedule.notes || 'None'}`;
    
    // Convert to ISO string explicitly
    const startDateTime = schedule.startTime.toISOString();
    const endDateTime = schedule.endTime.toISOString();

    return {
      summary,
      description,
      location: schedule.roomNumber || undefined,
      start: { dateTime: startDateTime, timeZone: 'UTC' }, // Note: Adjust timezone if required
      end: { dateTime: endDateTime, timeZone: 'UTC' },
    };
  }

  static async syncCreate(schedule: FullSchedule) {
    try {
      const oauth2Client = await this.getOAuth2Client(schedule.teacher.userId);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const eventPayload = this.buildEventPayload(schedule);

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: eventPayload,
      });

      const googleEventId = response.data.id;

      if (!googleEventId) throw new Error("Failed to get googleEventId from API response.");

      await prisma.schedule.update({
        where: { id: schedule.id },
        data: {
          googleEventId,
          syncStatus: 'SYNCED',
        },
      });

      await prisma.calendarSyncLog.create({
        data: {
          scheduleId: schedule.id,
          action: 'CREATE',
          status: 'SUCCESS',
        },
      });

      return { success: true, googleEventId };
    } catch (error: any) {
      await prisma.schedule.update({
        where: { id: schedule.id },
        data: { syncStatus: 'FAILED' },
      });

      await prisma.calendarSyncLog.create({
        data: {
          scheduleId: schedule.id,
          action: 'CREATE',
          status: 'FAILED',
          errorDetail: error.message || String(error),
        },
      });

      console.error('Calendar Sync Create Error:', error);
      return { success: false, error: error.message };
    }
  }

  static async syncUpdate(schedule: FullSchedule) {
    if (!schedule.googleEventId) {
      // Fallback to create if missing
      return this.syncCreate(schedule);
    }

    try {
      const oauth2Client = await this.getOAuth2Client(schedule.teacher.userId);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const eventPayload = this.buildEventPayload(schedule);

      await calendar.events.patch({
        calendarId: 'primary',
        eventId: schedule.googleEventId,
        requestBody: eventPayload,
      });

      await prisma.schedule.update({
        where: { id: schedule.id },
        data: { syncStatus: 'SYNCED' },
      });

      await prisma.calendarSyncLog.create({
        data: {
          scheduleId: schedule.id,
          action: 'UPDATE',
          status: 'SUCCESS',
        },
      });

      return { success: true };
    } catch (error: any) {
      await prisma.schedule.update({
        where: { id: schedule.id },
        data: { syncStatus: 'FAILED' },
      });

      await prisma.calendarSyncLog.create({
        data: {
          scheduleId: schedule.id,
          action: 'UPDATE',
          status: 'FAILED',
          errorDetail: error.message || String(error),
        },
      });

      console.error('Calendar Sync Update Error:', error);
      return { success: false, error: error.message };
    }
  }

  static async syncDelete(schedule: FullSchedule) {
    if (!schedule.googleEventId) {
      return { success: true }; // Nothing to delete
    }

    try {
      const oauth2Client = await this.getOAuth2Client(schedule.teacher.userId);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: schedule.googleEventId,
      });

      await prisma.calendarSyncLog.create({
        data: {
          scheduleId: schedule.id,
          action: 'DELETE',
          status: 'SUCCESS',
        },
      });

      return { success: true };
    } catch (error: any) {
      await prisma.calendarSyncLog.create({
        data: {
          scheduleId: schedule.id,
          action: 'DELETE',
          status: 'FAILED',
          errorDetail: error.message || String(error),
        },
      });

      console.error('Calendar Sync Delete Error:', error);
      return { success: false, error: error.message };
    }
  }
}
