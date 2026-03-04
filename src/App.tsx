import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import CreateCampaign from "./pages/CreateCampaign";
import CampaignDetails from "./pages/CampaignDetails";
import Participants from "./pages/Participants";
import Users from "./pages/Users";
import PublicCampaignView from "./pages/PublicCampaignView";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/view/:id" element={<PublicCampaignView />} />
          <Route
            path="/"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/campaigns"
            element={
              <Layout>
                <Campaigns />
              </Layout>
            }
          />
          <Route
            path="/campaigns/create"
            element={
              <Layout>
                <CreateCampaign />
              </Layout>
            }
          />
          <Route
            path="/campaigns/:id"
            element={
              <Layout>
                <CampaignDetails />
              </Layout>
            }
          />
          <Route
            path="/participants"
            element={
              <Layout>
                <Participants />
              </Layout>
            }
          />
          <Route
            path="/users"
            element={
              <Layout>
                <Users />
              </Layout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
