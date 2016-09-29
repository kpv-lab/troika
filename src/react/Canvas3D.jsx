import React, {PropTypes as T} from 'react'
import World from '../facade/World'




const Canvas3D = React.createClass({
  displayName: 'Canvas3D',

  propTypes: {
    width: T.number.isRequired,
    height: T.number.isRequired,
    backgroundColor: T.any,
    lights: T.array,
    camera: T.object.isRequired,
    objects: T.array.isRequired,
    antialias: T.bool,
    showStats: T.bool,
    onBackgroundClick: T.func,
    className: T.string
  },

  componentDidUpdate() {
    this.updateWorld()
  },

  _bindCanvasRef(canvas) {
    if (canvas) {
      this.initWorld(canvas)
      this.updateWorld()
    } else {
      this.destroyWorld()
    }
  },

  _bindStatsRef(stats) {
    this._glStats = stats
  },

  initWorld(canvas) {
    let props = this.props
    this._world = new World(canvas, {
      antialias: props.antialias
    })
  },

  updateWorld() {
    let props = this.props
    let world = this._world
    world.width = props.width
    world.height = props.height
    world.backgroundColor = props.backgroundColor
    world.camera = props.camera
    world.scene = {
      lights: props.lights,
      children: props.objects,
      onClick: props.onBackgroundClick
    }
    world.afterUpdate()
  },

  destroyWorld() { //just to see it burn
    if (this._world) {
      this._world.destructor()
      delete this._world
    }
  },


  _onMouseMove(e) {
    this._world.handleMouseMoveEvent(e)
  },

  _onMouseButton(e) {
    this._world.handleMouseButtonEvent(e)
  },


  render() {
    return (
      <div className={ this.props.className }>
        <canvas
          ref={ this._bindCanvasRef }
          onMouseMove={ this._onMouseMove }
          onMouseOut={ this._onMouseMove }
          onClick={ this._onMouseButton }
          onMouseDown={ this._onMouseButton }
          onMouseUp={ this._onMouseButton }
          onDoubleClick={ this._onMouseButton }
        />
        
        { /*props.showStats && this._threeJsRenderer ? (
          <threejsUtils.WebGlStats
            ref={ this.bindStatsRef }
            renderer={ this._threeJsRenderer }
          />
        ) : null*/ }
      </div>
    )
  }
})

export default Canvas3D