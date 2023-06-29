import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import EnhancedTable from "../components/EnhancedTable.js";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";

export default function DashboardTicketsTable(props) {
  const { allTickets } = props;

  const [ticketTableQuery, setTicketTableQuery] = useState();
  const [tickets, setTickets] = useState();

  let rowsArray = [];

  const [selected, setSelected] = React.useState([]);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("calories");

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = useState([]);

  function createData(ticketTitle, developer, status, priority, created) {
    return {
      ticketTitle,
      developer,
      status,
      priority,
      created,
    };
  }

  const headCells = [
    {
      id: "ticketTitle",
      numeric: false,
      disablePadding: false,
      label: "Title",
    },
    {
      id: "developer",
      numeric: true,
      disablePadding: false,
      label: "Developer",
    },
    {
      id: "status",
      numeric: true,
      disablePadding: false,
      label: "Status",
    },
    {
      id: "priority",
      numeric: true,
      disablePadding: false,
      label: "Priority",
    },
    {
      id: "created",
      numeric: true,
      disablePadding: false,
      label: "Created",
    },
  ];

  useEffect(() => {
    tickets &&
      tickets.map((ticket, index) => {
        const title = ticket.title;
        const created = ticket.created;
        const status = ticket.status;
        const developer = ticket.developer;
        const priority = ticket.priority;

        rowsArray = [
          ...rowsArray,
          createData(title, developer, status, priority, created),
        ];
      });

    setRows(rowsArray);
  }, [tickets]);

  const rows2 = [
    createData(
      "Cupcake",
      307,
      3.7,
      67,
      <Checkbox
        sx={{ color: "rgba(255, 255, 255, 0.7)" }}
        role="checkbox"
        color="primary"
      />
    ),
    createData("Eclair", 262, 16.0, 24, 6.0),
    createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
    createData("Gingerbread", 356, 16.0, 49, 3.9),
    createData("Honeycomb", 408, 3.2, 87, 6.5),
    createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
    createData("Jelly Bean", 375, 0.0, 94, 0.0),
    createData("KitKat", 518, 26.0, 65, 7.0),
    createData("Lollipop", 392, 0.2, 98, 0.0),
    createData("Marshmallow", 318, 0, 81, 2.0),
    createData("Nougat", 360, 19.0, 9, 37.0),
    createData("Oreo", 437, 18.0, 63, 4.0),
  ];

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  function getComparator(order, orderBy) {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  const isSelected = (name) => selected.indexOf(name) !== -1;

  function handleSearch(event) {
    let newSearchQuery = event.target.value;

    let filteredTickets = [];

    setTicketTableQuery(newSearchQuery);

    tickets &&
      tickets.map((ticket) => {
        let developer;
        let ticketTitle;
        let dateCreated;

        ticketTitle = ticket.title;
        developer = ticket.developer;
        dateCreated = ticket.created;

        if (ticketTitle.includes(newSearchQuery)) {
          if (newSearchQuery !== "") {
            filteredTickets.push(ticket);
          }
        }
      });

    if (newSearchQuery === "") {
      setTickets(allTickets);
    } else {
      setTickets(filteredTickets);
    }
  }

  return (
    <EnhancedTable
      size="small"
      rows={rows ? rows : rows2}
      selected={selected}
      setSelected={setSelected}
      order={order}
      setOrder={setOrder}
      orderBy={orderBy}
      setOrderBy={setOrderBy}
      headCells={headCells}
      rowsPerPage={rowsPerPage}
      setRowsPerPage={setRowsPerPage}
      page={page}
      setPage={setPage}
      tableTitle={"Tickets"}
      searchBar={
        <TextField
          id="outlined-basic"
          label="Search"
          variant="outlined"
          inputProps={{ sx: { color: "#969292" } }}
          value={ticketTableQuery}
          onChange={handleSearch}
          sx={{
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#343434 !important",
            },
            "& .MuiInputLabel-root": {
              color: "rgb(90, 90, 90) !important",
            },
            marginTop: ".5rem",
          }}
        />
      }
      className="dashboardTicketsTable"
      tableHeadCellStyle={{ paddingRight: "5px" }}
      tableHeight={{ lg: "22rem" }}
      bodyLogic={
        rows &&
        stableSort(rows, getComparator(order, orderBy))
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((row, index) => {
            const isItemSelected = isSelected(row.name);
            const labelId = `enhanced-table-checkbox-${index}`;

            return (
              <TableRow
                hover
                aria-checked={isItemSelected}
                tabIndex={-1}
                key={row.ticketTitle}
                selected={isItemSelected}
                sx={{
                  borderBottom: "1px solid green",
                  color: "rgb(255, 255, 255)",
                }}
              >
                <TableCell
                  component="th"
                  id={labelId}
                  scope="row"
                  sx={{
                    color: "rgb(255, 255, 255)",
                    borderBottom: "1px solid rgb(81, 81, 81)",
                    paddingTop: "9.09px",
                    paddingBottom: "9.019px",
                    paddingRight: "0px",
                    width: "8rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {row.ticketTitle}
                </TableCell>

                <TableCell
                  sx={{
                    color: "rgb(255, 255, 255)",
                    borderBottom: "1px solid rgb(81, 81, 81)",
                    paddingTop: "9.09px",
                    paddingBottom: "9.09px",
                    width: "80px",
                    paddingLeft: "15px",
                    paddingRight: "0px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  align="right"
                >
                  {row.developer}
                </TableCell>

                <TableCell
                  sx={{
                    color: "rgb(255, 255, 255)",
                    borderBottom: "1px solid rgb(81, 81, 81)",
                    paddingTop: "9.09px",
                    paddingBottom: "9.09px",
                    width: "80px",
                    paddingLeft: "15px",
                    paddingRight: "0px",
                    width: "110px",
                  }}
                  align="right"
                >
                  {row.status}
                </TableCell>

                <TableCell
                  sx={{
                    color: "rgb(255, 255, 255)",
                    borderBottom: "1px solid rgb(81, 81, 81)",
                    paddingTop: "9.09px",
                    paddingBottom: "9.09px",
                    width: "80px",
                    paddingLeft: "10px",
                    paddingRight: "0px",
                  }}
                  align="right"
                >
                  {row.priority}
                </TableCell>

                <TableCell
                  sx={{
                    color: "rgb(255, 255, 255)",
                    borderBottom: "1px solid rgb(81, 81, 81)",
                    paddingTop: "9.09px",
                    paddingBottom: "9.09px",
                    width: "80px",
                    paddingLeft: "0px",
                    paddingRight: "5px",
                  }}
                  align="right"
                >
                  {row.created}
                </TableCell>
              </TableRow>
            );
          })
      }
    ></EnhancedTable>
  );
}
