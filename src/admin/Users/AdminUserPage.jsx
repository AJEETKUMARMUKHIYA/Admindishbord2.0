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
  Chip,
  Avatar,
  InputAdornment,
  Paper,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from "axios";
import * as XLSX from "xlsx";
import Moment from "moment";

// Settings
const Settings = {
  DISPLAY_DATE_FORMAT: "YYYY-MM-DD",
};

// Beautiful visual columns
const columns = [
  { field: "userId", headerName: "ID", width: 80, sortable: true },
  {
    field: "fullName",
    headerName: "User Name",
    width: 200,
    renderCell: (params) => {
      const first = params.row.firstName || "";
      const last = params.row.lastName || "";
      const initials = (first.charAt(0) + last.charAt(0)).toUpperCase() || "?";
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, height: "100%" }}>
          <Avatar 
            sx={{ 
              width: 34, 
              height: 34, 
              bgcolor: params.row.roleId === 1 ? "#2952E3" : "#C67C1F", 
              fontSize: "0.85rem", 
              fontWeight: "600",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}
          >
            {initials}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#1E293B", lineHeight: 1.2 }}>
              {`${first} ${last}`}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.7rem" }}>
              ID: {params.row.userId}
            </Typography>
          </Box>
        </Box>
      );
    }
  },
  { field: "email", headerName: "Email Address", width: 220 },
  { field: "mobile", headerName: "Mobile", width: 140 },
  {
    field: "roleId",
    headerName: "Role",
    width: 140,
    renderCell: (params) => {
      const isAdmin = params.value === 1;
      return (
        <Chip
          label={isAdmin ? "Admin" : "Supervisor"}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: "0.72rem",
            borderRadius: "6px",
            bgcolor: isAdmin ? "#EFF8FF" : "#F9F5FF",
            color: isAdmin ? "#175CD3" : "#6941C6",
            border: `1px solid ${isAdmin ? "#B2DDFF" : "#E9D7FE"}`
          }}
        />
      );
    }
  },
  {
    field: "active",
    headerName: "Status",
    width: 120,
    renderCell: (params) => (
      <Chip
        icon={params.value ? <CheckCircleIcon sx={{ fontSize: "14px !important", color: "#027A48 !important" }} /> : <CancelIcon sx={{ fontSize: "14px !important", color: "#B42318 !important" }} />}
        label={params.value ? "Active" : "Inactive"}
        size="small"
        sx={{
          fontWeight: 600,
          fontSize: "0.72rem",
          borderRadius: "6px",
          bgcolor: params.value ? "#ECFDF3" : "#FEF3F2",
          color: params.value ? "#027A48" : "#B42318",
          border: `1px solid ${params.value ? "#ABEFC6" : "#FECDCA"}`
        }}
      />
    )
  },
  { field: "password", headerName: "Password", width: 130 },
  {
    field: "createdDate",
    headerName: "Created On",
    width: 130,
    valueFormatter: (value) => value ? Moment(value).format("YYYY-MM-DD") : ""
  },
  { field: "defaultAccountId", headerName: "Account ID", width: 110 }
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
      const response = await axiosClient.get("/AdminUser/Users");
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

  const [searchQuery, setSearchQuery] = useState("");

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    const first = user.firstName?.toLowerCase() || "";
    const last = user.lastName?.toLowerCase() || "";
    const email = user.email?.toLowerCase() || "";
    const mobile = user.mobile || "";
    const userId = String(user.userId || "");
    return (
      first.includes(query) ||
      last.includes(query) ||
      email.includes(query) ||
      mobile.includes(query) ||
      userId.includes(query)
    );
  });

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress size={45} sx={{ color: "#2952E3" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#F8F9FC", minHeight: "100vh" }}>
      {/* Upper header section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ color: "#0F172A", letterSpacing: "-0.5px" }}>
            Admin Users
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage administrative members, supervisors, credentials, and default accounts.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateUser}
            sx={{
              bgcolor: "#2952E3",
              fontWeight: 600,
              borderRadius: "8px",
              px: 3,
              py: 1,
              textTransform: "none",
              boxShadow: "0 4px 10px rgba(41, 82, 227, 0.2)",
              "&:hover": {
                bgcolor: "#1E3BB3",
                boxShadow: "0 6px 14px rgba(41, 82, 227, 0.3)",
              }
            }}
          >
            Create User
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onExport}
            sx={{
              borderColor: "#E2E8F0",
              color: "#334155",
              fontWeight: 600,
              borderRadius: "8px",
              px: 3,
              py: 1,
              textTransform: "none",
              bgcolor: "#FFFFFF",
              "&:hover": {
                bgcolor: "#F1F5F9",
                borderColor: "#CBD5E1",
              }
            }}
          >
            Export to Excel
          </Button>
        </Box>
      </Box>

      {/* Grid container with modern SaaS shadows */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: "16px", 
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.02)",
          bgcolor: "#FFFFFF",
          overflow: "hidden"
        }}
      >
        {/* Search tool panel */}
        <Box sx={{ mb: 3, maxWidth: 400 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name, email, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#94A3B8" }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: "8px",
                bgcolor: "#F8FAFC",
                "& fieldset": { borderColor: "#E2E8F0" },
                "&:hover fieldset": { borderColor: "#CBD5E1" },
                "&.Mui-focused fieldset": { borderColor: "#2952E3" },
              }
            }}
          />
        </Box>

        <div style={{ height: 580, width: "100%" }}>
          <DataGrid
            rows={filteredUsers}
            columns={[
              ...columns,
              {
                field: "actions",
                headerName: "Actions",
                width: 180,
                sortable: false,
                renderCell: (params) => (
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center", height: "100%" }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon sx={{ fontSize: "14px !important" }} />}
                      onClick={() => handleEditUser(params.row)}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        borderColor: "#E2E8F0",
                        color: "#475569",
                        borderRadius: "6px",
                        py: 0.5,
                        "&:hover": {
                          bgcolor: "#F1F5F9",
                          borderColor: "#CBD5E1",
                        }
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon sx={{ fontSize: "14px !important" }} />}
                      onClick={() => handleDeleteUser(params.row.userId)}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        borderRadius: "6px",
                        py: 0.5,
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                ),
              },
            ]}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            onRowClick={handleRowClick}
            getRowId={(row) => row.userId}
            disableSelectionOnClick
            sx={{
              border: "none",
              fontFamily: "'Inter', sans-serif",
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: "#F8FAFC",
                color: "#475569",
                fontWeight: 600,
                borderBottom: "1px solid #E2E8F0",
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: 600,
                }
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid #F1F5F9",
                color: "#334155",
                display: "flex",
                alignItems: "center",
              },
              "& .MuiDataGrid-row:hover": {
                bgcolor: "#F8FAFC",
                cursor: "pointer",
              },
              "& .MuiTablePagination-root": {
                color: "#64748B",
              }
            }}
          />
        </div>
      </Paper>

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