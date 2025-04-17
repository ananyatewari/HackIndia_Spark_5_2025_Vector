import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['zoom'],
    default: 'zoom'
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurrencePattern: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly'],
    required: function() {
      return this.isRecurring;
    }
  },
  participants: [{
    type: String,
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  meetingId: {
    type: String,
    required: true
  },
  passcode: {
    type: String,
    required: true
  },
  joinUrl: {
    type: String,
    required: function() {
      return this.type === 'google-meet';
    }
  }
}, {
  timestamps: true,
});

export const Meeting = mongoose.model('Meeting', meetingSchema); 