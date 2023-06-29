/* eslint-disable */
import axios from "axios";
import React, { useState, useEffect } from "react";
import Header from "../components/Header.js";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";

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

function TicketsEdit() {
  const navigate = useNavigate();

  const { state } = useLocation();

  const [ticketId, setTicketId] = useState(state.ticketId);

  const { getAccessTokenSilently } = useAuth0();
  const [userId, setUserId] = useState();
  const [ticketToEdit, setTicketToEdit] = useState();
  const [projectId, setProjectId] = useState();
  const [projects, setProjects] = useState();
  const [selectedProject, setSelectedProject] = useState();
  const [status, setStatus] = useState();
  const [priority, setPriority] = useState();
  const [ticketTitle, setTicketTitle] = useState();
  const [selectedTicketType, setSelectedTicketType] = useState();
  const [selectedPriority, setSelectedPriority] = useState();
  const [description, setDescription] = useState();
  const [ticketType, setTicketType] = useState();
  const [title, setTitle] = useState();
  const [noTicketTitleError, setNoTicketTitleError] = useState();
  const [noTicketDescriptionError, setNoTicketDescriptionError] = useState();
  const [user, setUser] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const [auth0Id, setAuth0Id] = useState();

  useEffect(() => {
    let userId;

    let allProjects;
    let ticket;

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
                process.env.REACT_APP_SERVER + "/Tickets/Edit/ProjectInfo",
                { id: userId }
              )
              .then((r) => {
                allProjects = r.data;

                axios
                  .post(process.env.REACT_APP_SERVER + "/Tickets/Edit/Info", {
                    ticketId: ticketId && ticketId,
                    auth0Id: userId,
                  })
                  .then((r) => {
                    ticket = r.data;

                    setProjects(allProjects);

                    setTicketToEdit(ticket);
                    setProjectId(ticket.projectId);
                    setSelectedProject(ticket.project);
                    setStatus(ticket.status);
                    setPriority(ticket.priority);
                    setTicketTitle(ticket.title);
                    setDescription(ticket.description);
                    setTicketType(ticket.ticketType);
                    setIsLoading(false);
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

  const [projectName, setProjectName] = useState();

  function handleProjectSelect(e) {
    setProjectId(e.target.id);
    setSelectedProject(e.target.value);
  }

  const DisplayProjects = () => {
    return (
      <FormControl fullWidth variant="outlined" className="select">
        <InputLabel id="projectSelectLabel">Project</InputLabel>
        <Select
          sx={{ svg: { color: "#707070" }, color: "#969292" }}
          labelId="projectSelectLabel"
          id="projectSelect"
          value={
            selectedProject && selectedProject !== "" ? selectedProject : ""
          }
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
            projects.map((project) => {
              return (
                <MenuItem
                  onClick={() => {
                    setSelectedProject(project.projectName);
                    getProjectId(project.id);
                  }}
                  value={project.projectName}
                >
                  {project.projectName}
                </MenuItem>
              );
            })}
        </Select>
      </FormControl>
    );
  };

  function DisplayTicketType() {
    return (
      <FormControl fullWidth variant="outlined" className="select">
        <InputLabel id="ticketTypeSelectLabel">Ticket Type</InputLabel>
        <Select
          sx={{ svg: { color: "#707070" }, color: "#969292" }}
          labelId="ticketTypeSelectLabel"
          id="ticketTypeSelect"
          label="Ticket Type"
          name="ticketType"
          value={ticketType}
          onChange={handleTicketType}
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
          <MenuItem value={"New Development"}>New Development</MenuItem>
          <MenuItem value={"Work Task"}>Work task</MenuItem>
          <MenuItem value={"Defect"}>Defect</MenuItem>
          <MenuItem value={"Change Request"}>Change Request</MenuItem>
          <MenuItem value={"Enhancement"}>Enhancement</MenuItem>
          <MenuItem value={"General Task"}>General Task</MenuItem>
        </Select>
      </FormControl>
    );
  }

  function DisplayTicketPriority() {
    return (
      <FormControl fullWidth variant="outlined" className="select">
        <InputLabel id="prioritySelectLabel">Priority</InputLabel>
        <Select
          sx={{ svg: { color: "#707070" }, color: "#969292" }}
          labelId="prioritySelectLabel"
          id="prioritySelect"
          label="Priority"
          name="priority"
          value={priority}
          onChange={handleSelectPriority}
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
    );
  }

  function DisplayTicketStatus() {
    return (
      <FormControl fullWidth variant="outlined" className="select">
        <InputLabel id="statusSelectLabel">Status</InputLabel>
        <Select
          sx={{ svg: { color: "#707070" }, color: "#969292" }}
          labelId="statusSelectLabel"
          id="statusSelect"
          label="Status"
          name="status"
          value={status}
          onChange={handleSelectStatus}
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
          <MenuItem value={"New"}>New</MenuItem>
          <MenuItem value={"Development"}>Development</MenuItem>
          <MenuItem value={"Testing"}>Testing</MenuItem>
          <MenuItem value={"Resolved"}>Resolved</MenuItem>
        </Select>
      </FormControl>
    );
  }

  function handleSelectStatus(e) {
    setStatus(e.target.value);
  }
  function handleSelectPriority(e) {
    setPriority(e.target.value);
  }

  function handleTicketTitle(e) {
    setTicketTitle(e.target.value);
  }

  function handleDescription(e) {
    setDescription(e.target.value);
  }

  function handleTicketType(e) {
    setTicketType(e.target.value);
  }

  function editTicket() {
    if (
      !ticketTitle ||
      !description ||
      ticketTitle === "" ||
      description === ""
    ) {
      if (!ticketTitle) {
        setNoTicketTitleError(true);
      }
      if (!description) {
        setNoTicketDescriptionError(true);
      }
    } else {
      axios
        .post(process.env.REACT_APP_SERVER + "/Tickets/Edit", {
          auth0Id: auth0Id,
          projectId: projectId && projectId,
          status: status,
          title: ticketTitle,
          description: description,
          ticketType: ticketType,
          priority: priority,
          project: selectedProject,
          auth0Id: auth0Id,
          ticketId: ticketToEdit && ticketToEdit.id,
          projectId: projectId,
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
          <form
            action="http://localhost:3025/tickets/Edit"
            method="post"
            noValidate
          >
            <div className="row justify-content-center">
              <div className="col-md-10 col-lg-8 col-xl-5">
                <div className="ticketsCreateDiv">
                  <h4
                    className=" ps-3"
                    style={{ fontWeight: 300, marginBottom: "2rem" }}
                  >
                    Edit Ticket
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
                            color: noTicketTitleError
                              ? "#c44438 !important"
                              : "",
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: noTicketTitleError
                              ? "#c44438 !important"
                              : "",
                          },
                          "& .MuiInputLabel-root": {
                            color:
                              noTicketTitleError && !ticketTitle
                                ? "rgb(118, 114, 105) !important"
                                : noTicketTitleError && ticketTitle
                                ? "#c44438"
                                : "rgb(118, 114, 105) !important",
                          },
                        }}
                        size="medium"
                        variant="outlined"
                        value={ticketTitle ? ticketTitle : ""}
                        defaultValue={ticketTitle}
                        helperText={noTicketTitleError && "Enter title"}
                        onChange={handleTicketTitle}
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
                        size="medium"
                        variant="outlined"
                        onChange={handleDescription}
                        value={description ? description : ""}
                        helperText={
                          noTicketDescriptionError && "Enter description"
                        }
                      />
                    </div>
                  </div>

                  <div className="row px-3 pb-4">
                    <div className="col-md-12">
                      <DisplayTicketType />
                    </div>
                  </div>

                  <div className="row px-3 pb-4">
                    <div className="col-md-12">
                      <DisplayProjects />
                    </div>
                  </div>

                  <div className="row px-3 pb-4">
                    <div className="col-md-12">
                      <DisplayTicketPriority />
                    </div>
                  </div>

                  <div className="row px-3 pb-4">
                    <div className="col-md-12">
                      <DisplayTicketStatus />
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
                      <Button onClick={editTicket} variant="contained">
                        Save
                      </Button>
                    </div>
                  </row>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default TicketsEdit;
