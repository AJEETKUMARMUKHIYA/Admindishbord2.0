import React, { useState, useEffect, useMemo } from "react";
import axiosClient from "../../AxiosClient";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Autocomplete,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Stack,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SearchIcon from "@mui/icons-material/Search";

// Status -> chip color mapping. Extend as new statuses are introduced.
const STATUS_STYLES = {
  pending: { color: "warning", label: "Pending" },
  "in progress": { color: "info", label: "In Progress" },
  completed: { color: "success", label: "Completed" },
  cancelled: { color: "error", label: "Cancelled" },
};

const getStatusChip = (status) => {
  const key = (status || "").toLowerCase();
  const style = STATUS_STYLES[key] || { color: "default", label: status || "Unknown" };
  return <Chip size="small" label={style.label} color={style.color} variant="outlined" sx={{ fontWeight: 600 }} />;
};

const AssignTicket = () => {
  const [tickets, setTickets] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [assignedSupervisors, setAssignedSupervisors] = useState({}); // Track ticket-to-supervisor assignments
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Search state (filters by Booking ID)
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch tickets and supervisors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsResponse, supervisorsResponse, vehiclesResponse] = await Promise.all([
          axiosClient.get("/Booking/Tickets"),
          axiosClient.get("/Booking/Supervisors"),
          axiosClient.get("/Vehicle/all"),
        ]);

        setTickets(ticketsResponse.data);
        setSupervisors(supervisorsResponse.data);
        setVehicles(vehiclesResponse.data.data);

        // Initialize assigned supervisors from fetched tickets
        const initialAssigned = {};
        ticketsResponse.data.forEach((ticket) => {
          if (ticket.assignedSupervisorID) {
            initialAssigned[ticket.ticketID] = ticket.assignedSupervisorID;
          }
        });
        setAssignedSupervisors(initialAssigned);
      } catch (error) {
        console.error("Fetch error:", error.response?.data || error.message);
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
  }, []);

  // Handle supervisor assignment
  const handleAssignSupervisor = async (ticketId, supervisorId) => {
    try {
      const response = await axiosClient.put(
        `/Booking/AssignTicket/${ticketId}`,
        { TicketID: ticketId, SupervisorID: supervisorId },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Assign response:", response.data);

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.ticketID === ticketId
            ? { ...ticket, assignedSupervisorID: supervisorId }
            : ticket
        )
      );

      setAssignedSupervisors((prev) => ({
        ...prev,
        [ticketId]: supervisorId,
      }));

      setSnackbar({
        open: true,
        message: `Ticket ${ticketId} assigned successfully`,
        severity: "success",
      });
    } catch (error) {
      console.error("Assign error:", error.response?.data || error.message);
      setSnackbar({
        open: true,
        message: "Failed to assign ticket: " + (error.response?.data?.message || error.message),
        severity: "error",
      });
      throw error;
    }
  };

  // Handle supervisor unassignment
  const handleUnassignSupervisor = async (ticketId) => {
    try {
      const response = await axiosClient.put(
        `/Booking/AssignTicket/${ticketId}`,
        { TicketID: ticketId, SupervisorID: 0 }, // Assuming 0 means unassigned
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Unassign response:", response.data);

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.ticketID === ticketId ? { ...ticket, assignedSupervisorID: null } : ticket
        )
      );

      setAssignedSupervisors((prev) => {
        const updated = { ...prev };
        delete updated[ticketId];
        return updated;
      });

      setSnackbar({
        open: true,
        message: `Ticket ${ticketId} unassigned successfully`,
        severity: "success",
      });
    } catch (error) {
      console.error("Unassign error:", error.response?.data || error.message);
      setSnackbar({
        open: true,
        message: "Failed to unassign ticket: " + (error.response?.data?.message || error.message),
        severity: "error",
      });
      throw error;
    }
  };

  const handleAssignedVehicle = async (bookingID, vehicleID) => {
    try {
      await axiosClient.post("/Vehicle/assign", {
        bookingId: bookingID,
        vehicleId: vehicleID,
      });

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.ticketID === bookingID ? { ...ticket, vehicleId: vehicleID } : ticket
        )
      );

      setSnackbar({
        open: true,
        message: "Vehicle assigned successfully",
        severity: "success",
      });
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Vehicle assignment failed",
        severity: "error",
      });
    }
  };

  const handleUnAssignVehicle = async (bookingID, vehicleID) => {
    try {
      await axiosClient.post("/Vehicle/unassign", {
        bookingId: bookingID,
        vehicleId: vehicleID,
      });

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.ticketID === bookingID ? { ...ticket, vehicleId: null } : ticket
        )
      );

      setSnackbar({
        open: true,
        message: "Vehicle unassigned successfully",
        severity: "success",
      });
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Vehicle unassign failed",
        severity: "error",
      });
    }
  };

  // Get available supervisors for a ticket
  const getAvailableSupervisors = () => supervisors; // Return all supervisors, allowing assignment to multiple tickets
  const getAllVehicles = () => vehicles || [];

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page whenever the search term changes
  };

  const filteredTickets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return tickets;
    return tickets.filter((ticket) =>
      String(ticket.bookingID ?? "").toLowerCase().includes(query)
    );
  }, [tickets, searchQuery]);

  const paginatedTickets = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredTickets.slice(start, start + rowsPerPage);
  }, [filteredTickets, page, rowsPerPage]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, mt: 10 }}>
        <CircularProgress size={36} thickness={4} />
        <Typography variant="body2" color="text.secondary">
          Loading tickets…
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto", p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700} letterSpacing={-0.3}>
            Assign Tickets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Assign supervisors and vehicles to active booking tickets
          </Typography>
        </Box>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <TextField
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by Booking ID"
            size="small"
            sx={{ minWidth: 240 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: "text.disabled" }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => handleSearchChange({ target: { value: "" } })}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
          <Chip
            label={`${filteredTickets.length} ticket${filteredTickets.length === 1 ? "" : "s"}`}
            sx={{ fontWeight: 600, bgcolor: "grey.100" }}
          />
        </Stack>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <TableContainer sx={{ maxHeight: 640 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {["Booking ID", "Status", "Truck Entry", "Supervisor", "Action", "From", "To"].map((heading) => (
                  <TableCell
                    key={heading}
                    sx={{
                      bgcolor: "grey.50",
                      fontWeight: 700,
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                      color: "text.secondary",
                      borderBottom: "2px solid",
                      borderColor: "divider",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {heading}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: "center", py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      {searchQuery
                        ? `No tickets found for Booking ID "${searchQuery}".`
                        : "No tickets to display."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTickets.map((ticket, idx) => (
                  <TableRow
                    key={ticket.ticketID}
                    hover
                    sx={{
                      bgcolor: idx % 2 === 0 ? "background.paper" : "grey.50",
                      "&:last-child td": { borderBottom: 0 },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        #{ticket.bookingID}
                      </Typography>
                    </TableCell>

                    <TableCell>{getStatusChip(ticket.status)}</TableCell>

                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <LocalShippingOutlinedIcon fontSize="small" sx={{ color: "text.disabled" }} />
                        <Autocomplete
                          options={getAllVehicles()}
                          getOptionLabel={(option) => option.vehicleNumber || ""}
                          value={vehicles.find((v) => v.id === ticket.vehicleId) || null}
                          onChange={(event, newValue) => {
                            if (newValue) {
                              handleAssignedVehicle(ticket.ticketID, newValue.id);
                            }
                          }}
                          renderInput={(params) => (
                            <TextField {...params} placeholder="Select vehicle" size="small" variant="outlined" />
                          )}
                          sx={{ minWidth: 190 }}
                          slotProps={{ paper: { elevation: 3 } }}
                        />
                        <Tooltip title={ticket.vehicleId ? "Remove vehicle" : "No vehicle assigned"}>
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={!ticket.vehicleId}
                              onClick={() => handleUnAssignVehicle(ticket.ticketID, ticket.vehicleId)}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PersonOutlineOutlinedIcon fontSize="small" sx={{ color: "text.disabled" }} />
                        <Autocomplete
                          options={getAvailableSupervisors()}
                          getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                          value={supervisors.find((s) => s.userId === ticket.assignedSupervisorID) || null}
                          onChange={(event, newValue) => {
                            if (newValue) {
                              handleAssignSupervisor(ticket.ticketID, newValue.userId);
                            } else {
                              handleUnassignSupervisor(ticket.ticketID);
                            }
                          }}
                          renderInput={(params) => (
                            <TextField {...params} placeholder="Select supervisor" size="small" variant="outlined" />
                          )}
                          sx={{ minWidth: 210 }}
                          slotProps={{ paper: { elevation: 3 } }}
                        />
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleUnassignSupervisor(ticket.ticketID)}
                        disabled={!ticket.assignedSupervisorID}
                        sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 600 }}
                      >
                        Unassign
                      </Button>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {ticket.fromLocation}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {ticket.toLocation}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredTickets.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        />
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 1.5 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AssignTicket;
