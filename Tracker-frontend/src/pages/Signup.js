/* eslint-disable */
import { useAuth0 } from "@auth0/auth0-react";
import React, { useState, useEffect } from "react";
import Header from "../components/Header.js";
import { createAuth0Client } from "@auth0/auth0-spa-js";
import { useNavigate, Link } from "react-router-dom";
import { webAuth, webAuthLogin, webAuthLoginWithRoles } from "../index.js";
import jwt from "jsonwebtoken";

const issueTrackerRealm = process.env.REACT_APP_ISSUETRACKERLOGINREALM;

function Signup() {
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const [logInAttempted, setLoginAttempted] = useState(false);
  const [results, setResults] = useState();

  const { loginWithRedirect, isAuthenticated, getAccessTokenSilently } =
    useAuth0();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isInvalid4PasswordNoMatch, setIsInvalid4PasswordNoMatch] = useState();
  const [isInvalid4EmailFormat, setIsInvalid4EmailFormat] = useState();
  const [isInvalidForWeakPassword, setIsInvalidForWeakPassword] = useState();
  const [isInvalidForNoEmail, setIsInvalidForNoEmail] = useState();
  const [isInvalidForNoFirstName, setIsInvalidForNoFirstName] = useState();
  const [isInvalidForNoLastName, setIsInvalidForNoLastName] = useState();
  const [isInvalidForNoFirstNameFeedback, setIsInvalidForNoFirstNameFeedback] =
    useState();
  const [isInvalidForNoLastNameFeedback, setIsInvalidForNoLastNameFeedback] =
    useState();
  const [isInvalidForNoEmailFeedback, setIsInvalidForNoEmailFeedback] =
    useState();
  const [isInvalidForNoPasswordFeedback, setIsInvalidForNoPasswordFeedback] =
    useState();
  const [
    isInvalidForNoPasswordConfirmFeedback,
    setIsInvalidForNoPasswordConfirmFeedback,
  ] = useState();
  const [isInvalidForNoPassword, setIsInvalidForNoPassword] = useState();
  const [isInvalidForNoPasswordConfirm, setIsInvalidForNoPasswordConfirm] =
    useState();
  const [passwordInvalidFeedbackNoMatch, setPasswordInvalidFeedbackNoMatch] =
    useState();
  const [passwordStrengthInvalidFeedback, setPasswordStrengthInvalidFeedback] =
    useState();
  const [emailFormatInvalidFeedback, setEmailFormatInvalidFeedback] =
    useState();
  const [isInvalid4UserExists, setIsInvalid4UserExists] = useState();
  const [isInvalid4UserExistsFeedback, setIsInvalid4UserExistsFeedback] =
    useState();
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [emailInvalidClasses, setEmailInvalidClasses] = useState();
  const [passwordInvalidClasses, setPasswordInvalidClasses] = useState();
  const [passwordConfirmInvalidClasses, setPasswordConfirmInvalidClasses] =
    useState();

  const [passwordStrengthDisplay, setPasswordStrengthDisplay] =
    useState("none");

  const [isValid4SignUp, setIsValid4SignUp] = useState();
  const [isValid4SignUpFeedback, setIsValid4SignUpFeedback] = useState();

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
        setIsLoading(false);

        if (e.toString() === "Error: Login required") {
          setIsLoading(false);
        }
      });
  }, []);

  const webAuthSignUp = () => {
    if (
      email === "" ||
      password === "" ||
      passwordConfirm === "" ||
      firstName === "" ||
      lastName === ""
    ) {
      setIsInvalid4EmailFormat("");
      setIsInvalid4UserExists("");
      setIsInvalidForWeakPassword("");
      setIsInvalid4PasswordNoMatch("");

      setEmailFormatInvalidFeedback("");
      setIsInvalid4UserExistsFeedback("");
      setPasswordStrengthInvalidFeedback("");
      setPasswordInvalidFeedbackNoMatch("");

      if (email === "") {
        setIsInvalidForNoEmail("is-invalid");
        setIsInvalidForNoEmailFeedback("Please fill out this field");
      } else {
        setIsInvalidForNoEmail("");
        setIsInvalidForNoEmailFeedback("");
      }
      if (password === "") {
        setIsInvalidForNoPassword("is-invalid");
        setIsInvalidForNoPasswordFeedback("Please fill out this field");
      } else {
        setIsInvalidForNoPassword("");
        setIsInvalidForNoPasswordFeedback("");
      }
      if (passwordConfirm === "") {
        setIsInvalidForNoPasswordConfirm("is-invalid");
        setIsInvalidForNoPasswordConfirmFeedback("Please fill out this field");
      } else {
        setIsInvalidForNoPasswordConfirm("");
        setIsInvalidForNoPasswordConfirmFeedback("");
      }
      if (firstName === "") {
        setIsInvalidForNoFirstName("is-invalid");
        setIsInvalidForNoFirstNameFeedback("Please fill out this field");
      } else {
        setIsInvalidForNoFirstName("");
        setIsInvalidForNoFirstNameFeedback("");
      }
      if (lastName === "") {
        setIsInvalidForNoLastName("is-invalid");
        setIsInvalidForNoLastNameFeedback("Please fill out this field");
      } else {
        setIsInvalidForNoLastName("");
        setIsInvalidForNoLastNameFeedback("");
      }
    } else {
      setIsInvalidForNoFirstName("");
      setIsInvalidForNoLastName("");
      setIsInvalidForNoEmail("");
      setIsInvalidForNoPassword("");
      setIsInvalidForNoPasswordConfirm("");

      setIsInvalidForNoFirstNameFeedback("");
      setIsInvalidForNoLastNameFeedback("");
      setIsInvalidForNoEmailFeedback("");
      setIsInvalidForNoPasswordFeedback("");
      setIsInvalidForNoPasswordConfirmFeedback("");

      if (password !== passwordConfirm) {
        setEmailFormatInvalidFeedback("");
        setIsInvalid4UserExistsFeedback("");
        setPasswordStrengthInvalidFeedback("");

        setIsInvalid4EmailFormat("");
        setIsInvalid4UserExists("");
        setIsInvalidForWeakPassword("");

        setIsInvalid4PasswordNoMatch("is-invalid ");
        setPasswordInvalidFeedbackNoMatch("passwords do not match.");
      } else {
        webAuthLoginWithRoles.signup(
          {
            connection: issueTrackerRealm,
            email: email,
            password: password,
            userMetadata: { firstName: firstName, lastName: lastName },
          },
          (err, result) => {
            if (err) {
              if (err.code.includes("email format validation failed")) {
                setIsInvalid4UserExists("");
                setIsInvalidForWeakPassword("");
                setIsInvalid4PasswordNoMatch("");

                setIsInvalid4UserExistsFeedback("");
                setPasswordStrengthInvalidFeedback("");
                setPasswordInvalidFeedbackNoMatch("");

                setIsInvalid4EmailFormat("is-invalid");
                setEmailFormatInvalidFeedback("Email format is invalid");
              } else if (err.code === "invalid_signup") {
                setIsInvalid4UserExists("is-invalid");
                setIsInvalid4UserExistsFeedback(
                  "That email is taken. Try another."
                );
              } else if (err.name === "PasswordStrengthError") {
                setIsInvalidForWeakPassword("is-invalid");
                setPasswordStrengthInvalidFeedback("password is too weak");
              }
            } else if (result) {
              setIsValid4SignUp("is-valid");
              setIsValid4SignUpFeedback(
                "Success! you will be redirected to login page momentarily."
              );
              setTimeout(() => {
                navigate("/");
              }, 4500);
            }
          }
        );
      }
    }
  };

  if (isLoading) {
    return <div></div>;
  } else {
    return (
      <div className="width">
        <div className="container signUpWidth">
          <h1>Sign up</h1>
          <hr />

          <div className="row enable-grid-classes">
            <div class="mb-3 col-md-6">
              <label for="exampleInputEmail1" class="form-label mt-4">
                First Name
              </label>

              <input
                type="text"
                onChange={(e) => {
                  setFirstName(e.target.value);
                }}
                className={
                  "form-control " +
                  isInvalidForNoFirstName +
                  " " +
                  isValid4SignUp
                }
                value={firstName}
                required="required"
              />
              <div className="invalid-feedback">
                {isInvalidForNoFirstNameFeedback}
              </div>
              <div className="valid-feedback">{isValid4SignUpFeedback}</div>
            </div>

            <div class="mb-3 col-md-6">
              <label for="exampleInputEmail1" class="form-label mt-4">
                Last Name
              </label>

              <input
                type="text"
                onChange={(e) => {
                  setLastName(e.target.value);
                }}
                className={
                  "form-control " +
                  isInvalidForNoLastName +
                  " " +
                  isValid4SignUp
                }
                value={lastName}
                required="required"
              />
              <div className="invalid-feedback">
                {isInvalidForNoLastNameFeedback}
              </div>
              <div className="valid-feedback">{isValid4SignUpFeedback}</div>
            </div>
          </div>

          <div className="row enable-grid-classes">
            <div class="mb-3 col-md-6">
              <label for="exampleInputEmail1" class="form-label ">
                Email
              </label>

              <input
                type="text"
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                className={
                  "form-control " +
                  isInvalidForNoEmail +
                  " " +
                  isInvalid4EmailFormat +
                  " " +
                  isInvalid4UserExists +
                  " " +
                  isValid4SignUp
                }
                value={email}
                required="required"
              />
              <div className="invalid-feedback">
                {emailFormatInvalidFeedback}
                {isInvalidForNoEmailFeedback}
              </div>
              <div className="valid-feedback">{isValid4SignUpFeedback}</div>
            </div>
          </div>

          <div className="row enable-grid-classes">
            <div class="mb-3 col-md-6">
              <label for="exampleInputPassword1" class="form-label">
                Password
              </label>
              <input
                type="password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordStrengthDisplay("block");
                }}
                className={
                  "form-control " +
                  isInvalid4PasswordNoMatch +
                  " " +
                  isInvalidForWeakPassword +
                  " " +
                  isInvalidForNoPassword
                }
                value={password}
                required
                onin
              />
              <div className="invalid-feedback">
                {passwordStrengthInvalidFeedback}
                {isInvalidForNoPasswordFeedback}
              </div>
            </div>
          </div>

          <div className="row enable-grid-classes">
            <div className="mb-3 col-md-6">
              <label class="form-label">confirm password</label>

              <input
                key={setIsInvalidForWeakPassword}
                onChange={(e) => {
                  setPasswordConfirm(e.target.value);
                }}
                type="password"
                className={
                  "form-control " +
                  isInvalid4PasswordNoMatch +
                  " " +
                  isInvalidForNoPasswordConfirm
                }
                required
                id="password_confirm"
                onin
                value={passwordConfirm}
              />

              <div className="invalid-feedback">
                {passwordInvalidFeedbackNoMatch}
                {isInvalidForNoPasswordConfirmFeedback}
              </div>

              <div
                style={{ display: passwordStrengthDisplay }}
                className="form-floating border rounded mt-4"
              >
                <ul className="mt-3  ap-ul ul-no-bullet-point">
                  <li className="mb-1">Your password must contain: </li>
                  <ul className="ps-3 ">
                    {" "}
                    <li> At least 8 characters </li>
                    <li className="mb-1"> At least 3 of the following: </li>
                  </ul>

                  <ul className="ps-5 ">
                    {" "}
                    <li>Lower case letters (a-z)</li>
                    <li className="mb-1">Upper case letters (A-Z)</li>
                    <li className="mb-1">Numbers (0-9)</li>
                    <li className="mb-1">Special characters (e.g. !@#$%^&*)</li>
                  </ul>
                </ul>
              </div>

              <button onClick={webAuthSignUp} class="btn mt-5 btn-primary mb-4">
                SIGN UP
              </button>

              <Link to="/">
                <div>
                  <p>
                    <a>Sign in instead</a>
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Signup;
