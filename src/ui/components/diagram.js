import * as React from "react";

export default ({ svg }) => (
  <div id="diagram">
    <svg dangerouslySetInnerHTML={{ __html: svg }} />
  </div>
);
