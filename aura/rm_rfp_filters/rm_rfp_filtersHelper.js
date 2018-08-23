({
  fireEvent: function(eventName, params) {
    const { component } = this
    const helper = this
    const compEvent = component.getEvent(eventName)
    compEvent.setParams(params)
    compEvent.fire()
  },

  resetSearch: function(previousIndexHits, categoryPills) {
    const helper = this
    // updates by reference
    if (
      previousIndexHits &&
      categoryPills &&
      previousIndexHits.length &&
      categoryPills.length
    ) {
      previousIndexHits.forEach(prevHitIdx => {
        categoryPills[prevHitIdx].searchHit = false
      })
    }
    helper.fireEvent('rm_rfp_action', {
      type: 'updateState',
      payload: {
        previousIndexHits: []
      }
    })
  }
})