import {Meeting} from '../models/Meeting.js';

export async function createMeeting(req, res) {
  try {
    const { 
      title, 
      description, 
      date, 
      time, 
      isRecurring, 
      recurrencePattern,
      meetingId,
      passcode
    } = req.body;

    if (!title || !description || !date || !time || !meetingId || !passcode) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const meeting = new Meeting({
      title,
      description,
      date,
      time,
      type: 'zoom',
      isRecurring: isRecurring || false,
      recurrencePattern: isRecurring ? recurrencePattern : undefined,
      meetingId,
      passcode,
      createdBy: 'default-user'
    });

    const savedMeeting = await meeting.save();
    res.status(201).json(savedMeeting);
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ message: 'Error creating meeting', error: error.message });
  }
}

export async function getMeetings(req, res) {
  try {
    const { upcoming, past } = req.query;
    let query = {};

    if (upcoming === 'true') {
      query.date = { $gte: new Date().toISOString().split('T')[0] };
    } else if (past === 'true') {
      query.date = { $lt: new Date().toISOString().split('T')[0] };
    }

    const meetings = await Meeting.find(query).sort({ date: 1, time: 1 });
    res.json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ message: 'Error fetching meetings' });
  }
}

export async function getMeeting(req, res) {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    res.json(meeting);
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({ message: 'Error fetching meeting' });
  }
}

export async function updateMeeting(req, res) {
  try {
    const meeting = await Meeting.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    res.json(meeting);
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({ message: 'Error updating meeting' });
  }
}

export async function deleteMeeting(req, res) {
  try {
    const meeting = await Meeting.findByIdAndDelete(req.params.id);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ message: 'Error deleting meeting' });
  }
}

export async function getMeetingStatistics(req, res) {
  try {
    const meetings = await Meeting.find();
    const statistics = {
      totalMeetings: meetings.length,
      meetingsByType: meetings.reduce((acc, meeting) => {
        acc[meeting.type] = (acc[meeting.type] || 0) + 1;
        return acc;
      }, {}),
      recurringMeetings: meetings.filter(m => m.isRecurring).length
    };
    res.json(statistics);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
}
