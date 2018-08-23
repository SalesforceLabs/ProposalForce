({
  goToSObject: function(objectId, isredirect) {
    const { component } = this
    const helper = this
    isredirect = isredirect || false
    const navEvt = $A.get('e.force:navigateToSObject')
    if (navEvt) {
      navEvt.setParams({
        recordId: objectId,
        isredirect: isredirect
      })
      navEvt.fire()
    } else {
      window.location.href = `/${objectId}`
    }
  },

  fireEvent: function(eventName, params) {
    const { component } = this
    const helper = this
    const compEvent = component.getEvent(eventName)
    compEvent.setParams(params)
    compEvent.fire()
  }
})