import api from './api';

class HelpSupportService {
  /**
   * Get FAQ data
   */
  async getFAQ() {
    try {
      const response = await api.get('/admin/help-support/faq');
      return response.data;
    } catch (error) {
      console.error('Error fetching FAQ:', error);
      throw error;
    }
  }

  /**
   * Submit support ticket
   */
  async submitSupportTicket(ticketData) {
    try {
      const response = await api.post('/admin/help-support/support-ticket', ticketData);
      return response.data;
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      throw error;
    }
  }

  /**
   * Get help resources
   */
  async getHelpResources() {
    try {
      const response = await api.get('/admin/help-support/resources');
      return response.data;
    } catch (error) {
      console.error('Error fetching help resources:', error);
      throw error;
    }
  }

  /**
   * Get contact information
   */
  async getContactInfo() {
    try {
      const response = await api.get('/admin/help-support/contact-info');
      return response.data;
    } catch (error) {
      console.error('Error fetching contact info:', error);
      throw error;
    }
  }
}

export default new HelpSupportService();