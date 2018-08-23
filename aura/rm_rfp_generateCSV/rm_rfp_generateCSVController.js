({
  init: function(component, event, helper) {
    const rfpId = component.get('v.recordId')
    const action = component.get('c.generateCSV')
    action.setParams({ rfpId })
    action.setCallback(this, a => {
      if (a.getState() === 'ERROR') {
        component.set('v.error', a.getError())
      } else if (a.getState() === 'SUCCESS') {
        component.set('v.fileId', a.getReturnValue())
      }
    })
    $A.enqueueAction(action)
  }
})