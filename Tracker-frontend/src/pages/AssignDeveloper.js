/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

import { useNavigate, useLocation, Link } from "react-router-dom";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import jwt from "jsonwebtoken";

function AssignDeveloper() {
  const navigate = useNavigate();

  const { state } = useLocation();
  const [ticketId, setTicketId] = useState(state.ticketId);

  const { getAccessTokenSilently } = useAuth0();

  const [auth0Id, setAuth0Id] = useState();

  const [developers, setDevelopers] = useState();

  const [ticket, setTicket] = useState();
  const [developer, setDeveloper] = useState();
  const [user, setUser] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let userId;

    getAccessTokenSilently({ detailedResponse: true })
      .then((r) => {
        const decodeIdToken = async () => {
          const decodedIdToken = jwt.decode(r.id_token);

          userId = decodedIdToken.sub;

          if (userId) {
            setAuth0Id(userId);

            const usersFullName =
              decodedIdToken["https://ttttttttttttttt.com/name"];

            setUser(usersFullName);

            axios
              .post(process.env.REACT_APP_SERVER + "/Tickets/Details/Info", {
                ticketId: ticketId && ticketId,
              })
              .then((r) => {
                setTicket(r.data);

                axios
                  .get(process.env.REACT_APP_SERVER + "/getDevs")
                  .then((r) => {
                    setDevelopers(r.data);
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

  function handleSelectDeveloper(e) {
    let dev = e.target.value;
    setDeveloper(dev);
  }

  function handleAssignDeveloper(e) {
    ticket.developer = developer && developer;

    let ticketActivity;
    let comments;
    let project;
    let attachments;

    axios
      .post(
        process.env.REACT_APP_SERVER + "/Tickets/Activity/AssignDeveloper",
        {
          ticketId: ticketId && ticketId,
          auth0Id: auth0Id,
          developer: developer && developer,
          projectId: ticket && ticket.projectId,
          user: user && user,
        }
      )
      .then((r) => {
        axios
          .post(
            process.env.REACT_APP_SERVER + "/Tickets/Details/activityInfo",
            { id: ticket.id, auth0Id: auth0Id }
          )
          .then((r) => {
            ticketActivity = r.data;

            axios
              .post(
                process.env.REACT_APP_SERVER + "/Tickets/Details/ProjectInfo",
                {
                  auth0Id: auth0Id && auth0Id,
                  projectId: ticket && ticket.projectId,
                }
              )
              .then((r) => {
                project = r.data;

                axios
                  .post(
                    process.env.REACT_APP_SERVER +
                      "/Tickets/Details/CommentInfo",
                    {
                      ticketId: ticket && ticket.id,
                      auth0Id: auth0Id && auth0Id,
                    }
                  )
                  .then((r) => {
                    comments = r.data;

                    axios
                      .post(
                        process.env.REACT_APP_SERVER +
                          "/Tickets/Details/AttachmentInfo",
                        {
                          ticketId: ticket && ticket.id,
                          auth0Id: auth0Id && auth0Id,
                        }
                      )
                      .then((r) => {
                        attachments = r.data;

                        navigate("/Tickets/Details", {
                          state: {
                            ticketId: ticketId && ticketId,
                          },
                        });
                      });
                  });
              });
          });
      });
  }

  if (isLoading) {
    return <div></div>;
  } else {
    return (
      <div className="width">
        <div className="container mt-3">
          <div className="row justify-content-center">
            <div className="col-md-10 col-lg-8 col-xl-5">
              <div className="ticketsCreateDiv mt-4">
                <h3
                  className="ps-3"
                  style={{ fontWeight: 300, marginBottom: "2rem" }}
                >
                  Assign Developer
                </h3>

                <h4 style={{ fontWeight: "200" }} className="ps-3">
                  {ticket && ticket.title}
                </h4>

                <Link
                  to="/Projects/Details"
                  state={{ projectId: ticket && ticket.projectId }}
                  style={{ paddingLeft: ".48rem" }}
                >
                  <Button sx={{ textTransform: "none" }}>
                    {ticket && ticket.project}
                  </Button>
                </Link>

                <p className="ps-3 mt-5 mb-0">
                  {ticket && "Ticket Description: " + ticket.description}
                </p>

                <div className="row px-3 pb-4 mt-5">
                  <div className="col-md-12">
                    <FormControl
                      fullWidth
                      variant="outlined"
                      className="select"
                    >
                      <InputLabel>Developer</InputLabel>
                      <Select
                        sx={{ svg: { color: "#707070" }, color: "#969292" }}
                        labelId="projectSelectLabel"
                        onChange={handleSelectDeveloper}
                        value={developer}
                        label="Developer"
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
                        {developers &&
                          developers.map((dev, index) => {
                            const devName = dev.firstName + " " + dev.lastName;
                            return (
                              <MenuItem key={index} value={devName}>
                                {" "}
                                {devName}{" "}
                              </MenuItem>
                            );
                          })}
                      </Select>
                    </FormControl>
                  </div>
                </div>

                <row class="row pe-3 g-3 mt-4">
                  <div class="mb-2 ps-3">
                    <Link to="/Tickets/Unassigned">
                      <Button sx={{ textTransform: "none" }}>
                        Unassigned Tickets
                      </Button>
                    </Link>
                  </div>

                  <div class="col-6 ps-3 projectsCreateButton">
                    <Link
                      to="/Tickets/Details"
                      state={{ ticketId: ticketId && ticketId }}
                    >
                      <Button
                        sx={{ textTransform: "none" }}
                        className="projectsCreateButton"
                      >
                        Back to Ticket
                      </Button>
                    </Link>
                  </div>

                  <div class="col-6  text-end">
                    <Button variant="contained" onClick={handleAssignDeveloper}>
                      Assign
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

export default AssignDeveloper;
