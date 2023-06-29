/* eslint-disable */
import axios from "axios";
import React, { useState, useEffect } from "react";
import Header from "../components/Header.js";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, Link } from "react-router-dom";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import Button from "@mui/material/Button";
import { FormHelperText } from "@mui/material";
import jwt from "jsonwebtoken";

const CustomTextField = styled(TextField, {
  shouldForwardProp: (props) => props !== "focusColor",
})((p) => ({
  "& .MuiInputLabel-root": { color: "rgb(118, 114, 105)" },
  "& .MuiOutlinedInput-root": {
    "& > fieldset": { borderColor: "#292b2d" },
  },
  "& .MuiOutlinedInput-root.Mui-focused": {
    "& > fieldset": {
      borderColor: "#1976d2",
    },
  },
  "& .MuiOutlinedInput-root:hover": {
    "& > fieldset": {
      borderColor: "#252525",
    },
  },
  "& .MuiOutlinedInput-root.Mui-focused:hover": {
    "& > fieldset": {
      borderColor: "#1976d2",
    },
  },
}));

function TicketsCreate() {
  const date = new Date();

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let currentDate = month + "-" + day + "-" + year;

  const navigate = useNavigate();

  const { getAccessTokenSilently } = useAuth0();
  const [userId, setUserId] = useState();
  const [projectId, setProjectId] = useState();
  const [projects, setProjects] = useState();
  const [selectedProject, setSelectedProject] = useState();
  const [selectedTicketType, setSelectedTicketType] = useState();
  const [selectedPriority, setSelectedPriority] = useState();
  const [title, setTitle] = useState();
  const [description, setDescription] = useState();
  const [noTicketTitleError, setNoTicketTitleError] = useState();
  const [noTicketDescriptionError, setNoTicketDescriptionError] = useState();
  const [noSelectedProjectError, setNoSelectedProjectError] = useState();
  const [user, setUser] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const [auth0Id, setAuth0Id] = useState();

  useEffect(() => {
    let userId;

    getAccessTokenSilently({ detailedResponse: true })
      .then((r) => {
        const decodeIdToken = async () => {
          const decodedIdToken = jwt.decode(r.id_token);

          userId = decodedIdToken.sub;

          if (userId) {
            const usersFullName =
              decodedIdToken["https://ttttttttttttttt.com/name"];

            setAuth0Id(userId);
            setUser(usersFullName);

            setUserId(userId);

            axios
              .post(
                process.env.REACT_APP_SERVER + "/Tickets/Create/ProjectInfo",
                { id: userId }
              )
              .then((r) => {
                setProjects(r.data);
                setProjectId(r.data.length > 0 && r.data[0].id);
                setSelectedProject(r.data.length > 0 && r.data[0].projectName);
                setSelectedTicketType("New Development");
                setSelectedPriority("Low");
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

  const [projectName, setProjectName] = useState();

  function getProjectId(id) {
    setProjectId(id);
  }

  function handleTicketTypeSelect(e) {
    setSelectedTicketType(e.target.value);
  }

  function handlePrioritySelect(e) {
    setSelectedPriority(e.target.value);
  }

  function createTicket() {
    if (!title || !description || !selectedProject) {
      if (!title) {
        setNoTicketTitleError(true);
      }
      if (!description) {
        setNoTicketDescriptionError(true);
      }
      if (!selectedProject) {
        setNoSelectedProjectError(true);
      }
    } else {
      axios
        .post(process.env.REACT_APP_SERVER + "/Tickets/Create", {
          currentDate: currentDate,
          auth0Id: userId,
          projectId: projectId && projectId,
          status: "New",
          title: title,
          description: description,
          ticketType: selectedTicketType,
          priority: selectedPriority,
          project: selectedProject,
          auth0Id: auth0Id && auth0Id,
          user: user && user,
        })
        .then((r) => {
          navigate("/Tickets");
        });
    }
  }

  if (isLoading) {
    return <div></div>;
  } else {
    return (
      <div className="width">
        <div className="container mt-3">
          <div className="row justify-content-center">
            <div className="col-md-10 col-lg-8 col-xl-5">
              <div className="ticketsCreateDiv">
                <h4
                  className=" ps-3"
                  style={{ fontWeight: 300, marginBottom: "3rem" }}
                >
                  Create Ticket
                </h4>

                <div className="row pb-4 px-3">
                  <div className="col-md-12">
                    <CustomTextField
                      id="outlined-multiline-static"
                      label="Title"
                      name="title"
                      className="muiTextField"
                      inputProps={{ style: { color: "#969292" } }}
                      sx={{
                        width: "100%",
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: noTicketTitleError ? "#c44438 !important" : "",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: noTicketTitleError
                            ? "#c44438 !important"
                            : "",
                        },
                        "& .MuiInputLabel-root": {
                          color:
                            noTicketTitleError && !title
                              ? "rgb(118, 114, 105) !important"
                              : noTicketTitleError && title
                              ? "#c44438"
                              : "rgb(118, 114, 105) !important",
                        },
                      }}
                      onChange={(e) => {
                        setTitle(e.target.value);
                      }}
                      value={title}
                      size="medium"
                      variant="outlined"
                      helperText={noTicketTitleError && "Enter title"}
                    />
                  </div>
                </div>

                <div className="row px-3 pb-4">
                  <div className="col-md-12">
                    <CustomTextField
                      multiline
                      rows={2.5}
                      id="outlined-multiline-static"
                      label="Description"
                      name="description"
                      className="muiTextField"
                      inputProps={{ style: { color: "#969292" } }}
                      sx={{
                        width: "100%",
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: noTicketDescriptionError
                            ? "#c44438 !important"
                            : "",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: noTicketDescriptionError
                            ? "#c44438 !important"
                            : "",
                        },
                        "& .MuiInputLabel-root": {
                          color:
                            noTicketDescriptionError && !description
                              ? "rgb(118, 114, 105) !important"
                              : noTicketDescriptionError && description
                              ? "#c44438"
                              : "rgb(118, 114, 105) !important",
                        },
                      }}
                      onChange={(e) => {
                        setDescription(e.target.value);
                      }}
                      value={description}
                      size="medium"
                      variant="outlined"
                      helperText={
                        noTicketDescriptionError && "Enter description"
                      }
                    />
                  </div>
                </div>
                <div className="row px-3 pb-4">
                  <div className="col-md-12">
                    <FormControl
                      fullWidth
                      variant="outlined"
                      className="select"
                    >
                      <InputLabel id="ticketTypeSelectLabel">
                        Ticket Type
                      </InputLabel>
                      <Select
                        sx={{ svg: { color: "#707070" }, color: "#969292" }}
                        labelId="ticketTypeSelectLabel"
                        id="ticketTypeSelect"
                        value={selectedTicketType ? selectedTicketType : ""}
                        label="Ticket Type"
                        name="ticketType"
                        onChange={handleTicketTypeSelect}
                        inputProps={{
                          MenuProps: {
                            MenuListProps: {
                              sx: {
                                backgroundColor: "rgb(131, 131, 131)",
                              },
                            },
                          },
                        }}
                      >
                        <MenuItem value={"New Development"}>
                          New Development
                        </MenuItem>
                        <MenuItem value={"Work task"}>Work task</MenuItem>
                        <MenuItem value={"Defect"}>Defect</MenuItem>
                        <MenuItem value={"Change Request"}>
                          Change Request
                        </MenuItem>
                        <MenuItem value={"Enhancement"}>Enhancement</MenuItem>
                        <MenuItem value={"General Task"}>General Task</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </div>

                <div className="row px-3 pb-4">
                  <div className="col-md-12">
                    <FormControl
                      fullWidth
                      variant="outlined"
                      className="select"
                    >
                      <InputLabel>Project</InputLabel>
                      <Select
                        sx={{
                          svg: { color: "#707070" },
                          color: "#969292",

                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: noSelectedProjectError
                              ? "#c44438 !important"
                              : "",
                          },
                        }}
                        labelId="projectSelectLabel"
                        value={selectedProject ? selectedProject : ""}
                        disabled={projects && projects.length === 0 && true}
                        label="Project"
                        name="project"
                        inputProps={{
                          MenuProps: {
                            MenuListProps: {
                              sx: {
                                backgroundColor: "rgb(131, 131, 131)",
                              },
                            },
                          },
                        }}
                      >
                        {projects &&
                          projects.map((project, index) => {
                            return (
                              <MenuItem
                                onClick={() => {
                                  setSelectedProject(project.projectName);
                                  getProjectId(project.id);
                                }}
                                key={index}
                                value={project.projectName}
                              >
                                {project.projectName}
                              </MenuItem>
                            );
                          })}
                      </Select>
                    </FormControl>

                    {noSelectedProjectError && (
                      <FormHelperText
                        sx={{
                          color: "#c44438 !important",
                          marginLeft: "14px",
                          marginTop: "4px",
                        }}
                      >
                        {projects && projects.length === 0
                          ? "Project is required, no projects created yet"
                          : "Select project"}
                      </FormHelperText>
                    )}
                  </div>
                </div>

                <div className="row px-3 pb-4">
                  <div className="col-md-12">
                    <FormControl
                      fullWidth
                      variant="outlined"
                      className="select"
                    >
                      <InputLabel id="prioritySelectLabel">Priority</InputLabel>
                      <Select
                        sx={{ svg: { color: "#707070" }, color: "#969292" }}
                        labelId="prioritySelectLabel"
                        id="prioritySelect"
                        value={selectedPriority ? selectedPriority : ""}
                        label="Priority"
                        name="priority"
                        onChange={handlePrioritySelect}
                        inputProps={{
                          MenuProps: {
                            MenuListProps: {
                              sx: {
                                backgroundColor: "rgb(131, 131, 131)",
                              },
                            },
                          },
                        }}
                      >
                        <MenuItem value={"Low"}>Low</MenuItem>
                        <MenuItem value={"Medium"}>Medium</MenuItem>
                        <MenuItem value={"High"}>High</MenuItem>
                        <MenuItem value={"Urgent"}>Urgent</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </div>

                <row class="row pe-3 g-3 mt-2 ">
                  <div class="col-6 ps-3">
                    <Link to="/Tickets">
                      <Button
                        sx={{ textTransform: "none" }}
                        className="projectsCreateButton"
                      >
                        Back to all Tickets
                      </Button>
                    </Link>
                  </div>

                  <div class="col-6 text-end">
                    <Button variant="contained" onClick={createTicket}>
                      Create
                    </Button>
                  </div>
                </row>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default TicketsCreate;
