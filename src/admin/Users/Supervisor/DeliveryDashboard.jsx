
import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputAdornment,
  Button,
  CircularProgress,
  Stack
} from "@mui/material";

import {
  LocalShipping,
  TrendingUp,
  AccessTime,
  CheckCircle,
  Cancel,
  Search,
  FilterList,
  ErrorOutline
} from "@mui/icons-material";

import axiosClient from "../../../AxiosClient";
import { TicketCard } from "./TicketCard";
export default function DeliveryDashboard({ userId, onSelectTicket }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [stats, setStats] = useState({
    totalTickets: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchTickets();
  }, [userId]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axiosClient.get("/Booking/Tickets");

      const assigned = res.data
        .filter(
          t => t && t.ticketID && t.assignedSupervisorID === Number(userId)
        )
        .map(t => ({
          ticketID: t.ticketID,
          ticketNo: t.ticketNo || "N/A",
          bookingID: t.bookingID || "N/A",
          fromLocation: t.fromLocation || "",
          toLocation: t.toLocation || "",
          status: t.status || "Pending"
        }));

      setTickets(assigned);
      calculateStats(assigned);
    } catch (err) {
      setError("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = list => {
    setStats({
      totalTickets: list.length,
      pending: list.filter(t => t.status === "Pending").length,
      inProgress: list.filter(t => t.status === "In Progress").length,
      completed: list.filter(t => t.status === "Completed").length,
      cancelled: list.filter(t => t.status === "Cancelled").length
    });
  };

  const filteredTickets = tickets.filter(t => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      t.ticketNo.toLowerCase().includes(s) ||
      t.bookingID.toLowerCase().includes(s) ||
      t.fromLocation.toLowerCase().includes(s) ||
      t.toLocation.toLowerCase().includes(s);

    const matchesStatus =
      filterStatus === "all" || t.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
        <Card sx={{ p: 4, maxWidth: 400 }}>
          <Stack spacing={2} alignItems="center">
            <ErrorOutline color="error" fontSize="large" />
            <Typography color="error">{error}</Typography>
            <Button variant="contained" color="error" onClick={fetchTickets}>
              Retry
            </Button>
          </Stack>
        </Card>
      </Box>
    );
  }

  return (
    <Box bgcolor="#f9fafb" minHeight="100vh">
      {/* HEADER */}
      <Box bgcolor="white" borderBottom="1px solid #e5e7eb" p={3}>
        <Typography variant="h6">Supervisor Dashboard</Typography>
        <Typography color="text.secondary">
          Manage all delivery operations
        </Typography>
      </Box>

      {/* STATS */}
      <Box p={3}>
        <Grid container spacing={2}>
          <StatsCard icon={<LocalShipping />} label="Total" value={stats.totalTickets} />
          <StatsCard icon={<AccessTime />} label="Pending" value={stats.pending} />
          <StatsCard icon={<TrendingUp />} label="In Progress" value={stats.inProgress} />
          <StatsCard icon={<CheckCircle />} label="Completed" value={stats.completed} />
          <StatsCard icon={<Cancel />} label="Cancelled" value={stats.cancelled} />
        </Grid>
      </Box>

      {/* FILTERS */}
      <Box px={3} pb={3}>
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  placeholder="Search ticket, booking, location..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Select
                  fullWidth
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterList />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* TICKETS */}
      <Box px={3} pb={4}>
        <Stack spacing={2}>
          {filteredTickets.length === 0 ? (
            <Card sx={{ p: 6, textAlign: "center" }}>
              <Typography>No tickets found</Typography>
            </Card>
          ) : (
            filteredTickets.map(t => (
              <TicketCard
                key={t.ticketID}
                ticket={t}
                onSelect={() => onSelectTicket(t.ticketID)}
              />
            ))
          )}
        </Stack>
      </Box>
    </Box>
  );
}
function StatsCard({ icon, label, value }) {
  return (
    <Grid item xs={12} sm={6} md={2.4}>
      <Card>
        <CardContent>
          <Stack spacing={1}>
            {icon}
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h6">{value}</Typography>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );
}
