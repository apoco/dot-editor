import * as React from "react";
import { PointerEventHandler, WheelEventHandler } from "react";

const SCALING_RATE = 0.001;

type Props = {
  svg: string;
  className: string;
};

type State = {
  offsetX: number;
  offsetY: number;
  dragOffsetX: number;
  dragOffsetY: number;
  scale: number;
};

class Diagram extends React.Component<Props, State> {
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

  handlePointerDown: PointerEventHandler = e => {
    e.preventDefault();

    Object.assign(this, {
      isDragging: true,
      dragPointer: e.pointerId,
      dragX: e.screenX,
      dragY: e.screenY
    });

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  handlePointerMove: PointerEventHandler = e => {
    if (e.pointerId === this.dragPointer && this.isDragging) {
      e.preventDefault();

      this.setState({
        dragOffsetX: e.screenX - (this.dragX || 0),
        dragOffsetY: e.screenY - (this.dragY || 0)
      });
    }
  };

  handlePointerUp: PointerEventHandler = e => {
    const { state, dragPointer } = this;

    if (dragPointer && e.pointerId === dragPointer) {
      const { offsetX, offsetY } = state;

      e.preventDefault();
      e.currentTarget.releasePointerCapture(dragPointer);
      this.isDragging = false;

      this.setState({
        offsetX: offsetX + e.screenX - (this.dragX || 0),
        offsetY: offsetY + e.screenY - (this.dragY || 0),
        dragOffsetX: 0,
        dragOffsetY: 0
      });
    }
  };

  handleWheel: WheelEventHandler = e => {
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
