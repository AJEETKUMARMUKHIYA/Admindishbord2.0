import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import { columns } from "./constants";

const UserDataGrid = ({ users, onRowClick, onEditUser, onDeleteUser }) => {
  const actionColumn = {
    field: "actions",
    headerName: "Actions",
    width: 200,
    renderCell: (params) => (
      <>
        <Button
          variant="outlined"
          color="primary"
          size="small"
          onClick={() => onEditUser(params.row)}
          sx={{ mr: 1 }}
        >
          Edit
        </Button>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => onDeleteUser(params.row.userId)}
        >
          Delete
        </Button>
      </>
    ),
  };

  return (
    <div style={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={users}
        columns={[...columns, actionColumn]}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        onRowClick={onRowClick}
        getRowId={(row) => row.userId}
        disableSelectionOnClick
      />
    </div>
  );
};

export default UserDataGrid;