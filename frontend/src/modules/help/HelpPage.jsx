import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/ui/card';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Textarea } from '../../shared/ui/textarea';
import { Badge } from '../../shared/ui/badge';
import { 
  HelpCircle, 
  Search, 
  MessageCircle, 
  Phone, 
  Mail, 
  FileText, 
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Send,
  Clock,
  CheckCircle,
  Book,
  Video,
  Download
} from 'lucide-react';
import { toast } from 'react-toastify';
import helpSupportService from '../../services/helpSupportService';

const HelpPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [activeTab, setActiveTab] = useState('faq');
  const [supportForm, setSupportForm] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    description: ''
  });
  
  // State for API data
  const [faqData, setFaqData] = useState([]);
  const [quickLinks, setQuickLinks] = useState([]);
  const [contactInfo, setContactInfo] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [faqResponse, resourcesResponse, contactResponse] = await Promise.all([
          helpSupportService.getFAQ(),
          helpSupportService.getHelpResources(),
          helpSupportService.getContactInfo()
        ]);

        if (faqResponse.success) {
          setFaqData(faqResponse.data);
        }

        if (resourcesResponse.success) {
          // Map resources to quickLinks format
          const mappedResources = resourcesResponse.data.map(resource => ({
            title: resource.title,
            description: resource.description,
            icon: getResourceIcon(resource.category),
            type: resource.type,
            url: resource.url
          }));
          setQuickLinks(mappedResources);
        }

        if (contactResponse.success) {
          // Map contact info with icons
          const mappedContacts = contactResponse.data.map(contact => ({
            type: contact.type,
            icon: getContactIcon(contact.type),
            contact: contact.contact,
            hours: contact.hours
          }));
          setContactInfo(mappedContacts);
        }
      } catch (error) {
        console.error('Error loading help data:', error);
        toast.error('Failed to load help data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Helper functions for icons
  const getResourceIcon = (category) => {
    switch (category) {
      case 'documentation': return <Book className="w-5 h-5" />;
      case 'tutorials': return <Video className="w-5 h-5" />;
      case 'system': return <CheckCircle className="w-5 h-5" />;
      case 'policies': return <FileText className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getContactIcon = (type) => {
    if (type.includes('HR')) return <Mail className="w-5 h-5 text-blue-600" />;
    if (type.includes('IT')) return <Phone className="w-5 h-5 text-green-600" />;
    if (type.includes('Emergency')) return <Phone className="w-5 h-5 text-red-600" />;
    return <Mail className="w-5 h-5 text-blue-600" />;
  };

  const filteredFaqs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await helpSupportService.submitSupportTicket(supportForm);
      if (response.success) {
        toast.success('Support ticket submitted successfully. We\'ll get back to you soon!');
        setSupportForm({
          subject: '',
          category: 'general',
          priority: 'medium',
          description: ''
        });
      }
    } catch (error) {
      toast.error('Failed to submit support ticket. Please try again.');
    }
  };

  const tabs = [
    { id: 'faq', label: 'FAQ', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'contact', label: 'Contact Support', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'resources', label: 'Resources', icon: <FileText className="w-4 h-4" /> }
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Help & Support Center</h1>
        <p className="text-gray-600">
          Find answers to common questions or get in touch with our support team
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search for help articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-center"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Tab */}
      {activeTab === 'faq' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
          
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading FAQ...</p>
              </CardContent>
            </Card>
          ) : filteredFaqs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500">
                  Try searching with different keywords or browse all categories.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => (
                <Card key={faq.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-0">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {faq.category}
                          </Badge>
                        </div>
                        <h3 className="font-medium text-gray-900">{faq.question}</h3>
                      </div>
                      {expandedFaq === faq.id ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    
                    {expandedFaq === faq.id && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <p className="text-gray-600 mt-3">{faq.answer}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contact Support Tab */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Submit a Support Ticket</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSupportSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <Input
                    value={supportForm.subject}
                    onChange={(e) => setSupportForm({...supportForm, subject: e.target.value})}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={supportForm.category}
                      onChange={(e) => setSupportForm({...supportForm, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="general">General</option>
                      <option value="technical">Technical Issue</option>
                      <option value="account">Account Access</option>
                      <option value="payroll">Payroll</option>
                      <option value="leave">Leave Management</option>
                      <option value="attendance">Attendance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={supportForm.priority}
                      onChange={(e) => setSupportForm({...supportForm, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <Textarea
                    value={supportForm.description}
                    onChange={(e) => setSupportForm({...supportForm, description: e.target.value})}
                    placeholder="Please provide detailed information about your issue..."
                    rows={4}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Ticket
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo.map((contact, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="mt-1">{contact.icon}</div>
                    <div>
                      <h4 className="font-medium text-gray-900">{contact.type}</h4>
                      <p className="text-sm text-gray-600">{contact.contact}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {contact.hours}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Low Priority</span>
                  <Badge variant="outline">2-3 business days</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Medium Priority</span>
                  <Badge variant="outline">1-2 business days</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">High Priority</span>
                  <Badge variant="outline">4-8 hours</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Urgent</span>
                  <Badge variant="outline">1-2 hours</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Helpful Resources</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-3"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickLinks.map((link, index) => (
                <Card key={index} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {link.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{link.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{link.description}</p>
                        <Button variant="ghost" size="sm" className="p-0 h-auto">
                          <span className="mr-1">Access</span>
                          {link.type === 'external' ? (
                            <ExternalLink className="w-3 h-3" />
                          ) : link.type === 'download' ? (
                            <Download className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HelpPage;