import express from 'express'
const router = express.Router();
import {  
  createMeeting, 
  getMeetings, 
  getMeeting, 
  updateMeeting, 
  deleteMeeting, 
  getMeetingStatistics } from "../controllers/meetingController.js"

router.post('/', createMeeting);
router.get('/', getMeetings);
router.get('/statistics', getMeetingStatistics);
router.get('/:id', getMeeting);
router.put('/:id', updateMeeting);
router.delete('/:id', deleteMeeting);
export default router;