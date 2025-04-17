import axios from 'axios';

const API_URL = 'http://localhost:5000/api/meetings';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Meeting {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: string;
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  recurringDetails?: {
    pattern: string;
    startDate: string;
    endDate: string;
  };
  participants: string[];
  createdBy: string;
  meetingId?: string;
  passcode?: string;
  joinUrl?: string;
  isRecurrence?: boolean;
  originalMeetingId?: string;
  hasRecording?: boolean;
  processed?: boolean;
  uploadDate?: string;
  processedDate?: string;
  mom?: string;
  momGeneratedDate?: string;
}

export interface MeetingStatistics {
  totalMeetings: number;
  meetingsByType: { [key: string]: number };
  recurringMeetings: number;
}

export const meetingService = {
  createMeeting: async (meetingData: Partial<Meeting>) => {
    try {
      const response = await api.post('/', meetingData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  },

  getMeetings: async (options?: { upcoming?: boolean; past?: boolean }) => {
    try {
      const params = new URLSearchParams();
      if (options?.upcoming) params.append('upcoming', 'true');
      if (options?.past) params.append('past', 'true');
      
      const response = await api.get('/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching meetings:', error);
      throw error;
    }
  },

  getUpcomingMeetings: async () => {
    return meetingService.getMeetings({ upcoming: true });
  },

  getPastMeetings: async () => {
    return meetingService.getMeetings({ past: true });
  },

  getMeeting: async (id: string) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  updateMeeting: async (id: string, meetingData: Partial<Meeting>) => {
    const response = await api.put(`/${id}`, meetingData);
    return response.data;
  },

  deleteMeeting: async (id: string) => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw error;
    }
  },

  getMeetingStatistics: async () => {
    try {
      const response = await api.get('/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },

  uploadRecording: async (meetingId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('recording', file);
      formData.append('meetingId', meetingId);
      
      const response = await axios.post('http://localhost:5000/api/audio/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading recording:', error);
      throw error;
    }
  },
}; 