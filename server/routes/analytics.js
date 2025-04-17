import express from 'express';
import Audio from '../models/Audio.js';
import {Meeting} from '../models/Meeting.js';

const router = express.Router();

router.get('/meetings', async (req, res) => {
  try {
    const meetings = await Audio.find()
      .sort({ uploadDate: -1 })
      .select('filename size contentType transcription processed uploadDate summary actionItems mom speakers');
    
    res.json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Failed to fetch meetings data' });
  }
});

router.get('/', async (req, res) => {
  try {
    const totalAudios = await Audio.countDocuments();
    const processedAudios = await Audio.countDocuments({ processed: true });
    
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    last7Days.setHours(0, 0, 0, 0);
    const sampleData = [
      { uploadDate: new Date(), processed: true, size: 5000000, transcription: "test", mom: "test" },
      { uploadDate: new Date(), processed: false, size: 3000000, transcription: null, mom: null },
      { uploadDate: new Date(Date.now() - 24 * 60 * 60 * 1000), processed: true, size: 4000000, transcription: "test", mom: "test" }
    ];

    const count = await Audio.countDocuments();
    if (count === 0) {
      await Audio.insertMany(sampleData);
    }
    
    const dailyUploads = await Audio.aggregate([
      {
        $match: {
          uploadDate: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: { 
            $dateToString: { 
              format: "%Y-%m-%d", 
              date: "$uploadDate",
              timezone: "UTC"
            } 
          },
          totalUploads: { $sum: 1 },
          processedFiles: { $sum: { $cond: [{ $eq: ["$processed", true] }, 1, 0] }},
          averageSize: { $avg: "$size" },
          totalWithMoM: { $sum: { $cond: [{ $ne: ["$mom", null] }, 1, 0] }}
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const filledDailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split('T')[0];
      
      const existingData = dailyUploads.find(d => d._id === dateStr);
      if (existingData) {
        filledDailyData.push({
          date: dateStr,
          totalUploads: existingData.totalUploads,
          processedFiles: existingData.processedFiles,
          averageSize: Math.round((existingData.averageSize / (1024 * 1024)) * 100) / 100,
          totalWithMoM: existingData.totalWithMoM
        });
      } else {
        filledDailyData.push({
          date: dateStr,
          totalUploads: 0,
          processedFiles: 0,
          averageSize: 0,
          totalWithMoM: 0
        });
      }
    }

    const avgSize = await Audio.aggregate([
      {
        $group: {
          _id: null,
          avgSize: { $avg: "$size" }
        }
      }
    ]);

    const totalMeetings = await Meeting.countDocuments();

    const recentAudios = await Audio.find()
      .sort({ uploadDate: -1 })
      .limit(5)
      .select('filename size contentType transcription processed uploadDate summary actionItems mom speakers');

    res.json({
      totalAudios,
      processedAudios,
      dailyUploads: filledDailyData,
      avgSize: avgSize[0]?.avgSize || 0,
      totalMeetings,
      recentAudios
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

export default router; 