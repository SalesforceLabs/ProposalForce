({
  pillClick: function(component, event, helper) {
    helper.component = component
    const clickedPill = event.getSource()
    const selectedFilterName = clickedPill.get('v.name')

    helper.fireEvent('rm_rfp_action', {
      type: 'filterSelected',
      payload: {
        selectedFilterName
      }
    })
  }
})