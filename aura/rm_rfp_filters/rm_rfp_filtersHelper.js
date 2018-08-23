/**
 * Copyright (c) 2018, salesforce.com, inc., 
 *  All rights reserved. 
 * SPDX-License-Identifier: BSD-3-Clause 
 * For full license text, see the LICENSE file in the repo root or https: //opensource.org/licenses/BSD-3-Clause
 */

({
  fireEvent: function(eventName, params) {
    const { component } = this
    const helper = this
    const compEvent = component.getEvent(eventName)
    compEvent.setParams(params)
    compEvent.fire()
  },

  resetSearch: function(previousIndexHits, categoryPills) {
    const helper = this
    // updates by reference
    if (
      previousIndexHits &&
      categoryPills &&
      previousIndexHits.length &&
      categoryPills.length
    ) {
      previousIndexHits.forEach(prevHitIdx => {
        categoryPills[prevHitIdx].searchHit = false
      })
    }
    helper.fireEvent('rm_rfp_action', {
      type: 'updateState',
      payload: {
        previousIndexHits: []
      }
    })
  }
})