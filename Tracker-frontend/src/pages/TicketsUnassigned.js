/* eslint-disable */
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import EnhancedTable from "../components/EnhancedTable.js";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import jwt from "jsonwebtoken";

function TicketsUnassigned() {
  const navigate = useNavigate();

  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const userId = isAuthenticated && user.sub;

  const [auth0Id, setAuth0Id] = useState();
  const [allTickets, setAllTickets] = useState();

  const [initialArchivedStatus, setInitialArchivedStatus] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let userId;

    getAccessTokenSilently({ detailedResponse: true })
      .then((r) => {
        const decodeIdToken = async () => {
          const decodedIdToken = jwt.decode(r.id_token);

          setAuth0Id(decodedIdToken.sub);
          userId = decodedIdToken.sub;

          if (userId) {
            axios
              .post(process.env.REACT_APP_SERVER + "/Tickets/Unassigned", {
                auth0Id: userId,
              })
              .then((r) => {
                setAllTickets(r.data.tickets);
                setInitialArchivedStatus(r.data.tickets.archived);
                setIsLoading(false);
              });
          }
        };

        decodeIdToken();
      })
      .catch((e) => {
        if (e.toString() === "Error: Login required") {
          navigate("/");
        }
      });
  }, []);

  const [selected, setSelected] = React.useState([]);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("calories");

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = useState([]);

  function createData(
    ticketTitle,
    description,
    created,
    lastUpdated,
    project,
    type,
    priority,
    status,
    archived,
    developer,
    actions
  ) {
    return {
      ticketTitle,
      description,
      created,
      lastUpdated,
      project,
      type,
      priority,
      status,
      archived,
      developer,
      actions,
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
      id: "description",
      numeric: true,
      disablePadding: true,
      label: "Description",
    },
    {
      id: "created",
      numeric: true,
      disablePadding: true,
      label: "Created",
    },
    {
      id: "lastUpdated",
      numeric: true,
      disablePadding: true,
      label: "Updated",
    },
    {
      id: "project",
      numeric: true,
      disablePadding: false,
      label: "Project",
    },
    {
      id: "type",
      numeric: true,
      disablePadding: false,
      label: "Type",
    },
    {
      id: "priority",
      numeric: true,
      disablePadding: true,
      label: "Priority",
    },
    {
      id: "status",
      numeric: true,
      disablePadding: false,
      label: "Status",
    },
    {
      id: "archived",
      numeric: true,
      disablePadding: true,
      label: "Archived",
    },
    {
      id: "developer",
      numeric: true,
      disablePadding: false,
      label: "Developer",
    },
    {
      id: "actions",
      numeric: true,
      disablePadding: false,
      label: "",
    },
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

  function TableHeader(props) {
    const {
      tickets,
      setTickets,
      setPage,
      currentPage,
      setCurrentPage,
      page,
      setSearching,
      searching,
    } = props;

    const [ticketsTableQuery, setTicketsTableQuery] = useState();

    function handleSearch(event) {
      let newSearchQuery = event.target.value;

      let filteredTickets = [];

      setTicketsTableQuery(newSearchQuery);

      allTickets &&
        allTickets.map((ticket) => {
          let title;
          let description;
          let created;
          let lastUpdated;
          let ticketProject;
          let developer;

          title = ticket.title.toLowerCase();
          ticketProject = ticket.project.toLowerCase();

          description = ticket.description && ticket.description.toLowerCase();
          created = ticket.created.toLowerCase();
          lastUpdated = ticket.lastUpdated && ticket.lastUpdated.toLowerCase();
          developer = ticket.developer.toLowerCase();

          if (
            title.includes(newSearchQuery.toLowerCase()) ||
            (description &&
              description.includes(newSearchQuery.toLowerCase())) ||
            created.includes(newSearchQuery.toLowerCase()) ||
            (lastUpdated &&
              lastUpdated.includes(newSearchQuery.toLowerCase())) ||
            ticketProject.includes(newSearchQuery.toLowerCase()) ||
            developer.includes(newSearchQuery.toLowerCase())
          ) {
            if (newSearchQuery !== "") {
              filteredTickets.push(ticket);
            }
          }
        });

      if (newSearchQuery === "") {
        setTickets(allTickets);
        setPage(currentPage);
        setSearching(false);
      } else {
        if (!searching) {
          setCurrentPage(page);
          setSearching(true);
        }

        setPage(0);
        setTickets(filteredTickets);
      }
    }

    return (
      <div className="row">
        <div className="col-6">
          <h2>
            <strong
              style={{
                fontStyle: "bold",
                fontSize: "1.875rem",
                color: "rgb(241, 241, 241)",
                fontWeight: "400",
              }}
            >
              Unassigned Tickets
            </strong>
          </h2>
        </div>

        <div className="col-6 text-end">
          <TextField
            id="outlined-basic"
            label="Search"
            variant="outlined"
            inputProps={{ sx: { color: "rgb(255, 255, 255)" } }}
            value={ticketsTableQuery}
            onChange={handleSearch}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.23) !important",
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255, 255, 255, 0.7) !important",
              },
              "& .MuiOutlinedInput-root.Mui-focused": {
                "& > fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.7) !important",
                },
              },

              position: "relative",
              bottom: ".3rem",
              paddingBottom: ".5rem",
            }}
          />
        </div>
      </div>
    );
  }

  function TicketsTable() {
    const [tickets, setTickets] = useState();
    const [currentArchivedStatus, setCurrentArchivedStatus] = useState();
    const [searching, setSearching] = useState(false);

    useEffect(() => {
      setTickets(allTickets && allTickets);
      setCurrentArchivedStatus(initialArchivedStatus);
    }, []);

    let rowsArray = [];

    const [selected, setSelected] = React.useState([]);
    const [order, setOrder] = React.useState("asc");
    const [orderBy, setOrderBy] = React.useState("calories");

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [rows, setRows] = useState([]);
    const [currentPage, setCurrentPage] = useState();

    const isSelected = (name) => selected.indexOf(name) !== -1;

    function onClickDetailsIcon(e, ticket) {
      let ticketInfo = {
        ticket: ticket,
      };
      axios
        .post(process.env.REACT_APP_SERVER + "/Tickets/Info", ticketInfo)
        .then((res) => {
          navigate("/Tickets/Details");
        });

      axios
        .post(process.env.REACT_APP_SERVER + "/Tickets/Details/activityInfo", {
          id: ticket.id,
        })
        .then((res) => {});
    }

    function onClickEditIcon(e, ticket) {
      let ticketInfo = {
        ticket: ticket,
      };
      axios
        .post(
          process.env.REACT_APP_SERVER + "/Tickets/Edit/InfoFromTicketsTable",
          ticketInfo
        )
        .then((res) => {
          navigate("/Tickets/Edit");
        });
    }

    function handleDeleteTicket(e, ticket) {}

    useEffect(() => {
      tickets &&
        tickets.map((ticket, index) => {
          const archivedStatus = ticket.archived;
          let isChecked;
          let isArchived;
          if (archivedStatus === false) {
            isArchived = false;
            isChecked = false;
          } else {
            isArchived = true;
            isChecked = true;
          }

          const ticketId = ticket.id;
          const title = ticket.title;
          const description = ticket.description;
          const created = ticket.created;
          const developer = ticket.developer;
          const lastUpdated = ticket.lastUpdated;
          const project = ticket.project;
          const type = ticket.ticketType;
          const status = ticket.status;
          const archived = (
            <Checkbox
              onClick={(event) => {
                isArchived = !isArchived;

                axios(
                  process.env.REACT_APP_SERVER + "/Tickets/archivedStatus",
                  {
                    method: "POST",
                    data: {
                      userId: auth0Id && auth0Id,
                      ticketId: ticketId,
                      archived: isArchived,
                    },
                  }
                ).then((r) => {});
              }}
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
              role="checkbox"
              color="primary"
              defaultChecked={isChecked}
            />
          );

          const priority = ticket.priority;
          const actions = (
            <div>
              <button
                onClick={(e) => {
                  onClickDetailsIcon(e, ticket);
                }}
                title="View Ticket Details "
                className="bi bi-info-circle-fill btn btn-sm p-2"
              ></button>
              <button
                onClick={(e) => {
                  axios
                    .post(process.env.REACT_APP_SERVER + "/Tickets/Delete", {
                      ticketId: ticket.id,
                      auth0Id: auth0Id,
                    })
                    .then((r) => {
                      axios
                        .post(
                          process.env.REACT_APP_SERVER + "/Tickets/Unassigned",
                          {
                            auth0Id: auth0Id,
                          }
                        )
                        .then((r) => {
                          setTickets(r.data.tickets);
                          setCurrentArchivedStatus(r.data.tickets.archived);
                        });
                    });
                }}
                type="button"
                data-bs-toggle="modal"
                title="Delete Ticket"
                className="bi bi-trash-fill  btn btn-sm p-2"
                data-bs-target="#exampleModal"
              ></button>

              <button
                onClick={(e) => {
                  onClickEditIcon(e, ticket);
                }}
                title="Edit Ticket"
                className="bi bi-pencil-fill btn btn-sm p-2"
              ></button>
            </div>
          );

          rowsArray = [
            ...rowsArray,
            createData(
              title,
              description,
              created,
              lastUpdated,
              project,
              type,
              priority,
              status,
              archived,
              developer,
              actions
            ),
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

    return (
      <div className="tableWrapper">
        <div className="row">
          <div className="col">
            {(rows.length > 0) | searching ? (
              <TableHeader
                setTickets={setTickets}
                setPage={setPage}
                setCurrentPage={setCurrentPage}
                page={page && page}
                currentPage={currentPage && currentPage}
                setSearching={setSearching}
                searching={searching}
              />
            ) : (
              <div></div>
            )}
          </div>
        </div>

        <div className="row">
          <div className="col">
            {(rows.length > 0) | searching ? (
              <EnhancedTable
                rows={rows ? rows : rows2}
                selected={selected}
                setSelected={setSelected}
                order={order}
                setOrder={setOrder}
                orderBy={orderBy}
                setOrderBy={setOrderBy}
                rowsPerPageOptions={[5, 10, 25]}
                headCells={headCells}
                rowsPerPage={rowsPerPage}
                setRowsPerPage={setRowsPerPage}
                page={page}
                setPage={setPage}
                toolbarMinHeight={"0px"}
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
                          key={index}
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
                              minWidth: "7rem",
                            }}
                          >
                            {row.ticketTitle}
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "rgb(255, 255, 255)",
                              borderBottom: "1px solid rgb(81, 81, 81)",
                              paddingRight: "0px",
                              paddingLeft: "0px",
                            }}
                            align="right"
                          >
                            {row.description}
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "rgb(255, 255, 255)",
                              borderBottom: "1px solid rgb(81, 81, 81)",
                              paddingRight: "0px",
                              paddingLeft: "12.8px",
                            }}
                            align="right"
                          >
                            {row.created}
                          </TableCell>

                          <TableCell
                            sx={{
                              color: "rgb(255, 255, 255)",
                              borderBottom: "1px solid rgb(81, 81, 81)",
                              paddingRight: "0px",
                              paddingLeft: "0px",
                            }}
                            align="right"
                          >
                            {row.lastUpdated}
                          </TableCell>

                          <TableCell
                            sx={{
                              color: "rgb(255, 255, 255)",
                              borderBottom: "1px solid rgb(81, 81, 81)",
                            }}
                            align="right"
                          >
                            {row.project}
                          </TableCell>

                          <TableCell
                            sx={{
                              color: "rgb(255, 255, 255)",
                              borderBottom: "1px solid rgb(81, 81, 81)",
                              paddingTop: "8px",
                              paddingBottom: "8px",
                              paddingLeft: "0px",
                            }}
                            align="right"
                          >
                            {row.type}
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "rgb(255, 255, 255)",
                              borderBottom: "1px solid rgb(81, 81, 81)",
                              paddingRight: "0px",
                              paddingLeft: "0px",
                            }}
                            align="right"
                          >
                            {row.priority}
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "rgb(255, 255, 255)",
                              borderBottom: "1px solid rgb(81, 81, 81)",
                            }}
                            align="right"
                          >
                            {row.status}
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "rgb(255, 255, 255)",
                              borderBottom: "1px solid rgb(81, 81, 81)",
                              paddingRight: "0px",
                              paddingLeft: "0px",
                            }}
                            align="right"
                          >
                            {row.archived}
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "rgb(255, 255, 255)",
                              borderBottom: "1px solid rgb(81, 81, 81)",
                            }}
                            align="right"
                          >
                            {row.developer}
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "rgb(255, 255, 255)",
                              borderBottom: "1px solid rgb(81, 81, 81)",
                              paddingRight: "4px",
                              paddingLeft: "0px",
                              minWidth: "7rem",
                            }}
                            align="right"
                          >
                            {row.actions}
                          </TableCell>
                        </TableRow>
                      );
                    })
                }
              ></EnhancedTable>
            ) : (
              <div
                className="row"
                style={{
                  backgroundColor: "rgb(18, 18, 18)",
                  borderRadius: "8px",
                  margin: ".7rem .5rem .7rem",
                }}
              >
                <div
                  className="col text-center"
                  style={{ paddingTop: "1.25rem", paddingBottom: "1rem" }}
                >
                  <h4>No unassigned tickets</h4>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div></div>;
  } else {
    return (
      <div className="width">
        <div className="container mt-3">
          <TicketsTable />
        </div>
      </div>
    );
  }
}

export default TicketsUnassigned;
