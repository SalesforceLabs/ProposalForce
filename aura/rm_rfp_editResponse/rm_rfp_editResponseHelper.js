({
  fireEvent: function(eventName, params) {
    const { component } = this
    const helper = this
    const compEvent = component.getEvent(eventName)
    compEvent.setParams(params)
    compEvent.fire()
  },
  toggleClass: function(auraId, className) {
    const { component } = this
    const helper = this
    const el = component.find(auraId)
    if (el.length) {
      el.forEach(e => $A.util.toggleClass(e, className))
    } else {
      $A.util.toggleClass(el, className)
    }
  },

  addClass: function(auraId, className) {
    const { component } = this
    const helper = this
    const el = component.find(auraId)
    if (el.length) {
      el.forEach(e => $A.util.addClass(e, className))
    } else {
      $A.util.addClass(el, className)
    }
  },

  removeClass: function(auraId, className) {
    const { component } = this
    const helper = this
    const el = component.find(auraId)
    if (el.length) {
      el.forEach(e => $A.util.removeClass(e, className))
    } else {
      $A.util.removeClass(el, className)
    }
  }
})