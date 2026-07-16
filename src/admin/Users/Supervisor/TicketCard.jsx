import {
  Card,
  CardContent,
  Box,
  Grid,
  Typography,
  Chip,
  Button,
  Stack
} from "@mui/material";

import {
  LocationOn,
  Inventory2,
  LocalShipping
} from "@mui/icons-material";

import { useEffect, useState } from "react";
import axiosClient from "../../../AxiosClient";

export function TicketCard({ ticket, onSelect }) {
  const statusColorMap = {
    Pending: "warning",
    "In Progress": "info",
    Completed: "success",
    Cancelled: "error"
  };

  const [attachments, setAttachments] = useState([]);

  // 🔹 Fetch ticket attachments
  useEffect(() => {
    if (!ticket?.ticketID) return;

    axiosClient
      .get(`/TicketAttachment/ByTicket/${ticket.ticketID}`)
      .then(res => setAttachments(res.data || []))
      .catch(() => setAttachments([]));
  }, [ticket.ticketID]);

  // 🔹 Download attachment
  const downloadFile = (attachmentId, fileName) => {
    axiosClient({
      url: `/TicketAttachment/Download/${attachmentId}`,
      method: "GET",
      responseType: "blob"
    }).then(res => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  };

  // 🔹 Badge label based on filename
  const getLabel = (fileName = "") => {
    const name = fileName.toLowerCase();
    if (name.includes("group")) return "G1";
    if (name.includes("additional")) return "G2";
    if (name.includes("delivery")) return "DEL";
    return "IMG";
  };

  return (
    <Card
      sx={{ cursor: "pointer", "&:hover": { boxShadow: 6 } }}
      onClick={onSelect}
    >
      <CardContent>
        <Grid container spacing={3}>
          {/* LEFT SECTION */}
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6">
                  Ticket #{ticket.ticketNo}
                </Typography>

                <Chip
                  label={ticket.status}
                  size="small"
                  color={statusColorMap[ticket.status]}
                  sx={{ ml: 1 }}
                />

                <Typography variant="body2" color="text.secondary">
                  Booking ID: {ticket.bookingID}
                </Typography>
              </Box>

              <Box display="flex" gap={2}>
                <LocationOn color="success" />
                <Typography>{ticket.fromLocation}</Typography>

                <LocationOn color="error" />
                <Typography>{ticket.toLocation}</Typography>
              </Box>

              {ticket.totalItems && (
                <Box display="flex" gap={1}>
                  <Inventory2 />
                  <Typography>{ticket.totalItems}</Typography>
                </Box>
              )}

              {ticket.vanDetails && (
                <Box display="flex" gap={1}>
                  <LocalShipping />
                  <Typography>{ticket.vanDetails}</Typography>
                </Box>
              )}
            </Stack>
          </Grid>

          {/* RIGHT SECTION */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Box
                bgcolor="#f9fafb"
                border="1px solid #e0e0e0"
                borderRadius={1}
                p={2}
              >
                <Typography variant="body2">
                  Uploaded Images
                </Typography>

                <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                  {attachments.length > 0 ? (
                    attachments.map(file => (
                      <ImageBadge
                        key={file.attachmentId}
                        label={getLabel(file.originalFileName)}
                        color="info"
                        onClick={(e) => {
                          e.stopPropagation(); // prevent card click
                          downloadFile(
                            file.attachmentId,
                            file.originalFileName
                          );
                        }}
                      />
                    ))
                  ) : (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      No images
                    </Typography>
                  )}
                </Box>
              </Box>

              <Button
                variant="contained"
                fullWidth
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.();
                }}
              >
                View Full Details
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

function ImageBadge({ label, color, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        width: 48,
        height: 48,
        cursor: "pointer",
        "&:hover": { opacity: 0.8 }
      }}
      display="flex"
      alignItems="center"
      justifyContent="center"
      borderRadius={1}
      bgcolor={`${color}.light`}
      color={`${color}.main`}
      fontSize={12}
      fontWeight={600}
    >
      {label}
    </Box>
  );
}
