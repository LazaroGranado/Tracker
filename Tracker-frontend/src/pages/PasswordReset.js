/* eslint-disable */
import { useAuth0 } from "@auth0/auth0-react";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { webAuth } from "../index.js";
import jwt from "jsonwebtoken";

function PasswordReset() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);

  const { loginWithRedirect, isAuthenticated, getAccessTokenSilently } =
    useAuth0();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isInvalid4WrongEmailOrPassword, setIsValidRequestSent] = useState();
  const [isInvalidForNoEmail, setIsInvalidForNoEmail] = useState();
  const [isInvalidForNoEmailFeedback, setIsInvalidForNoEmailFeedback] =
    useState();
  const [requestSentFeedback, setRequestSentFeedback] = useState();

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
            // setIsLoading(false)
          }
        };

        if (r) {
          decodeIdToken();
        } else {
          // setIsLoading(false)
        }
      })
      .catch((e) => {
        if (e.toString() === "Error: Login required") {
          // setIsLoading(false)
        }
      });
  }, []);

  const requestReset = (event) => {
    event.preventDefault();

    if (email === "") {
      if (email === "") {
        setIsInvalidForNoEmail("is-invalid");
        setIsInvalidForNoEmailFeedback("Please fill out this field");
      } else {
        setIsInvalidForNoEmail("");
        setIsInvalidForNoEmailFeedback("");
      }
    } else {
      setIsInvalidForNoEmail("");

      setIsInvalidForNoEmailFeedback("");

      webAuth.changePassword(
        {
          connection: "Username-Password-Authentication",
          email: email,
        },
        (err, result) => {
          if (
            result === "We've just sent you an email to reset your password."
          ) {
            setIsValidRequestSent("is-valid");
            setRequestSentFeedback(
              "if an account exists with this email, an email has been sent to reset your password."
            );
          }
        }
      );
    }
  };

  if (isLoading) {
    return <div></div>;
  } else {
    return (
      <div className="width">
        <form className="align-items-center enable-grid-classes justify-content-center">
          <div class="mb-3 mt-5 col-md-6 m-auto">
            <h1>Request password reset</h1>
            <hr />
            <label for="exampleInputEmail1" class="form-label mt-4">
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
                isInvalid4WrongEmailOrPassword
              }
              value={email}
              required="required"
            />
            <div className="valid-feedback">{requestSentFeedback}</div>
          </div>

          <div class="mb-3 col-md-6 m-auto"></div>
          <div class="mb-3 col-md-6 m-auto">
            <button
              onClick={(event) => requestReset(event)}
              class="btn btn-primary mt-3 mb-4"
            >
              Send request
            </button>
            <div>
              <Link to="/signup">
                <p>
                  <a>Register as a new user</a>
                </p>
              </Link>

              <Link to="/">
                <div>
                  <p>
                    <a>Sign in instead</a>
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default PasswordReset;
