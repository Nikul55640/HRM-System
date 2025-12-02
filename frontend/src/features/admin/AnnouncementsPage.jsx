import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Megaphone, Calendar, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/essHelpers';
const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      setAnnouncements([
        {
          id: 1,
          title: 'Company Holiday - New Year',
          content: 'The office will be closed on January 1st for New Year celebrations. Happy New Year to all!',
          priority: 'high',
          author: 'HR Department',
          createdAt: new Date('2024-12-20'),
        },
        {
          id: 2,
          title: 'New Health Insurance Policy',
          content: 'We are pleased to announce an upgraded health insurance policy for all employees. Please check your email for details.',
          priority: 'medium',
          author: 'Benefits Team',
          createdAt: new Date('2024-12-15'),
        },
        {
          id: 3,
          title: 'Team Building Event - January 25th',
          content: 'Join us for a team building event at the city park. Food and activities will be provided. RSVP by January 20th.',
          priority: 'low',
          author: 'HR Department',
          createdAt: new Date('2024-12-10'),
        },
      ]);
    } catch (error) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading announcements...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Company Announcements</h1>
        <Megaphone className="h-8 w-8 text-primary" />
      </div>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No announcements at this time.
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{announcement.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {announcement.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(announcement.createdAt)}
                      </div>
                    </div>
                  </div>
                  <Badge variant={getPriorityColor(announcement.priority)}>
                    {announcement.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{announcement.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
