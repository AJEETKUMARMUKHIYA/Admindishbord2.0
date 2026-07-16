import React, { useState, useEffect } from "react";
import axiosClient from "../../AxiosClient";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  Chip,
  Avatar,
  LinearProgress,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CommentIcon from '@mui/icons-material/Comment';
import ImageIcon from '@mui/icons-material/Image';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import { styled } from '@mui/material/styles';

const apiHost = (import.meta.env.VITE_API_BASE_URL || 'https://packyatra.in/api').replace(/\/api$/, '');

// Custom styled components
const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 'bold',
  ...(status === 'Completed' && {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark,
  }),
  ...(status === 'In Progress' && {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.dark,
  }),
  ...(status === 'Pending' && {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.dark,
  }),
  ...(status === 'Cancelled' && {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark,
  }),
}));

const ImagePreview = styled('img')(({ theme }) => ({
  width: '100%',
  height: '150px',
  objectFit: 'cover',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  cursor: 'pointer',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const SupervisorPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const [formData, setFormData] = useState({});
  const [groupPictures, setGroupPictures] = useState({});
  const [additionalGroupPictures, setAdditionalGroupPictures] = useState({});
  const ATTACHMENT_TYPES = {
  GROUP: "Group",
  ADDITIONAL_GROUP: "AdditionalGroup",
  DELIVERY: "Delivery"
};
const [attachments, setAttachments] = useState({});

  const [deliveryPictures, setDeliveryPictures] = useState({});
  const [uploading, setUploading] = useState({});

  useEffect(() => {
    fetchTickets();
  }, [userId]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      if (!userId || isNaN(parseInt(userId))) {
        throw new Error("Invalid userId");
      }
      
      const response = await axiosClient.get("/Booking/Tickets");
      console.log("API response:", response.data);
      
      const assignedTickets = response.data
        .filter((ticket) => ticket && ticket.ticketID && ticket.assignedSupervisorID === parseInt(userId))
        .map((ticket) => ({
          ticketID: ticket.ticketID,
          ticketNo: ticket.ticketNo || "N/A",
          bookingID: ticket.bookingID || "N/A",
          fromLocation: ticket.fromLocation || "",
          toLocation: ticket.toLocation || "",
          status: ticket.status || "Pending",
          fromAddress: ticket.fromAddress || "",
          toAddress: ticket.toAddress || "",
          vanDetails: ticket.vanDetails || "",
          totalItems: ticket.totalItems || "",
          groupPicturePath: ticket.groupPicturePath || "",
          additionalGroupPicturePath: ticket.additionalGroupPicturePath || "",
          deliveryPicturePath: ticket.deliveryPicturePath || "",
          comments: ticket.comments || "",
        }));
      
      setTickets(assignedTickets);
      console.log("Filtered tickets:", assignedTickets);
    } catch (error) {
      console.error("Fetch tickets error:", error.response?.data || error.message);
      setSnackbar({
        open: true,
        message: "Failed to fetch tickets: " + (error.response?.data?.message || error.message),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleExpandClick = (ticketId) => {
    setExpandedTicketId(expandedTicketId === ticketId ? null : ticketId);
    if (!formData[ticketId]) {
      const ticket = tickets.find((t) => t.ticketID === ticketId);
      setFormData((prev) => ({
        ...prev,
        [ticketId]: {
          fromAddress: ticket?.fromAddress || "",
          toAddress: ticket?.toAddress || "",
          vanDetails: ticket?.vanDetails || "",
          totalItems: ticket?.totalItems || "",
          status: ticket?.status || "Pending",
          comments: ticket?.comments || "",
        },
      }));
    }
  };

  const handleFormChange = (ticketId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [ticketId]: { ...prev[ticketId], [field]: value },
    }));
  };

  // const handleFileChange = (ticketId, type, event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     if (type === "group") {
  //       setGroupPictures((prev) => ({ ...prev, [ticketId]: file }));
  //     } else if (type === "additionalGroup") {
  //       setAdditionalGroupPictures((prev) => ({ ...prev, [ticketId]: file }));
  //     } else if (type === "delivery") {
  //       setDeliveryPictures((prev) => ({ ...prev, [ticketId]: file }));
  //     }
  //   }
  // };
const handleFileChange = (ticketId, category, event) => {
  const file = event.target.files[0];
  if (!file) return;

  setAttachments((prev) => ({
    ...prev,
    [ticketId]: {
      ...prev[ticketId],
      [category]: file
    }
  }));
};
const uploadAttachment = async (ticketId, category, file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);

  return axiosClient.post(
    `/TicketAttachment/Upload/${ticketId}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
};

  const handleUpdateTicket = async (ticketId) => {
    if (!groupPictures[ticketId] || !additionalGroupPictures[ticketId]) {
      setSnackbar({
        open: true,
        message: "Both group pictures are mandatory",
        severity: "error",
      });
      return;
    }

    setUploading((prev) => ({ ...prev, [ticketId]: true }));

    try {
      const form = formData[ticketId] || {};
      const formDataToSend = new FormData();
      formDataToSend.append("fromAddress", form.fromAddress || "");
      formDataToSend.append("toAddress", form.toAddress || "");
      formDataToSend.append("vanDetails", form.vanDetails || "");
      formDataToSend.append("totalItems", form.totalItems || "");
      formDataToSend.append("status", form.status || "Pending");
      formDataToSend.append("comments", form.comments || "");
      if (groupPictures[ticketId]) formDataToSend.append("groupPicture", groupPictures[ticketId]);
      if (additionalGroupPictures[ticketId]) formDataToSend.append("additionalGroupPicture", additionalGroupPictures[ticketId]);
      if (deliveryPictures[ticketId]) formDataToSend.append("deliveryPicture", deliveryPictures[ticketId]);

      const response = await axiosClient.put(
        `/Booking/UpdateTicket/${ticketId}`,
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.ticketID === ticketId
            ? {
                ...ticket,
                ...form,
                status: form.status,
                comments: form.comments,
                groupPicturePath: response.data.groupPicturePath || ticket.groupPicturePath,
                additionalGroupPicturePath: response.data.additionalGroupPicturePath || ticket.additionalGroupPicturePath,
                deliveryPicturePath: response.data.deliveryPicturePath || ticket.deliveryPicturePath,
              }
            : ticket
        )
      );

      setSnackbar({
        open: true,
        message: `Ticket #${ticketId} updated successfully!`,
        severity: "success",
      });

      // Reset form and file states
      setFormData((prev) => {
        const newData = { ...prev };
        delete newData[ticketId];
        return newData;
      });
      setGroupPictures((prev) => {
        const newPics = { ...prev };
        delete newPics[ticketId];
        return newPics;
      });
      setAdditionalGroupPictures((prev) => {
        const newPics = { ...prev };
        delete newPics[ticketId];
        return newPics;
      });
      setDeliveryPictures((prev) => {
        const newPics = { ...prev };
        delete newPics[ticketId];
        return newPics;
      });
      setExpandedTicketId(null);
    } catch (error) {
      console.error("Update ticket error:", error.response?.data || error.message);
      setSnackbar({
        open: true,
        message: "Failed to update ticket: " + (error.response?.data?.message || error.message),
        severity: "error",
      });
    } finally {
      setUploading((prev) => ({ ...prev, [ticketId]: false }));
    }
  };

  const handleFullScreenEdit = (ticketId) => {
    navigate(`/update-ticket/${ticketId}`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircleIcon color="success" />;
      case 'In Progress':
        return <CircularProgress size={20} color="warning" />;
      case 'Pending':
        return <PendingIcon color="info" />;
      default:
        return <CheckCircleIcon color="disabled" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '80vh' 
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading tickets...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: '1400px', 
      mx: 'auto', 
      p: 3, 
      bgcolor: 'background.default',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Supervisor Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your delivery tickets
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchTickets}
          sx={{ borderRadius: 2 }}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Summary */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="h6">Total Tickets</Typography>
              <Typography variant="h3">{tickets.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
            <CardContent>
              <Typography variant="h6">Pending</Typography>
              <Typography variant="h3">
                {tickets.filter(t => t.status === 'Pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <CardContent>
              <Typography variant="h6">In Progress</Typography>
              <Typography variant="h3">
                {tickets.filter(t => t.status === 'In Progress').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent>
              <Typography variant="h6">Completed</Typography>
              <Typography variant="h3">
                {tickets.filter(t => t.status === 'Completed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <Card sx={{ 
          textAlign: 'center', 
          py: 8, 
          bgcolor: 'background.paper',
          boxShadow: 3
        }}>
          <ImageIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tickets assigned
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tickets will appear here once assigned to you.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {tickets.map((ticket) => (
            <Grid item xs={12} key={ticket.ticketID}>
              <Card sx={{ 
                boxShadow: 3,
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                }
              }}>
                {/* Card Header */}
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {ticket.ticketNo.charAt(0)}
                    </Avatar>
                  }
                  action={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StatusChip
                        icon={getStatusIcon(ticket.status)}
                        label={ticket.status}
                        status={ticket.status}
                        size="medium"
                      />
                      <ExpandMore
                        expand={expandedTicketId === ticket.ticketID}
                        onClick={() => handleExpandClick(ticket.ticketID)}
                        aria-expanded={expandedTicketId === ticket.ticketID}
                        aria-label="show more"
                      >
                        <ExpandMoreIcon />
                      </ExpandMore>
                    </Box>
                  }
                  title={
                    <Typography variant="h6" fontWeight="bold">
                      Ticket #{ticket.ticketNo}
                    </Typography>
                  }
                  subheader={`Booking ID: ${ticket.bookingID}`}
                  sx={{ 
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.default'
                  }}
                />

                {/* Card Content */}
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOnIcon color="success" sx={{ mr: 1 }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          From:
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight="medium">
                        {ticket.fromLocation}
                      </Typography>
                      {ticket.fromAddress && (
                        <Typography variant="body2" color="text.secondary">
                          {ticket.fromAddress}
                        </Typography>
                      )}
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOnIcon color="error" sx={{ mr: 1 }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          To:
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight="medium">
                        {ticket.toLocation}
                      </Typography>
                      {ticket.toAddress && (
                        <Typography variant="body2" color="text.secondary">
                          {ticket.toAddress}
                        </Typography>
                      )}
                    </Grid>

                    {ticket.vanDetails && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <DirectionsCarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            <strong>Vehicle:</strong> {ticket.vanDetails}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {ticket.totalItems && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Items:</strong> {ticket.totalItems}
                        </Typography>
                      </Grid>
                    )}

                    {ticket.comments && (
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <CommentIcon sx={{ mr: 1, mt: 0.5, color: 'text.secondary' }} />
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Comments:
                            </Typography>
                            <Typography variant="body2">
                              {ticket.comments}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}

                    {/* Images Preview */}
                    {(ticket.groupPicturePath || ticket.additionalGroupPicturePath || ticket.deliveryPicturePath) && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Uploaded Images:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          {ticket.groupPicturePath && (
                            <Box sx={{ width: 120 }}>
                              <ImagePreview
                                src={`${apiHost}${ticket.groupPicturePath}`}
                                alt="Group"
                                onClick={() => window.open(`${apiHost}${ticket.groupPicturePath}`, '_blank')}
                              />
                              <Typography variant="caption" color="text.secondary">
                                Group
                              </Typography>
                            </Box>
                          )}
                          {ticket.additionalGroupPicturePath && (
                            <Box sx={{ width: 120 }}>
                              <ImagePreview
                                src={`${apiHost}${ticket.additionalGroupPicturePath}`}
                                alt="Additional Group"
                                onClick={() => window.open(`${apiHost}${ticket.additionalGroupPicturePath}`, '_blank')}
                              />
                              <Typography variant="caption" color="text.secondary">
                                Additional Group
                              </Typography>
                            </Box>
                          )}
                          {ticket.deliveryPicturePath && (
                            <Box sx={{ width: 120 }}>
                              <ImagePreview
                                src={`${apiHost}${ticket.deliveryPicturePath}`}
                                alt="Delivery"
                                onClick={() => window.open(`${apiHost}${ticket.deliveryPicturePath}`, '_blank')}
                              />
                              <Typography variant="caption" color="text.secondary">
                                Delivery
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>

                {/* Expandable Form */}
                <Collapse in={expandedTicketId === ticket.ticketID} timeout="auto" unmountOnExit>
                  <CardContent sx={{ 
                    bgcolor: 'grey.50', 
                    borderTop: 1, 
                    borderColor: 'divider',
                    pt: 2
                  }}>
                    {uploading[ticket.ticketID] && (
                      <LinearProgress sx={{ mb: 2 }} />
                    )}
                    
                    <Typography variant="h6" gutterBottom color="primary">
                      Update Ticket Details
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="From Address"
                          value={formData[ticket.ticketID]?.fromAddress || ""}
                          onChange={(e) => handleFormChange(ticket.ticketID, "fromAddress", e.target.value)}
                          size="small"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="To Address"
                          value={formData[ticket.ticketID]?.toAddress || ""}
                          onChange={(e) => handleFormChange(ticket.ticketID, "toAddress", e.target.value)}
                          size="small"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Van Details"
                          value={formData[ticket.ticketID]?.vanDetails || ""}
                          onChange={(e) => handleFormChange(ticket.ticketID, "vanDetails", e.target.value)}
                          size="small"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Total Items"
                          value={formData[ticket.ticketID]?.totalItems || ""}
                          onChange={(e) => handleFormChange(ticket.ticketID, "totalItems", e.target.value)}
                          size="small"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Comments"
                          multiline
                          rows={3}
                          value={formData[ticket.ticketID]?.comments || ""}
                          onChange={(e) => handleFormChange(ticket.ticketID, "comments", e.target.value)}
                          size="small"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Status</InputLabel>
                          <Select
                            value={formData[ticket.ticketID]?.status || "Pending"}
                            onChange={(e) => handleFormChange(ticket.ticketID, "status", e.target.value)}
                            label="Status"
                          >
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="In Progress">In Progress</MenuItem>
                            <MenuItem value="Completed">Completed</MenuItem>
                            <MenuItem value="Cancelled">Cancelled</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Button
                          variant="contained"
                          component="label"
                          startIcon={<CloudUploadIcon />}
                          fullWidth
                          size="small"
                          color="success"
                        >
                          Upload Group Picture
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleFileChange(ticket.ticketID, "group", e)}
                          />
                        </Button>
                        {groupPictures[ticket.ticketID] && (
                          <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                            Selected: {groupPictures[ticket.ticketID].name}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Button
                          variant="contained"
                          component="label"
                          startIcon={<CloudUploadIcon />}
                          fullWidth
                          size="small"
                          color="success"
                        >
                          Upload Additional Group Picture
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleFileChange(ticket.ticketID, "additionalGroup", e)}
                          />
                        </Button>
                        {additionalGroupPictures[ticket.ticketID] && (
                          <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                            Selected: {additionalGroupPictures[ticket.ticketID].name}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<CloudUploadIcon />}
                          fullWidth
                          size="small"
                        >
                          Upload Delivery Picture
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleFileChange(ticket.ticketID, "delivery", e)}
                          />
                        </Button>
                        {deliveryPictures[ticket.ticketID] && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Selected: {deliveryPictures[ticket.ticketID].name}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button
                            variant="contained"
                            onClick={() => handleUpdateTicket(ticket.ticketID)}
                            disabled={uploading[ticket.ticketID]}
                            startIcon={<CheckCircleIcon />}
                            sx={{ flex: 1 }}
                          >
                            {uploading[ticket.ticketID] ? 'Updating...' : 'Update Ticket'}
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => handleFullScreenEdit(ticket.ticketID)}
                            startIcon={<EditIcon />}
                          >
                            Full Screen Edit
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Collapse>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SupervisorPage;