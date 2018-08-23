/**
 * Copyright (c) 2018, salesforce.com, inc., 
 *  All rights reserved. 
 * SPDX-License-Identifier: BSD-3-Clause 
 * For full license text, see the LICENSE file in the repo root or https: //opensource.org/licenses/BSD-3-Clause
 */

({
  init: function(component, event, helper) {
    const rfpId = component.get('v.recordId')
    const action = component.get('c.generateCSV')
    action.setParams({ rfpId })
    action.setCallback(this, a => {
      if (a.getState() === 'ERROR') {
        component.set('v.error', a.getError())
      } else if (a.getState() === 'SUCCESS') {
        component.set('v.fileId', a.getReturnValue())
      }
    })
    $A.enqueueAction(action)
  }
})