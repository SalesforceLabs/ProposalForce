({
  backendCall: function(type, payload, namespace) {
    const { component } = this
    const helper = this

    const storableMap = {
      getKnowledgeArticles: true
    }

    const isStorable = storableMap[type]

    helper.createComponent('lightning:spinner', {
      variant: 'brand',
      size: 'large',
      alternativeText: 'backend call'
    })
    helper
      .fireApex(namespace + type, payload, isStorable)
      .then(res => {
        const newState = helper.middleWare(type, res, payload)
        if (newState) {
          const state = helper.setState(component, newState)
        }

        // destroy spinner
        component.set('v.body', [])
      })
      .catch(error => {
        component.set('v.body', [])
        const message = error.length
          ? error.reduce((a, m) => `${a + m.message}\n`, '')
          : error.message
        helper.showErrorToast(message)
      })
  },

  // Begin Middleware
  // middleWare must return new state slice
  middleWare: function(type, data, originalPayload) {
    const helper = this

    const middleWares = {
      getRFPs: RFPs => ({ RFPs, visibleRFPs: RFPs.slice(0, 50) }),

      getNamespacePrefix: namespacePrefix => ({ namespacePrefix }),

      getCurrentUserId: userId => ({ userId }),

      getKnowledgeObjectName: knowledgeObjectName => ({ knowledgeObjectName }),

      getKnowledgeArticles: knowledgeArticles => {
        const { namespacePrefix } = helper.component.get('v.state')
        knowledgeArticles = knowledgeArticles.filter(ka => {

          // to make this key accessible in markup without knowing the namespace
          ka.Answer__c = ka[`${namespacePrefix}Answer__c`]
          
          return ka.Answer__c !== undefined
        })
        return { knowledgeArticles }
      },

      setNewComplianceResponses: newRFP => {
        helper.fireEvent('rm_rfp_action', {
          type: 'insertUpdatedRFP',
          payload: { newRFP }
        })
      },

      createNewArticleVersion: newArticleVersionId => {
        const { component } = helper
        const workspaceAPI = component.find('workspace')
        workspaceAPI.getFocusedTabInfo().then(tabInfo => {
          const focusedTabId = tabInfo.tabId
          workspaceAPI
            .openSubtab({
              parentTabId: focusedTabId,
              url: `/${originalPayload.articleId}`,
              focus: true
            })
            .then(() => {
              const editRecordEvent = $A.get('e.force:editRecord')
              editRecordEvent.setParams({
                recordId: newArticleVersionId
              })
              editRecordEvent.fire()
            })
        })
      },

      updateQuestion: questions => {
        const toast = $A.get('e.force:showToast')
        toast.setParams({
          title: 'Saved',
          message: 'The response has been set!',
          type: 'success'
        })
        toast.fire()
        questions = this.summaryBuilder(questions)

        return { questions }
      },

      updateQuestionStatus: questions => {
        const toast = $A.get('e.force:showToast')
        toast.setParams({
          title: 'Success',
          message: 'Status updated!',
          type: 'success'
        })
        toast.fire()
        questions = this.summaryBuilder(questions)
        return { questions }
      },

      getKnowledgeCategories: catString => {
        const categoryTreeRaw = JSON.parse(catString)

        const categoryTrees = helper.treeBuilder(categoryTreeRaw)

        let categoryPills = helper.pillBuilder(categoryTrees)
        categoryPills = categoryPills.sort(
          (a, b) => (a.label > b.label ? 1 : -1)
        )
        categoryPills.forEach((p, i) => {
          p.index = i
        })

        const categorySearchIndex = helper.categorySearchIndexBuilder(
          categoryPills
        )

        return { categoryTrees, categoryPills, categorySearchIndex }
      },

      getQuestions: questions => {
        questions = this.summaryBuilder(questions)
        return { questions }
      }
    }

    return middleWares[type] ? middleWares[type](data) : null
  },
  // End Middleware

  pillBuilder: function(categoryGroups) {
    const pillBuilderHelper = (categories, groupName) => {
      let categoryPills = []
      categories.forEach(c => {
        const newPill = { groupName, name: c.name, label: c.label }
        categoryPills.push(newPill)
        if (c.items.length) {
          categoryPills = categoryPills.concat(
            pillBuilderHelper(c.items, groupName)
          )
        }
      })
      return categoryPills
    }

    let result = []
    categoryGroups.forEach(group => {
      const pills = [].concat(pillBuilderHelper(group.items, group.name))
      result = result.concat(pills)
    })
    return result
  },

  summaryBuilder: function(questions) {
    questions.forEach((q, i) => {
      if (q.proposalforce__RFP_Question_Text__c) {
        const beginningCharacters = q.proposalforce__RFP_Question_Text__c.slice(
          0,
          50
        )
        if (beginningCharacters === q.proposalforce__RFP_Question_Text__c) {
          q.summary = beginningCharacters
        } else {
          const lastSpaceIdx = beginningCharacters
            .slice(0, 100)
            .lastIndexOf(' ')
          q.summary = `${beginningCharacters.slice(0, lastSpaceIdx)}...`
        }
      } else {
        q.summary = 'No Question'
      }
      q.idx = i
    })
    return questions
  },

  categorySearchIndexBuilder: function(categoryPills) {
    const categorySearchIndex = {}

    categoryPills.forEach(p => {
      const pillLabelWords = p.label.split(' ')

      pillLabelWords.forEach(pillLabelWord => {
        if (pillLabelWord === 'and') return
        for (let i = 3; i <= pillLabelWord.length; i++) {
          const label = pillLabelWord
            .slice(0, i)
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
          if (categorySearchIndex[label] && categorySearchIndex[label].length) {
            categorySearchIndex[label].push(p.index)
          } else {
            categorySearchIndex[label] = [p.index]
          }
        }
      })
    })
    return categorySearchIndex
  },

  treeBuilder: function(categoryGroups) {
    const treeBuilderHelper = (categories, groupName) => {
      categories.forEach(c => {
        Object.defineProperty(
          c,
          'items',
          Object.getOwnPropertyDescriptor(c, 'childCategories')
        )
        delete c.childCategories
        if (c.items.length) {
          treeBuilderHelper(c.items, groupName)
        }
      })
      return categories
    }

    const result = []
    categoryGroups.forEach(group => {
      const newItem = {}
      newItem.label = group.label
      newItem.name = group.name
      newItem.expanded = true
      newItem.items = [].concat(
        treeBuilderHelper(group.topCategories, group.name)
      )
      result.push(newItem)
    })
    return result
  },
  breadcrumbBuilder: function(branches, targetName) {
    let result = []
    branches.forEach(branch => {
      if (branch.name === targetName) {
        result.push(branch.label)
      }

      const possibleResult = this.breadcrumbBuilder(branch.items, targetName)
      if (possibleResult.length) {
        result = result.concat(branch.label, possibleResult)
      }
    })
    return result
  },

  expandSelectedCategories: function(branches, selectedPillNames) {
    let result
    branches = branches || []
    branches.forEach(branch => {
      branch.expanded = false
      if (selectedPillNames.includes(branch.name)) {
        result = true
      }
      const possibleResult = this.expandSelectedCategories(
        branch.items,
        selectedPillNames
      )
      if (possibleResult) {
        branch.expanded = true
        result = possibleResult
      }
    })
    return result
  },

  showErrorToast: function(error) {
    error = typeof error === 'string' ? error : error.message
    const { component } = this
    const helper = this
    component.set('v.body', [])
    const toast = $A.get('e.force:showToast')
    toast.setParams({
      title: 'There was an error.',
      message: error,
      type: 'Error'
    })
    toast.fire()
  },

  setState: function(component, newStateSlice) {
    try {
      const state = component.get('v.state')
      const newState = Object.assign({}, state, newStateSlice)
      component.set('v.state', newState)
      console.log('state in setState: ', newState)
      localStorage.setItem('proposalforceState', JSON.stringify(newState))
      return newState
    } catch (error) {
      this.fireEvent('rm_rfp_action', {
        type: 'error',
        payload: {
          error
        }
      })
      return component.get('v.state')
    }
  },

  // TODO: implement undo and store last state in localStorage
  // setState: function(component, newStateSlice) {
  //   try {
  //     const state = component.get('v.state')
  //     const states = component.get('v.states')

  //     const newState = Object.assign({}, state, newStateSlice)
  //     component.set('v.state', newState)

  //     states.push(JSON.stringify(state))
  //     component.set('v.states', states)
  //     const lastStateIdx = component.get('v.lastStateIdx')
  //     component.set('v.lastStateIdx', lastStateIdx + 1)
  //     console.log('state in setState: ', newState)
  //     return newState
  //   } catch (error) {
  //     this.fireEvent('rm_rfp_action', {
  //       type: 'error',
  //       payload: {
  //         error
  //       }
  //     })
  //     return component.get('v.state')
  //   }
  // },

  // undo: function() {
  //   const { component } = this
  //   const helper = this
  //   const states = component.get('v.states')
  //   const lastStateIdx = component.get('v.lastStateIdx')
  //   const newState = JSON.parse(states[lastStateIdx])
  //   component.set('v.lastStateIdx', lastStateIdx - 1)
  //   const state = component.get('v.state')
  //   states.push(JSON.stringify(state))
  //   component.set('v.states', states)
  //   component.set('v.state', newState)
  // },

  /* *******************convenience methods******************* */

  goToUrl: function(url) {
    const { component } = this
    const helper = this
    const urlEvent = $A.get('e.force:navigateToURL')
    if (urlEvent) {
      urlEvent.setParams({
        url: url
      })
      urlEvent.fire()
    } else {
      window.location.href = url
    }
  },

  goToSObject: function(objectId, isredirect) {
    // redirect is optional
    const { component } = this
    const helper = this
    isredirect = isredirect || false
    const navEvt = $A.get('e.force:navigateToSObject')
    if (navEvt) {
      navEvt.setParams({
        recordId: objectId,
        isredirect: isredirect
      })
      navEvt.fire()
    } else {
      window.location.href = `/${objectId}`
    }
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
  },

  createComponent: function(compName, attributes, location, append) {
    const { component } = this
    const helper = this
    location = location || 'v.body'
    $A.createComponent(compName, attributes, (newCmp, status, errorMessage) => {
      // Add the new button to the body array
      if (status === 'SUCCESS') {
        if (append) {
          const body = component.get(location)
          body.push(newCmp)
          component.set(location, body)
        } else {
          component.set(location, newCmp)
        }
      } else if (status === 'INCOMPLETE') {
        throw new Error('No response from server or client is offline.')
        // Show offline error
      } else if (status === 'ERROR') {
        throw new Error(errorMessage)
      }
    })
  },

  appendComponent: function(compName, attributes, location) {
    const { component } = this
    const helper = this
    helper.createComponent(compName, attributes, location, true)
  },

  fireApexHelper: function(
    component,
    isStorable,
    ApexFunctionName,
    params,
    resolve,
    reject,
    attributeName
  ) {
    const helper = this
    const action = component.get(ApexFunctionName)
    if (isStorable) action.setStorable()
    action.setParams(params)
    action.setCallback(this, a => {
      if (a.getState() === 'ERROR') {
        reject(a.getError())
      } else if (a.getState() === 'SUCCESS') {
        if (attributeName) component.set(attributeName, a.getReturnValue())
        resolve(a.getReturnValue())
      }
    })
    $A.enqueueAction(action)
  },

  fireApex: function(ApexFunctionName, params, isStorable, attributeName) {
    const helper = this
    const { component } = this
    const p = new Promise((resolve, reject) => {
      helper.fireApexHelper(
        component,
        isStorable,
        ApexFunctionName,
        params,
        resolve,
        reject,
        attributeName
      )
    })
    return p
  },

  fireEvent: function(eventName, params) {
    const { component } = this
    const helper = this
    const compEvent = component.getEvent(eventName)
    compEvent.setParams(params)
    compEvent.fire()
  }
})