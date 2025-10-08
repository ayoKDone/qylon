import { ActionItem, ApiResponse, Meeting, PaginatedResponse } from '@/types';
import { apiService } from './api';

export class MeetingService {
  private baseEndpoint = '/api/v1/meetings';

  async getMeetings(
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<PaginatedResponse<Meeting>>> {
    return apiService.getPaginated<Meeting>(this.baseEndpoint, page, limit);
  }

  async getMeeting(id: string): Promise<ApiResponse<Meeting>> {
    return apiService.get<Meeting>(`${this.baseEndpoint}/${id}`);
  }

  async createMeeting(
    meeting: Omit<Meeting, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<ApiResponse<Meeting>> {
    return apiService.post<Meeting>(this.baseEndpoint, meeting);
  }

  async updateMeeting(id: string, updates: Partial<Meeting>): Promise<ApiResponse<Meeting>> {
    return apiService.put<Meeting>(`${this.baseEndpoint}/${id}`, updates);
  }

  async deleteMeeting(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  async getMeetingActionItems(meetingId: string): Promise<ApiResponse<ActionItem[]>> {
    return apiService.get<ActionItem[]>(`${this.baseEndpoint}/${meetingId}/action-items`);
  }

  async createActionItem(
    meetingId: string,
    actionItem: Omit<ActionItem, 'id' | 'meeting_id' | 'created_at' | 'updated_at'>,
  ): Promise<ApiResponse<ActionItem>> {
    return apiService.post<ActionItem>(
      `${this.baseEndpoint}/${meetingId}/action-items`,
      actionItem,
    );
  }

  async updateActionItem(
    meetingId: string,
    actionItemId: string,
    updates: Partial<ActionItem>,
  ): Promise<ApiResponse<ActionItem>> {
    return apiService.put<ActionItem>(
      `${this.baseEndpoint}/${meetingId}/action-items/${actionItemId}`,
      updates,
    );
  }

  async deleteActionItem(meetingId: string, actionItemId: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(
      `${this.baseEndpoint}/${meetingId}/action-items/${actionItemId}`,
    );
  }

  async startMeeting(id: string): Promise<ApiResponse<Meeting>> {
    return apiService.post<Meeting>(`${this.baseEndpoint}/${id}/start`);
  }

  async endMeeting(id: string): Promise<ApiResponse<Meeting>> {
    return apiService.post<Meeting>(`${this.baseEndpoint}/${id}/end`);
  }

  async getMeetingTranscript(id: string): Promise<ApiResponse<{ transcript: string }>> {
    return apiService.get<{ transcript: string }>(`${this.baseEndpoint}/${id}/transcript`);
  }
}

export const meetingService = new MeetingService();
