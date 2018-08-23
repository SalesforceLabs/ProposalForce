/**
 * Copyright (c) 2018, salesforce.com, inc., 
 *  All rights reserved. 
 * SPDX-License-Identifier: BSD-3-Clause 
 * For full license text, see the LICENSE file in the repo root or https: //opensource.org/licenses/BSD-3-Clause
 */

({
  pillClick: function(component, event, helper) {
    helper.component = component
    const clickedPill = event.getSource()
    const selectedFilterName = clickedPill.get('v.name')

    helper.fireEvent('rm_rfp_action', {
      type: 'filterSelected',
      payload: {
        selectedFilterName
      }
    })
  }
})