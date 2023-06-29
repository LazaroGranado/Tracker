/* eslint-disable */
import React from "react";
import { Routes, Route } from "react-router-dom";
import ProjectsCreate from "./pages/ProjectsCreate.js";
import TicketsCreate from "./pages/TicketsCreate";
import "./App.css";
import Layout from "./pages/Layout.js";
import Projects from "./pages/Projects";
import Tickets from "./pages/Tickets";
import Login from "./pages/Login.js";
import ProjectsDetails from "./pages/ProjectsDetails";
import TicketsDetails from "./pages/TicketsDetails";
import AssignDeveloper from "./pages/AssignDeveloper";
import TicketsEdit from "./pages/TicketsEdit";
import ProjectsEdit from "./pages/ProjectsEdit";
import ProjectsArchived from "./pages/ProjectsArchived";
import ProjectsUnassigned from "./pages/ProjectsUnassigned";
import TicketsArchived from "./pages/TicketsArchived";
import TicketsUnassigned from "./pages/TicketsUnassigned";
import ManageRoles from "./pages/ManageRoles";
import { ProSidebarProvider } from "react-pro-sidebar";
import Company from "./pages/Company";
import Dashboard from "./pages/Dashboard";
import DemoLogin from "./pages/DemoLogin";
import ManageTeam from "./pages/ManageTeam";
import MyProjects from "./pages/MyProjects";
import MyTickets from "./pages/MyTickets";
import Signup from "./pages/Signup";

export default function App() {
  return (
    <ProSidebarProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Login />} />
          <Route path="/Projects" element={<Projects />} />
          <Route path="/Tickets" element={<Tickets />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Projects/Create" element={<ProjectsCreate />} />
          <Route path="/Tickets/Create" element={<TicketsCreate />} />
          <Route path="/Projects/Details" element={<ProjectsDetails />} />
          <Route path="/Tickets/Details" element={<TicketsDetails />} />
          <Route path="/Projects/Archived" element={<ProjectsArchived />} />
          <Route path="/Projects/Unassigned" element={<ProjectsUnassigned />} />
          <Route path="/Tickets/Archived" element={<TicketsArchived />} />
          <Route path="/Tickets/Unassigned" element={<TicketsUnassigned />} />
          <Route path="/Projects/Edit" element={<ProjectsEdit />} />
          <Route path="/Tickets/Edit" element={<TicketsEdit />} />
          <Route
            path="/Tickets/AssignDeveloper"
            element={<AssignDeveloper />}
          />
          <Route path="/ManageRoles" element={<ManageRoles />} />
          <Route path="/Company" element={<Company />} />
          <Route path="/Home" element={<Dashboard />} />
          <Route path="/Demo/Login" element={<DemoLogin />} />
          <Route path="/ManageTeam" element={<ManageTeam />} />
          <Route path="/Projects/MyProjects" element={<MyProjects />} />
          <Route path="/Tickets/MyTickets" element={<MyTickets />} />
          <Route path="/Signup" element={<Signup />} />
        </Route>
      </Routes>
    </ProSidebarProvider>
  );
}
