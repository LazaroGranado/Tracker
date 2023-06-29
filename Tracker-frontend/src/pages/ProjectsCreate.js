/* eslint-disable */
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, Link } from "react-router-dom";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { styled } from "@mui/material/styles";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import jwt from "jsonwebtoken";
import * as dayjs from "dayjs";
import { FormHelperText } from "@mui/material";
import { useProSidebar } from "react-pro-sidebar";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

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

const CustomTextField = styled(TextField, {
  shouldForwardProp: (props) => props !== "focusColor",
})((p) => ({
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

function ProjectsCreate() {
  const navigate = useNavigate();

  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [userId, setUserId] = useState();

  const [files, setFiles] = useState([]);
  const [auth0Id, setAuth0Id] = useState();
  const [noProjectNameError, setNoProjectNameError] = useState();
  const [noStartDateError, setNoStartDateError] = useState();
  const [noEndDateError, setNoEndDateError] = useState();

  const [projectName, setProjectName] = useState();
  const [projectDescription, setProjectDescription] = useState();
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [priority, setPriority] = useState();
  const [imageBuffer, setImageBuffer] = useState(null);
  const [projectManager, setProjectManager] = useState();
  const [projectImageBase64, setProjectImageBase64] = useState();
  const [description, setDescription] = useState();
  const [projectManagers, setProjectManagers] = useState();
  const [projectManagerEmail, setProjectManagerEmail] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const { collapseSidebar, toggleSidebar, toggled, collapsed, broken } =
    useProSidebar();

  useEffect(() => {
    let userId;

    getAccessTokenSilently({ detailedResponse: true })
      .then((r) => {
        const decodeIdToken = async () => {
          const decodedIdToken = jwt.decode(r.id_token);

          userId = decodedIdToken.sub;

          if (userId) {
            setAuth0Id(userId);

            setUserId(userId);

            setPriority("Low");

            axios
              .get(process.env.REACT_APP_SERVER + "/getProjectManagers")
              .then((r) => {
                const managers = r.data;

                setProjectManagers(managers);
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

  const handlePrioritySelect = (event) => {
    setPriority(event.target.value);
  };

  function createProject() {
    let invalidStartDate = false;
    let invalidEndDate = false;

    if (startDate && dayjs(startDate).format("MM-DD-YYYY") === "Invalid Date") {
      invalidStartDate = true;
    }

    if (endDate && dayjs(endDate).format("MM-DD-YYYY") === "Invalid Date") {
      invalidEndDate = true;
    }

    if (auth0Id) {
      if (
        !projectName ||
        !startDate ||
        !endDate ||
        invalidStartDate ||
        invalidEndDate
      ) {
        if (!projectName) {
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
          .post(process.env.REACT_APP_SERVER + "/projects/Create", {
            projectImageBase64: projectImageBase64,
            projectName: projectName,
            description: description,
            startDate: startDate && dayjs(startDate).format("MM-DD-YYYY"),
            endDate: endDate && dayjs(endDate).format("MM-DD-YYYY"),
            priority: priority,
            projectManager: projectManager,
            auth0Id: auth0Id && auth0Id,
            projectManagerEmail: projectManagerEmail && projectManagerEmail,
          })
          .then((r) => {
            navigate("/Projects");
          });
      }
    }
  }

  if (isLoading) {
    return <div></div>;
  } else {
    return (
      <div className="width">
        <div className="container mt-3">
          <div className="row justify-content-center">
            <div
              className={
                collapsed ? "col-lg-10 col-xl-8" : "col-lg-11 col-xl-9"
              }
            >
              <div className="projectsCreateDiv">
                <h4
                  className=" ps-3"
                  style={{ fontWeight: 300, marginBottom: "2rem" }}
                >
                  Create Project
                </h4>

                <div className="row px-3 pb-4 g-3">
                  <div class={collapsed ? "col-md-6" : "col-md-12 col-lg-6"}>
                    <CustomTextField
                      id="outlined-multiline-static"
                      label="Project name"
                      error={noProjectNameError}
                      onChange={(e) => {
                        setProjectName(e.target.value);
                      }}
                      value={projectName}
                      name="projectName"
                      className="muiTextField"
                      inputProps={{ style: { color: "#969292" } }}
                      InputLabelProps={{
                        style: {
                          "& .MuiInputLabel-root": {
                            color: "#d32f1f !important",
                          },
                        },
                      }}
                      sx={{
                        width: "100%",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: noProjectNameError
                            ? "#c44438 !important"
                            : "",
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: noProjectNameError ? "#c44438 !important" : "",
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
                      size="small"
                      variant="outlined"
                    />
                  </div>

                  <div class={collapsed ? "col-md-6" : "col-md-12 col-lg-6"}>
                    <FormControl
                      fullWidth
                      variant="outlined"
                      size="small"
                      className="select"
                    >
                      <InputLabel id="projectManagerSelectLabel">
                        Project Manager
                      </InputLabel>

                      <Select
                        sx={{
                          svg: { color: "#707070" },
                          color: "#969292",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#292b2d !important",
                          },
                        }}
                        labelId="projectManagerSelectLabel"
                        id="projectManagerSelect"
                        helperText={noProjectNameError && "Enter project name"}
                        value={projectManager}
                        label="Project Manager"
                        name="projectManager"
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
                            const name =
                              manager.firstName + " " + manager.lastName;

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
                  </div>
                </div>

                <div className="row px-3 pb-4 g-3 ">
                  <div class={collapsed ? "col-md-6" : "col-md-12 col-lg-6"}>
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
                            color: noStartDateError ? "#c44438 !important" : "",
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
                        inputFormat="MM/DD/YYYY"
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

                  <div class={collapsed ? "col-md-6" : "col-md-12 col-lg-6"}>
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
                        inputFormat="MM/DD/YYYY"
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
                  <div class={collapsed ? "col-md-6" : "col-md-12 col-lg-6"}>
                    <div className="filepondDiv" style={{ height: "8rem" }}>
                      <CloudUploadIcon className="cloudUploadIcon" />

                      <FilePond
                        className="createPage"
                        instantUpload={false}
                        files={files}
                        onremovefile={(error, file) => {
                          setProjectImageBase64(null);
                        }}
                        onupdatefiles={(files) => {
                          setFiles(files);

                          files.map((file) => {
                            const base64String =
                              file.getFileEncodeBase64String();

                            setProjectImageBase64(base64String);
                          });
                        }}
                        allowMultiple={false}
                        labelIdle={
                          '<div><ul class="list-unstyled"><i class="testing mb-2" > | </i> <li></li><li>Drag your project image here</li>  <li class="pt-1 pb-1"> <span class="t">__</span>  OR <span class="r">__</span></li>   <li class="pt-1"><span class="btn btn-outline-dark  uploadProjectImageButton">BROWSE</span></li>  </ul> </div> '
                        }
                        type="file"
                        credits={false}
                        acceptedFileTypes={["image/png", "image/jpeg"]}
                        imagePreviewMaxHeight={146.9}
                      ></FilePond>
                    </div>
                  </div>

                  <div class={collapsed ? "col-md-6" : "col-md-12 col-lg-6"}>
                    <FormControl
                      fullWidth
                      variant="outlined"
                      size="small"
                      className="pb-4 select"
                    >
                      <InputLabel id="prioritySelectLabel">Priority</InputLabel>
                      <Select
                        sx={{
                          svg: { color: "#707070" },
                          color: "#969292",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: noProjectNameError
                              ? "#292b2d"
                              : "#292b2d !important",
                          },
                        }}
                        labelId="prioritySelectLabel"
                        id="prioritySelect"
                        value={priority ? priority : ""}
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
                      size="small"
                      variant="outlined"
                      multiline
                      rows={4.188}
                      onChange={(e) => {
                        setDescription(e.target.value);
                      }}
                      value={description}
                    />
                  </div>
                </row>

                <row class="row pe-3 g-3 mt-1">
                  <div class="col-6 ps-3 projectsCreateButton">
                    <Link to="/Projects">
                      <p class="mt-3">
                        <Button
                          sx={{ textTransform: "none" }}
                          className="projectsCreateButton"
                        >
                          Back to All Projects
                        </Button>
                      </p>
                    </Link>
                  </div>

                  <div class="col-6 text-end" style={{ paddingTop: ".92rem" }}>
                    <Button onClick={createProject} variant="contained">
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

export default ProjectsCreate;
