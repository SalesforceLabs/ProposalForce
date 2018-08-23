({
  addResponse: function() {
    const { component } = this
    const helper = this
    const newComplianceResponses = component.get('v.newComplianceResponses')
    const newResponseInput = component.find('add-response-input').getElement()
    const newResponseValue = newResponseInput.value
    newComplianceResponses.push(newResponseValue)
    newResponseInput.value = ''
    newResponseInput.focus()
    component.set('v.newComplianceResponses', newComplianceResponses)
  },

  closeModal: function() {
    const helper = this
    helper.removeClass('modal', 'slds-fade-in-open')
    helper.removeClass('backdrop', 'slds-backdrop_open')
  },

  closeModalAndCancel: function() {
    const helper = this
    const { component } = this
    helper.closeModal()
    const { selectedComplianceResponses } = component.get('v.state')
    component.set('v.newComplianceResponses', selectedComplianceResponses)
  },

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