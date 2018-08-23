({
  init: function(component, event, helper) {
    const prevState = window.localStorage.getItem('proposalforceState')
    if (prevState) {
      component.set('v.state', JSON.parse(prevState))
    }
  },

  handleAction: function(component, event, helper) {
    helper.component = component
    const params = event.getParams()
    const { type, payload } = params
    const namespace = 'c.'
    let state = component.get('v.state')

    const {
      categoryPills,
      pillSearchResults,
      pillQuery,
      questions,
      RFPs,
      selectedComplianceResponses,
      categoryTrees
    } = state

    // console.log('action type: ', type)

    switch (type) {
      case 'updateState': {
        state = helper.setState(component, payload)
        break
      }
      case 'undo': {
        helper.undo()
        break
      }
      case 'navigate': {
        const workspaceAPI = component.find('workspace')
        workspaceAPI.openTab({
          url: `#/sObject/${payload.recordId}/view`,
          focus: true
        })
        break
      }
      case 'filterSelected': {
        let { selectedFilterName } = payload
        categoryPills.forEach(p => {
          if (p.name === selectedFilterName) {
            p.selected = !p.selected
            p.title = p.title
              ? p.title
              : helper
                  .breadcrumbBuilder(categoryTrees, selectedFilterName)
                  .join(' > ')
            if (
              pillQuery &&
              p.label.toLowerCase().indexOf(pillQuery.toLowerCase()) > -1
            ) {
              p.searchHit = true
            } else {
              p.searchHit = false
            }
            if (p.searchHit && p.selected) p.searchHit = false
          }
          if (p.searchHit) p.searchHit = false
        })

        const selectedPillNames = categoryPills
          .filter(p => p.selected)
          .map(p => p.name)

        // lightning:tree does not update properly when 'expanded' values change
        // by reference,must pass a new array
        const newCategoryTrees = JSON.parse(JSON.stringify(categoryTrees))

        helper.expandSelectedCategories(newCategoryTrees, selectedPillNames)
        selectedFilterName = null
        helper.setState(component, {
          selectedFilterName,
          categoryTrees: newCategoryTrees
        })
        break
      }
      case 'getKnowledgeArticles': {
        const categoryNames = categoryPills
          .filter(c => c.selected)
          .map(c => `${c.groupName}__c BELOW ${c.name}__c`)
          .join(' AND ')
        payload.categoryNames = categoryNames
        helper.backendCall(type, payload, namespace)
        break
      }
      case 'insertUpdatedRFP': {
        const { newRFP } = payload
        const idxToReplace = RFPs.map(r => r.Id).indexOf(newRFP.Id)
        RFPs[idxToReplace] = newRFP
        const newSelectedComplianceResponses = newRFP.proposalforce__Compliance_Responses__c.split(
          ';'
        )
        helper.setState(component, {
          RFPs,
          selectedComplianceResponses: newSelectedComplianceResponses
        })
        const toast = $A.get('e.force:showToast')
        toast.setParams({
          title: 'Saved',
          message: 'Compliance answers saved.',
          type: 'success'
        })
        toast.fire()
        break
      }
      case 'error': {
        helper.showErrorToast(payload.error)
        break
      }
      default: {
        helper.backendCall(type, payload, namespace)
        break
      }
    }
  }
})