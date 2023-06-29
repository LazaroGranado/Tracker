/* eslint-disable */
import { useAuth0 } from "@auth0/auth0-react";
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import jwt from "jsonwebtoken";

const CustomTextField = styled(TextField, {
  shouldForwardProp: (props) => props !== "focusColor",
})((p) => ({
  "& .MuiInputLabel-root": { color: "rgb(118, 114, 105)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "rgb(118, 114, 105)" },

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

const issueTrackerRealm = process.env.REACT_APP_ISSUETRACKERLOGINREALM;

function Login() {
  const navigate = useNavigate();

  const { loginWithRedirect, isAuthenticated, getAccessTokenSilently } =
    useAuth0();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isInvalid4WrongEmailOrPassword, setIsInvalid4WrongEmailOrPassword] =
    useState();
  const [isInvalidForNoEmail, setIsInvalidForNoEmail] = useState();
  const [isInvalidForNoEmailFeedback, setIsInvalidForNoEmailFeedback] =
    useState();
  const [isInvalidForNoPasswordFeedback, setIsInvalidForNoPasswordFeedback] =
    useState();
  const [isInvalidForNoPassword, setIsInvalidForNoPassword] = useState();
  const [
    wrongEmailOrPasswordInvalidFeedback,
    setWrongEmailOrPasswordInvalidFeedback,
  ] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let userId;

    getAccessTokenSilently({ detailedResponse: true })
      .then((r) => {
        const decodeIdToken = async () => {
          const decodedIdToken = jwt.decode(r.id_token);

          userId = decodedIdToken.sub;

          if (userId) {
            navigate("/Home");
          } else {
            setIsLoading(false);
          }
        };

        if (r) {
          decodeIdToken();
        } else {
          setIsLoading(false);
        }
      })
      .catch((e) => {
        if (e.toString() === "Error: Login required") {
          setIsLoading(false);
        }
      });
  }, []);

  /////////////
  // const loginUser = (event) => {

  //     if (email === '' || password === '') {

  //         if (email === '') {

  //             setIsInvalidForNoEmail('is-invalid')
  //             setIsInvalidForNoEmailFeedback('Please fill out this field')

  //         }
  //         else {
  //             setIsInvalidForNoEmail('')
  //             setIsInvalidForNoEmailFeedback('')
  //         }
  //         if (password === '') {
  //             setIsInvalidForNoPassword('is-invalid')
  //             setIsInvalidForNoPasswordFeedback('Please fill out this field')

  //         }
  //         else {
  //             setIsInvalidForNoPassword('')
  //             setIsInvalidForNoPasswordFeedback('')
  //         }

  //     } else {

  //         setIsInvalidForNoEmail('')
  //         setIsInvalidForNoPassword('')

  //         setIsInvalidForNoEmailFeedback('')
  //         setIsInvalidForNoPasswordFeedback('')

  //         webAuthLoginWithRoles.login({
  //             realm: issueTrackerRealm,
  //             username: email,
  //             password: password,
  //         }, (err, result) => {
  //             if (result) {
  //             }
  //             if (err) {
  //                 if (err.description === 'Wrong email or password.') {
  //                     setIsInvalid4WrongEmailOrPassword('is-invalid')
  //                     setWrongEmailOrPasswordInvalidFeedback('Email or password is incorrect')

  //                 }

  //             }

  //         })

  //     }

  // }
  /////////////

  function handleLoginEmail(e) {
    setEmail(e.target.value);
  }

  function handleLoginPassword(e) {
    setPassword(e.target.value);
  }

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClickLogin = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseLogin = () => {
    setAnchorEl(null);
  };

  function LoginPopover() {
    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;

    return (
      <Popover
        className="loginPopover"
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseLogin}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Typography sx={{ p: "1rem 1rem 1rem", color: "#c15353" }}>
          Please use Demo Login below.
        </Typography>
      </Popover>
    );
  }

  const [anchorElForgotPassword, setAnchorElForgotPassword] =
    React.useState(null);

  const handleClickForgotPassword = (event) => {
    setAnchorElForgotPassword(event.currentTarget);
  };

  const handleCloseForgotPassword = () => {
    setAnchorElForgotPassword(null);
  };

  function ForgotPasswordPopover() {
    const open = Boolean(anchorElForgotPassword);
    const id = open ? "simple-popover" : undefined;

    return (
      <Popover
        className="loginPopover"
        id={id}
        open={open}
        anchorEl={anchorElForgotPassword}
        onClose={handleCloseForgotPassword}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Typography sx={{ p: "1rem 1rem 1rem", color: "#c15353" }}>
          Please use Demo Login.
        </Typography>
      </Popover>
    );
  }

  const [anchorElRegisterUser, setAnchorElRegisterUser] = React.useState(null);

  const handleClickRegisterUser = (event) => {
    setAnchorElRegisterUser(event.currentTarget);
  };

  const handleCloseRegisterUser = () => {
    setAnchorElRegisterUser(null);
  };

  function RegisterUserPopover() {
    const open = Boolean(anchorElRegisterUser);
    const id = open ? "simple-popover" : undefined;

    return (
      <Popover
        id={id}
        className="loginPopover"
        open={open}
        anchorEl={anchorElRegisterUser}
        onClose={handleCloseRegisterUser}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Typography sx={{ p: "1rem 1rem 1rem", color: "#c15353" }}>
          Please use Demo Login below.
        </Typography>
      </Popover>
    );
  }

  if (isLoading) {
    return <div></div>;
  } else {
    return (
      <div className="width">
        <div className="container " style={{ marginTop: "5.5rem" }}>
          <div className="row justify-content-center">
            <div className="col-md-10 col-lg-8 col-xl-5">
              <div className="loginDiv">
                <h4
                  className=" ps-3"
                  style={{
                    fontWeight: 300,
                    marginBottom: "2rem",
                    paddingRight: "1.5rem",
                    paddingLeft: "1.5rem",
                  }}
                >
                  Sign in
                </h4>

                <div className="row pb-4 px-3">
                  <div className="col-md-12">
                    <CustomTextField
                      id="outlined-multiline-static"
                      label="Email"
                      onChange={handleLoginEmail}
                      name="email"
                      className={
                        isInvalidForNoEmail +
                        " " +
                        isInvalid4WrongEmailOrPassword
                      }
                      value={email}
                      inputProps={{ style: { color: "#969292" } }}
                      sx={{ width: "100%" }}
                      size="medium"
                      variant="outlined"
                    />

                    <div className="invalid-feedback ps-1">
                      {wrongEmailOrPasswordInvalidFeedback}
                      {isInvalidForNoEmailFeedback}
                    </div>
                  </div>
                </div>

                <div className="row px-3 pb-4">
                  <div className="col-md-12">
                    <CustomTextField
                      id="outlined-multiline-static"
                      label="Password"
                      name="Password"
                      onChange={handleLoginPassword}
                      className={
                        isInvalidForNoPassword +
                        " " +
                        isInvalid4WrongEmailOrPassword
                      }
                      value={password}
                      inputProps={{ style: { color: "#969292" } }}
                      sx={{ width: "100%" }}
                      type="password"
                      size="medium"
                      variant="outlined"
                    />

                    <div className="invalid-feedback">
                      {isInvalidForNoPasswordFeedback}
                    </div>

                    <a
                      onClick={handleClickForgotPassword}
                      style={{
                        color: "#1976d2",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                      }}
                    >
                      Forgot your password?
                    </a>

                    <ForgotPasswordPopover />
                  </div>
                </div>

                <row class="row pe-3 g-3 mt-2 ">
                  <div class="col-md-6 col-sm-8 ps-3 registerCol">
                    <Button
                      onClick={handleClickRegisterUser}
                      sx={{ textTransform: "none" }}
                    >
                      Register as a new user
                    </Button>
                    <RegisterUserPopover />
                  </div>

                  <div class="col-md-6 col-sm-4 loginCol text-end">
                    <Button onClick={handleClickLogin} variant="contained">
                      Log in
                    </Button>

                    <LoginPopover />
                  </div>
                </row>
              </div>

              <div className="demoLoginDiv" style={{}}>
                <h4
                  className="ps-3"
                  style={{ fontWeight: 300, marginBottom: "2rem" }}
                >
                  Demo Account Login
                </h4>

                <div className="row">
                  <div class="text-center">
                    <Link to="/Demo/Login">
                      <Button
                        variant="contained"
                        size="large"
                        style={{ backgroundColor: "#a4a32ceb" }}
                        className="demoLoginButton"
                      >
                        demo log in
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
