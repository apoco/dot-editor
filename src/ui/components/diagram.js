import * as React from "react";

export default ({ svg }) => (
  <div id="diagram">
    <svg id="canvas" dangerouslySetInnerHTML={{ __html: svg }} />
  </div>
);
