/**
 * Copyright (c) 2018, salesforce.com, inc., 
 *  All rights reserved. 
 * SPDX-License-Identifier: BSD-3-Clause 
 * For full license text, see the LICENSE file in the repo root or https: //opensource.org/licenses/BSD-3-Clause
 */

({
  getCategories: function() {
    try {
      this.fireEvent('rm_rfp_action', {
        type: 'getKnowledgeCategories',
        payload: {}
      })
    } catch (error) {
      this.fireEvent('rm_rfp_action', {
        type: 'error',
        payload: {
          error
        }
      })
    }
  },

  fireEvent: function(eventName, params) {
    const { component } = this
    const helper = this
    const compEvent = component.getEvent(eventName)
    compEvent.setParams(params)
    compEvent.fire()
  }
})