/* eslint-disable */
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EnhancedTable from "../components/EnhancedTable.js";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import jwt from "jsonwebtoken";

function ProjectsUnassigned() {
  const navigate = useNavigate();

  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const userId = isAuthenticated && user.sub;
  const [auth0Id, setAuth0Id] = useState();

  const [defaultImage, setDefaultImage] = useState();
  const [allProjects, setAllProjects] = useState();

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
              .post(process.env.REACT_APP_SERVER + "/Projects", {
                auth0Id: userId,
              })
              .then((r) => {
                const unassignedProjects = [];

                r.data.projects.map((project) => {
                  if (!project.projectManager) {
                    unassignedProjects.push(project);
                  }
                });

                setAllProjects(unassignedProjects);
                setInitialArchivedStatus(
                  unassignedProjects.length > 0 && unassignedProjects.archived
                );
                setDefaultImage(r.data.defaultImage);
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

  function createData(
    projectName,
    description,
    startDate,
    endDate,
    archived,
    image,
    priority,
    actions
  ) {
    return {
      projectName,
      description,
      startDate,
      endDate,
      archived,
      image,
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
      id: "description",
      numeric: true,
      disablePadding: false,
      label: "Description",
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
      id: "archived",
      numeric: true,
      disablePadding: false,
      label: "Archived",
    },
    {
      id: "image",
      numeric: true,
      disablePadding: false,
      label: "Image",
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
      projects,
      setProjects,
      setPage,
      currentPage,
      setCurrentPage,
      page,
      setSearching,
      searching,
    } = props;

    const [projectsTableQuery, setProjectsTableQuery] = useState();

    function handleSearch(event) {
      let newSearchQuery = event.target.value;

      let filteredProjects = [];

      setProjectsTableQuery(newSearchQuery);

      allProjects &&
        allProjects.map((project) => {
          let name;
          let description;
          let startDate;
          let endDate;

          name = project.projectName.toLowerCase();
          description =
            project.description && project.description.toLowerCase();
          startDate = project.startDate.toLowerCase();
          endDate = project.endDate.toLowerCase();

          if (
            name.includes(newSearchQuery.toLowerCase()) ||
            (description &&
              description.includes(newSearchQuery.toLowerCase())) ||
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
              Unassigned Projects
            </strong>
          </h2>
        </div>

        <div className="col-6 text-end">
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

  function ProjectTable() {
    const [projects, setProjects] = useState();
    const [currentArchivedStatus, setCurrentArchivedStatus] = useState();

    const [currentPage, setCurrentPage] = useState();
    const [searching, setSearching] = useState(false);

    const [selected, setSelected] = React.useState([]);
    const [order, setOrder] = React.useState("asc");
    const [orderBy, setOrderBy] = React.useState("calories");

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [rows, setRows] = useState([]);

    const isSelected = (name) => selected.indexOf(name) !== -1;

    let rowsArray = [];

    useEffect(() => {
      setProjects(allProjects && allProjects);
      setCurrentArchivedStatus(initialArchivedStatus);
    }, []);

    function onClickDetailsIcon(e, project) {
      navigate("/Projects/Details", {
        state: {
          projectId: project.id,
        },
      });
    }

    function onClickEditIcon(e, project) {
      let projectInfo = {
        project: project,
      };
      axios
        .post(
          process.env.REACT_APP_SERVER + "/Projects/Edit/InfoFromProjectsTable",
          projectInfo
        )
        .then((res) => {
          navigate("/Projects/Edit");
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
            projectImage = project.projectImage;
          } else {
            projectImage = defaultImage;
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

                axios(process.env.REACT_APP_SERVER + "/projects/archived", {
                  method: "POST",
                  data: {
                    userId: userId,
                    projectId: projectId,
                    archived: isArchived,
                  },
                }).then((r) => {
                  setContacts(r.data);
                });
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
              src={"data:image/png;base64," + projectImage}
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
                className="bi bi-info-circle-fill btn btn-sm p-2"
              ></button>
              <button
                onClick={(e) => {
                  onClickEditIcon(e, project);
                }}
                title="Edit Project"
                className="bi bi-pencil-fill btn btn-sm p-2"
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
                        .get(process.env.REACT_APP_SERVER + "/Projects")
                        .then((r) => {
                          setProjects(r.data.projects);
                          setCurrentArchivedStatus(r.data.projects.archived);
                          setDefaultImage(r.data.defaultImage);
                        });
                    });
                }}
                type="button"
                title="Delete Project"
                className="bi bi-trash-fill  btn btn-sm p-2"
                data-bs-target="#exampleModal"
              ></button>
            </div>
          );

          rowsArray = [
            ...rowsArray,
            createData(
              name,
              description,
              startDate,
              endDate,
              archived,
              image,
              priority,
              actions
            ),
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

    return (
      <div className="tableWrapper">
        <div className="row">
          <div className="col">
            {(rows.length > 0) | searching ? (
              <TableHeader
                setProjects={setProjects}
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
                              minWidth: "9.9rem",
                            }}
                          >
                            {row.projectName}
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "rgb(255, 255, 255)",
                              borderBottom: "1px solid rgb(81, 81, 81)",
                            }}
                            align="right"
                          >
                            {row.description}
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "rgb(255, 255, 255)",
                              borderBottom: "1px solid rgb(81, 81, 81)",
                            }}
                            align="right"
                          >
                            {row.startDate}
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "rgb(255, 255, 255)",
                              borderBottom: "1px solid rgb(81, 81, 81)",
                            }}
                            align="right"
                          >
                            {row.endDate}
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "rgb(255, 255, 255)",
                              borderBottom: "1px solid rgb(81, 81, 81)",
                            }}
                            align="right"
                          >
                            {row.archived}
                          </TableCell>

                          <TableCell
                            sx={{
                              color: "rgb(255, 255, 255)",
                              borderBottom: "1px solid rgb(81, 81, 81)",
                              paddingTop: "8px",
                              paddingBottom: "8px",
                            }}
                            align="right"
                          >
                            {row.image}
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
                              minWidth: "7rem",
                              paddingRight: "4px",
                              paddingLeft: "0px",
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
                  <h4>No unassigned projects</h4>
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
          <ProjectTable />
        </div>
      </div>
    );
  }
}

export default ProjectsUnassigned;
