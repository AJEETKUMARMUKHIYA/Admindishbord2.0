import React from "react";
//import makeStyles from "@mui/styles/makeStyles";
import Paper from "@mui/material/Paper";
import UserTable from "./UserTable";
import PageHeader from "../../components/Header";
import AssignTicket from "../AssginTicket/AssignTicket";
// import Auth from "../../Auth";
// import UnAuthorized from "../Common/UnAuthorized"

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

export default function ManageUserPage() {
  //const classes = useStyles();
//   if (!(Auth.isAdmin || Auth.isFSC))
//     return <UnAuthorized></UnAuthorized>
  return (
    <div>
    <PageHeader title="Manage User" />
    <Paper sx={{ padding: 3.25, marginTop: 2 }}> {/* 26px = 3.25 * 8px */}
    <AssignTicket/>
    </Paper>
    <Paper sx={{ padding: 3.25, marginTop: 2 }}> {/* 26px = 3.25 * 8px */}
       <UserTable /> 
    </Paper>
  </div>
  );
}
