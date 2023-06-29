/* eslint-disable */
import axios from "axios";
import React, { useState, useEffect } from "react";
import Header from "../components/Header.js";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import Checkbox from "@mui/material/Checkbox";
import jwt from "jsonwebtoken";
import Stack from "@mui/material/Stack";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

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

function ManageTeam() {
  const { state } = useLocation();

  const [projectId, setProjectId] = useState(state.projectId);

  const date = new Date();

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let currentDate = month + "-" + day + "-" + year;

  const navigate = useNavigate();

  const { getAccessTokenSilently } = useAuth0();
  const [userId, setUserId] = useState();
  const [projects, setProjects] = useState();
  const [project, setProject] = useState();
  const [selectedProject, setSelectedProject] = useState();
  const [selectedTicketType, setSelectedTicketType] = useState();
  const [selectedPriority, setSelectedPriority] = useState();
  const [title, setTitle] = useState();
  const [description, setDescription] = useState();
  const [noTicketTitleError, setNoTicketTitleError] = useState();
  const [noTicketDescriptionError, setNoTicketDescriptionError] = useState();
  const [noSelectedProjectError, setNoSelectedProjectError] = useState();
  const [user, setUser] = useState();
  const [devs, setDevs] = useState();

  const [auth0Id, setAuth0Id] = useState();
  const [isLoading, setIsLoading] = useState(true);

  let newTeam = [];

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
              .post(process.env.REACT_APP_SERVER + "/Projects/Details/Info", {
                projectId: projectId && projectId,
              })
              .then((r) => {
                let project = r.data;

                axios
                  .get(process.env.REACT_APP_SERVER + "/getDevs")
                  .then((r) => {
                    setProject(project);

                    setDevs(r.data);

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

  if (project && project.teamMembers) newTeam = project.teamMembers;

  function assignTeamMembers() {
    axios
      .post(process.env.REACT_APP_SERVER + "/ManageTeam", {
        projectId: projectId && projectId,
        teamMembers: newTeam,
      })
      .then((r) => {
        setOpen(true);
        setProject(r.data);
      });
  }

  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const [open, setOpen] = React.useState(false);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  function CustomizedSnackbars(props) {
    return (
      <Stack spacing={2} sx={{ width: "100%" }}>
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert
            onClose={handleClose}
            severity="success"
            sx={{ width: "100%" }}
          >
            Successfully saved your changes.
          </Alert>
        </Snackbar>
      </Stack>
    );
  }

  function MembersList() {
    let currentTeam = project && project.teamMembers;
    useEffect(() => {}, []);

    return (
      devs &&
      devs.map((dev, index) => {
        let isChecked;

        currentTeam &&
          currentTeam.map((member) => {
            if (member.auth0Id === dev.auth0Id) {
              isChecked = true;
            }
          });

        function handleSetTeamMembers() {
          let isMember = false;

          newTeam &&
            newTeam.map((member) => {
              if (member.auth0Id === dev.auth0Id) {
                isMember = true;
              }
            });

          if (isMember) {
            newTeam = newTeam.filter((member) => {
              return member.auth0Id !== dev.auth0Id;
            });
          } else {
            newTeam.push(dev);
          }
        }

        let name;
        {
          name = dev.firstName + " " + dev.lastName;
        }

        return (
          <ListItem disablePadding>
            <ListItemIcon>
              <Checkbox
                onClick={handleSetTeamMembers}
                defaultChecked={isChecked}
              />
            </ListItemIcon>
            <ListItemText primary={name} />
          </ListItem>
        );
      })
    );
  }

  if (isLoading) {
    return <div></div>;
  } else {
    return (
      <div className="width">
        <CustomizedSnackbars />

        <div className="container mt-3">
          <div className="row justify-content-center">
            <div className="col-md-10 col-lg-8 col-xl-5">
              <div className="manageTeamDiv">
                <h4
                  className=" ps-3"
                  style={{ fontWeight: 300, marginBottom: "3rem" }}
                >
                  Assign team members
                </h4>

                <div className="row pb-4 px-3">
                  <div className="col-md-12">
                    <List
                      sx={{
                        width: "100%",
                        maxWidth: 360,
                        bgcolor: "#2b2b2b",
                        borderRadius: "4px",
                      }}
                    >
                      <MembersList />
                    </List>
                  </div>
                </div>

                <row class="row pe-3 g-3 mt-2 ">
                  <div class="col-6 ps-3">
                    <Link
                      to="/Projects/Details"
                      state={{ projectId: projectId && projectId }}
                    >
                      <Button
                        sx={{ textTransform: "none" }}
                        className="projectsCreateButton"
                      >
                        Back to project
                      </Button>
                    </Link>
                  </div>

                  <div class="col-6 text-end assignTeamButton">
                    <Button variant="contained" onClick={assignTeamMembers}>
                      Save
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

export default ManageTeam;
