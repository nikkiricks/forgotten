import fs from 'fs';
import path from 'path';

class RequestTracker {
  constructor() {
    this.requestsFile = path.join(process.cwd(), 'data', 'requests.json');
    this.ensureDataDirectory();
  }

  ensureDataDirectory() {
    const dataDir = path.dirname(this.requestsFile);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.requestsFile)) {
      fs.writeFileSync(this.requestsFile, JSON.stringify([], null, 2));
    }
  }

  async saveRequest(requestData) {
    const requests = this.loadRequests();
    
    const newRequest = {
      id: `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      status: 'submitted',
      contactEmail: requestData.contactEmail,
      deceasedName: requestData.deceasedName,
      firstName: requestData.firstName,
      lastName: requestData.lastName,
      linkedinUrl: requestData.linkedinUrl,
      relationship: requestData.relationship,
      confirmationId: requestData.confirmationId,
      method: requestData.method || 'automated',
      estimatedCompletion: requestData.estimatedProcessingTime,
      lastUpdated: new Date().toISOString(),
      notes: []
    };

    requests.push(newRequest);
    fs.writeFileSync(this.requestsFile, JSON.stringify(requests, null, 2));
    
    return newRequest;
  }

  loadRequests() {
    try {
      const data = fs.readFileSync(this.requestsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async updateRequestStatus(requestId, status, notes = '') {
    const requests = this.loadRequests();
    const requestIndex = requests.findIndex(req => req.id === requestId);
    
    if (requestIndex !== -1) {
      requests[requestIndex].status = status;
      requests[requestIndex].lastUpdated = new Date().toISOString();
      
      if (notes) {
        requests[requestIndex].notes.push({
          timestamp: new Date().toISOString(),
          note: notes
        });
      }
      
      fs.writeFileSync(this.requestsFile, JSON.stringify(requests, null, 2));
      return requests[requestIndex];
    }
    
    return null;
  }

  async getRequestsByEmail(email) {
    const requests = this.loadRequests();
    return requests.filter(req => req.contactEmail === email);
  }

  async getAllRequests() {
    return this.loadRequests();
  }

  async getRequestStats() {
    const requests = this.loadRequests();
    
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'submitted' || r.status === 'processing').length,
      completed: requests.filter(r => r.status === 'completed').length,
      failed: requests.filter(r => r.status === 'failed').length,
      recentRequests: requests.slice(-10).reverse()
    };
  }
}

export default RequestTracker;