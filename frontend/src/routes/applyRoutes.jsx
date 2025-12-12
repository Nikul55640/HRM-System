// src/routes/applyRoutes.jsx
import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../core/guards/ProtectedRoute";

export const applyRoutes = (routes) => {
  console.log('🛣️ [APPLY ROUTES] Applying routes:', routes.map(r => ({ path: r.path, roles: r.roles })));
  
  return routes.map(({ path, element: Element, roles }, index) => {
    console.log(`🛣️ [APPLY ROUTES] Creating route: ${path} with roles:`, roles);
    
    const Wrapped = (
      <ProtectedRoute allowedRoles={roles}>
        <Element />
      </ProtectedRoute>
    );

    return <React.Fragment key={index}>
      <Route path={path} element={roles ? Wrapped : <Element />} />
    </React.Fragment>;
  });
};
