import express from 'express';
import RequestTracker from '../services/requestTracker.js';
import NotificationService from '../services/notificationService.js';

const router = express.Router();
const requestTracker = new RequestTracker();
const notificationService = new NotificationService();

// Admin dashboard - get all requests
router.get('/requests', async (req, res) => {
  try {
    const requests = await requestTracker.getAllRequests();
    const stats = await requestTracker.getRequestStats();
    
    res.json({
      requests,
      stats
    });
  } catch (error) {
    console.error('Error fetching admin requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Update request status
router.put('/requests/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const updatedRequest = await requestTracker.updateRequestStatus(id, status, notes);
    
    if (!updatedRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Send notification to family
    await notificationService.sendStatusUpdate(updatedRequest, status, notes);
    
    res.json(updatedRequest);
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ error: 'Failed to update request status' });
  }
});

// Get request by ID
router.get('/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const requests = await requestTracker.getAllRequests();
    const request = requests.find(r => r.id === id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json(request);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await requestTracker.getRequestStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;