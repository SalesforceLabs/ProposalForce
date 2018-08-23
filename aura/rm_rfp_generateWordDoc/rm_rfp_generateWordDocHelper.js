/**
 * Copyright (c) 2018, salesforce.com, inc., 
 *  All rights reserved. 
 * SPDX-License-Identifier: BSD-3-Clause 
 * For full license text, see the LICENSE file in the repo root or https: //opensource.org/licenses/BSD-3-Clause
 */

({
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

  fireApexHelper: function(ApexFunctionName, params, resolve, attributeName) {
    const { component } = this
    const helper = this
    const action = component.get(ApexFunctionName)
    action.setParams(params)
    action.setCallback(this, a => {
      if (a.getState() === 'ERROR') {
        // console.log('There was an error:')
        // console.log(a.getError())
      } else if (a.getState() === 'SUCCESS') {
        if (attributeName) component.set(attributeName, a.getReturnValue())
        resolve(a.getReturnValue())
        // console.log(a.getReturnValue())
      }
    })
    $A.enqueueAction(action)
  },

  fireApex: function(ApexFunctionName, params, attributeName) {
    const { component } = this
    const helper = this
    const p = new Promise(resolve => {
      helper.fireApexHelper(ApexFunctionName, params, resolve, attributeName)
    })
    return p
  }
})