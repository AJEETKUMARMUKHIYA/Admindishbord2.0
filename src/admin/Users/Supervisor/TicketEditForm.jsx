import React from "react";

// MUI components
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  Button,
} from "@mui/material";

// MUI icons
import { Save } from "@mui/icons-material";

const TicketEditForm = ({ formData, setFormData, saving, onSave }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" mb={2}>
          Edit Ticket Details
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="From Address"
              value={formData.fromAddress}
              onChange={e =>
                setFormData({ ...formData, fromAddress: e.target.value })
              }
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="To Address"
              value={formData.toAddress}
              onChange={e =>
                setFormData({ ...formData, toAddress: e.target.value })
              }
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Van Details"
              value={formData.vanDetails}
              onChange={e =>
                setFormData({ ...formData, vanDetails: e.target.value })
              }
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Select
              fullWidth
              value={formData.status}
              onChange={e =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              {["Pending", "In Progress", "Completed", "Cancelled"].map(
                status => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                )
              )}
            </Select>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              startIcon={<Save />}
              disabled={saving}
              onClick={onSave}
            >
              Update Ticket
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TicketEditForm;
