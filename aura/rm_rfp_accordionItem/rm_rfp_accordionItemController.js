({
  init: function(component, event, helper) {
    helper.component = component
  },

  render: function(component, event, helper) {
    const accordionItem = component.find('accordionItem')
    const { Id } = component.get('v.question')
    const { selectedQuestionId } = component.get('v.state')
    if (accordionItem && Id === selectedQuestionId) {
      accordionItem.getElement().scrollIntoView()
    }
  },

  setSelectedQuestion: function(component, event, helper) {
    try {
      const question = component.get('v.question')
      const { proposalforce__RFP_Response__r } = question
      const { selectedQuestionId, namespacePrefix } = component.get('v.state')
      let payload

      if (question.Id === selectedQuestionId) {
        payload = {
          selectedResponse: '',
          query: question.proposalforce__RFP_Question_Text__c,
          selectedQuestionId: null,
          selectedQuestion: null
        }
      } else {
        const responseText = proposalforce__RFP_Response__r
          ? proposalforce__RFP_Response__r.proposalforce__Response_Text__c
          : ''
        payload = {
          selectedResponse: {
            Answer__c: responseText,
            Title: proposalforce__RFP_Response__r
              ? proposalforce__RFP_Response__r.Name
              : ''
          },
          selectedQuestionId: question.Id,
          query: question.proposalforce__RFP_Question_Text__c,
          selectedQuestion: question
        }
      }

      helper.fireEvent('rm_rfp_action', {
        type: 'updateState',
        payload
      })
    } catch (error) {
      helper.fireEvent('rm_rfp_action', {
        type: 'error',
        payload: {
          error
        }
      })
    }
  },

  handleMenuSelect: function(component, event, helper) {
    event.preventDefault()
    const value = event.getParam('value')
    if (value === 'updateQuestionStatus') {
      const question = component.get('v.question')
      helper.fireEvent('rm_rfp_action', {
        type: value,
        payload: {
          question: question,
          newStatus: 'Approved'
        }
      })
      return
    }

    helper.goToSObject(value)
  }
})