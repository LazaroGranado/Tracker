/* eslint-disable */
import React, { useEffect, useState, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import { CardHeader } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import fileDownload from "js-file-download";
import b64toBlob from "b64-to-blob";
import Divider from "@mui/material/Divider";
import jwt from "jsonwebtoken";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import InfoIcon from "@mui/icons-material/Info";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import _ from "lodash";

const CustomTextField = styled(TextField, {
  shouldForwardProp: (props) => props !== "focusColor",
})((p) => ({
  "& .MuiInputLabel-root.Mui-focused": {
    color: "rgb(144,202,248) !important",
    height: "4.15rem !important",
  }, //styles the label
  "& .MuiInputLabel-root": {
    color: "rgb(98,98,98) !important",
    height: "4.15rem !important",
  },

  "& .MuiOutlinedInput-root": {
    "& > fieldset": {
      borderColor: "transparent",
      borderRadius: "20px",
      height: "4.15rem !important",
    },
  },
  "& .MuiOutlinedInput-root.Mui-focused": {
    "& > fieldset": {
      borderColor: "rgb(144,202,248) !important",
      paddingTop: "0 !important",
      height: "4.15rem !important",
    },
  },
  width: { sm: 250, md: 350 },
  "& .MuiOutlinedInput-root:hover": {
    "& > fieldset": {
      borderColor: "rgb(255,255,255)",
      height: "4.15rem !important",
    },
  },
  "& .MuiOutlinedInput-root.Mui-focused:hover": {
    "& > fieldset": {
      borderColor: "#1976d2",
      borderRadius: "20px",
      height: "4.15rem !important",
    },
  },
  "& .MuiOutlinedInput-root": {
    borderColor: "transparent",
    borderRadius: "20px",
    height: "3.8rem !important",
  },
}));

import { FilePond, File, registerPlugin } from "react-filepond";

import "filepond/dist/filepond.min.css";

import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import FilePondPluginFileEncode from "filepond-plugin-file-encode";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginFileRename from "filepond-plugin-file-rename";
import FilePondPluginGetFile from "filepond-plugin-get-file";

registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileEncode,
  FilePondPluginFileValidateType,
  FilePondPluginFileRename,
  FilePondPluginGetFile
);

function TicketsDetails(props) {
  const navigate = useNavigate();

  const { state } = useLocation();

  const [ticketId, setTicketId] = useState(state.ticketId);

  const { getAccessTokenSilently } = useAuth0();
  const [userId, setUserId] = useState();
  const [cameFromSearch, setCameFromSearch] = useState(false);
  const [ticketToView, setTicketToView] = useState();
  const [activityInfo, setActivityInfo] = useState();
  const [project, setProject] = useState();
  const [comments, setComments] = useState();
  const [commentText, setCommentText] = useState();
  const [attachments, setAttachments] = useState([]);
  const [defaultImage, setDefaultImage] = useState();
  const [auth0Id, setAuth0Id] = useState();
  const [user, setUser] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const [files, setFiles] = useState();

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

            setUserId(userId);
            setAuth0Id(userId);
            setUser(usersFullName);

            let ticketActivity;
            let comments;
            let project;
            let attachments;
            let ticket;

            axios
              .post(process.env.REACT_APP_SERVER + "/Tickets/Details/Info", {
                ticketId: ticketId && ticketId,
                auth0Id: userId,
              })
              .then((r) => {
                ticket = r.data;

                axios
                  .post(
                    process.env.REACT_APP_SERVER +
                      "/Tickets/Details/activityInfo",
                    { id: ticket.id, auth0Id: auth0Id }
                  )
                  .then((r) => {
                    ticketActivity = r.data;
                    ticketActivity = _.orderBy(ticketActivity, "id");

                    axios
                      .post(
                        process.env.REACT_APP_SERVER +
                          "/Tickets/Details/ProjectInfo",
                        {
                          auth0Id: userId,
                          projectId: ticket.projectId,
                        }
                      )
                      .then((r) => {
                        project = r.data;

                        axios
                          .post(
                            process.env.REACT_APP_SERVER +
                              "/Tickets/Details/CommentInfo",
                            {
                              ticketId: ticket.id,
                              auth0Id: userId,
                            }
                          )
                          .then((r) => {
                            comments = r.data;

                            axios
                              .post(
                                process.env.REACT_APP_SERVER +
                                  "/Tickets/Details/AttachmentInfo",
                                {
                                  ticketId: ticket.id,
                                  auth0Id: userId,
                                }
                              )
                              .then((r) => {
                                attachments = r.data;

                                setTicketToView(ticket);
                                setProject(project);
                                setComments(comments.reverse());
                                setAttachments(attachments);
                                setActivityInfo(ticketActivity.reverse());
                                setIsLoading(false);
                              });
                          });
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

  function handleNavigateToProjectDetails() {
    navigate("/Projects/Details", {
      state: { projectId: project && project.id },
    });
  }

  function handleSubmitFile(e) {
    if (fileInput && fileInput.files.length === 0) {
      e.preventDefault();
    }
  }

  function handleCommentInput(e) {
    setCommentText(e.target.value);
  }

  function handleClickToAssign(e) {
    navigate("/Tickets/AssignDeveloper", {
      state: { ticketId: ticketToView && ticketToView.id },
    });
  }

  function handleClickEditTicket(e) {
    axios
      .post(process.env.REACT_APP_SERVER + "/Tickets/Edit/ProjectInfo", {
        id: auth0Id && auth0Id,
      })
      .then((r) => {
        let projectsData = r.data;

        navigate("/Tickets/Edit", {
          state: {
            project: projectsData,
            ticketId: ticketToView && ticketToView.id,
          },
        });
      });
  }

  function handleDeleteTicket() {
    axios
      .post(process.env.REACT_APP_SERVER + "/Tickets/Details/DeleteTicket", {
        ticketId: ticketToView.id,
        auth0Id: auth0Id && auth0Id,
      })
      .then((r) => {
        navigate("/tickets");
      });
  }

  function handleCreateComment(e) {
    if (commentText) {
      axios(process.env.REACT_APP_SERVER + "/Tickets/Details/CreateComment", {
        method: "post",
        data: {
          comment: commentText && commentText,
          ticketId: ticketToView && ticketToView.id,
          user: user && user,
          auth0Id: auth0Id && auth0Id,
          ticketTitle: ticketToView && ticketToView.title,
          projectId: ticketToView && ticketToView.projectId,
        },
      }).then((r) => {
        axios(process.env.REACT_APP_SERVER + "/Tickets/Details/CommentInfo", {
          method: "post",
          data: {
            ticketId: ticketToView && ticketToView.id,
            auth0Id: auth0Id,
          },
        }).then((r) => {
          axios
            .post(
              process.env.REACT_APP_SERVER + "/Tickets/Details/activityInfo",
              {
                id: ticketId && ticketId,
              }
            )
            .then((res) => {
              setActivityInfo(res.data.reverse());
            });
          setComments(r.data.reverse());
          setCommentText("");
        });
      });
    }
  }

  function DisplayAttachments() {
    {
      return (
        attachments &&
        attachments.map((attachment) => {
          let projectImage;
          let imageData;
          let attachmentImage;

          if (attachment.attachment) {
            attachmentImage = attachment.attachment.data;
          } else {
            attachmentImage = defaultImage;
          }
          if (attachmentImage) {
            imageData = Buffer.from(attachmentImage).toString("base64");
          } else {
          }
        })
      );
    }
  }

  function DisplayAssignDev() {
    if (ticketToView && ticketToView.developer === "Not Assigned") {
      return (
        <div>
          <strong>Developer:</strong>
          <a
            onClick={handleClickToAssign}
            className="badge"
            style={{ backgroundColor: "#1976d1", marginLeft: "9.7px" }}
          >
            Assign Developer
          </a>
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

  function DisplayComments() {
    {
      return (
        comments &&
        comments.map((comment) => {
          return (
            <div className="direction">
              <ul className="list-unstyled mb-0">
                <li className="mb-1">
                  <span className="text-muted mediumFont pe-1">
                    {comment.user}
                    <MoreVertIcon class="ps-2 commentDetailsIcon" />
                    <span className="ps-2 text-muted smallFont">
                      {comment.dateOfComment}
                    </span>
                  </span>
                </li>
              </ul>
              <p>{comment.comment}</p>

              <Divider style={{ marginTop: ".5rem", marginBottom: ".5rem" }} />
            </div>
          );
        })
      );
    }
  }

  function DisplayActivityinfo() {
    {
      return (
        activityInfo &&
        activityInfo.map((activity, index) => {
          let usersName = activity.user;

          let typeOfActivity = activity.typeOfActivity;
          let newTitle = "";
          let newDeveloper = "";
          let ticketTitle = "";
          let ticketStatus = "";
          let ticketPriority = "";

          let showPreviousActivity = false;

          let divider = ": ";
          let message = "";
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
          if (activity.ticketTitle !== null) {
            ticketTitle = activity.ticketTitle;
          }
          if (activity.newStatus !== null) {
            ticketStatus = activity.newStatus;
          }
          if (activity.newPriority !== null) {
            ticketPriority = activity.newPriority;
          }

          if (showPreviousActivity) {
            previousDisplay = previousMessage;

            currentDisplay = currentMessage;
          }

          return (
            <div className="direction">
              <p className="card-text mt-3 mb-0 fw-bold">
                {activity.dateOfActivity}
              </p>

              <p className="card-text mt-0 mb-0">
                {typeOfActivity +
                  divider +
                  newTitle +
                  newDeveloper +
                  ticketTitle +
                  ticketPriority +
                  ticketStatus}
              </p>

              <p className="card-text mt-0 mb-0">{"By: " + usersName}</p>

              <p className="card-text mt-3 mb-3">{message}</p>

              {previousDisplay}

              {currentDisplay}

              <Divider variant="middle" />
            </div>
          );
        })
      );
    }
  }

  function DisplayAttachments() {
    return (
      attachments &&
      attachments.map((attachment) => {
        const { fileName, fileType, fileInBase64 } = attachment.attachment;
        const id = attachment.id;

        function handleDownloadFile() {
          var attachmentBLOB = b64toBlob(fileInBase64, fileType);

          fileDownload(attachmentBLOB, fileName);
        }

        function handleDeleteFile() {
          axios
            .post(
              process.env.REACT_APP_SERVER +
                "/Tickets/Details/DeleteAttachment",
              {
                id: id,
                auth0Id: userId,
                ticketId: ticketToView && ticketToView.id,
              }
            )
            .then((r) => {
              state.attachments = r.data;
              setAttachments(r.data);
            });
        }

        return (
          <div className="attachmentDiv text-center">
            <span className="float-start" style={{}}>
              <IconButton
                size="small"
                aria-label="delete"
                onClick={handleDeleteFile}
              >
                <DeleteIcon size="small" className="attachmentIcon" />
              </IconButton>
              <IconButton
                className="attachmentButtonDownload"
                size="small"
                aria-label="downloac"
                onClick={handleDownloadFile}
              >
                <DownloadRoundedIcon size="small" className="attachmentIcon" />
              </IconButton>
            </span>
            <p className="attachmentText">{fileName}</p>
          </div>
        );
      })
    );
  }

  const filePondRef = useRef(null);

  if (isLoading) {
    return <div></div>;
  } else {
    return (
      <div className="width">
        <div className="container" style={{ marginBottom: "1.25rem" }}>
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
                    Ticket Details
                  </strong>
                </div>
              }
            />
          </Card>

          <div className="row g-5">
            <div className="col-lg-12 col-xl-8">
              <Card
                className="ticketDetailsInfoDiv"
                sx={{
                  backgroundColor: "rgb(23, 23, 23)",
                  color: "rgb(255, 255, 255)",
                  borderRadius: 2,
                }}
              >
                <CardHeader
                  title={
                    <div style={{ position: "relative" }}>
                      <InfoIcon class="pe-2 infoIcon" />

                      {ticketToView && ticketToView.title}

                      <span>
                        <button
                          onClick={handleDeleteTicket}
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
                          onClick={handleClickEditTicket}
                          title="Edit Ticket"
                          className="bi bi-pencil-fill btn btn-lg p-2 float-end "
                          style={{ position: "relative", bottom: ".25rem" }}
                        ></button>
                      </span>
                    </div>
                  }
                />
                <CardContent>
                  <Typography
                    sx={{ mb: 3.5 }}
                    gutterBottom
                    variant=""
                    component="div"
                  >
                    {ticketToView && ticketToView.description}
                  </Typography>

                  <ul className="list-unstyled mb-0">
                    <li className="mb-1">
                      <strong className="card-text mt-0 mb-0">
                        {project && "Project: "}
                      </strong>

                      <span>
                        <Button
                          style={{
                            color: "rgb(61, 136, 208)",
                            textTransform: "none",
                          }}
                          onClick={handleNavigateToProjectDetails}
                        >
                          {project && project.projectName}
                        </Button>
                      </span>
                    </li>
                  </ul>

                  {<DisplayAssignDev />}

                  <Divider
                    variant="middle"
                    style={{ marginTop: "1rem", marginBottom: "1rem" }}
                  />

                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <strong className="card-text mt-0 mb-5">
                        {"Date Entered: "}
                      </strong>
                      <span>
                        {ticketToView &&
                          ticketToView.created.replace(
                            new RegExp(/\//, "gi"),
                            "-"
                          )}
                      </span>
                    </li>

                    <li className="mb-2">
                      <strong className="card-text mt-0 mb-2">
                        {"Deadline: "}
                      </strong>
                      <span>{project && project.endDate}</span>
                    </li>

                    <li className="mb-2">
                      <strong className="card-text mt-0 mb-2">
                        {"Type: "}
                      </strong>
                      <span>{ticketToView && ticketToView.ticketType}</span>
                    </li>

                    <li className="mb-2">
                      <strong className="card-text mt-0 mb-2">
                        {"Priority: "}
                      </strong>
                      <span>{project && project.priority}</span>
                    </li>

                    <li className="mb-2">
                      <strong className="card-text mt-0 mb-2">
                        {"Status: "}
                      </strong>
                      <span>{ticketToView && ticketToView.status}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <div className="row g-3 mt-4 mb-4">
                <div className="col-md-8">
                  <Card
                    sx={{
                      backgroundColor: "rgb(23, 23, 23)",
                      color: "rgb(255, 255, 255)",
                      borderRadius: 2,
                      height: "21rem",
                    }}
                  >
                    <CardHeader
                      title={
                        <div>
                          <ForumOutlinedIcon className="forumOutlinedIcon pe-2" />
                          Comments
                        </div>
                      }
                    >
                      {" "}
                    </CardHeader>

                    <CardContent
                      className="scrollableComments"
                      sx={{ height: "11.59rem" }}
                    >
                      {comments && comments.length !== 0 && <DisplayComments />}
                    </CardContent>

                    {comments && comments.length === 0 && (
                      <div>
                        <div
                          className="text-center"
                          style={{ position: "relative", bottom: "5.2rem" }}
                        >
                          <ForumRoundedIcon className="forumRoundedIcon" />
                        </div>

                        <div
                          className="text-center"
                          style={{ position: "relative", bottom: "10.44rem" }}
                        >
                          <strong>No comment yet</strong>
                        </div>
                      </div>
                    )}

                    <CardContent
                      sx={{
                        backgroundColor: "rgb(23, 23, 23)",
                        position: "relative",
                        bottom: comments && comments.length === 0 && "10.44rem",
                      }}
                    >
                      <CustomTextField
                        id="outlined-multiline-static"
                        label="add comment"
                        multiline
                        style={{
                          backgroundColor: "rgb(35, 35, 35)",
                          borderRadius: "20px",
                          width: "100%",
                          borderColor: "blue !important",
                        }}
                        rows={2}
                        onChange={handleCommentInput}
                        value={commentText}
                        className="muiTextField"
                        inputProps={{
                          style: {
                            color: "rgb(210,210,210)",
                            backgroundColor: "rgb(35, 35, 35)",
                            borderColor: "blue",
                          },
                        }}
                        InputProps={{
                          endAdornment: (
                            <IconButton
                              onClick={handleCreateComment}
                              style={{
                                width: "3rem",
                                position: "relative",
                                top: ".59rem",
                                left: ".4rem",
                                height: "2.8rem",
                                borderRadius: "15.9px",
                                marginBottom: "10px",
                              }}
                              sx={{
                                "&:active": {
                                  boxShadow: "none",
                                  backgroundColor:
                                    "rgba(200, 202, 248, 0.06) !important",
                                  borderColor: "#005cbf",
                                },
                                "&:hover": {
                                  boxShadow: "none",
                                  backgroundColor: "rgba(144, 202, 248, 0.04)",
                                  borderColor: "#005cbf",
                                },
                              }}
                            >
                              <SendRoundedIcon className="sendRoundedIcon" />
                            </IconButton>
                          ),
                        }}
                        variant="outlined"
                      />
                    </CardContent>
                  </Card>
                </div>

                <div
                  className="col-md-4 ticketDetailsAttachmentsCol"
                  style={{ height: "21rem" }}
                >
                  <Card
                    sx={{
                      backgroundColor: "rgb(23, 23, 23)",
                      color: "rgb(255, 255, 255)",
                      borderRadius: 2,
                      height: "100%",
                    }}
                  >
                    <CardHeader
                      sx={{ paddingBottom: 0 }}
                      title={
                        <div>
                          <AttachFileRoundedIcon className="attachFileRoundedIcon pe-2" />
                          Attachments
                        </div>
                      }
                    >
                      {" "}
                    </CardHeader>

                    <CardContent style={{ height: "100%" }}>
                      <div
                        className="row scrollableComments"
                        style={{ height: "57.3%" }}
                      >
                        <div className="col-lg-12">
                          <Stack spacing={1}>
                            <DisplayAttachments />
                          </Stack>

                          {attachments && attachments.length === 0 && (
                            <div
                              style={{ height: "100%", position: "relative" }}
                            >
                              <div className="text-center">
                                <AttachFileRoundedIcon className="attachFileRoundedIconLarge" />
                              </div>

                              <div
                                className="text-center attachmentsTextDiv"
                                style={{}}
                              >
                                <strong>No attachments</strong>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        className="row"
                        style={{ position: "relative", top: "1.09rem" }}
                      >
                        <div className="col-lg-12 ticketDetails">
                          <FilePond
                            ref={filePondRef}
                            allowRevert={false}
                            files={files}
                            onupdatefiles={(file) => {}}
                            onprocessfile={(error, file) => {
                              const fileInBase64 =
                                file.getFileEncodeBase64String();
                              const fileToSend = file.file;
                              axios
                                .post(
                                  process.env.REACT_APP_SERVER +
                                    "/Tickets/Details/AddAttachment",
                                  {
                                    file: {
                                      fileName: fileToSend.name,
                                      fileType: fileToSend.type,
                                      fileInBase64: fileInBase64,
                                    },

                                    auth0Id: userId,
                                    ticketId: ticketToView && ticketToView.id,
                                    ticketTitle:
                                      ticketToView && ticketToView.title,
                                    projectId:
                                      ticketToView && ticketToView.projectId,
                                    user: user && user,
                                  }
                                )
                                .then((r) => {
                                  let attachments = r.data;

                                  axios
                                    .post(
                                      process.env.REACT_APP_SERVER +
                                        "/Tickets/Details/activityInfo",
                                      {
                                        id: ticketId && ticketId,
                                      }
                                    )
                                    .then((res) => {
                                      setActivityInfo(res.data.reverse());
                                      setAttachments(attachments.reverse());
                                    });
                                });

                              if (!error) {
                                setTimeout(() => {
                                  filePondRef.current &&
                                    filePondRef.current.removeFile(file);
                                }, 3400);
                              }
                            }}
                            acceptedFileTypes={[
                              "image/png",
                              "image/jpeg",
                              "text/plain",
                              "text/csv",
                            ]}
                            allowMultiple={false}
                            server={
                              process.env.REACT_APP_SERVER + "/filesMessage"
                            }
                            allowImagePreview={false}
                            labelIdle={
                              '<p className="pt-2">Drag & Drop your files or <span class="btn browseButton ">Browse</span> </p>'
                            }
                            type="file"
                            credits={false}
                            imagePreviewMaxHeight={146.9}
                          ></FilePond>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-lg-12 ticketDetailsActivityCol">
              <Card
                className=""
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

                <CardContent className="scrollable ticketDetailsActivityContentDiv">
                  {project && <DisplayActivityinfo />}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default TicketsDetails;
