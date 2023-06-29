/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import TextField from "@mui/material/TextField";
import EnhancedTable from "../components/EnhancedTable.js";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import {
  useNavigate,
  useSearchParams,
  useLocation,
  Link,
} from "react-router-dom";
import { CardHeader } from "@mui/material";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import InfoIcon from "@mui/icons-material/Info";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PersonIcon from "@mui/icons-material/Person";
import GroupsIcon from "@mui/icons-material/Groups";
import jwt from "jsonwebtoken";

const userRolesKey = process.env.REACT_APP_ROLESKEY;

function ProjectsDetails() {
  const navigate = useNavigate();

  const { state } = useLocation();

  const [projectId, setProjectId] = useState(state.projectId);
  const [auth0Id, setAuth0Id] = useState();

  const { user, getAccessTokenSilently } = useAuth0();

  const [userId, setUserId] = useState();
  const [ticketToView, setTicketToView] = useState();
  const [projectToView, setProjectToView] = useState();
  const [activityInfo, setActivityInfo] = useState();
  const [project, setProject] = useState();
  const [projectTeam, setProjectTeam] = useState([]);

  const [allTickets, setAllTickets] = useState();
  const [projectManagerEmail, setProjectManagerEmail] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState();

  useEffect(() => {
    let userId;

    getAccessTokenSilently({ detailedResponse: true })
      .then((r) => {
        const decodeIdToken = async () => {
          const decodedIdToken = jwt.decode(r.id_token);

          userId = decodedIdToken.sub;

          if (userId && projectId) {
            setAuth0Id(userId);
            setUserId(userId);

            let projectTickets;
            let ticketActivity;
            let project;

            axios
              .post(process.env.REACT_APP_SERVER + "/Projects/Details/Info", {
                projectId: projectId && projectId,
                auth0Id: userId,
              })
              .then((r) => {
                project = r.data;

                axios
                  .post(
                    process.env.REACT_APP_SERVER +
                      "/Projects/Details/ProjectTickets",
                    {
                      projectId: project.id,
                      auth0Id: userId,
                    }
                  )
                  .then((r) => {
                    projectTickets = r.data;

                    axios
                      .post(
                        process.env.REACT_APP_SERVER +
                          "/Projects/Details/activityInfo",
                        {
                          projectId: project.id,
                          auth0Id: userId,
                        }
                      )
                      .then((r) => {
                        ticketActivity = r.data;
                        ticketActivity = _.orderBy(ticketActivity, "id");
                        ticketActivity = ticketActivity.reverse();

                        const userRoles = decodedIdToken[userRolesKey];
                        if (userRoles.includes("Administrator")) {
                          setAdmin(true);
                        }

                        setProjectToView(project);
                        setActivityInfo(ticketActivity);
                        setAllTickets(projectTickets);
                        Array.isArray(project.teamMembers)
                          ? setProjectTeam(project.teamMembers)
                          : setProjectTeam([]);
                        setIsLoading(false);
                      });
                  });
              });
          }
        };

        decodeIdToken();
      })
      .catch((e) => {
        if (e.toString() === "Error: Login required") {
          window.history.replaceState({}, "");
          navigate("/");
        }
      });
  }, []);

  const fileInput = document.getElementById("fileUpload");

  function handleClickToAssign(e) {
    axios
      .post(process.env.REACT_APP_SERVER + "/Tickets/AssignDeveloper", {
        ticket: ticketToView && ticketToView,
      })
      .then((r) => {
        navigate("/Tickets/AssignDeveloper");
      });
  }

  function handleClickEditProjectFromDetails(e) {
    navigate("/Projects/Edit", {
      state: {
        projectId: projectToView && projectToView.id,
      },
    });
  }

  function handleDeleteProject() {
    axios
      .post(process.env.REACT_APP_SERVER + "/Projects/Delete", {
        projectId: projectToView.id,
        auth0Id: auth0Id,
      })
      .then((r) => {
        navigate("/Projects");
      });
  }

  function DisplayAssignDev() {
    if (ticketToView && ticketToView.developer === "Not Assigned") {
      return (
        <div>
          <strong>Developer:</strong>{" "}
          <Link to="/tickets/assignDeveloper">
            <a onClick={handleClickToAssign} className="badge bg-info">
              Assign Developer
            </a>
          </Link>
        </div>
      );
    } else {
      return (
        <ul className="list-unstyled">
          <li className="mb-2">
            <strong className="card-text mt-0 mb-2">
              {ticketToView && "Developer: "}
            </strong>
            <span>{ticketToView && ticketToView.developer}</span>
          </li>
        </ul>
      );
    }
  }

  function DisplayActivityinfo() {
    {
      return (
        activityInfo &&
        activityInfo.map((activity, index) => {
          let typeOfActivity = activity.typeOfActivity;
          let usersName = activity.user;
          let newTitle = "";
          let newDeveloper = "";
          let ticketTitle = "";
          let showPreviousActivity = false;
          let divider = ": ";
          let message = "";
          let ticketStatus = "";
          let ticketPriority = "";
          let previousMessage;
          let currentMessage;
          let previousDisplay;
          let currentDisplay;

          if (typeOfActivity === "New Ticket Created") {
            divider = "";
            message = "A ticket was added";
          } else if (typeOfActivity === "New Ticket Title") {
            showPreviousActivity = true;

            message = "The ticket title was edited";
            previousMessage = (
              <p className="mt-0 mb-3">
                Previous Title:{" "}
                <span style={{ color: "rgb(255, 135, 134)" }}>
                  {activity.previousTitle}
                </span>
              </p>
            );

            currentMessage = (
              <p className="mt-0 mb-3">
                Current Title:{" "}
                <span style={{ color: "#87d984" }}>{activity.newTitle}</span>
              </p>
            );
          } else if (typeOfActivity === "New Ticket Priority") {
            showPreviousActivity = true;

            message = "The ticket priority was edited";
            previousMessage = (
              <p className="mt-0 mb-3">
                Previous Priority:{" "}
                <span style={{ color: "rgb(255, 135, 134)" }}>
                  {activity.previousPriority}
                </span>
              </p>
            );

            currentMessage = (
              <p className="mt-0 mb-3">
                Current Priority:{" "}
                <span style={{ color: "#87d984" }}>{activity.newPriority}</span>
              </p>
            );
          } else if (typeOfActivity === "New Ticket Status") {
            showPreviousActivity = true;

            message = "The ticket status was changed";
            previousMessage = (
              <p className="mt-0 mb-3">
                Previous Status:{" "}
                <span style={{ color: "rgb(255, 135, 134)" }}>
                  {activity.previousStatus}
                </span>
              </p>
            );

            currentMessage = (
              <p className="mt-0 mb-3">
                Current Status:{" "}
                <span style={{ color: "#87d984" }}>{activity.newStatus}</span>
              </p>
            );
          } else if (typeOfActivity === "New Developer Assigned") {
            showPreviousActivity = true;

            message = "The ticket Developer was changed";
            previousMessage = (
              <p className="mt-0 mb-3">
                Previous Developer:{" "}
                <span style={{ color: "rgb(255, 135, 134)" }}>
                  {activity.previousDeveloper}
                </span>
              </p>
            );

            currentMessage = (
              <p className="mt-0 mb-3">
                Current Developer:{" "}
                <span style={{ color: "#87d984" }}>
                  {activity.newDeveloper}
                </span>
              </p>
            );
          } else if (typeOfActivity === "New comment added to ticket") {
            message = "A ticket comment was added";
          } else if (typeOfActivity === "Attachment added to ticket") {
            message = "A ticket attachment was added";
          }

          if (activity.newDeveloper !== null) {
            newDeveloper = activity.newDeveloper;
          }
          if (activity.newTitle !== null) {
            newTitle = activity.newTitle;
          }
          if (activity.newPriority !== null) {
            ticketPriority = activity.newPriority;
          }
          if (activity.ticketTitle !== null) {
            ticketTitle = activity.ticketTitle;
          }
          if (activity.newStatus !== null) {
            ticketStatus = activity.newStatus;
          }

          if (showPreviousActivity) {
            previousDisplay = (
              <p className="card-text mt-0 mb-3">{previousMessage}</p>
            );

            currentDisplay = (
              <p className="card-text mt-0 mb-3">{currentMessage}</p>
            );
          }

          return (
            <div className="direction">
              <p className="card-text mt-3 mb-0 fw-bold">
                {activity.dateOfActivity}
              </p>

              <p className="card-text mt-0 mb-0">
                {/* {typeOfActivity + divider + newTitle + newDeveloper + ticketTitle} */}
                {typeOfActivity +
                  divider +
                  newTitle +
                  newDeveloper +
                  ticketTitle +
                  ticketPriority +
                  ticketStatus}
              </p>

              <p className="card-text mt-0 mb-0">
                {projectToView && "By: " + usersName}
              </p>

              <p className="card-text mt-3 mb-3">{message}</p>

              {previousDisplay}

              {currentDisplay}

              <hr />
            </div>
          );
        })
      );
    }
  }

  function TableHeader(props) {
    const {
      tickets,
      setProjectTickets,
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
        setProjectTickets(allTickets);
        setPage(currentPage);
        setSearching(false);
      } else {
        if (!searching) {
          setCurrentPage(page);
          setSearching(true);
        }

        setPage(0);
        setProjectTickets(filteredTickets);
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
              Tickets
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
    const [projectTickets, setProjectTickets] = useState();
    const [searching, setSearching] = useState(false);

    useEffect(() => {
      setProjectTickets(allTickets && allTickets);
    }, []);

    let rowsArray = [];

    const [selected, setSelected] = React.useState([]);
    const [order, setOrder] = React.useState("asc");
    const [orderBy, setOrderBy] = React.useState("calories");

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [rows, setRows] = useState([]);
    const [currentPage, setCurrentPage] = useState();

    function createData(
      ticketTitle,
      developer,
      status,
      priority,
      created,
      actions
    ) {
      return {
        ticketTitle,
        developer,
        status,
        priority,
        created,
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
        label: "date",
      },
      {
        id: "actions",
        numeric: true,
        disablePadding: false,
        label: "Actions",
      },
    ];

    function onClickDetailsIcon(e, ticket) {
      navigate("/Tickets/Details", {
        state: {
          ticketId: ticket.id,
        },
      });
    }

    function onClickEditIcon(e, ticket) {
      navigate("/Tickets/Edit", {
        state: {
          ticketId: ticket.id,
        },
      });
    }

    function handleDeleteTicket(e, ticket) {
      axios
        .post(process.env.REACT_APP_SERVER + "/Projects/Details/DeleteTicket", {
          ticketId: ticket.id,
          auth0Id: auth0Id && auth0Id,
          projectId: ticket.projectId,
        })
        .then((r) => {
          setProjectTickets(r.data);
        });
    }

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

    useEffect(() => {
      projectTickets &&
        projectTickets.map((ticket, index) => {
          const title = ticket.title;
          const created = ticket.created;
          const status = ticket.status;
          const developer = ticket.developer;
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
                  handleDeleteTicket(e, ticket);
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
            createData(title, developer, status, priority, created, actions),
          ];
        });

      setRows(rowsArray);
    }, [projectTickets]);

    return (
      <div className="row g-3">
        <div className="col-lg-12 ">
          <div className="tableWrapperProjectsDetails">
            <div className="row">
              <div className="col">
                {allTickets && allTickets.length > 0 && (
                  <TableHeader
                    setProjectTickets={setProjectTickets}
                    setPage={setPage}
                    setCurrentPage={setCurrentPage}
                    page={page && page}
                    currentPage={currentPage && currentPage}
                    setSearching={setSearching}
                    searching={searching}
                  />
                )}
              </div>
            </div>

            <div className="row">
              <div className="col">
                {allTickets && allTickets.length > 0 ? (
                  <EnhancedTable
                    rows={rows ? rows : rows2}
                    selected={selected}
                    setSelected={setSelected}
                    order={order}
                    setOrder={setOrder}
                    orderBy={orderBy}
                    setOrderBy={setOrderBy}
                    rowsPerPageOptions={[5, 10, 15]}
                    headCells={headCells}
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage}
                    page={page}
                    setPage={setPage}
                    toolbarMinHeight={"0px"}
                    bodyLogic={
                      rows &&
                      stableSort(rows, getComparator(order, orderBy))
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
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
                                }}
                              >
                                {row.ticketTitle}
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
                                }}
                                align="right"
                              >
                                {row.status}
                              </TableCell>

                              <TableCell
                                sx={{
                                  color: "rgb(255, 255, 255)",
                                  borderBottom: "1px solid rgb(81, 81, 81)",
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
                                {row.created}
                              </TableCell>

                              <TableCell
                                sx={{
                                  color: "rgb(255, 255, 255)",
                                  borderBottom: "1px solid rgb(81, 81, 81)",
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
                      <h4>No tickets yet</h4>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    // }
  }

  if (isLoading) {
    return <div></div>;
  } else {
    return (
      <div className="width">
        <div className="container">
          <Card
            sx={{
              backgroundColor: "rgb(23, 23, 23)",
              color: "rgb(255, 255, 255)",
              mb: 5,
              borderRadius: 3.4,
            }}
          >
            <CardHeader
              style={{ paddingTop: ".2rem", paddingBottom: ".2rem" }}
              title={
                <div style={{ paddingTop: ".3rem" }}>
                  <strong
                    style={{
                      fontStyle: "bold",
                      fontSize: "1.875rem",
                      color: "rgb(229, 229, 229)",
                    }}
                  >
                    Project Details
                  </strong>
                </div>
              }
            />
          </Card>
          <div className="row g-5">
            <div className="col-xl-8 ">
              <Card
                className="projectInfoCard"
                sx={{
                  backgroundColor: "rgb(23, 23, 23)",
                  color: "rgb(255, 255, 255)",
                  borderRadius: 2,
                }}
              >
                <CardHeader
                  title={
                    <div>
                      <InfoIcon class="pe-2 infoIcon" />

                      {projectToView && projectToView.projectName}

                      <span>
                        <button
                          onClick={handleDeleteProject}
                          type="button"
                          data-bs-toggle="modal"
                          title=" Contact"
                          className="bi bi-trash-fill float-end btn btn-lg p-2 "
                          data-bs-target="#exampleModal"
                          style={{
                            position: "relative",
                            bottom: ".25rem",
                            marginRight: "0rem",
                          }}
                        ></button>

                        <button
                          onClick={handleClickEditProjectFromDetails}
                          title="Edit Ticket"
                          className="bi bi-pencil-fill btn btn-lg p-2 float-end "
                          style={{ position: "relative", bottom: ".25rem" }}
                        ></button>
                      </span>
                    </div>
                  }
                  titleTypographyProps={{
                    fontWeight: 500,
                  }}
                />

                <CardContent>
                  <Typography
                    sx={{ mb: 3.5 }}
                    gutterBottom
                    variant=""
                    component="div"
                  >
                    {projectToView && projectToView.description}
                  </Typography>

                  <ul className="list-unstyled mb-0">
                    <li className="mb-1">
                      <strong className="card-text mt-0 mb-0">
                        {project && "Project: "}
                      </strong>
                      <span>{project && project.projectName}</span>
                    </li>
                  </ul>

                  {<DisplayAssignDev />}

                  <hr />

                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <strong className="card-text mt-0 mb-5">
                        {"Start Date: "}
                      </strong>
                      <span>{projectToView && projectToView.startDate}</span>
                    </li>

                    <li className="mb-2">
                      <strong className="card-text mt-0 mb-2">
                        {"Deadline: "}
                      </strong>
                      <span>{projectToView && projectToView.endDate}</span>
                    </li>

                    <li className="mb-2">
                      <strong className="card-text mt-0 mb-2">
                        {"Priority: "}
                      </strong>
                      <span>{projectToView && projectToView.priority}</span>
                    </li>

                    {/* <li className='mb-2' >
                                            <strong className='card-text mt-0 mb-2'>
                                                {'Status: '}
                                            </strong>
                                            <span>{projectToView && projectToView.status}</span>
                                        </li> */}
                  </ul>
                </CardContent>
              </Card>

              <div className="row g-3">
                <div className="col-md-6 ">
                  <Card
                    className="projectManagerCard"
                    sx={{
                      backgroundColor: "rgb(23, 23, 23)",
                      color: "rgb(255, 255, 255)",
                      borderRadius: 2,
                      height: "16.79rem",
                      position: "relative",
                    }}
                  >
                    <CardHeader
                      title={
                        <div>
                          <PersonOutlineOutlinedIcon className="personOutlineOutlinedIcon pe-2" />
                          Project Manager
                        </div>
                      }
                    />

                    <CardContent className="text-center">
                      {projectToView && projectToView.projectManager && (
                        <Stack spacing={0.4} className="projectManagerDiv">
                          <PersonIcon className="personIcon" />

                          <i
                            class="pe-2"
                            style={{
                              color: "#5e5e5e",
                              fontSize: "1.7rem",
                              marginTop: ".8rem",
                              marginBottom: "2.29rem",
                              visibility: "hidden",
                            }}
                          >
                            {" "}
                            |{" "}
                          </i>

                          <h5>
                            {projectToView && projectToView.projectManager}
                          </h5>
                          <p style={{ color: "rgb(60, 57, 57)" }}>
                            {projectToView && projectToView.projectManagerEmail}
                          </p>
                          <p style={{ color: "#3c3939" }}>Project Manager</p>
                        </Stack>
                      )}

                      {projectToView && !projectToView.projectManager && (
                        <div>
                          <div className="text-center teamDiv">
                            <strong>No manager selected</strong>
                          </div>
                        </div>
                      )}
                      {admin &&
                        projectToView &&
                        !projectToView.projectManager && (
                          <Link
                            to="/ManageTeam"
                            style={{
                              top: ".729rem",
                              right: "8rem",
                              position: "relative",
                            }}
                            state={{ projectId: projectId && projectId }}
                          >
                            <Button
                              style={{
                                color: "rgb(82, 128, 163)",
                                maxWidth: "fit-content",
                                position: "relative",
                                top:
                                  projectToView &&
                                  !projectToView.projectManager &&
                                  "8.3rem",
                              }}
                            >
                              Manage Team
                            </Button>
                          </Link>
                        )}
                      {admin &&
                        projectToView &&
                        projectToView.projectManager && (
                          <Link
                            to="/ManageTeam"
                            style={{
                              top: "-1.63rem",
                              right: "8rem",
                              position: "relative",
                            }}
                            state={{ projectId: projectId && projectId }}
                          >
                            <Button
                              style={{
                                color: "rgb(82, 128, 163)",
                                maxWidth: "fit-content",
                                position: "relative",
                                top:
                                  projectToView &&
                                  !projectToView.projectManager &&
                                  "8.3rem",
                              }}
                            >
                              Manage Team
                            </Button>
                          </Link>
                        )}
                    </CardContent>
                  </Card>

                  <div></div>
                </div>

                <div className="col-md-6 projectTeamCol">
                  <Card
                    sx={{
                      backgroundColor: "rgb(23, 23, 23)",
                      color: "rgb(255, 255, 255)",
                      borderRadius: 2,
                      height: "16.79rem",
                      position: "relative",
                    }}
                  >
                    <CardHeader
                      style={{ paddingBottom: "0px" }}
                      title={
                        <div>
                          <GroupsIcon className="groupsIcon pe-2" />
                          Project Team
                        </div>
                      }
                      // subheader="some_subheader"
                    />

                    <CardContent className="scrollableComments">
                      {projectTeam.length !== 0 &&
                        projectTeam.map((member) => {
                          let roles = [];

                          member.roles.map((role) => {
                            roles.push(role.description);
                          });
                          return (
                            <div className="direction">
                              <ul className="list-unstyled mb-0">
                                <div
                                  style={{
                                    backgroundColor: "#7575751c",
                                    borderRadius: "10px",
                                    paddingBottom: ".18rem",
                                    paddingTop: ".15rem",
                                    marginBottom: ".59rem",
                                  }}
                                >
                                  <li className="mb-1 text-center">
                                    <span className=" ">
                                      {member.firstName + " " + member.lastName}
                                    </span>

                                    <div className="text-center">
                                      {roles.map((role) => {
                                        return (
                                          <Chip
                                            align="center"
                                            variant={"outlined"}
                                            label={role}
                                            sx={{
                                              color: "#f1f1f1",
                                              marginBottom: ".18rem",
                                              fontSize: ".67rem",
                                              height: "1.2rem",
                                              margin: "0 .18rem 0",
                                              color: "#535353",
                                              borderColor: "#4f4f4f",
                                              borderRadius: "5.5px",
                                            }}
                                          />
                                        );
                                      })}
                                    </div>
                                  </li>
                                </div>
                              </ul>
                            </div>
                          );
                        })}

                      {projectTeam.length === 0 && (
                        <div>
                          <div
                            className="text-center"
                            style={{ position: "relative", bottom: "5.2rem" }}
                          ></div>

                          <div className="text-center teamDiv">
                            <strong>No team yet</strong>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-lg-12 projectDetailsActivityCol">
              <Card
                sx={{
                  backgroundColor: "rgb(23, 23, 23)",
                  color: "rgb(255, 255, 255)",
                  borderRadius: 2,
                }}
              >
                <CardHeader
                  title={
                    <div>
                      <TimelineRoundedIcon className="timelineRoundedIcon pe-2" />
                      Activity
                    </div>
                  }
                />

                <CardContent className="scrollable ProjectDetailsActivityContentDiv">
                  {activityInfo && <DisplayActivityinfo />}
                </CardContent>
              </Card>

              <div></div>
            </div>

            <TicketsTable />
          </div>
        </div>
      </div>
    );
  }
}

export default ProjectsDetails;
