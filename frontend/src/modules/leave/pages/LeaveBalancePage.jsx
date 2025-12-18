import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import leaveService from '../../services/leaveService';

const LeaveBalancePage = () => {
  const [balances, setBalances] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openApply, setOpenApply] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      const [balancesResp, historyResp] = await Promise.all([
        leaveService.getLeaveBalance(),
        leaveService.getLeaveHistory(),
      ]);
      setBalances(balancesResp.data || []);
      setLeaveHistory(historyResp.data || []);
    } catch (error) {
      enqueueSnackbar('Failed to load leave data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApply = (leaveType) => {
    setSelectedLeaveType(leaveType);
    setOpenApply(true);
  };

  const handleCloseApply = () => {
    setOpenApply(false);
    setSelectedLeaveType('');
  };

  const handleApplyLeave = async (data) => {
    try {
      await leaveService.applyLeave({
        leaveType: selectedLeaveType,
        ...data,
      });
      enqueueSnackbar('Leave request submitted successfully', {
        variant: 'success',
      });
      handleCloseApply();
      fetchLeaveData();
    } catch (error) {
      enqueueSnackbar('Failed to apply leave', { variant: 'error' });
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Leave Management
      </Typography>

      {/* Leave Balance Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {balances.map((balance) => (
          <Grid item xs={12} sm={6} md={4} key={balance.leaveTypeId}>
            <Card>
              <CardHeader
                title={balance.leaveTypeName}
                subheader={`${balance.used} of ${balance.total} days used`}
              />
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Remaining: {balance.remaining} days
                  </Typography>
                  <Box
                    sx={{
                      mt: 1,
                      width: '100%',
                      height: 8,
                      backgroundColor: '#e0e0e0',
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${(balance.used / balance.total) * 100}%`,
                        backgroundColor: '#ff9800',
                      }}
                    />
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleOpenApply(balance.leaveTypeId)}
                  disabled={balance.remaining <= 0}
                >
                  Apply {balance.leaveTypeName}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Leave History */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Leave History
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Leave Type</TableCell>
              <TableCell>From Date</TableCell>
              <TableCell>To Date</TableCell>
              <TableCell>Days</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaveHistory.map((leave) => (
              <TableRow key={leave.id}>
                <TableCell>{leave.leaveTypeName}</TableCell>
                <TableCell>{new Date(leave.fromDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(leave.toDate).toLocaleDateString()}</TableCell>
                <TableCell>{leave.days}</TableCell>
                <TableCell>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor:
                        leave.status === 'approved'
                          ? '#4caf50'
                          : leave.status === 'rejected'
                          ? '#f44336'
                          : '#ff9800',
                      color: 'white',
                    }}
                  >
                    {leave.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Apply Leave Dialog */}
      <Dialog open={openApply} onClose={handleCloseApply}>
        <DialogTitle>Apply for Leave</DialogTitle>
        <DialogContent sx={{ minWidth: 400, py: 2 }}>
          <TextField
            fullWidth
            label="From Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
            id="from-date"
          />
          <TextField
            fullWidth
            label="To Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
            id="to-date"
          />
          <TextField
            fullWidth
            label="Reason"
            multiline
            rows={4}
            placeholder="Provide reason for your leave request..."
            id="reason"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApply}>Cancel</Button>
          <Button
            onClick={() => {
              const fromDate = document.getElementById('from-date')?.value;
              const toDate = document.getElementById('to-date')?.value;
              const reason = document.getElementById('reason')?.value;
              handleApplyLeave({ fromDate, toDate, reason });
            }}
            variant="contained"
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LeaveBalancePage;
