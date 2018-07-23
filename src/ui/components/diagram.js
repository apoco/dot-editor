import * as React from "react";

const SCALING_RATE = 0.001;

class Diagram extends React.Component {
  state = {
    offsetX: 0,
    offsetY: 0,
    dragOffsetX: 0,
    dragOffsetY: 0,
    scale: 1
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

  handleWheel = e => {
    e.preventDefault();
    this.setState({
      scale: this.state.scale + e.deltaY * SCALING_RATE
    });
  };

  render() {
    const { svg, className } = this.props;
    const { offsetX, offsetY, dragOffsetX, dragOffsetY, scale } = this.state;

    return (
      <div
        className={className}
        onPointerDown={this.handlePointerDown}
        onPointerMove={this.handlePointerMove}
        onPointerUp={this.handlePointerUp}
        onWheel={this.handleWheel}
      >
        <svg
          className="canvas"
          transform={`
            translate(${offsetX + dragOffsetX} ${offsetY + dragOffsetY})
            scale(${scale})
          `}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    );
  }
}

export default Diagram;
