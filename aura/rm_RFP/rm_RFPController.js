({
  init: function(component, event, helper) {
    helper.component = component
    const { categories, namespacePrefix } = component.get('v.state')
    if (!categories) {
      helper.getCategories()
    }
    if (!namespacePrefix) {
      try {
        helper.fireEvent('rm_rfp_action', {
          type: 'getNamespacePrefix',
          payload: {}
        })
      } catch (error) {
        helper.fireEvent('rm_rfp_action', {
          type: 'error',
          payload: {
            error
          }
        })
      }
    }
  },

  refreshFeed: function(component, event, helper) {
    const { selectedQuestionId, selectedRfpId } = component.get('v.state')

    const recordId = selectedQuestionId
    component.set('v.body', [])
    if (selectedQuestionId) {
      $A.createComponents(
        [
          [
            'forceChatter:publisher',
            {
              context: 'RECORD',
              recordId
            }
          ],
          [
            'forceChatter:feed',
            {
              type: 'record',
              subjectId: recordId
            }
          ]
        ],
        (newComponents, status, errorMessage) => {
          // Add the new button to the body array
          if (status === 'SUCCESS') {
            component.set('v.body', newComponents)
          } else if (status === 'INCOMPLETE') {
            throw new Error('No response from server or client is offline.')

            // Show offline error
          } else if (status === 'ERROR') {
            throw new Error(errorMessage)
            // Show error message
          }
        }
      )
    }
  },

  searchResponses: function(component, event, helper) {
    const { query, namespacePrefix } = component.get('v.state')
    try {
      if (!query || query.length < 3) {
        throw new Error('Search query must be at least 3 characters.')
      }
      helper.fireEvent('rm_rfp_action', {
        type: 'getKnowledgeArticles',
        payload: { namespacePrefix, queryString: query }
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

  setSelectedResponse: function(component, event, helper) {
    const { id } = event.currentTarget.dataset
    const { knowledgeArticles, namespacePrefix } = component.get('v.state')
    const newSelectedResponse = knowledgeArticles.filter(r => r.Id === id)[0]
    let { selectedResponse } = component.get('v.state')
    selectedResponse = selectedResponse || {}
    try {
      const originalResponseText = selectedResponse.Answer__c
      selectedResponse.Answer__c = selectedResponse
        ? `${selectedResponse.Answer__c}\n${newSelectedResponse.Answer__c}`
        : newSelectedResponse.Answer__c

      helper.fireEvent('rm_rfp_action', {
        type: 'updateState',
        payload: {
          originalResponseText,
          selectedResponse
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

  editArticle: function(component, event, helper) {
    try {
      const articleIdAndArticleVersionId = event
        .getSource()
        .get('v.value')
        .split('|')
      const articleId = articleIdAndArticleVersionId[0]
      const articleVersionId = articleIdAndArticleVersionId[1]
      helper.fireEvent('rm_rfp_action', {
        type: 'createNewArticleVersion',
        payload: {
          articleId,
          articleVersionId
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

  breadcrumbClicked: function(component, event, helper) {
    try {
      const selectedFilterName = event.currentTarget.dataset.name

      helper.fireEvent('rm_rfp_action', {
        type: 'filterSelected',
        payload: {
          selectedFilterName
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

  treeBranchSelection: function(component, event, helper) {
    try {
      const selectedBranch = event.getParams()
      const selectedFilterName = selectedBranch.name
      helper.fireEvent('rm_rfp_action', {
        type: 'filterSelected',
        payload: {
          selectedFilterName
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
  }
})