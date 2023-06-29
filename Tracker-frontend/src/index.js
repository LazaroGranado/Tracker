/* eslint-disable */
import React from "react";
import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import auth0 from "auth0-js";

import App from "./App.js";

const issueTrackerClientId = process.env.REACT_APP_ISSUETRACKERCLIENTID;
const issueTrackerDomain = process.env.REACT_APP_ISSUETRACKERDOMAIN;
const issueTrackerRedirectUri =
  process.env.REACT_APP_ISSUETRACKERWEBAUTHREDIRECTURI;

const issueTrackerAudience = process.env.REACT_APP_ISSUETRACKERAUDIENCE;
const issueTrackerWithRolesAudience =
  process.env.REACT_APP_ISSUETRACKERWITHROLESAUDIENCE;

const issueTrackerWebAuthResponseType =
  process.env.REACT_APP_ISSUETRACKERWEBAUTHRESPONSETYPE;
const issueTrackerWebAuthLoginResponseType =
  process.env.REACT_APP_ISSUETRACKERWEBAUTHLOGINRESPONSETYPE;
const issueTrackerPrompt = process.env.REACT_APP_ISSUETRACKERPROMPT;
const issueTrackerScope = process.env.REACT_APP_ISSUETRACKERSCOPE;

export const webAuthLoginWithRoles = new auth0.WebAuth({
  clientID: issueTrackerClientId,
  domain: issueTrackerDomain,

  redirectUri: window.location.origin,

  audience: issueTrackerWithRolesAudience,
  scope: issueTrackerScope,
  responseType: issueTrackerWebAuthLoginResponseType,
  prompt: issueTrackerPrompt,
});

export const webAuth = new auth0.WebAuth({
  clientID: issueTrackerClientId,
  domain: issueTrackerDomain,
  redirectUri: issueTrackerRedirectUri,
  audience: issueTrackerAudience,
  scope: issueTrackerScope,
  responseType: issueTrackerWebAuthResponseType,
  prompt: issueTrackerPrompt,
});

export const webAuthLogin = new auth0.WebAuth({
  clientID: issueTrackerClientId,
  domain: issueTrackerDomain,
  redirectUri: issueTrackerRedirectUri,
  audience: issueTrackerAudience,
  scope: issueTrackerScope,
  responseType: issueTrackerWebAuthLoginResponseType,
  prompt: issueTrackerPrompt,
});

export const webAuthWithRoles = new auth0.WebAuth({
  clientID: issueTrackerClientId,
  domain: issueTrackerDomain,
  redirectUri: issueTrackerRedirectUri,
  audience: issueTrackerWithRolesAudience,
  scope: issueTrackerScope,
  responseType: issueTrackerWebAuthResponseType,
  prompt: issueTrackerPrompt,
});

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <BrowserRouter>
    <Auth0Provider
      domain={issueTrackerDomain}
      clientId={issueTrackerClientId}
      authorizationParams={{
        audience: issueTrackerWithRolesAudience,
      }}
    >
      <App />
    </Auth0Provider>
  </BrowserRouter>
);
