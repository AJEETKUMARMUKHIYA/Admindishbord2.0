import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import axiosClient from "../../AxiosClient";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import * as XLSX from "xlsx";
import Moment from "moment";

// Settings
const Settings = {
  DISPLAY_DATE_FORMAT: "YYYY-MM-DD",
};

// Columns
const columns = [
  { field: "UserID", headerName: "User ID", width: 100 },
  { field: "Password", headerName: "Password", width: 150 },
  { field: "Email", headerName: "Email", width: 200 },
  { field: "Mobile", headerName: "Mobile", width: 150 },
  { field: "CreatedBy", headerName: "Created By", width: 130 },
  {
    field: "CreatedDate",
    headerName: "Created Date",
    width: 150,
    valueFormatter: ({ value }) => Moment(value).format(Settings.DISPLAY_DATE_FORMAT),
  },
  { field: "UpdatedBy", headerName: "Updated By", width: 130 },
  {
    field: "UpdatedDate",
    headerName: "Updated Date",
    width: 150,
    valueFormatter: ({ value }) => Moment(value).format(Settings.DISPLAY_DATE_FORMAT),
  },
  { field: "Active", headerName: "Active", width: 100, type: "boolean" },
  {
    field: "LastActivityDate",
    headerName: "Last Activity Date",
    width: 160,
    valueFormatter: ({ value }) => Moment(value).format(Settings.DISPLAY_DATE_FORMAT),
  },
  { field: "FirstName", headerName: "First Name", width: 130 },
  { field: "LastName", headerName: "Last Name", width: 130 },
  { field: "FullName", headerName: "Full Name", width: 180 },
  { field: "DefaultAccountId", headerName: "Default Account ID", width: 150 },
  { field: "Role", headerName: "Role", width: 130 },
];

// Component to Create User
const CreateUserDialog = ({ open, onClose, onSave }) => {
  const [form, setForm] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    Mobile: "",
    Password: "",
    DefaultAccountId: "",
    Role: "Customer",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!form.FirstName) newErrors.FirstName = "First Name is required";
    if (!form.LastName) newErrors.LastName = "Last Name is required";
    if (!form.Email || !/\S+@\S+\.\S+/.test(form.Email)) newErrors.Email = "Valid Email is required";
    if (!form.Mobile || !/^\d{10}$/.test(form.Mobile)) newErrors.Mobile = "Valid 10-digit Mobile is required";
    if (!form.Password || form.Password.length < 6) newErrors.Password = "Password must be at least 6 characters";
    if (!form.DefaultAccountId || isNaN(form.DefaultAccountId)) newErrors.DefaultAccountId = "Valid Account ID is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const newUser = {
        ...form,
        DefaultAccountId: parseInt(form.DefaultAccountId),
      };
      await onSave(newUser);
      onClose();
    } catch (error) {
      setErrors({ submit: "Failed to create user" });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New User</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          fullWidth
          label="First Name"
          name="FirstName"
          value={form.FirstName}
          onChange={handleChange}
          error={!!errors.FirstName}
          helperText={errors.FirstName}
        />
        <TextField
          margin="dense"
          fullWidth
          label="Last Name"
          name="LastName"
          value={form.LastName}
          onChange={handleChange}
          error={!!errors.LastName}
          helperText={errors.LastName}
        />
        <TextField
          margin="dense"
          fullWidth
          label="Email"
          name="Email"
          value={form.Email}
          onChange={handleChange}
          error={!!errors.Email}
          helperText={errors.Email}
        />
        <TextField
          margin="dense"
          fullWidth
          label="Mobile"
          name="Mobile"
          value={form.Mobile}
          onChange={handleChange}
          error={!!errors.Mobile}
          helperText={errors.Mobile}
        />
        <TextField
          margin="dense"
          fullWidth
          label="Password"
          name="Password"
          type="password"
          value={form.Password}
          onChange={handleChange}
          error={!!errors.Password}
          helperText={errors.Password}
        />
        <TextField
          margin="dense"
          fullWidth
          label="Default Account ID"
          name="DefaultAccountId"
          type="number"
          value={form.DefaultAccountId}
          onChange={handleChange}
          error={!!errors.DefaultAccountId}
          helperText={errors.DefaultAccountId}
        />
        <TextField
          margin="dense"
          fullWidth
          label="Full Name"
          name="FullName"
          
          value={form.FullName}
          onChange={handleChange}
          error={!!errors.FullName}
          helperText={errors.FullName}
        />
        <TextField
          margin="dense"
          fullWidth
          select
          label="Role"
          name="Role"
          value={form.Role}
          onChange={handleChange}
          error={!!errors.Role}
          helperText={errors.Role}
        >
          <MenuItem value="Customer">Customer</MenuItem>
          <MenuItem value="Supervisor">Supervisor</MenuItem>
          <MenuItem value="Admin">Admin</MenuItem>
        </TextField>
        {errors.submit && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {errors.submit}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Component
const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      //const response = await axios.get("http://your-backend-api/api/Booking/Users");
      const response = await axiosClient.get("/Booking/Users");
      setUsers(response.data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to fetch users: " + (error.response?.data?.message || error.message),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRowClick = (params) => {
    setSelectedUser(params.row);
    setOpenDialog(true);
  };

  const handleCreateUser = async (newUser) => {
    try {
      // const response = await axios.post(
      //   "http://your-backend-api/api/Booking/CreateUser",
      //   newUser,
      //   { headers: { "Content-Type": "application/json" } }
      // );


       const response = await axiosClient.post(
        "/Booking/CreateUser",
        newUser,
        { headers: { "Content-Type": "application/json" } }
      );
      setUsers((prev) => [...prev, response.data]);
      setSnackbar({
        open: true,
        message: "User created successfully",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to create user: " + (error.response?.data?.message || error.message),
        severity: "error",
      });
      throw error;
    }
  };

  const onExport = () => {
    const exportData = users.map((item) => ({
      UserID: item.UserID,
      Password: item.Password,
      Email: item.Email,
      Mobile: item.Mobile,
      CreatedBy: item.CreatedBy,
      CreatedDate: Moment(item.CreatedDate).format(Settings.DISPLAY_DATE_FORMAT),
      UpdatedBy: item.UpdatedBy,
      UpdatedDate: Moment(item.UpdatedDate).format(Settings.DISPLAY_DATE_FORMAT),
      Active: item.Active,
      LastActivityDate: Moment(item.LastActivityDate).format(Settings.DISPLAY_DATE_FORMAT),
      FirstName: item.FirstName,
      LastName: item.LastName,
      FullName: item.FullName,
      DefaultAccountId: item.DefaultAccountId,
      Role: item.Role,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws["!cols"] = [
      { wch: 10 }, // UserID
      { wch: 20 }, // Password
      { wch: 25 }, // Email
      { wch: 15 }, // Mobile
      { wch: 15 }, // CreatedBy
      { wch: 15 }, // CreatedDate
      { wch: 15 }, // UpdatedBy
      { wch: 15 }, // UpdatedDate
      { wch: 10 }, // Active
      { wch: 20 }, // LastActivityDate
      { wch: 15 }, // FirstName
      { wch: 15 }, // LastName
      { wch: 20 }, // FullName
      { wch: 15 }, // DefaultAccountId
      { wch: 15 }, // Role
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "Users.xlsx");
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          User Table
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            sx={{ mr: 1 }}
            onClick={() => setOpenCreateDialog(true)}
          >
            Create User
          </Button>
          <Button variant="contained" color="secondary" onClick={onExport}>
            Export to Excel
          </Button>
        </Box>
      </Box>

      <div style={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={users}
          columns={columns}
          pageSize={10}
          onRowClick={handleRowClick}
          getRowId={(row) => row.UserID}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
        />
      </div>

      {/* View User Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <>
              <Typography><strong>Full Name:</strong> {selectedUser.FullName}</Typography>
              <Typography><strong>Email:</strong> {selectedUser.Email}</Typography>
              <Typography><strong>Mobile:</strong> {selectedUser.Mobile}</Typography>
              <Typography><strong>Role:</strong> {selectedUser.Role}</Typography>
              <Typography><strong>Created By:</strong> {selectedUser.CreatedBy}</Typography>
              <Typography><strong>Updated By:</strong> {selectedUser.UpdatedBy}</Typography>
              <Typography><strong>Default Account ID:</strong> {selectedUser.DefaultAccountId}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Create User Dialog */}
      <CreateUserDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onSave={handleCreateUser}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserTable;