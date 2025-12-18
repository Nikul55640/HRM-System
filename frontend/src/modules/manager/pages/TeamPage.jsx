import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useSnackbar } from 'notistack';

const ManagerTeamPage = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const fetchTeam = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data
      const mockTeam = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          department: 'Engineering',
          designation: 'Developer',
          status: 'active',
          attendance: 18,
          leaves: 2,
        },
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          department: 'Engineering',
          designation: 'Senior Developer',
          status: 'active',
          attendance: 19,
          leaves: 1,
        },
      ];
      setTeam(mockTeam);
    } catch (error) {
      enqueueSnackbar('Failed to load team', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  const handleViewMember = (member) => {
    setSelectedMember(member);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMember(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Team Members
      </Typography>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Grid container spacing={3}>
          {team.map((member) => (
            <Grid item xs={12} sm={6} md={4} key={member.id}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{ width: 60, height: 60, mx: 'auto', mb: 2 }}
                    src={member.avatar}
                  >
                    {member.firstName?.[0]}
                  </Avatar>
                  <Typography variant="h6">
                    {member.firstName} {member.lastName}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {member.designation}
                  </Typography>
                  <Typography color="textSecondary" variant="body2" sx={{ mb: 2 }}>
                    {member.email}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Attendance: {member.attendance} days
                    </Typography>
                    <Typography variant="body2">
                      Leaves Used: {member.leaves} days
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleViewMember(member)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Detail Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Team Member Details</DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          {selectedMember && (
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {selectedMember.firstName} {selectedMember.lastName}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Email:</strong> {selectedMember.email}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Department:</strong> {selectedMember.department}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Designation:</strong> {selectedMember.designation}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Status:</strong> {selectedMember.status}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Attendance:</strong> {selectedMember.attendance} days
              </Typography>
              <Typography variant="body2">
                <strong>Leaves:</strong> {selectedMember.leaves} days
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          <Button variant="contained">Send Message</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManagerTeamPage;
