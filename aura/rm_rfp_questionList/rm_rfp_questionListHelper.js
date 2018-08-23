/**
 * Copyright (c) 2018, salesforce.com, inc., 
 *  All rights reserved. 
 * SPDX-License-Identifier: BSD-3-Clause 
 * For full license text, see the LICENSE file in the repo root or https: //opensource.org/licenses/BSD-3-Clause
 */

({
  collapseList: function(component) {
    const helper = this
    helper.toggleClass('vertical-nav', 'collapsed-nav')
    helper.toggleClass('nav-icon', 'flip-nav')
    helper.toggleClass('rfp', 'slide-out')
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
        console.log('No response from server or client is offline.')
        // Show offline error
      } else if (status === 'ERROR') {
        console.log('Error: ', errorMessage)
        // Show error message
      }
    })
  },

  fireEvent: function(eventName, params) {
    const { component } = this
    const helper = this
    const compEvent = component.getEvent(eventName)
    compEvent.setParams(params)
    compEvent.fire()
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
  }
})