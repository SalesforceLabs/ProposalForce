/**
 * Copyright (c) 2018, salesforce.com, inc., 
 *  All rights reserved. 
 * SPDX-License-Identifier: BSD-3-Clause 
 * For full license text, see the LICENSE file in the repo root or https: //opensource.org/licenses/BSD-3-Clause
 */

({
  init: function(component, event, helper) {
    helper.component = component
  },

  handleSave: function(component, event, helper) {
    let { RFPs } = component.get('v.state')
    const { selectedRfpId } = component.get('v.state')
    const sortBy = component.find('sort').get('v.value')
    const sortFunctions = {
      Name: (a, b) => (a.Name >= b.Name ? 1 : -1),
      LeastRecent: (a, b) => (a.CreatedDate >= b.CreatedDate ? 1 : -1),
      MostRecent: (a, b) => (a.CreatedDate <= b.CreatedDate ? 1 : -1),
      LeastComplete: (a, b) =>
        a.proposalforce__Completion_Percentage__c >=
        b.proposalforce__Completion_Percentage__c
          ? 1
          : -1,
      MostComplete: (a, b) =>
        a.proposalforce__Completion_Percentage__c <=
        b.proposalforce__Completion_Percentage__c
          ? 1
          : -1
    }

    RFPs.sort(sortFunctions[sortBy])
    const RFPSearchHitIds = component.get('v.RFPSearchHits').map(r => r.Id)
    const hits = RFPs.filter((r, i) => RFPSearchHitIds.includes(r.Id))
    const nonHits = RFPs.filter((r, i) => !RFPSearchHitIds.includes(r.Id))
    RFPs = [...hits, ...nonHits]

    helper.createComponent('lightning:dynamicIcon', { type: 'ellie' })

    helper.fireEvent('rm_rfp_action', {
      type: 'updateState',
      payload: { RFPs, visibleRFPs: RFPs.slice(0, 50) }
    })
    component.toggleOpen()
  },

  handleSearch: function(component, event, helper) {
    const query = event.currentTarget.value.toLowerCase()
    const { RFPs } = component.get('v.state')
    let RFPSearchHits = component.get('v.RFPSearchHits')
    const searchHitIds = {}
    RFPSearchHits.forEach(r => {
      searchHitIds[r.Id] = true
    })
    if (query.length > 2) {
      RFPSearchHits = RFPs.filter(
        r => r.Name.toLowerCase().indexOf(query) > -1 && !searchHitIds[r.Id]
      ).concat(...RFPSearchHits) // Need to spread the array in concat param for Safari.
      component.set('v.RFPSearchHits', RFPSearchHits)
    }
  },

  removeHit: function(component, event, helper) {
    const hitId = event.currentTarget.dataset.hitid
    let RFPSearchHits = component.get('v.RFPSearchHits')
    RFPSearchHits = RFPSearchHits.filter(r => r.Id !== hitId)
    component.set('v.RFPSearchHits', RFPSearchHits)
  },

  toggleOpen: function(component, event, helper) {
    helper.toggleOpen()
  }
})