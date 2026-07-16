import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from "@mui/material";

const ViewUserDialog = ({ open, onClose, selectedUser }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>User Details</DialogTitle>
      <DialogContent dividers>
        {selectedUser && (
          <>
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
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewUserDialog;