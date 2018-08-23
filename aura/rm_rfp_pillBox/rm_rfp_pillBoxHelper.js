({
  fireEvent: function(eventName, params) {
    const { component } = this
    const helper = this
    const compEvent = component.getEvent(eventName)
    compEvent.setParams(params)
    compEvent.fire()
  }
})