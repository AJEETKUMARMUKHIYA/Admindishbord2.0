import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import * as XLSX from "xlsx";
import Moment from "moment";

// Settings
const Settings = {
  DISPLAY_DATE_FORMAT: "YYYY-MM-DD",
};

// Dummy initial users
const initialUsers = [
  {
    userId: 1,
    password: "password123",
    email: "john@example.com",
    mobile: "1234567890",
    createdBy: "Admin",
    createdDate: new Date(),
    updateedBy: "Admin",
    updatedDate: new Date(),
    active: true,
    lastActivityDate: new Date(),
    firstName: "John",
    lastName: "Doe",
    fullName: "John Doe",
    defaultAccountId: 101,
  },
  {
    userId: 2,
    password: "secure456",
    email: "jane@example.com",
    mobile: "0987654321",
    createdBy: "Admin",
    createdDate: new Date(),
    updateedBy: "UserManager",
    updatedDate: new Date(),
    active: false,
    lastActivityDate: new Date(),
    firstName: "Jane",
    lastName: "Smith",
    fullName: "Jane Smith",
    defaultAccountId: 102,
  },
];

// Columns
const columns = [
  { field: "userId", headerName: "UserId", width: 100 },
  { field: "password", headerName: "Password", width: 150 },
  { field: "email", headerName: "Email", width: 200 },
  { field: "mobile", headerName: "Mobile", width: 150 },
  { field: "createdBy", headerName: "CreatedBy", width: 130 },
  { field: "createdDate", headerName: "CreatedDate", width: 150, valueFormatter: ({ value }) => Moment(value).format(Settings.DISPLAY_DATE_FORMAT) },
  { field: "updateedBy", headerName: "UpdateedBy", width: 130 },
  { field: "updatedDate", headerName: "UpdatedDate", width: 150, valueFormatter: ({ value }) => Moment(value).format(Settings.DISPLAY_DATE_FORMAT) },
  { field: "active", headerName: "Active", width: 100, type: "boolean" },
  { field: "lastActivityDate", headerName: "LastActivityDate", width: 160, valueFormatter: ({ value }) => Moment(value).format(Settings.DISPLAY_DATE_FORMAT) },
  { field: "firstName", headerName: "FirstName", width: 130 },
  { field: "lastName", headerName: "LastName", width: 130 },
  { field: "fullName", headerName: "FullName", width: 180 },
  { field: "defaultAccountId", headerName: "DefaultAccountId", width: 150 },
];

// Component to Create User
const CreateUserDialog = ({ open, onClose, onSave }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    defaultAccountId: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const fullName = `${form.firstName} ${form.lastName}`;
    const newUser = {
      ...form,
      userId: Date.now(),
      createdBy: "Admin",
      updateedBy: "Admin",
      createdDate: new Date(),
      updatedDate: new Date(),
      active: true,
      lastActivityDate: new Date(),
      fullName,
      defaultAccountId: parseInt(form.defaultAccountId),
    };
    onSave(newUser);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New User</DialogTitle>
      <DialogContent>
        <TextField margin="dense" fullWidth label="First Name" name="firstName" onChange={handleChange} />
        <TextField margin="dense" fullWidth label="Last Name" name="lastName" onChange={handleChange} />
        <TextField margin="dense" fullWidth label="Email" name="email" onChange={handleChange} />
        <TextField margin="dense" fullWidth label="Mobile" name="mobile" onChange={handleChange} />
        <TextField margin="dense" fullWidth label="Password" name="password" onChange={handleChange} />
        <TextField margin="dense" fullWidth label="Default Account ID" name="defaultAccountId" type="number" onChange={handleChange} />
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
  const [users, setUsers] = useState(initialUsers);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const handleRowClick = (params) => {
    setSelectedUser(params.row);
    setOpenDialog(true);
  };

  const handleCreateUser = (newUser) => {
    setUsers((prev) => [...prev, newUser]);
  };

  const onExport = () => {
    const exportData = users.map((item) => [
      item.userId,
      item.password,
      item.email,
      item.mobile,
      item.createdBy,
      Moment(item.createdDate).format(Settings.DISPLAY_DATE_FORMAT),
      item.updateedBy,
      Moment(item.updatedDate).format(Settings.DISPLAY_DATE_FORMAT),
      item.active,
      Moment(item.lastActivityDate).format(Settings.DISPLAY_DATE_FORMAT),
      item.firstName,
      item.lastName,
      item.fullName,
      item.defaultAccountId,
    ]);

    const Heading = [
      [
        "UserId", "Password", "Email", "Mobile", "CreatedBy", "CreatedDate", "UpdateedBy", "UpdatedDate",
        "Active", "LastActivityDate", "FirstName", "LastName", "FullName", "DefaultAccountId",
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet([...Heading, ...exportData]);
    ws["!cols"] = new Array(Heading[0].length).fill({ wch: 20 });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "Users.xlsx");
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
      
        <Typography variant="h5" fontWeight="bold" mb={3}>
        User Table
              </Typography>
        <Box>
          <Button variant="contained" sx={{ mr: 1 }} onClick={() => setOpenCreateDialog(true)}>Create User</Button>
          <Button variant="contained" onClick={onExport}>Export to Excel</Button>
        </Box>
      </Box>

      <div style={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={users}
          columns={columns}
          pageSize={10}
          onRowClick={handleRowClick}
          getRowId={(row) => row.userId}
        />
      </div>

      {/* View User Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <>
              <Typography><strong>Full Name:</strong> {selectedUser.fullName}</Typography>
              <Typography><strong>Email:</strong> {selectedUser.email}</Typography>
              <Typography><strong>Mobile:</strong> {selectedUser.mobile}</Typography>
              <Typography><strong>Created By:</strong> {selectedUser.createdBy}</Typography>
              <Typography><strong>Updated By:</strong> {selectedUser.updateedBy}</Typography>
              <Typography><strong>Default Account ID:</strong> {selectedUser.defaultAccountId}</Typography>
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
    </Box>
  );
};

export default UserTable;
