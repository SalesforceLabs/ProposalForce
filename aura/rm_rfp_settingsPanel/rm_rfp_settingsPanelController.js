({
  init: function(component, event, helper) {
    helper.component = component
    const { selectedComplianceResponses } = component.get('v.state')
    component.set('v.newComplianceResponses', selectedComplianceResponses)
  },
  updateNewComplianceResponses: function(component, event, helper) {
    const { selectedComplianceResponses } = component.get('v.state')
    component.set('v.newComplianceResponses', selectedComplianceResponses)
  },

  render: function(component, event, helper) {
    const newResponseComponent = component.find('add-response-input')
    const firstRender = component.get('v.firstRender')

    if (newResponseComponent && firstRender) {
      component.set('v.firstRender', false)

      const modalContainer = component.find('modal')
      const modalContainerElement = modalContainer.getElement()
      modalContainerElement.addEventListener('keyup', evt => {
        evt.preventDefault()
        if (evt.keyCode === 27) {
          helper.closeModalAndCancel()
        }
      })

      const newResponseInput = newResponseComponent.getElement()
      newResponseInput.addEventListener('keyup', evt => {
        evt.preventDefault()
        if (evt.keyCode === 13) {
          helper.addResponse()
        }
      })
    }
  },

  handleSave: function(component, event, helper) {
    const { RFPs, selectedRfpId } = component.get('v.state')
    const newComplianceResponses = component.get('v.newComplianceResponses')
    const rfp = RFPs.filter(r => r.Id === selectedRfpId)[0]
    rfp.proposalforce__Compliance_Responses__c = newComplianceResponses.join(
      ';'
    )
    helper.fireEvent('rm_rfp_action', {
      type: 'setNewComplianceResponses',
      payload: { rfp }
    })
    helper.closeModal()
    const { selectedComplianceResponses } = component.get('v.state')
    component.set('v.newComplianceResponses', selectedComplianceResponses)
  },

  removeResponse: function(component, event, helper) {
    const newComplianceResponses = component.get('v.newComplianceResponses')
    const selectedResponse = event.currentTarget.dataset.responsetext
    const idxToRemove = newComplianceResponses.indexOf(selectedResponse)
    newComplianceResponses.splice(idxToRemove, 1)
    component.set('v.newComplianceResponses', newComplianceResponses)
  },

  addResponse: function(component, event, helper) {
    helper.addResponse()
  },

  closeModalAndCancel: function(component, event, helper) {
    helper.closeModalAndCancel()
    // const { selectedComplianceResponses } = component.get('v.state')
    // component.set('v.newComplianceResponses', selectedComplianceResponses)
    // helper.closeModal()
  },
  openModal: function(component, event, helper) {
    helper.addClass('modal', 'slds-fade-in-open')
    helper.addClass('backdrop', 'slds-backdrop_open')
  }
})