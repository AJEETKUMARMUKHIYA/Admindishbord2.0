import { useState, useEffect } from "react";
import axiosClient from "../../../AxiosClient";
import TicketEditForm from "../Supervisor/TicketEditForm";
import TicketComments from "../Supervisor/TicketComments";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Stack,
} from "@mui/material";

import {
  ArrowBack,
  LocationOn,
  Inventory2,
  Save,
  UploadFile,
} from "@mui/icons-material";

/* ================= CONSTANTS ================= */
const ATTACHMENT_TYPES = {
  GROUP: "Group",
  ADDITIONAL_GROUP: "AdditionalGroup",
  DELIVERY: "Delivery",
};

/* ================= MAIN COMPONENT ================= */
export function TicketDetails({ ticketId, userId, onBack }) {
  const [ticket, setTicket] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [files, setFiles] = useState({});
  const [tab, setTab] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    fromAddress: "",
    toAddress: "",
    vanDetails: "",
    totalItems: "",
    status: "Pending",
    comments: "",
  });

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetchTicket();
    fetchAttachments();
  }, [ticketId]);

  const fetchTicket = async () => {
    try {
      const res = await axiosClient.get("/Booking/Tickets");
      const found = res.data.find(t => t.ticketID === ticketId);
      if (!found) return;

      setTicket(found);
      setFormData({
        fromAddress: found.fromAddress || "",
        toAddress: found.toAddress || "",
        vanDetails: found.vanDetails || "",
        totalItems: found.totalItems || "",
        status: found.status || "Pending",
        comments: found.comments || "",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAttachments = async () => {
    const res = await axiosClient.get(
      `/TicketAttachment/ByTicket/${ticketId}`
    );
    setAttachments(res.data || []);
  };

  /* ================= FILE UPLOAD ================= */
  const handleFileChange = (type, file) => {
    setFiles(prev => ({ ...prev, [type]: file }));
  };

  const uploadFiles = async () => {
    try {
      setSaving(true);
      setError(null);

      for (const type in files) {
        const form = new FormData();
        form.append("file", files[type]);
        form.append("category", type);

        await axiosClient.post(
          `/TicketAttachment/Upload/${ticketId}`,
          form,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      setFiles({});
      setSuccess("Files uploaded successfully");
      fetchAttachments();
    } catch {
      setError("File upload failed");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UPDATE TICKET ================= */
  const updateTicket = async () => {
    try {
      setSaving(true);
      await axiosClient.put(
        `/Booking/UpdateTicket/${ticketId}`,
        formData
      );
      setSuccess("Ticket updated successfully");
      fetchTicket();
    } catch {
      setError("Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (!ticket) return null;

  /* ================= UI ================= */
  return (
    <Box>
      {/* HEADER */}
      <Box p={2} borderBottom="1px solid #ddd">
        <Button startIcon={<ArrowBack />} onClick={onBack}>
          Back
        </Button>

        <Stack direction="row" spacing={2} alignItems="center" mt={2}>
          <Typography variant="h5">
            Ticket #{ticket.ticketNo}
          </Typography>
          <Chip label={ticket.status} />
        </Stack>

        <Typography color="text.secondary">
          Booking ID: {ticket.bookingID}
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      {/* <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Overview" />
        <Tab label="Images" />
        <Tab label="Edit Ticket" />
      </Tabs> */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Overview" />
        <Tab label="Attachments" />
        <Tab label="Edit Ticket" />
        <Tab label="Comments & Updates" />
      </Tabs>


      {/* ================= OVERVIEW ================= */}
      {tab === 0 && (
        <Grid container spacing={2} p={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Locations</Typography>
                <LocationRow title="From" value={ticket.fromAddress} />
                <LocationRow title="To" value={ticket.toAddress} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Delivery</Typography>
                <InfoRow value={ticket.vanDetails} />
                <InfoRow value={ticket.totalItems} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ================= IMAGES ================= */}
      {tab === 1 && (
        <Grid container spacing={2} p={2}>
          <Grid item xs={12}>
            <Typography variant="h6">Uploaded Files</Typography>
            <Divider sx={{ my: 1 }} />
          </Grid>

          {attachments.map(a => (
            <Grid item xs={12} md={4} key={a.attachmentId}>
              <Card>
                <CardContent>
                  <Typography>{a.category}</Typography>
                  <Button
                    size="small"
                    onClick={() =>
                      window.open(
                        `${import.meta.env.VITE_API_BASE_URL || "https://packyatra.in/api"}/TicketAttachment/Download/${a.attachmentId}`,
                        "_blank"
                      )
                    }
                  >
                    View / Download
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Upload Files</Typography>

            <Stack direction="row" spacing={2} mt={2} flexWrap="wrap">
              <FileUpload
                label="Group"
                onChange={f =>
                  handleFileChange(ATTACHMENT_TYPES.GROUP, f)
                }
              />
              <FileUpload
                label="Additional Group"
                onChange={f =>
                  handleFileChange(
                    ATTACHMENT_TYPES.ADDITIONAL_GROUP,
                    f
                  )
                }
              />
              <FileUpload
                label="Delivery"
                onChange={f =>
                  handleFileChange(ATTACHMENT_TYPES.DELIVERY, f)
                }
              />
            </Stack>

            <Button
              sx={{ mt: 2 }}
              variant="contained"
              startIcon={<Save />}
              disabled={saving}
              onClick={uploadFiles}
            >
              Upload Files
            </Button>
          </Grid>
        </Grid>
      )}

      {/* ================= EDIT ================= */}
      {tab === 2 && (
        // <Card sx={{ m: 2 }}>
        //   <CardContent>
        //     <Grid container spacing={2}>
        //       {Object.keys(formData).map(key =>
        //         key !== "status" ? (
        //           <Grid item xs={12} md={6} key={key}>
        //             <TextField
        //               fullWidth
        //               label={key}
        //               value={formData[key]}
        //               onChange={e =>
        //                 setFormData({
        //                   ...formData,
        //                   [key]: e.target.value,
        //                 })
        //               }
        //             />
        //           </Grid>
        //         ) : null
        //       )}

        //       <Grid item xs={12}>
        //         <Select
        //           fullWidth
        //           value={formData.status}
        //           onChange={e =>
        //             setFormData({
        //               ...formData,
        //               status: e.target.value,
        //             })
        //           }
        //         >
        //           {["Pending", "In Progress", "Completed", "Cancelled"].map(
        //             s => (
        //               <MenuItem key={s} value={s}>
        //                 {s}
        //               </MenuItem>
        //             )
        //           )}
        //         </Select>
        //       </Grid>

        //       <Grid item xs={12}>
        //         <Button
        //           fullWidth
        //           variant="contained"
        //           startIcon={<Save />}
        //           disabled={saving}
        //           onClick={updateTicket}
        //         >
        //           Update Ticket
        //         </Button>
        //       </Grid>
        //     </Grid>
        //   </CardContent>
        // </Card>
        <TabPanel value={tab} index={2}>
          <TicketEditForm
            formData={formData}
            setFormData={setFormData}
            saving={saving}
            onSave={updateTicket}
          />
        </TabPanel>
      )}
      {/* ================= COMMENTS & UPDATES ================= */}
      {tab === 3 && (
        <TabPanel value={tab} index={3}>
  <TicketComments 
  ticketId={ticketId} 
  userId={userId} />
</TabPanel>
      )}
    </Box>
  );
}

/* ================= HELPERS ================= */
function LocationRow({ title, value }) {
  return (
    <Stack direction="row" spacing={1} mt={2}>
      <LocationOn />
      <Box>
        <Typography variant="body2">{title}</Typography>
        <Typography>{value}</Typography>
      </Box>
    </Stack>
  );
}

function InfoRow({ value }) {
  if (!value) return null;
  return (
    <Stack direction="row" spacing={1} mt={2}>
      <Inventory2 />
      <Typography>{value}</Typography>
    </Stack>
  );
}

function FileUpload({ label, onChange }) {
  return (
    <Button
      component="label"
      variant="outlined"
      startIcon={<UploadFile />}
    >
      {label}
      <input
        hidden
        type="file"
        onChange={e => onChange(e.target.files[0])}
      />
    </Button>
  );
}
function TabPanel({ value, index, children }) {
  if (value !== index) return null;

  return (
    <Box p={2}>
      {children}
    </Box>
  );
}

