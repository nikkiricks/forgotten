import express from 'express';
import RequestTracker from '../services/requestTracker.js';
import StatusTracker from '../services/statusTracker.js';
import NotificationService from '../services/notificationService.js';

const router = express.Router();
const requestTracker = new RequestTracker();
const statusTracker = new StatusTracker();
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

// ===== NEW STATUS TRACKING SYSTEM (Privacy-First) =====

// Get all tracking entries (no PII)
router.get('/tracking', async (req, res) => {
  try {
    const trackingData = await statusTracker.getAllTracking();
    res.json(trackingData);
  } catch (error) {
    console.error('Error fetching tracking data:', error);
    res.status(500).json({ error: 'Failed to fetch tracking data' });
  }
});

// Get tracking stats
router.get('/tracking/stats', async (req, res) => {
  try {
    const stats = await statusTracker.getAdminStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching tracking stats:', error);
    res.status(500).json({ error: 'Failed to fetch tracking stats' });
  }
});

// Update overall tracking status
router.patch('/tracking/:trackingNumber/status', async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const { status, message } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const validStatuses = ['submitted', 'processing', 'action_required', 'completed', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status', 
        validStatuses 
      });
    }
    
    const updated = await statusTracker.updateStatus(trackingNumber, status, message);
    
    if (!updated) {
      return res.status(404).json({ error: 'Tracking number not found' });
    }
    
    res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating tracking status:', error);
    res.status(500).json({ error: 'Failed to update tracking status' });
  }
});

// Update platform-specific status
router.patch('/tracking/:trackingNumber/platform/:platformName', async (req, res) => {
  try {
    const { trackingNumber, platformName } = req.params;
    const { status, message } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const validStatuses = ['submitted', 'processing', 'action_required', 'completed', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status', 
        validStatuses 
      });
    }
    
    const updated = await statusTracker.updatePlatformStatus(trackingNumber, platformName, status, message);
    
    if (!updated) {
      return res.status(404).json({ error: 'Tracking number not found' });
    }
    
    res.json({ success: true, message: `${platformName} status updated successfully` });
  } catch (error) {
    console.error('Error updating platform status:', error);
    res.status(500).json({ error: 'Failed to update platform status' });
  }
});

// Get specific tracking details (for admin)
router.get('/tracking/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const status = await statusTracker.getStatus(trackingNumber);
    
    if (!status) {
      return res.status(404).json({ error: 'Tracking number not found' });
    }
    
    res.json(status);
  } catch (error) {
    console.error('Error fetching tracking details:', error);
    res.status(500).json({ error: 'Failed to fetch tracking details' });
  }
});

export default router;