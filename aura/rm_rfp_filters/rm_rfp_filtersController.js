({
  pillClick: function(component, event, helper) {
    helper.component = component
    const clickedPill = event.getSource()
    const selectedFilterName = clickedPill.get('v.name')
    helper.resetSearch()

    helper.fireEvent('rm_rfp_action', {
      type: 'filterSelected',
      payload: {
        selectedFilterName
      }
    })
  },

  searchPillClick: function(component, event, helper) {
    helper.component = component
    const clickedPill = event.getSource()
    const selectedFilterName = clickedPill.get('v.name')
    const searchInput = component.find('search-input')
    searchInput.set('v.value', '')
    searchInput.focus()
    helper.fireEvent('rm_rfp_action', {
      type: 'filterSelected',
      payload: {
        selectedFilterName
      }
    })
    // helper.resetSearch()
  },

  searchPills: function(component, event, helper) {
    helper.component = component
    const { categoryPills, categorySearchIndex, categoryTrees } = component.get(
      'v.state'
    )
    let { previousIndexHits } = component.get('v.state')
    let pillQuery = event
      .getSource()
      .get('v.value')
      .toLowerCase()
    previousIndexHits = previousIndexHits || []
    pillQuery = pillQuery || ''

    if (pillQuery.length === 0) {
      helper.resetSearch(previousIndexHits, categoryPills)
    }

    // indexHitList has changed?
    const newIndexHits = categorySearchIndex[pillQuery] || []
    let indexHitListHasChanged = false
    if (newIndexHits.length !== previousIndexHits.length) {
      indexHitListHasChanged = true
    } else {
      newIndexHits.forEach((hit, i) => {
        if (hit.name !== previousIndexHits[i].name) {
          indexHitListHasChanged = true
        }
      })
    }

    // updates by reference
    if (pillQuery.length > 2 && indexHitListHasChanged) {
      previousIndexHits.forEach(idxHit => {
        categoryPills[idxHit].searchHit = false
      })

      newIndexHits.forEach(idxHit => {
        categoryPills[idxHit].searchHit = true
      })

      helper.fireEvent('rm_rfp_action', {
        type: 'updateState',
        payload: {
          previousIndexHits: categorySearchIndex[pillQuery]
        }
      })
    }
  }
})