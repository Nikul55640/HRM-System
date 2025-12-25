import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import leaveService from '../../admin/services/adminLeaveService';

const LeaveApprovalsPage = () => {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [action, setAction] = useState('approve');
  const [remarks, setRemarks] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const fetchPendingLeaves = useCallback(async () => {
    try {
      setLoading(true);
      const response = await leaveService.getPendingLeaveRequests();
      setPendingLeaves(response.data || []);
    } catch (error) {
      enqueueSnackbar('Failed to load pending leaves', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchPendingLeaves();
  }, [fetchPendingLeaves]);

  const handleOpenDialog = (leave, act) => {
    setSelectedLeave(leave);
    setAction(act);
    setOpenDialog(true);
    setRemarks('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedLeave(null);
    setRemarks('');
  };

  const handleApproveOrReject = async () => {
    try {
      if (action === 'approve') {
        await leaveService.approveLeaveRequest(selectedLeave.id, {
          remarks,
        });
      } else {
        await leaveService.rejectLeaveRequest(selectedLeave.id, {
          remarks,
        });
      }
      enqueueSnackbar(`Leave ${action}ed successfully`, { variant: 'success' });
      handleCloseDialog();
      fetchPendingLeaves();
    } catch (error) {
      enqueueSnackbar(`Failed to ${action} leave`, { variant: 'error' });
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Leave Request Approvals
      </Typography>

      {(pendingLeaves || []).length === 0 ? (
        <Card>
          <CardContent>
            <Typography align="center" color="textSecondary">
              No pending leave requests
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Employee</TableCell>
                <TableCell>Leave Type</TableCell>
                <TableCell>From Date</TableCell>
                <TableCell>To Date</TableCell>
                <TableCell>Days</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(pendingLeaves || []).map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        sx={{ width: 32, height: 32 }}
                        src={leave.user?.avatar}
                      >
                        {leave.user?.firstName?.[0]}
                      </Avatar>
                      {leave.user?.firstName} {leave.user?.lastName}
                    </Box>
                  </TableCell>
                  <TableCell>{leave.leaveType?.name}</TableCell>
                  <TableCell>
                    {new Date(leave.fromDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(leave.toDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{leave.days}</TableCell>
                  <TableCell>{leave.reason}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => handleOpenDialog(leave, 'approve')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => handleOpenDialog(leave, 'reject')}
                      >
                        Reject
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Approval Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {action === 'approve' ? 'Approve' : 'Reject'} Leave Request
        </DialogTitle>
        <DialogContent sx={{ minWidth: 400, py: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Employee: {selectedLeave?.user?.firstName}{' '}
            {selectedLeave?.user?.lastName}
          </Typography>
          <TextField
            fullWidth
            label="Remarks"
            multiline
            rows={4}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add remarks for your decision..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleApproveOrReject} variant="contained">
            {action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LeaveApprovalsPage;
