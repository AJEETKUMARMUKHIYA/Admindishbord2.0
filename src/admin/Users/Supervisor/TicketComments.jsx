import React, { useEffect, useState } from "react";
import axiosClient from "../../../AxiosClient";

// MUI components
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
  Chip,
} from "@mui/material";

const TicketComments = ({ ticketId, userId }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [type, setType] = useState("General");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ticketId) return;
 if (!userId) return;
    setLoading(true);
    axiosClient
      .get(`/TicketComments/${ticketId}`)
      .then(res => setComments(res.data || []))
      .finally(() => setLoading(false));
  }, [ticketId]);

  const addComment = async () => {
    if (!text.trim()) return;

    await axiosClient.post("/TicketComments", {
      ticketId,
      commentType: type,
      commentText: text,
      createdBy: userId.toLocaleString(),
    });

    setText("");
    setType("General");

    const res = await axiosClient.get(`/TicketComments/${ticketId}`);
    setComments(res.data || []);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" mb={2}>
          Comments & Delivery Updates
        </Typography>

        {/* ADD COMMENT */}
        <Stack spacing={2} mb={3}>
          <Select
            value={type}
            onChange={e => setType(e.target.value)}
            fullWidth
          >
            <MenuItem value="General">General</MenuItem>
            <MenuItem value="Consignment">Consignment</MenuItem>
            <MenuItem value="Delivery Update">Delivery Update</MenuItem>
            <MenuItem value="Status Change">Status Change</MenuItem>
          </Select>

          <TextField
            multiline
            minRows={3}
            placeholder="Write update for customer / operations team..."
            value={text}
            onChange={e => setText(e.target.value)}
            fullWidth
          />

          <Button variant="contained" onClick={addComment}>
            Add Update
          </Button>
        </Stack>

        <Divider />

        {/* COMMENTS TIMELINE */}
        <Stack spacing={2} mt={3}>
          {comments.map(c => (
            <Card key={c.commentId} variant="outlined">
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Chip label={c.commentType} color="primary" />
                  <Typography variant="caption">
                    {new Date(c.createdAt).toLocaleString()}
                  </Typography>
                </Stack>

                <Typography mt={1}>
                  {c.commentText}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  mt={1}
                  display="block"
                >
                  — {c.createdBy}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TicketComments;
