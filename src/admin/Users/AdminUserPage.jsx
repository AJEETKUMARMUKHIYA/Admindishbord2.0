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
  { field: "userId", headerName: "User ID", width: 100 },
  { field: "password", headerName: "Password", width: 150 },
  { field: "email", headerName: "Email", width: 200 },
  { field: "mobile", headerName: "Mobile", width: 150 },
  { field: "createdBy", headerName: "Created By", width: 130 },
  {
    field: "createdDate",
    headerName: "Created Date",
    width: 150,
    valueFormatter: (value) => {  return value ? Moment(value).format("YYYY-MM-DD"): ""
    },
     //valueFormatter: ({ value }) => Moment(value).format(Settings.DISPLAY_DATE_FORMAT),
  },
  { field: "updatedBy", headerName: "Updated By", width: 130 },
  {
    field: "updatedDate",
    headerName: "Updated Date",
    width: 150,
     valueFormatter: (value) => {  return value ? Moment(value).format("YYYY-MM-DD"): ""
    },
  },
  { field: "active", headerName: "Active", width: 100, type: "boolean" },
  {
    field: "lastActivityDate",
    headerName: "Last Activity Date",
    width: 160,
    valueFormatter: (value) => {  return value ? Moment(value).format("YYYY-MM-DD"): ""
    },
  },
  { field: "firstName", headerName: "First Name", width: 130 },
  { field: "lastName", headerName: "Last Name", width: 130 },
  { field: "defaultAccountId", headerName: "Default Account ID", width: 150 },
  { field: "roleId", headerName: "Role", width: 130 },
];

// Component for Create/Edit User
const UserDialog = ({ open, onClose, onSave, user, isEdit }) => {
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    password: user?.password || "",
    defaultAccountId: user?.defaultAccountId || "",
    roleId: user?.roleId || 2, // Default to Supervisor (roleId: 2)
    active: user?.active !== undefined ? user.active : true,
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!form.firstName) newErrors.firstName = "First Name is required";
    if (!form.lastName) newErrors.lastName = "Last Name is required";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Valid Email is required";
    if (!form.mobile || !/^\d{10}$/.test(form.mobile)) newErrors.mobile = "Valid 10-digit Mobile is required";
    if (!isEdit && (!form.password || form.password.length < 6)) newErrors.password = "Password must be at least 6 characters";
    if (!form.defaultAccountId || isNaN(form.defaultAccountId)) newErrors.defaultAccountId = "Valid Account ID is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleToggleActive = () => {
    setForm({ ...form, active: !form.active });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const userData = {
        userId: user?.userId,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        mobile: form.mobile,
        password: isEdit ? undefined : form.password, // Exclude password for edit
        defaultAccountId: parseInt(form.defaultAccountId),
        roleId: parseInt(form.roleId),
        active: form.active,
      };
      await onSave(userData, isEdit);
      onClose();
    } catch (error) {
      setErrors({ submit: "Failed to save user: " + (error.response?.data?.message || error.message) });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? "Edit User" : "Create New User"}</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          fullWidth
          label="First Name"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          error={!!errors.firstName}
          helperText={errors.firstName}
        />
        <TextField
          margin="dense"
          fullWidth
          label="Last Name"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          error={!!errors.lastName}
          helperText={errors.lastName}
        />
        <TextField
          margin="dense"
          fullWidth
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
        />
        <TextField
          margin="dense"
          fullWidth
          label="Mobile"
          name="mobile"
          value={form.mobile}
          onChange={handleChange}
          error={!!errors.mobile}
          helperText={errors.mobile}
        />
        <TextField
          margin="dense"
          fullWidth
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
          disabled={isEdit} // Password not editable
        />
        <TextField
          margin="dense"
          fullWidth
          label="Default Account ID"
          name="defaultAccountId"
          type="number"
          value={form.defaultAccountId}
          onChange={handleChange}
          error={!!errors.defaultAccountId}
          helperText={errors.defaultAccountId}
        />
        <TextField
          margin="dense"
          fullWidth
          select
          label="Role"
          name="roleId"
          value={form.roleId}
          onChange={handleChange}
          error={!!errors.roleId}
          helperText={errors.roleId}
        >
          <MenuItem value={2}>Supervisor</MenuItem>
          <MenuItem value={1}>Admin</MenuItem>
        </TextField>
        {isEdit && (
          <Button
            variant="outlined"
            onClick={handleToggleActive}
            sx={{ mt: 2 }}
            color={form.active ? "error" : "success"}
          >
            {form.active ? "Deactivate" : "Activate"}
          </Button>
        )}
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
const AdminUserPage = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://localhost:7148/api/AdminUser/Users");
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

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsEdit(false);
    setOpenUserDialog(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEdit(true);
    setOpenUserDialog(true);
  };

  const handleDeleteUser = (userId) => {
    setUserToDelete(userId);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteUser = async () => {
    try {
      //await axios.delete(`https://localhost:7148/api/AdminUser/DeleteUser/${userToDelete}`);

         await axiosClient.delete(`/AdminUser/DeleteUser/${userToDelete}`);
      setUsers(users.filter((user) => user.userId !== userToDelete));
      setSnackbar({
        open: true,
        message: "User deleted successfully",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete user: " + (error.response?.data?.message || error.message),
        severity: "error",
      });
    } finally {
      setOpenDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  const handleSaveUser = async (userData, isEdit) => {
    try {
      if (isEdit) {
        // const response = await axios.put(
        //   `https://localhost:7148/api/AdminUser/UpdateUser/${userData.userId}`,
        //   { ...userData, updatedBy: 1, updatedDate: new Date().toISOString() }, // Add updatedBy and updatedDate
        //   { headers: { "Content-Type": "application/json" } }
        // );

          const response = await axiosClient.put(
          `/AdminUser/UpdateUser/${userData.userId}`,
          { ...userData, updatedBy: 1, updatedDate: new Date().toISOString() }, // Add updatedBy and updatedDate
          { headers: { "Content-Type": "application/json" } }
        );
        setUsers(users.map((user) => (user.userId === userData.userId ? response.data : user)));
        setSnackbar({
          open: true,
          message: "User updated successfully",
          severity: "success",
        });
      } else {
        // const response = await axios.post(
        //   "https://localhost:7148/api/AdminUser/CreateUser",
        //   { ...userData, createdBy: 1, createdDate: new Date().toISOString() }, // Add createdBy and createdDate
        //   { headers: { "Content-Type": "application/json" } }
        // );


         const response = await axiosClient.post(
          "/AdminUser/CreateUser",
          { ...userData, createdBy: 1, createdDate: new Date().toISOString() }, // Add createdBy and createdDate
          { headers: { "Content-Type": "application/json" } }
        );
        setUsers([...users, response.data]);
        setSnackbar({
          open: true,
          message: "User created successfully",
          severity: "success",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to save user: " + (error.response?.data?.message || error.message),
        severity: "error",
      });
      throw error;
    }
  };

  const onExport = () => {
    const exportData = users.map((item) => ({
      userId: item.userId,
      password: item.password,
      email: item.email,
      mobile: item.mobile,
      createdBy: item.createdBy,
      createdDate: Moment(item.createdDate).format(Settings.DISPLAY_DATE_FORMAT),
      updatedBy: item.updatedBy,
      updatedDate: Moment(item.updatedDate).format(Settings.DISPLAY_DATE_FORMAT),
      active: item.active,
      lastActivityDate: Moment(item.lastActivityDate).format(Settings.DISPLAY_DATE_FORMAT),
      firstName: item.firstName,
      lastName: item.lastName,
      defaultAccountId: item.defaultAccountId,
      roleId: item.roleId,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws["!cols"] = [
      { wch: 10 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 20 },
      { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AdminUsers");
    XLSX.writeFile(wb, "AdminUsers.xlsx");
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
          Admin Users
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            sx={{ mr: 1 }}
            onClick={handleCreateUser}
          >
            Create User
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={onExport}
          >
            Export to Excel
          </Button>
        </Box>
      </Box>

      <div style={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={users}
          columns={[
            ...columns,
            {
              field: "actions",
              headerName: "Actions",
              width: 200,
              renderCell: (params) => (
                <>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => handleEditUser(params.row)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDeleteUser(params.row.userId)}
                  >
                    Delete
                  </Button>
                </>
              ),
            },
          ]}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          onRowClick={handleRowClick}
          getRowId={(row) => row.userId}
          disableSelectionOnClick
        />
      </div>

      {/* View User Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <>
              <Typography><strong>User ID:</strong> {selectedUser.userId}</Typography>
              <Typography><strong>First Name:</strong> {selectedUser.firstName}</Typography>
              <Typography><strong>Last Name:</strong> {selectedUser.lastName}</Typography>
              <Typography><strong>Email:</strong> {selectedUser.email}</Typography>
              <Typography><strong>Mobile:</strong> {selectedUser.mobile}</Typography>
              <Typography><strong>Role ID:</strong> {selectedUser.roleId}</Typography>
              <Typography><strong>Created By:</strong> {selectedUser.createdBy}</Typography>
              <Typography><strong>Updated By:</strong> {selectedUser.updatedBy}</Typography>
              <Typography><strong>Default Account ID:</strong> {selectedUser.defaultAccountId}</Typography>
              <Typography><strong>Active:</strong> {selectedUser.active ? "Yes" : "No"}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit User Dialog */}
      <UserDialog
        open={openUserDialog}
        onClose={() => setOpenUserDialog(false)}
        onSave={handleSaveUser}
        user={selectedUser}
        isEdit={isEdit}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this user?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={confirmDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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

export default AdminUserPage;