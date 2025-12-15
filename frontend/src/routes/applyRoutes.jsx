// src/routes/applyRoutes.jsx
import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../core/guards/ProtectedRoute";

export const applyRoutes = (routes) => {
  return routes.map(({ path, element, roles }, index) => {
    const wrappedElement = roles ? (
      <ProtectedRoute allowedRoles={roles}>
        {element}
      </ProtectedRoute>
    ) : element;

    return (
      <Route key={index} path={path} element={wrappedElement} />
    );
  });
};
