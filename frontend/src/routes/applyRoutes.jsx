// src/routes/applyRoutes.jsx
import React from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "../components/common";

export const applyRoutes = (routes) =>
  routes.map(({ path, element: Element, roles }, index) => {
    const Wrapped = (
      <ProtectedRoute allowedRoles={roles}>
        <Element />
      </ProtectedRoute>
    );

    return <React.Fragment key={index}>
      <Route path={path} element={roles ? Wrapped : <Element />} />
    </React.Fragment>;
  });
