({
  getCategories: function() {
    try {
      this.fireEvent('rm_rfp_action', {
        type: 'getKnowledgeCategories',
        payload: {}
      })
    } catch (error) {
      this.fireEvent('rm_rfp_action', {
        type: 'error',
        payload: {
          error
        }
      })
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