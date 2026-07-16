import React, { useState, useEffect } from "react";
import axiosClient from "../../AxiosClient";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Paper,
  Autocomplete,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import axios from "axios";
//import PageHeader from "../../components/Header";
import AssignTicket from "../AssginTicket/AssignTicket";
import AdminUserPage from "./AdminUserPage"; // Updated import

// Mock Auth (replace with your actual Auth implementation)
const Auth = {
  isAdmin: true,
  isFSC: false,
};

const UnAuthorized = () => (
  <Box sx={{ p: 3, textAlign: "center" }}>
    <Typography variant="h5" color="error">
      Unauthorized Access
    </Typography>
    <Typography variant="body1">
      You do not have permission to view this page.
    </Typography>
  </Box>
);

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ManageUserPage() {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (openDialog) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [ticketsResponse, supervisorsResponse] = await Promise.all([
            // axios.get("https://localhost:7148/api//Booking/Tickets"),
            // axios.get("https://localhost:7148/api/Booking/Supervisors"),

              axiosClient.get("/Booking/Tickets"),
            axiosClient.get("/Booking/Supervisors"),
          ]);
          setTickets(ticketsResponse.data);
          setSupervisors(supervisorsResponse.data);
        } catch (error) {
          setSnackbar({
            open: true,
            message: "Failed to fetch data: " + (error.response?.data?.message || error.message),
            severity: "error",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [openDialog]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTicket(null);
    setSelectedSupervisor(null);
  };

  const handleAssignTicket = async () => {
    if (!selectedTicket || !selectedSupervisor) {
      setSnackbar({
        open: true,
        message: "Please select a ticket and supervisor",
        severity: "warning",
      });
      return;
    }

    try {
      // await axios.put(
      //   `https://localhost:7148/api//Booking/AssignTicket/${selectedTicket.TicketID}`,
      //   { TicketID: selectedTicket.TicketID, SupervisorID: selectedSupervisor.UserID },
      //   { headers: { "Content-Type": "application/json" } }
      // );

          await axiosClient.put(
        `/Booking/AssignTicket/${selectedTicket.TicketID}`,
        { TicketID: selectedTicket.TicketID, SupervisorID: selectedSupervisor.UserID },
        { headers: { "Content-Type": "application/json" } }
      );
      setSnackbar({
        open: true,
        message: `Ticket ${selectedTicket.TicketNo} assigned to ${selectedSupervisor.Username}`,
        severity: "success",
      });
      handleCloseDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to assign ticket: " + (error.response?.data?.message || error.message),
        severity: "error",
      });
    }
  };

  const handleExportToExcel = () => {
    setSnackbar({
      open: true,
      message: "Export to Excel functionality not implemented yet",
      severity: "info",
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!(Auth.isAdmin || Auth.isFSC)) {
    return <UnAuthorized />;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {/* <PageHeader title="Manage Users & Tickets" /> */}
      <Paper sx={{ p: 3.25, mt: 2, borderRadius: 2 }} elevation={3}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          {/* <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenDialog}
              sx={{ mr: 1, borderRadius: 1 }}
            >
              Assign Ticket
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleExportToExcel}
              sx={{ borderRadius: 1 }}
            >
              Export to Excel
            </Button>
          </Box> */}
        </Box>
          <AssignTicket />
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        sx={{ "& .MuiDialog-paper": { borderRadius: 2, p: 2 } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Assign Ticket to Supervisor
          </Typography>
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Autocomplete
                options={tickets}
                getOptionLabel={(option) => `${option.TicketNo} (${option.FromLocation} to ${option.ToLocation})`}
                value={selectedTicket}
                onChange={(event, newValue) => setSelectedTicket(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Ticket"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                  />
                )}
                sx={{ mb: 2 }}
              />
              <Autocomplete
                options={supervisors}
                getOptionLabel={(option) => option.Username}
                value={selectedSupervisor}
                onChange={(event, newValue) => setSelectedSupervisor(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Supervisor"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                  />
                )}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ borderColor: "grey.400", color: "grey.700" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssignTicket}
            variant="contained"
            color="primary"
            disabled={loading || !selectedTicket || !selectedSupervisor}
          >
            Assign
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
}