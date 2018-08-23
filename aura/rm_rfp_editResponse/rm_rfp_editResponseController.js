({
  init: function(component, event, helper) {
    helper.component = component
    const {
      selectedQuestion,
      knowledgeObjectName,
      selectedResponse
    } = component.get('v.state')
    try {
      if (!knowledgeObjectName) {
        helper.fireEvent('rm_rfp_action', {
          type: 'getKnowledgeObjectName',
          payload: {}
        })
      }
    } catch (error) {
      helper.fireEvent('rm_rfp_action', {
        type: 'error',
        payload: {
          error
        }
      })
    }
    const originalResponse = component.get('v.state.selectedResponse.Answer__c')
    component.set('v.originalResponse', originalResponse)

    component
      .find('complianceAnswer')
      .set('v.value', selectedQuestion.proposalforce__Compliance_Response__c)
  },
  createArticle: function(component, event, helper) {
    const {
      selectedResponse,
      namespacePrefix,
      knowledgeObjectName
    } = component.get('v.state')
    const createRecordEvent = $A.get('e.force:createRecord')
    createRecordEvent.setParams({
      entityApiName: namespacePrefix + knowledgeObjectName,
      defaultFieldValues: {
        [`${namespacePrefix}Answer__c`]: selectedResponse
          ? selectedResponse.Answer__c
          : ''
      }
    })
    createRecordEvent.fire()
  },

  setResponse: function(component, event, helper) {
    try {
      const state = component.get('v.state')
      const { selectedResponse, namespacePrefix, selectedQuestion } = state
      const question = selectedQuestion
      const complianceAnswer = component.find('complianceAnswer').get('v.value')
      question.proposalforce__Compliance_Response__c = complianceAnswer
      if (!selectedResponse.Answer__c && !complianceAnswer)
        throw new Error('Response text or compliance answer must be populated.')

      helper.fireEvent('rm_rfp_action', {
        type: 'updateQuestion',
        payload: {
          // title: selectedResponse.Title,
          answer: selectedResponse.Answer__c,
          selectedResponse,
          question
          // isNewResponse
        }
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

  warnIfUnsavedChanges: function(component, event, helper) {
    const parser = new DOMParser()
    const originalResponse = parser.parseFromString(
      component.get('v.originalResponse'),
      'text/html'
    ).body.textContent
    const currentResponse = parser.parseFromString(
      component.get('v.state.selectedResponse.Answer__c'),
      'text/html'
    ).body.textContent
    if (originalResponse === currentResponse) {
      helper.addClass('warning', 'slds-hide')
    } else {
      helper.removeClass('warning', 'slds-hide')
    }
  }
})