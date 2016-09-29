/**
 * The base class for all Facade classes.
 *
 * A Facade is basically just a class that receives property assignments from a scene descriptor
 * and manages forwarding the resulting state to more complex underlying implementation
 * objects, e.g. ThreeJS objects.
 *
 * The instantiated facade objects have a very simple lifecycle:
 *   - The `constructor` in which the initial state and the underyling implementation object(s)
 *     can be initialized. It will be passed a single argument: the `parent` facade object.
 *   - Updates to the object's properties, usually by direct assignment from the scene descriptor.
 *     These updates can be handled immediately by defining property setters that handle syncing
 *     new values to the underyling implementation object(s).
 *   - The `afterUpdate()` method which signals the end of all property updates; this can be
 *     implemented to handle syncing the full set of updated properties to the underlying
 *     implementation object(s). Useful if an aspect of the syncing relies on multiple properties
 *     or needs things to be synced in a specific order.
 *   - The `destructor` method which is always called when the object is removed from the scene.
 *     Implement this to remove and clean up the underlying implementation object(s) and other
 *     cleanup logic.
 *
 * Scene Descriptors:
 *
 * All facade instances are created, updated, and destroyed based on the current structure of
 * a scene descriptor object. The properties in the descriptor are generally just copied
 * directly to properties of the same names on the facade instance, which can handle them
 * either by custom setters or in `afterUpdate`. There are a few special properties in the
 * descriptor:
 *
 *   - `key`: (required) an identifier that is unique amongst the descriptor's siblings, which
 *     is used to associate the descriptor with its corresponding Facade instance.
 *   - `class`: (required) a reference to the Facade class that will be instantiated.
 *   - `children`: (optional) for `Parent` facade subclasses, defines the child object descriptors.
 *   - `transition`: (optional) defines a set of properties that should be transitioned smoothly
 *     when their value changes. See `Animatable` for more details.
 *   - `animation`: (optional) defines one or more keyframe animations. See `Animatable` for more details.
 */
export default class FacadeBase {
  constructor(parent) {
    this.$facadeId = `facade${ idCounter++ }`
    this.parent = parent
    this.ref = this._lastRef = null

    // If the subclass has not implemented an onNotify method, copy the parent's implementation.
    // This allows bubbling notifications up to the topmost impl without having to explicitly
    // walk all the way up the chain on each call. It assumes implementations will not be added
    // after the fact anywhere in the prototype chain.
    // TODO see if this is worthwhile, has issues with 'this' binding
    // if (!this.onNotify) {
    //   this.onNotify = parent && parent.onNotify && parent.onNotify.bind(parent)
    // }
  }

  /**
   * Called at the end of an update batch, after all individual properties have been assigned.
   */
  afterUpdate() {
    // Handle calling ref function
    let ref = this.ref
    if (ref !== this._lastRef) {
      if (typeof this._lastRef === 'function') {
        this._lastRef.call(null, null)
      }
      if (typeof ref === 'function') {
        ref.call(null, this)
        this._lastRef = ref
      } else {
        this._lastRef = null
      }
    }
  }

  /**
   * Dispatch a message with optional data up the facade parent tree.
   */
  notify(message, data) {
    this.parent.onNotify(this, message, data)
  }

  /**
   * Default notify handler just bubbles it up
   */
  onNotify(...args) {
    this.parent.onNotify(...args)
  }

  /**
   * Called when the instance is being removed from the scene. Override this to implement any
   * custom cleanup logic.
   */
  destructor() {
    delete this.parent
    if (typeof this.ref === 'function') {
      this.ref.call(null, null)
    }
  }
}


let idCounter = 0
const DEF_SPECIAL_PROPS = {key:1, class:1, transition:1}

/**
 * Determine if a certain property name is one of the special descriptor properties
 */
export function isSpecialDescriptorProperty(name) {
  return DEF_SPECIAL_PROPS.hasOwnProperty(name)
}
