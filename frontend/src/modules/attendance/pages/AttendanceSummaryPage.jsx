import React, { useEffect, useState } from 'react';
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
  Loading,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import attendanceService from '../../services/attendanceService';

const AttendanceSummaryPage = () => {
  const [data, setData] = useState({
    present: 0,
    absent: 0,
    late: 0,
    onLeave: 0,
  });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCorrection, setOpenCorrection] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchAttendanceData();
  }, [month, year]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.getAttendanceSummary({
        month,
        year,
      });
      setData(response.data);
      setRecords(response.records || []);
    } catch (error) {
      enqueueSnackbar('Failed to load attendance data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCorrection = (record) => {
    setSelectedRecord(record);
    setOpenCorrection(true);
  };

  const handleCloseCorrection = () => {
    setOpenCorrection(false);
    setSelectedRecord(null);
  };

  const handleSubmitCorrection = async (correctionData) => {
    try {
      await attendanceService.requestCorrection({
        ...correctionData,
        recordId: selectedRecord.id,
      });
      enqueueSnackbar('Correction request submitted', { variant: 'success' });
      handleCloseCorrection();
      fetchAttendanceData();
    } catch (error) {
      enqueueSnackbar('Failed to submit correction', { variant: 'error' });
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Attendance Summary
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Present
              </Typography>
              <Typography variant="h5">{data.present}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Absent
              </Typography>
              <Typography variant="h5">{data.absent}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Late
              </Typography>
              <Typography variant="h5">{data.late}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                On Leave
              </Typography>
              <Typography variant="h5">{data.onLeave}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Month/Year Filter */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Month</InputLabel>
          <Select
            value={month}
            label="Month"
            onChange={(e) => setMonth(e.target.value)}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <MenuItem key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleString('default', { month: 'long' })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>
          <Select
            value={year}
            label="Year"
            onChange={(e) => setYear(e.target.value)}
          >
            {Array.from({ length: 5 }, (_, i) => (
              <MenuItem key={i} value={new Date().getFullYear() - i}>
                {new Date().getFullYear() - i}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Attendance Records Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Date</TableCell>
              <TableCell>Check-In</TableCell>
              <TableCell>Check-Out</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                <TableCell>{record.checkIn || '-'}</TableCell>
                <TableCell>{record.checkOut || '-'}</TableCell>
                <TableCell>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor:
                        record.status === 'present'
                          ? '#4caf50'
                          : record.status === 'absent'
                          ? '#f44336'
                          : '#ff9800',
                      color: 'white',
                    }}
                  >
                    {record.status}
                  </span>
                </TableCell>
                <TableCell>
                  {record.status !== 'present' && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleOpenCorrection(record)}
                    >
                      Request Correction
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Correction Dialog */}
      <Dialog open={openCorrection} onClose={handleCloseCorrection}>
        <DialogTitle>Request Attendance Correction</DialogTitle>
        <DialogContent sx={{ minWidth: 400, py: 2 }}>
          <TextField
            fullWidth
            label="Reason"
            multiline
            rows={4}
            placeholder="Explain why you need a correction..."
            sx={{ mb: 2 }}
            id="correction-reason"
          />
          <TextField
            fullWidth
            label="Correction Details"
            placeholder="Provide check-in/check-out times if needed"
            id="correction-details"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCorrection}>Cancel</Button>
          <Button
            onClick={() => {
              const reason = document.getElementById('correction-reason')?.value;
              const details = document.getElementById('correction-details')?.value;
              handleSubmitCorrection({ reason, details });
            }}
            variant="contained"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AttendanceSummaryPage;
