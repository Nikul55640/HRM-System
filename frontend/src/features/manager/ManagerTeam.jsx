import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Users, Mail, Phone, Calendar, Briefcase, MapPin, Search } from 'lucide-react';
import { managerService } from '../../services';
import { toast } from 'react-toastify';

const ManagerTeam = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await managerService.getTeamMembers();
      
      if (response.success) {
        setTeam(response.data);
      } else {
        toast.error('Failed to load team members');
      }
    } catch (error) {
      console.error('Failed to fetch team:', error);
      toast.error(error.message || 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const filteredTeam = team.filter(member => {
    const matchesSearch = member.personalInfo?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.personalInfo?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.contactInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'On Leave':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Inactive':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading team members...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">My Team</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and view your team members</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-800">{team.length}</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-800">
              {team.filter(m => m.status === 'Active').length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">On Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-800">
              {team.filter(m => m.status === 'On Leave').length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-800">
              {new Set(team.map(m => m.jobInfo?.department)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'Active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('Active')}
              >
                Active
              </Button>
              <Button
                variant={filterStatus === 'On Leave' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('On Leave')}
              >
                On Leave
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredTeam.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-400 text-sm">
              {searchTerm || filterStatus !== 'all' 
                ? 'No team members found matching your filters' 
                : 'No team members assigned yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeam.map(member => (
            <Card key={member._id} className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-semibold">
                    {member.personalInfo?.firstName?.[0]}{member.personalInfo?.lastName?.[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {member.personalInfo?.firstName} {member.personalInfo?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{member.employeeId}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    <span>{member.jobInfo?.jobTitle || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{member.contactInfo?.email || 'N/A'}</span>
                  </div>
                  
                  {member.contactInfo?.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{member.contactInfo.phoneNumber}</span>
                    </div>
                  )}

                  {member.jobInfo?.workLocation && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{member.jobInfo.workLocation}</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getStatusColor(member.status)}`}>
                      {member.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Profile
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Mail className="w-4 h-4 mr-1" />
                    Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerTeam;
