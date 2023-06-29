/* eslint-disable */
import axios from "axios";
import React, { useState, useEffect } from "react";
import Header from "../components/Header.js";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { styled } from "@mui/material/styles";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import dayjs from "dayjs";
import jwt from "jsonwebtoken";
import { FormHelperText } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import { FilePond, File, registerPlugin, load, addFile } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import FilePondPluginFileEncode from "filepond-plugin-file-encode";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";

registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileEncode,
  FilePondPluginFileValidateType
);

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

const CustomDatePicker = styled(DatePicker, {
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

function ProjectsEdit() {
  const { state } = useLocation();
  const [projectId, setProjectId] = useState(state.projectId);

  const defaultDate = new Date();

  const navigate = useNavigate();

  const [projectName, setProjectName] = useState();
  const [projectDescription, setProjectDescription] = useState();
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [priority, setPriority] = useState();
  const [image, setImage] = useState(null);
  const [noStartDateError, setNoStartDateError] = useState();
  const [noEndDateError, setNoEndDateError] = useState();
  const [projectManager, setProjectManager] = useState();
  const [files, setFiles] = useState([]);
  const [projectImageBase64, setProjectImageBase64] = useState();
  const [auth0Id, setAuth0Id] = useState();
  const [noProjectNameError, setNoProjectNameError] = useState();
  const [projectManagers, setProjectManagers] = useState();
  const [projectManagerEmail, setProjectManagerEmail] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const [loadedImageIsNew, setLoadedImageIsNew] = useState(true);

  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [userId, setUserId] = useState();

  const [projectToEdit, setProjectToEdit] = useState();

  useEffect(() => {
    setUserId(isAuthenticated && user.sub);

    let userId;

    getAccessTokenSilently({ detailedResponse: true })
      .then((r) => {
        const decodeIdToken = async () => {
          const decodedIdToken = jwt.decode(r.id_token);

          userId = decodedIdToken.sub;

          if (userId) {
            setAuth0Id(userId);

            axios
              .post(process.env.REACT_APP_SERVER + "/Projects/Edit/Info", {
                projectId: projectId && projectId,
                auth0Id: userId,
              })
              .then((r) => {
                let project = r.data;

                axios
                  .get(process.env.REACT_APP_SERVER + "/getProjectManagers")
                  .then((r) => {
                    const managers = r.data;

                    if (project.startDate) {
                      const startYear = project.startDate.match(
                        new RegExp(/....$/, "i")
                      );
                      const startMonth = project.startDate.match(
                        new RegExp(/^../, "i")
                      );
                      const startDay = project.startDate.match(
                        new RegExp(/(?<=\-)..(?=\-)/, "i")
                      );

                      project.startDate =
                        startYear + "-" + startMonth + "-" + startDay;

                      setStartDate(dayjs(project.startDate));
                    }

                    if (project.endDate) {
                      const endYear = project.endDate.match(
                        new RegExp(/....$/, "i")
                      );
                      const endMonth = project.endDate.match(
                        new RegExp(/^../, "i")
                      );
                      const endDay = project.endDate.match(
                        new RegExp(/(?<=\-)..(?=\-)/, "i")
                      );

                      project.endDate = endYear + "-" + endMonth + "-" + endDay;

                      setEndDate(dayjs(project.endDate));
                    }

                    setProjectManager(project.projectManager);
                    setProjectManagers(managers);
                    setProjectToEdit(project);
                    setProjectName(project.projectName);
                    setPriority(project.priority);
                    setProjectDescription(project.description);

                    setIsLoading(false);

                    if (project.projectImage) {
                      let file =
                        "data:image/png;base64," + project.projectImage;

                      setLoadedImageIsNew(false);
                      setFiles([file]);
                    }
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

  function handleSetProjectName(e) {
    setProjectName(e.target.value);
  }

  const handlePrioritySelect = (event) => {
    setPriority(event.target.value);
  };

  function handleDescription(e) {
    setProjectDescription(e.target.value);
  }

  function DisplayProjectManager() {
    return (
      <FormControl fullWidth variant="outlined" size="small" className="select">
        <InputLabel id="projectManagerSelectLabel">Project Manager</InputLabel>
        <Select
          sx={{ svg: { color: "#707070" }, color: "#969292" }}
          labelId="projectManagerSelectLabel"
          id="projectManagerSelect"
          label="Project Manager"
          name="projectManager"
          value={projectManager}
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
          {projectManagers &&
            projectManagers.map((manager) => {
              const name = manager.firstName + " " + manager.lastName;

              return (
                <MenuItem
                  onClick={() => {
                    setProjectManager(name);

                    setProjectManagerEmail(manager.email);
                  }}
                  value={name}
                >
                  {name}
                </MenuItem>
              );
            })}
        </Select>
      </FormControl>
    );
  }

  function DisplayPriority() {
    return (
      <FormControl
        fullWidth
        variant="outlined"
        size="small"
        className="pb-4 select"
      >
        <InputLabel id="prioritySelectLabel">Priority</InputLabel>
        <Select
          sx={{ svg: { color: "#707070" }, color: "#969292" }}
          labelId="prioritySelectLabel"
          id="prioritySelect"
          value={priority}
          onChange={handlePrioritySelect}
          label="Priority"
          name="priority"
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
          <MenuItem className="muiSelectBackground" value={"Low"}>
            Low
          </MenuItem>
          <MenuItem value={"Medium"}>Medium</MenuItem>
          <MenuItem value={"High"}>High</MenuItem>
          <MenuItem value={"Urgent"}>Urgent</MenuItem>
        </Select>
      </FormControl>
    );
  }

  function editProject() {
    let projectNameChanged = false;

    let invalidStartDate = false;
    let invalidEndDate = false;

    if (startDate && dayjs(startDate).format("MM-DD-YYYY") === "Invalid Date") {
      invalidStartDate = true;
    }

    if (endDate && dayjs(endDate).format("MM-DD-YYYY") === "Invalid Date") {
      invalidEndDate = true;
    }

    if (projectToEdit && projectToEdit.projectName !== projectName)
      projectNameChanged = true;

    if (
      !projectName ||
      !startDate ||
      !endDate ||
      projectName === "" ||
      startDate === "" ||
      endDate === "" ||
      invalidStartDate ||
      invalidEndDate
    ) {
      if (!projectName || projectName === "") {
        setNoProjectNameError(true);
      }
      if (!startDate || invalidStartDate) {
        setNoStartDateError(true);
      }
      if (!endDate || invalidEndDate) {
        setNoEndDateError(true);
      }
    } else {
      axios
        .post(process.env.REACT_APP_SERVER + "/projects/Edit", {
          projectImageBase64: projectImageBase64,
          projectName: projectName && projectName,
          description: projectDescription,
          startDate: startDate && dayjs(startDate).format("MM-DD-YYYY"),
          endDate: endDate && dayjs(endDate).format("MM-DD-YYYY"),
          priority: priority,
          projectManager: projectManager,
          auth0Id: auth0Id,
          projectId: projectToEdit && projectToEdit.id,
          projectManagerEmail: projectManagerEmail && projectManagerEmail,
          projectNameChanged: projectNameChanged,
        })
        .then((r) => {
          navigate("/Projects");
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
            action="http://localhost:3025/Projects/Edit"
            method="post"
            encType="multipart/form-data"
            noValidate
          >
            <input name="auth0Id" value={userId} style={{ display: "none" }} />
            <input
              name="projectId"
              value={projectToEdit && projectToEdit.id}
              style={{ display: "none" }}
            />

            <div className="row justify-content-center">
              <div className="col-md-12 col-lg-10 col-xl-8">
                <div className="projectsCreateDiv">
                  <h4
                    className=" ps-3"
                    style={{ fontWeight: 300, marginBottom: "2rem" }}
                  >
                    Edit Project
                  </h4>

                  <div className="row px-3 pb-4 g-3">
                    <div class="col-md-6">
                      <CustomTextField
                        id="outlined-multiline-static"
                        label="Project name"
                        name="projectName"
                        value={projectName ? projectName : ""}
                        onChange={handleSetProjectName}
                        className="muiTextField"
                        inputProps={{ style: { color: "#969292" } }}
                        sx={{
                          width: "100%",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: noProjectNameError
                              ? "#c44438 !important"
                              : "",
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: noProjectNameError
                              ? "#c44438 !important"
                              : "",
                          },
                          "& .MuiInputLabel-root": {
                            color:
                              noProjectNameError && !projectName
                                ? "rgb(118, 114, 105) !important"
                                : noProjectNameError && projectName
                                ? "#c44438"
                                : "rgb(118, 114, 105) !important",
                          },
                        }}
                        helperText={noProjectNameError && "Enter project name"}
                        instantUpload={false}
                        size="small"
                        variant="outlined"
                      />
                    </div>

                    <div class="col-md-6">
                      <DisplayProjectManager />
                    </div>
                  </div>

                  <div className="row px-3 pb-4 g-3 ">
                    <div class="col-md-6">
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <CustomDatePicker
                          label="Start Date"
                          sx={{
                            svg: { color: "#707070" },
                            input: { color: "rgb(118, 114, 105)" },
                            modal: { color: "green" },
                            width: "100%",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: noStartDateError
                                ? "#c44438 !important"
                                : "",
                            },
                            "& .MuiInputLabel-root.Mui-focused": {
                              color: noStartDateError
                                ? "#c44438 !important"
                                : "",
                            },
                            "& .MuiInputLabel-root": {
                              color:
                                noStartDateError && !startDate
                                  ? "rgb(118, 114, 105) !important"
                                  : noStartDateError && startDate
                                  ? "#c44438"
                                  : "rgb(118, 114, 105) !important",
                            },
                          }}
                          name="startDate"
                          slotProps={{ textField: { size: "small" } }}
                          onChange={setStartDate}
                          value={startDate}
                        />
                      </LocalizationProvider>

                      {noStartDateError && (
                        <FormHelperText
                          sx={{
                            color: "#c44438 !important",
                            marginLeft: "14px",
                            marginTop: "4px",
                          }}
                        >
                          Enter start date
                        </FormHelperText>
                      )}
                    </div>

                    <div class="col-md-6">
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <CustomDatePicker
                          label="End Date"
                          sx={{
                            svg: { color: "#707070" },
                            input: { color: "rgb(118, 114, 105)" },
                            modal: { color: "green" },
                            width: "100%",
                            "& .MuiInputLabel-root.Mui-focused": {
                              color: noEndDateError ? "#c44438 !important" : "",
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: noEndDateError
                                ? "#c44438 !important"
                                : "",
                            },
                            "& .MuiInputLabel-root": {
                              color:
                                noEndDateError && !endDate
                                  ? "rgb(118, 114, 105) !important"
                                  : noEndDateError && endDate
                                  ? "#c44438"
                                  : "rgb(118, 114, 105) !important",
                            },
                          }}
                          name="endDate"
                          slotProps={{ textField: { size: "small" } }}
                          onChange={setEndDate}
                          value={endDate}
                        />
                      </LocalizationProvider>

                      {noEndDateError && (
                        <FormHelperText
                          sx={{
                            color: "#c44438 !important",
                            marginLeft: "14px",
                            marginTop: "4px",
                          }}
                        >
                          Enter end date
                        </FormHelperText>
                      )}
                    </div>
                  </div>

                  <row class="row px-3 pb-4 g-3">
                    <div className="col-md-6 col-sm-12">
                      <div className="filepondDiv" style={{ height: "8rem" }}>
                        <CloudUploadIcon className="cloudUploadIcon" />

                        <FilePond
                          style={{ marginBottom: 0 }}
                          className="createPage"
                          instantUpload={false}
                          files={files}
                          onupdatefiles={(files) => {
                            setFiles(files);

                            if (files.length > 0) {
                              files.map((file) => {
                                const base64String =
                                  file.getFileEncodeBase64String();

                                setProjectImageBase64(base64String);
                              });
                            } else {
                              setProjectImageBase64(null);
                            }
                          }}
                          allowMultiple={false}
                          labelIdle={
                            '<div><ul class="list-unstyled"> <i class="testing mb-2" > | </i> <li></li><li>Drag your project image here</li>  <li class="pt-1 pb-1"> <span class="t">__</span>  OR <span class="r">__</span></li>   <li class="pt-1"><span class="btn btn-outline-dark  uploadProjectImageButton">BROWSE</span></li>  </ul> </div> '
                          }
                          credits={false}
                          acceptedFileTypes={["image/png", "image/jpeg"]}
                          fileRenameFunction={(file) => {
                            setLoadedImageIsNew(true);

                            return loadedImageIsNew ? file.name : " ";
                          }}
                          imagePreviewMaxHeight={146.9}
                        ></FilePond>
                      </div>
                    </div>

                    <div className="col-md-6 col-sm-12">
                      <DisplayPriority />

                      <CustomTextField
                        id="outlined-multiline-static"
                        label="Description"
                        name="description"
                        className="muiTextField"
                        inputProps={{ style: { color: "#969292" } }}
                        sx={{
                          width: "100%",
                          "& .MuiInputLabel-root": {
                            color: "rgb(118, 114, 105) !important",
                          },
                        }}
                        onChange={handleDescription}
                        size="small"
                        variant="outlined"
                        multiline
                        rows={4.188}
                        value={projectDescription ? projectDescription : ""}
                      />
                    </div>
                  </row>

                  <row class="row pe-3 g-3 mt-1">
                    <div class=" col-6 ps-3 projectsCreateButton">
                      <Link to="/Projects">
                        <p class="mt-3">
                          <Button
                            sx={{ textTransform: "none" }}
                            Johnny
                            className="projectsCreateButton"
                          >
                            Back to All Projects
                          </Button>
                        </p>
                      </Link>
                    </div>

                    <div
                      class=" col-6 text-end "
                      style={{ paddingTop: ".92rem" }}
                    >
                      <Button onClick={editProject} variant="contained">
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

export default ProjectsEdit;
