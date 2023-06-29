/* eslint-disable */
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import React, { useEffect, useState, PureComponent, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TextField from "@mui/material/TextField";
import EnhancedTable from "../components/EnhancedTable.js";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import { PieChart } from "react-minimal-pie-chart";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useProSidebar } from "react-pro-sidebar";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import jwt from "jsonwebtoken";

function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);

  let updatedProjectsList = [];

  const { collapseSidebar, toggleSidebar, toggled, collapsed, broken } =
    useProSidebar();

  const location = useLocation();
  const currentPageUrl = location.pathname;

  const navigate = useNavigate();

  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

  const [auth0Id, setAuth0Id] = useState();

  const [contacts, setContacts] = useState();
  const [contactsToEmail, setContactsToEmail] = useState();
  const [defaultImage, setDefaultImage] = useState();

  const [allTickets, setAllTickets] = useState();
  const [allProjects, setAllProjects] = useState();

  const [afterInitialLoad, setAfterInitialLoad] = useState(false);

  const [currentArchivedStatus, setCurrentArchivedStatus] = useState();
  const [displayProjectsBarchart, setDisplayProjectsBarchart] = useState(false);

  if (location.search !== "") {
    window.history.replaceState("", "", "/Home");
  }

  useEffect(() => {
    let userId;

    getAccessTokenSilently({ detailedResponse: true })
      .then((r) => {
        const decodeIdToken = async () => {
          const decodedIdToken = jwt.decode(r.id_token);

          setAuth0Id(decodedIdToken.sub);
          userId = decodedIdToken.sub;

          axios
            .post(process.env.REACT_APP_SERVER + "/Tickets", {
              auth0Id: userId,
            })
            .then((r) => {
              let tickets = r.data.tickets;

              axios
                .post(process.env.REACT_APP_SERVER + "/Projects", {
                  auth0Id: userId,
                })
                .then((r) => {
                  let projects = r.data.projects;

                  setAllTickets(tickets);
                  setCurrentArchivedStatus(tickets.archived);
                  setAllProjects(projects);

                  setCurrentArchivedStatus(projects.archived);
                  setDefaultImage(r.data.defaultImage);

                  projects.map((project) => {
                    tickets.map((ticket) => {
                      if (ticket.projectId === project.id.toString()) {
                        setDisplayProjectsBarchart(true);
                      }
                    });
                  });

                  setIsLoading(false);
                });
            });
        };

        decodeIdToken();
      })
      .catch((e) => {
        if (e.toString() === "Error: Login required") {
          navigate("/");
        }
      });
  }, []);

  function TicketsByPriorityCard() {
    const [priorityLowColor, setPriorityLowColor] =
      useState("rgb(72, 165, 88)");
    const [priorityMediumColor, setPriorityMediumColor] =
      useState("rgb(217, 215, 85)");
    const [priorityHighColor, setPriorityHighColor] =
      useState("rgb(217, 142, 64)");
    const [priorityUrgentColor, setPriorityUrgentColor] =
      useState("rgb(188, 69, 70)");
    const [priorityLowHovered, setPriorityLowHovered] = useState();
    const [priorityUrgentHovered, setPriorityUrgentHovered] = useState();
    const [priorityHighHovered, setPriorityHighHovered] = useState();
    const [priorityMediumHovered, setPriorityMediumHovered] = useState();
    const [priorityUrgentIndex, setPriorityUrgentIndex] = useState();
    const [priorityLowIndex, setPriorityLowIndex] = useState();
    const [priorityHighIndex, setPriorityHighIndex] = useState();
    const [priorityMediumIndex, setPriorityMediumIndex] = useState();

    const [priorityBeingHovered, setPriorityBeingHovered] = useState();

    let lowCount = 0;
    let mediumCount = 0;
    let highCount = 0;
    let urgentCount = 0;

    allTickets &&
      allTickets.map((ticket) => {
        let priority = ticket.priority;
        if (priority === "Low") {
          lowCount = lowCount + 1;
        } else if (priority === "Medium") {
          mediumCount = mediumCount + 1;
        } else if (priority === "High") {
          highCount = highCount + 1;
        } else if (priority === "Urgent") {
          urgentCount = urgentCount + 1;
        }
      });

    let dataForPriorityCard = [
      {
        title: "",
        value: urgentCount,
        color: priorityUrgentColor,
        id: "Urgent",
      },
      { title: "", value: lowCount, color: priorityLowColor, id: "Low" },
      {
        title: "",
        value: mediumCount,
        color: priorityMediumColor,
        id: "Medium",
      },
      { title: "", value: highCount, color: priorityHighColor, id: "High" },
    ];

    dataForPriorityCard = dataForPriorityCard.filter((object) => {
      return object.value !== 0;
    });

    return (
      <Card
        sx={{
          maxWidth: 250,
          backgroundColor: "rgb(18, 18, 18)",
          color: "rgb(255, 255, 255)",
          height: "20.27rem",
        }}
      >
        <CardContent>
          <Typography sx={{ mb: 5 }} gutterBottom variant="h6" component="div">
            Tickets By Priority
          </Typography>

          {allTickets && allTickets.length < 1 ? (
            <div
              className="row dashboardMessage"
              style={{
                backgroundColor: "rgb(18, 18, 18)",
                borderRadius: "4px",
              }}
            >
              <div
                className="col text-center "
                style={{ paddingTop: "2.1rem" }}
              >
                <h4>No tickets yet</h4>
              </div>
            </div>
          ) : (
            <PieChart
              data={dataForPriorityCard}
              lineWidth={33}
              paddingAngle={29.5}
              rounded
              label={({ dataEntry, dataIndex }) => {
                const value = dataEntry.value;
                const priority = dataEntry.id;

                if (priority === "Medium") {
                  setPriorityMediumIndex(dataIndex);
                  if (priorityMediumHovered) {
                    return "Medium";
                  } else {
                    if (
                      !priorityLowHovered &&
                      !priorityHighHovered &&
                      !priorityUrgentHovered
                    ) {
                      return value;
                    }
                  }
                }

                if (priority === "Low") {
                  setPriorityLowIndex(dataIndex);
                  if (priorityLowHovered) {
                    return "Low";
                  } else {
                    if (
                      !priorityMediumHovered &&
                      !priorityHighHovered &&
                      !priorityUrgentHovered
                    ) {
                      return value;
                    }
                  }
                }

                if (priority === "High") {
                  setPriorityHighIndex(dataIndex);
                  if (priorityHighHovered) {
                    return "High";
                  } else {
                    if (
                      !priorityMediumHovered &&
                      !priorityLowHovered &&
                      !priorityUrgentHovered
                    ) {
                      return value;
                    }
                  }
                }

                if (priority === "Urgent") {
                  setPriorityUrgentIndex(dataIndex);
                  if (priorityUrgentHovered) {
                    return "Urgent";
                  } else {
                    if (
                      !priorityMediumHovered &&
                      !priorityLowHovered &&
                      !priorityHighHovered
                    ) {
                      return value;
                    }
                  }
                }
              }}
              labelStyle={(index) => ({
                fill: dataForPriorityCard[index].color,
                fontSize: "9px",
                fontFamily: "sans-serif",
              })}
              labelPosition={priorityBeingHovered ? 0 : 50}
              onMouseOver={(e, segmentIndex) => {
                setPriorityBeingHovered(true);

                let priority = segmentIndex;

                if (priorityMediumIndex === segmentIndex) {
                  setPriorityMediumColor("rgba(217, 215, 85, 0.90)");
                  setPriorityMediumHovered(true);
                }

                if (priorityLowIndex === segmentIndex) {
                  setPriorityLowColor("rgba(72, 165, 88, 0.90)");

                  setPriorityLowHovered(true);
                }

                if (priorityHighIndex === segmentIndex) {
                  setPriorityHighColor("rgba(217, 142, 64, 0.90)");
                  setPriorityHighHovered(true);
                }

                if (priorityUrgentIndex === segmentIndex) {
                  setPriorityUrgentColor("rgba(188, 69, 70, 0.90)");

                  setPriorityUrgentHovered(true);
                }
              }}
              onMouseOut={(e, segmentIndex) => {
                setPriorityBeingHovered(false);
                let priority = segmentIndex;

                setPriorityLowHovered(false);
                setPriorityMediumHovered(false);
                setPriorityHighHovered(false);
                setPriorityUrgentHovered(false);
                setPriorityLowColor("rgb(72, 165, 88)");
                setPriorityUrgentColor("rgb(188, 69, 70)");
                setPriorityHighColor("rgb(217, 142, 64)");
                setPriorityMediumColor("rgb(217, 215, 85)");
              }}
            />
          )}
        </CardContent>
      </Card>
    );
  }

  let newCount = 0;
  let developmentCount = 0;
  let testingCount = 0;
  let resolvedCount = 0;

  allTickets &&
    allTickets.map((ticket) => {
      let status = ticket.status;
      if (status === "New") {
        newCount = newCount + 1;
      } else if (status === "Development") {
        developmentCount = developmentCount + 1;
      } else if (status === "Testing") {
        testingCount = testingCount + 1;
      } else if (status === "Resolved") {
        resolvedCount = resolvedCount + 1;
      }
    });

  function TicketsByStatusCard() {
    const [statusNewColor, setStatusNewColor] = useState("#0c84ec");
    const [statusTestingColor, setStatusTestingColor] =
      useState("rgb(217, 142, 64)");
    const [statusDevelopmentColor, setStatusDevelopmentColor] =
      useState("rgb(217, 215, 85)");
    const [statusResolvedColor, setStatusResolvedColor] =
      useState("rgb(72, 165, 88)");
    const [statusNewHovered, setStatusNewHovered] = useState();
    const [statusResolvedHovered, setStatusResolvedHovered] = useState();
    const [statusDevelopmentHovered, setStatusDevelopmentHovered] = useState();
    const [statusTestingHovered, setStatusTestingHovered] = useState();
    const [statusResolvedIndex, setStatusResolvedIndex] = useState();
    const [statusNewIndex, setStatusNewIndex] = useState();
    const [statusDevelopmentIndex, setStatusDevelopmentIndex] = useState();
    const [statusTestingIndex, setStatusTestingIndex] = useState();

    const [statusBeingHovered, setStatusBeingHovered] = useState();

    let dataForStatusCard = [
      {
        title: "",
        value: newCount,
        color: statusNewColor,
        id: "New",
        test: "test",
      },
      {
        title: "",
        value: developmentCount,
        color: statusDevelopmentColor,
        id: "Development",
      },
      {
        title: "",
        value: testingCount,
        color: statusTestingColor,
        id: "Testing",
      },
      {
        title: "",
        value: resolvedCount,
        color: statusResolvedColor,
        id: "Resolved",
      },
    ];

    dataForStatusCard = dataForStatusCard.filter((object) => {
      return object.value !== 0;
    });

    return (
      <Card
        className="uncollapsedTicketsByStatusCard"
        sx={{
          maxWidth: 250,
          backgroundColor: "rgb(18, 18, 18)",
          color: "rgb(255, 255, 255)",
          height: "20.27rem",
        }}
      >
        <CardContent>
          <Typography sx={{ mb: 5 }} gutterBottom variant="h6" component="div">
            Tickets By Status
          </Typography>

          {allTickets && allTickets.length < 1 ? (
            <div
              className="row dashboardMessage"
              style={{
                backgroundColor: "rgb(18, 18, 18)",
                borderRadius: "4px",
              }}
            >
              <div
                className="col text-center "
                style={{ paddingTop: "2.1rem" }}
              >
                <h4>No tickets yet</h4>
              </div>
            </div>
          ) : (
            <PieChart
              data={dataForStatusCard}
              lineWidth={33}
              paddingAngle={29.5}
              rounded
              label={({ dataEntry, dataIndex }) => {
                const value = dataEntry.value;
                const status = dataEntry.id;

                if (status === "Resolved") {
                  setStatusResolvedIndex(dataIndex);
                  if (statusResolvedHovered) {
                    return "Resolved";
                  } else {
                    if (
                      !statusNewHovered &&
                      !statusDevelopmentHovered &&
                      !statusTestingHovered
                    ) {
                      return value;
                    }
                  }
                }

                if (status === "New") {
                  setStatusNewIndex(dataIndex);
                  if (statusNewHovered) {
                    return "New";
                  } else {
                    if (
                      !statusResolvedHovered &&
                      !statusDevelopmentHovered &&
                      !statusTestingHovered
                    ) {
                      return value;
                    }
                  }
                }

                if (status === "Development") {
                  setStatusDevelopmentIndex(dataIndex);
                  if (statusDevelopmentHovered) {
                    return "Development";
                  } else {
                    if (
                      !statusResolvedHovered &&
                      !statusNewHovered &&
                      !statusTestingHovered
                    ) {
                      return value;
                    }
                  }
                }

                if (status === "Testing") {
                  setStatusTestingIndex(dataIndex);
                  if (statusTestingHovered) {
                    return "Testing";
                  } else {
                    if (
                      !statusResolvedHovered &&
                      !statusNewHovered &&
                      !statusDevelopmentHovered
                    ) {
                      return value;
                    }
                  }
                }
              }}
              labelStyle={(index) => ({
                fill: dataForStatusCard[index].color,
                fontSize: "9px",
                fontFamily: "sans-serif",
              })}
              labelPosition={statusBeingHovered ? 0 : 50}
              onMouseOver={(e, segmentIndex) => {
                setStatusBeingHovered(true);

                let status = segmentIndex;

                if (statusResolvedIndex === segmentIndex) {
                  setStatusResolvedColor("rgba(72, 165, 88, 0.90)");
                  setStatusResolvedHovered(true);
                }

                if (statusNewIndex === segmentIndex) {
                  setStatusNewColor("rgba(12, 131, 236, 0.90)");

                  setStatusNewHovered(true);
                }

                if (statusDevelopmentIndex === segmentIndex) {
                  setStatusDevelopmentColor("rgba(217, 215, 85, 0.90)");

                  setStatusDevelopmentHovered(true);
                }

                if (statusTestingIndex === segmentIndex) {
                  setStatusTestingColor("rgba(217, 142, 64, 0.90)");

                  setStatusTestingHovered(true);
                }
              }}
              onMouseOut={(e, segmentIndex) => {
                setStatusBeingHovered(false);
                let status = segmentIndex;

                setStatusNewHovered(false);
                setStatusResolvedHovered(false);
                setStatusDevelopmentHovered(false);
                setStatusTestingHovered(false);
                setStatusNewColor("#0c84ec");
                setStatusTestingColor("rgb(217, 142, 64)");
                setStatusDevelopmentColor("rgb(217, 215, 85)");
                setStatusResolvedColor("rgb(72, 165, 88)");
              }}
            />
          )}
        </CardContent>
      </Card>
    );
  }

  function TicketsTableHeader(props) {
    const {
      tickets,
      setTickets,
      setPage,
      currentPage,
      setCurrentPage,
      page,
      setSearching,
      searching,
      searchDisplay,
    } = props;

    const [ticketTableQuery, setTicketTableQuery] = useState();

    function handleSearch(event) {
      let newSearchQuery = event.target.value;

      let filteredTickets = [];

      setTicketTableQuery(newSearchQuery);

      allTickets &&
        allTickets.map((ticket) => {
          let developer;
          let ticketTitle;
          let dateCreated;

          ticketTitle = ticket.title.toLowerCase();
          developer = ticket.developer.toLowerCase();
          dateCreated = ticket.created.toLowerCase();

          if (
            developer.includes(newSearchQuery.toLowerCase()) ||
            ticketTitle.includes(newSearchQuery.toLowerCase()) ||
            dateCreated.includes(newSearchQuery.toLowerCase())
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
              Tickets
            </strong>
          </h2>
        </div>

        <div className="col-6 text-end" style={{ display: searchDisplay }}>
          <TextField
            id="outlined-basic"
            label="Search"
            variant="outlined"
            inputProps={{ sx: { color: "rgb(255, 255, 255)" } }}
            value={ticketTableQuery}
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
    let rowsArray = [];

    const [tickets, setTickets] = useState();

    const [currentPage, setCurrentPage] = useState();
    const [searching, setSearching] = useState(false);

    useEffect(() => {
      setTickets(allTickets && allTickets);
    }, []);

    const [selected, setSelected] = React.useState([]);
    const [order, setOrder] = React.useState("asc");
    const [orderBy, setOrderBy] = React.useState("calories");

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

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

    const [rows, setRows] = useState([]);

    useEffect(() => {
      tickets &&
        tickets.map((ticket, index) => {
          const ticketId = ticket.id;
          const title = ticket.title;
          const description = ticket.description;
          const created = ticket.created;
          const lastUpdated = ticket.lastUpdated;
          const project = ticket.project;
          const type = ticket.ticketType;
          const status = ticket.status;
          const owner = ticket.owner;
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

    return (
      <div
        className={collapsed ? "col-xl-6 " : "col-md-11 col-xl-6 col-lg-12 "}
      >
        <div className="tableWrapperDashboard">
          <div className="row ">
            <div className="col">
              <TicketsTableHeader
                tickets={tickets && tickets}
                setTickets={setTickets}
                setPage={setPage}
                setCurrentPage={setCurrentPage}
                page={page && page}
                currentPage={currentPage && currentPage}
                setSearching={setSearching}
                searching={searching}
                searchDisplay={rows.length < 1 && !searching && "none"}
              />
            </div>
          </div>

          <div className="row ">
            <div className="col">
              {(rows.length > 0) | searching ? (
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
                  rowsPerPageOptions={[5]}
                  rowsPerPage={rowsPerPage}
                  setRowsPerPage={setRowsPerPage}
                  page={page}
                  setPage={setPage}
                  toolbarMinHeight={"0px"}
                  className="dashboardTicketsTable"
                  tableHeadCellStyle={{ paddingRight: "5px" }}
                  tableHeight={{ lg: "18rem" }}
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
              ) : (
                <div
                  className="row noProjectsOrTicketsTableMessageRow"
                  style={{
                    backgroundColor: "rgb(18, 18, 18)",
                    borderRadius: "4px",
                    margin: "0rem .1px 4.129rem",
                  }}
                >
                  <div
                    className="col text-center noProjectsOrTicketsTableMessageCol"
                    style={{ paddingTop: "2.1rem" }}
                  >
                    <h4>No tickets yet</h4>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function ProjectsTableHeader(props) {
    const {
      projects,
      setProjects,
      setPage,
      currentPage,
      setCurrentPage,
      page,
      setSearching,
      searching,
      searchDisplay,
    } = props;

    const [projectsTableQuery, setProjectsTableQuery] = useState();

    function handleSearch(event) {
      let newSearchQuery = event.target.value;

      let filteredProjects = [];

      setProjectsTableQuery(newSearchQuery);

      allProjects &&
        allProjects.map((project) => {
          let projectName;
          let startDate;
          let endDate;

          projectName = project.projectName.toLowerCase();
          startDate = project.startDate.toLowerCase();
          endDate = project.endDate.toLowerCase();

          if (
            projectName.includes(newSearchQuery.toLowerCase()) ||
            startDate.includes(newSearchQuery.toLowerCase()) ||
            endDate.includes(newSearchQuery.toLowerCase())
          ) {
            if (newSearchQuery !== "") {
              filteredProjects.push(project);
            }
          }
        });

      if (newSearchQuery === "") {
        setProjects(allProjects);
        setPage(currentPage);
        setSearching(false);
      } else {
        if (!searching) {
          setCurrentPage(page);
          setSearching(true);
        }

        setPage(0);
        setProjects(filteredProjects);
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
              Projects
            </strong>
          </h2>
        </div>

        <div className="col-6 text-end" style={{ display: searchDisplay }}>
          <TextField
            id="outlined-basic"
            label="Search"
            variant="outlined"
            inputProps={{ sx: { color: "rgb(255, 255, 255)" } }}
            value={projectsTableQuery}
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

  function ProjectsTable() {
    let rowsArray = [];

    const [projects, setProjects] = useState();

    const [currentPage, setCurrentPage] = useState();
    const [searching, setSearching] = useState(false);

    useEffect(() => {
      setProjects(allProjects && allProjects);
    }, []);

    const [selected, setSelected] = React.useState([]);
    const [order, setOrder] = React.useState("asc");
    const [orderBy, setOrderBy] = React.useState("calories");

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [rows, setRows] = useState([]);

    function createData(projectName, startDate, endDate, priority, actions) {
      return {
        projectName,
        startDate,
        endDate,
        priority,
        actions,
      };
    }

    const headCells = [
      {
        id: "projectName",
        numeric: false,
        disablePadding: false,
        label: "Name",
      },
      {
        id: "startDate",
        numeric: true,
        disablePadding: false,
        label: "Start Date",
      },
      {
        id: "endDate",
        numeric: true,
        disablePadding: false,
        label: "End Date",
      },
      {
        id: "priority",
        numeric: true,
        disablePadding: false,
        label: "Priority",
      },
      {
        id: "actions",
        numeric: true,
        disablePadding: false,
        label: "Actions",
      },
    ];

    function onClickDetailsIcon(e, project) {
      navigate("/Projects/Details", {
        state: {
          projectId: project.id,
        },
      });
    }

    function onClickEditIcon(e, project) {
      navigate("/Projects/Edit", {
        state: {
          projectId: project.id,
        },
      });
    }

    useEffect(() => {
      projects &&
        projects.map((project, index) => {
          let projectImage;
          let imageData;
          const archivedStatus = project.archived;
          let isChecked;
          let isArchived;
          if (archivedStatus === false) {
            isArchived = false;
            isChecked = false;
          } else {
            isArchived = true;
            isChecked = true;
          }

          if (project.projectImage) {
            projectImage = project.projectImage.data;
          } else {
            projectImage = defaultImage;
          }
          if (projectImage) {
            imageData = Buffer.from(projectImage).toString("base64");
          } else {
          }

          const projectId = project.id;
          const name = project.projectName;
          const description = project.description;
          const startDate = project.startDate;
          const endDate = project.endDate;
          const archived = (
            <Checkbox
              onClick={(event) => {
                isArchived = !isArchived;
                setCurrentArchivedStatus(isArchived);

                axios(
                  process.env.REACT_APP_SERVER + "/projects/archivedStatus",
                  {
                    method: "POST",
                    data: {
                      userId: auth0Id && auth0Id,
                      projectId: projectId,
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
          const image = (
            <img
              alt=""
              style={{ width: "90px", height: "80px" }}
              className="card-img-top image"
              src={"data:image/pngbase64," + imageData}
            />
          );

          const priority = project.priority;
          const actions = (
            <div>
              <button
                onClick={(e) => {
                  onClickDetailsIcon(e, project);
                }}
                title="View Project Details "
                className="bi bi-info-circle-fill btn btn-sm dashboardTableButtons"
                style={{ paddingLeft: "0px" }}
              ></button>

              <button
                onClick={(e) => {
                  onClickEditIcon(e, project);
                }}
                title="Edit Project"
                className="bi bi-pencil-fill btn btn-sm p-2 dashboardTableButtons"
              ></button>

              <button
                onClick={(e) => {
                  axios
                    .post(process.env.REACT_APP_SERVER + "/Projects/Delete", {
                      projectId: project.id,
                      auth0Id: auth0Id,
                    })
                    .then((r) => {
                      axios
                        .post(process.env.REACT_APP_SERVER + "/Projects", {
                          auth0Id: auth0Id,
                        })
                        .then((r) => {
                          updatedProjectsList = r.data.projects;

                          setProjects(r.data.projects);
                        });
                    });
                }}
                type="button"
                title="Delete Project"
                className="bi bi-trash-fill  btn btn-sm dashboardTableButtons"
                style={{ paddingRight: "0px" }}
              ></button>
            </div>
          );

          rowsArray = [
            ...rowsArray,
            createData(name, startDate, endDate, priority, actions),
          ];
        });

      setRows(rowsArray);
    }, [projects]);

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

    return (
      <div
        className={
          collapsed
            ? "col-xl-6 projectsTableCol"
            : "col-md-11 col-xl-6 col-lg-12 projectsTableCol"
        }
      >
        <div className="tableWrapperDashboard">
          <div className="row">
            <div className="col">
              <ProjectsTableHeader
                projects={projects && projects}
                setProjects={setProjects}
                setPage={setPage}
                setCurrentPage={setCurrentPage}
                page={page && page}
                currentPage={currentPage && currentPage}
                setSearching={setSearching}
                searching={searching}
                searchDisplay={rows.length < 1 && !searching && "none"}
              />
            </div>
          </div>

          <div className="row">
            <div className="col">
              {(rows.length > 0) | searching ? (
                <EnhancedTable
                  size={"small"}
                  rows={rows ? rows : rows2}
                  selected={selected}
                  setSelected={setSelected}
                  order={order}
                  setOrder={setOrder}
                  orderBy={orderBy}
                  setOrderBy={setOrderBy}
                  headCells={headCells}
                  rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[5]}
                  setRowsPerPage={setRowsPerPage}
                  page={page}
                  setPage={setPage}
                  toolbarMinHeight={"0px"}
                  tableHeadCellStyle={{ paddingRight: "5px" }}
                  tableHeight={{ lg: "18rem" }}
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
                                width: "9rem !important",
                                paddingRight: "0px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {row.projectName}
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "rgb(255, 255, 255)",
                                borderBottom: "1px solid rgb(81, 81, 81)",
                                width: "115px !important",
                                paddingRight: "0px",
                                paddingLeft: "1.5rem",
                              }}
                              align="right"
                            >
                              {row.startDate}
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "rgb(255, 255, 255)",
                                borderBottom: "1px solid rgb(81, 81, 81)",
                                width: "110px !important",
                                paddingRight: "0px",
                              }}
                              align="right"
                            >
                              {row.endDate}
                            </TableCell>

                            <TableCell
                              sx={{
                                color: "rgb(255, 255, 255)",
                                borderBottom: "1px solid rgb(81, 81, 81)",
                                width: "70px !important",
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
                                width: "5rem !important",
                                paddingRight: "5px",
                                paddingLeft: "1.5rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
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
                  className="row noProjectsOrTicketsTableMessageRow"
                  style={{
                    backgroundColor: "rgb(18, 18, 18)",
                    borderRadius: "4px",
                    margin: "0rem .1px 4.129rem",
                  }}
                >
                  <div
                    className="col text-center noProjectsOrTicketsTableMessageCol"
                    style={{ paddingTop: "2.1rem" }}
                  >
                    <h4>No projects yet</h4>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  let barChartData = [];

  allProjects &&
    allProjects.map((project) => {
      let projectHasActiveTickets = false;

      let ticketCountForProject = 0;
      let devCountForProject = 0;

      allTickets &&
        allTickets.map((ticket) => {
          if (ticket.status !== "Resolved") {
            if (ticket.projectId === project.id.toString()) {
              projectHasActiveTickets = true;
            }
          }

          if (ticket.projectId === project.id.toString()) {
            ticketCountForProject = ticketCountForProject + 1;

            if (ticket.developer !== "Not Assigned") {
              devCountForProject = devCountForProject + 1;
            }
          }
        });

      if (projectHasActiveTickets) {
        const infoForChartData = {
          name: project.projectName,
          tickets: ticketCountForProject,
          developers: devCountForProject,
        };

        barChartData = [...barChartData, infoForChartData];
      }
    });

  class Chart extends PureComponent {
    render() {
      return (
        <Card
          sx={{
            backgroundColor: "rgb(18, 18, 18)",
            color: "rgb(255, 255, 255)",
            width: "100%",
            height: "100%",
          }}
        >
          <CardContent sx={{ width: "100%", height: "100%" }}>
            <h3 style={{ marginBottom: "0" }}>Projects</h3>
            <Typography
              sx={{ pb: "20px", mb: 0 }}
              align="center"
              gutterBottom
              variant="h6"
              component="div"
            >
              Tickets vs Developers{" "}
            </Typography>

            {displayProjectsBarchart === true ? (
              <ResponsiveContainer
                className="barChart"
                width="100%"
                height="70%"
              >
                <BarChart data={barChartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    className="chartTooltip"
                    contentStyle={{ backgroundColor: "rgb(18,18,18)" }}
                  />
                  <Legend />
                  <Bar
                    dataKey="tickets"
                    fill="#8884d8"
                    radius={[8.7, 8.7, 8.7, 8.7]}
                  />
                  <Bar
                    dataKey="developers"
                    fill="#82ca9d"
                    radius={[8.7, 8.7, 8.7, 8.7]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="row "
                style={{
                  backgroundColor: "rgb(18, 18, 18)",
                  borderRadius: "4px",
                }}
              >
                <div
                  className="col text-center "
                  style={{ paddingTop: "2.1rem", color: "rgb(167, 164, 158)" }}
                >
                  <h4>No tickets yet</h4>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }
  }

  if (isLoading) {
    return <div></div>;
  } else {
    return (
      <div className="width">
        <div className="container mt-3">
          <div className="row dashboardRow1">
            <div className="col-lg-6 text-center">
              <div className="row ticketsByStatusRow">
                <div
                  className={
                    collapsed
                      ? "col-xl-6 col-sm-6 ticketsByPriorityCol d-flex justify-content-center"
                      : "col-lg-6 col-md-11 col-sm-6 ticketsByPriorityCol d-flex justify-content-center"
                  }
                >
                  <TicketsByPriorityCard />
                </div>

                <div
                  className={
                    collapsed
                      ? "col-xl-6 col-sm-6 ticketsByStatusCol ticketsByStatusColPadding d-flex justify-content-center"
                      : " col-md-11 col-lg-6 col-sm-6 d-flex justify-content-center ticketsByStatusCol ticketsByStatusColMargin"
                  }
                >
                  <TicketsByStatusCard />
                </div>
              </div>
            </div>

            <div
              className={
                collapsed
                  ? "col-lg-6 chartsCol text-center"
                  : "col-md-11 col-lg-6 chartsCol text-center"
              }
            >
              <Chart />
            </div>
          </div>

          <div className="row mb-5">
            <TicketsTable />

            <ProjectsTable />
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;
