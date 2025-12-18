import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
} from '@mui/material';
import { useSnackbar } from 'notistack';

const DepartmentManagementPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data
      const mockDepts = [
        { id: 1, name: 'Engineering', description: 'Software Development' },
        { id: 2, name: 'HR', description: 'Human Resources' },
        { id: 3, name: 'Finance', description: 'Finance & Accounting' },
      ];
      setDepartments(mockDepts);
    } catch (error) {
      enqueueSnackbar('Failed to load departments', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  const handleOpenDialog = (dept = null) => {
    if (dept) {
      setFormData(dept);
      setEditingId(dept.id);
    } else {
      setFormData({ name: '', description: '' });
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    try {
      enqueueSnackbar(
        editingId ? 'Department updated' : 'Department created',
        { variant: 'success' }
      );
      handleCloseDialog();
      fetchDepartments();
    } catch (error) {
      enqueueSnackbar('Failed to save department', { variant: 'error' });
    }
  };

  const handleDelete = async (_id) => {
    if (window.confirm('Delete this department?')) {
      try {
        enqueueSnackbar('Department deleted', { variant: 'success' });
        fetchDepartments();
      } catch (error) {
        enqueueSnackbar('Failed to delete', { variant: 'error' });
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Department Management</Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Add Department
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell>{dept.name}</TableCell>
                  <TableCell>{dept.description}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => handleOpenDialog(dept)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete(dept.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Department' : 'Add Department'}
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DepartmentManagementPage;
