import React from "react";
import { useLocation } from "react-router-dom";

export const ComingSoon: React.FunctionComponent = () => {
  let location = useLocation();

  return (
    <div>
      <h3>Coming soon.</h3>
      <p>
        The requested page <code>{location.pathname}</code> is coming soon.
      </p>
    </div>
  );
};
