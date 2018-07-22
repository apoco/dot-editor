import * as React from "react";

class Diagram extends React.Component {
  state = {
    offsetX: 0,
    offsetY: 0,
    dragOffsetX: 0,
    dragOffsetY: 0
  };

  isDragging = false;
  dragPointer = null;
  dragX = null;
  dragY = null;

  handlePointerDown = e => {
    e.preventDefault();

    Object.assign(this, {
      isDragging: true,
      dragPointer: e.pointerId,
      dragX: e.screenX,
      dragY: e.screenY
    });

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  handlePointerMove = e => {
    if (e.pointerId === this.dragPointer && this.isDragging) {
      e.preventDefault();

      this.setState({
        dragOffsetX: e.screenX - this.dragX,
        dragOffsetY: e.screenY - this.dragY
      });
    }
  };
  
  handlePointerUp = e => {
    if (e.pointerId === this.dragPointer) {
      const { offsetX, offsetY } = this.state;

      e.preventDefault();
      e.currentTarget.releasePointerCapture(this.dragPointer);
      this.isDragging = false;

      this.setState({
        offsetX: offsetX + e.screenX - this.dragX,
        offsetY: offsetY + e.screenY - this.dragY,
        dragOffsetX: 0,
        dragOffsetY: 0
      });
    }
  };

  render() {
    const { offsetX, offsetY, dragOffsetX, dragOffsetY } = this.state;

    return (
      <div
        id="diagram"
        onPointerDown={this.handlePointerDown}
        onPointerMove={this.handlePointerMove}
        onPointerUp={this.handlePointerUp}
      >
        <svg
          id="canvas"
          transform={`
            translate(${offsetX + dragOffsetX} ${offsetY + dragOffsetY})
          `}
          dangerouslySetInnerHTML={{ __html: this.props.svg }}
        />
      </div>
    );
  }
}

export default Diagram;
