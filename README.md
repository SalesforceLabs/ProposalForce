<!---
 Copyright (c) 2018, salesforce.com, inc., 
  All rights reserved. 
 SPDX-License-Identifier: BSD-3-Clause 
 For full license text, see the LICENSE file in the repo root or https: //opensource.org/licenses/BSD-3-Clause
-->

# ProposalForce Documentation

## Setup

### My Domain

My Domain must be enabled in the org and deployed to users for the package to display properly.
Quick Search > My Domain

### Lightning Knowledge

To enable and set up Lightning Knowledge and Data Categories, see the directions in these links:
[Trailhead](https://trailhead.salesforce.com/en/projects/build-a-community-with-knowledge-and-chat/steps/enable-and-configure-lightning-knowledge)
[Documentation](https://help.salesforce.com/articleView?id=knowledge_lightning_set_up.htm&type=5)

### permissions

A couple of permissions to org-specific objects must be added to those in the included “Proposal Force”  permission set.

_Knowledge object_
Lightning Knowledge uses custom API names for the Knowledge object. ProposalForce users must have appropriate Create/Read/Update/Delete permissions for their needs.

Quick Search > Permission Sets > [Create new or Edit existing] > Object Settings > [Knowledge Object name]

_Data Category Visibility_
Similarly, Data Categories are custom to each org housing them. Access to the appropriate Data Category Groups must be granted in a permission set under the “Data Category Visibility” setting.

Quick Search > Permission Sets > [Create new or Edit existing] > Data Category Visibility

_Question Import_
If non-admin users need to upload RFP questions in bulk, consider adding the 'Import Custom Objects' in System Permissions to allow use of the Data Import Wizard.

Quick Search > System Permissions > Import Custom Objects

### Object and Field Setup

A custom rich text field called “Answer” (API name “Answer__c”) must be added to the Knowledge object in the org. Proper CRUD/FLS permissions for this field must be granted to appropriate users.

### Data Categories package

Due to a known limitation in packages, code referring to Data Categories cannot be packaged into AppExchange apps. Instead, to use Data Categories in ProposalForce 

* navigate to [this GitHub page](https://github.com/ryemcc/DataCategoryTreeBuilder)
* click the “Deploy to Salesforce” button
*  follow the install instructions. 

This will install a simple Apex class into the org allowing ProposalForce to query and display a Data Category tree.

### Custom Metadata

A custom metadata record included in the package allows ProposalForce to interact with Knowledge objects and Data Categories. 

Quick Search >Custom Metadata Types > Manage Records on ProposalForce Info > Edit on Proposalforce Info

_Knowledge_
If your org uses the default API name for the Lightning Knowledge object, “Knowledge__kav,” you do not need to take any action. Otherwise, update the field “Knowledge Object Name” on the record of the custom metadata type to the API name of the Knowledge object in your org.

_Data Categories_
If you have used the Apex class linked in the section “Data Categories package” above and have not changed the name of the Apex class, you do not need to take any action. If you have implemented your own Apex class for data categories, you should update the field “className” on the record of the custom metadata type to the class name in your implementation.

## Object Model

PropsalForce uses three custom objects

* RFP - Looks up to an Opportunity, parent to a particular set of RFP questions and answers.
* RFP Question - Contains the question text, the parent RFP, information about the question like assignee and status, and a reference to the associated response.
* RFP Response - A response to a particular question

## Import

### Import Questions

Questions can be created in the same way any other record is created in Salesforce. Often questions will be uploaded in bulk. This can be accomplished using a csv file and the Data Import Wizard launched from the list view page for the RFP Question object.

The CSV only needs two columns. One with the name of the RFP and one with the question text, like so:

|RFP	|Question	|
|---	|---	|
|Ohana, Inc.	|When were you founded?	|
|Ohana, Inc.	|How many employees do you have?	|
|Ohana, Inc.	|What is your security policy?	|



## ProposalForce App

Proposals is a console app launched from the App Launcher. It gives access to the RFP objects and, most importantly, to the ProposalForce app where RFPs and questions can be viewed, sorted, filtered, updated, and answered, and where knowledge articles can be searched, filtered, created, and updated.

### split view

![split](/images/categoryFilter.png)

Salesforce Console apps have the Split View option available. ProposalForce was designed to be used with Split View collapsed. Click the divider to collapse. [See here for more information.](https://releasenotes.docs.salesforce.com/en-us/summer17/release-notes/rn_general_lightning_console_split_view.htm)

### ProposalForce Parts

Three panes, from left to right:

* RFP List
* Question List
    * Question Detail
* Knowledge Search and Filter

## RFP List
![split](/images/list.png)

### Collapsing RFPs

If you'd like more screen real estate devoted to questions and answers for your selected RFP, you can collapse the list of RFPs.

### Sorting RFPs

By default, RFPs are listed in order of least complete to most complete. You can click the magnifying glass icon at the top of the RFP list to bring up the Search and Sort panel. Sort by name, most complete, least complete, most recent, or least recent.


### Pinning RFPs
![split](/images/pinning.png)

You can pin certain RFPs to the top of the list and sort the rest. Click the magnifying glass icon at the top of the RFP list to bring up the Search and Sort panel. Begin typing the name of an RFP and it will auto-populate in a list. Click the 'x' in the list to remove. The selected RFPs will remain at the top of the list even when you sort the rest.

### RFP Progress Bar

Below each RFP in the list is a blue progress bar indicating the percentage of questions whose status is 'Approved.'

### Filtering Questions

After an RFP is selected from the list, question filtering options appear. Check a box to show only New, Draft, or Approved questions.

## Question List

![split](/images/questionList.png)
### Compliance Answers
![split](/images/compliance.png)

RFPs will often require compliance responses (Yes/No/Maybe style answers). These are available in from a picklist on the question detail.

The available compliance responses are customizable on a per RFP basis. Click on the gear icon above the question list, add or remove compliance answers, and hit save. These new compliance options will be available in all questions associated with a particular RFP

### Completion Status

After an RFP is selected, the associated questions will appear in the center pane. Status is indicated by a colored dot next to each question. Red means New, yellow Draft, and green Approved.

A dropdown menu on each question allows a user to approve the current response (turn it green).

### Navigation

A dropdown menu on each question allows navigation to the question's standard detail page, to the parent RFP standard detail page, and to the response standard detail page (if one exists).

### Edit Response

A rich text box allows you to create a new response or edit an existing one. If the response has unsaved changes a warning notification will appear next to the “Save Response” button. 

### Creating Articles

A new Knowledge article can be created from the text entered into the response rich text box by clicking “Create Article”. The article will be created in draft status, so it must be categorized and then published.

## Knowledge Search and Filter
![split](/images/knowledgeSF.png)

### Knowledge Search

When a question has been clicked and opened in the question list, its text automatically populates the article search box on the right. The question text can be used directly or modified in any way the user sees fit.

### Categories

Well categorized articles are key to a usable knowledge base. Category filters can be added to searches in three ways in ProposalForce. Selections made in any of the three places are reflected in all of the three places

_Search Categories_
Below the search box is another search input. Begin typing the name of a category and search results will appear below. Click a result to apply the filter. Click the 'X' on an applied filter to remove it; hover over an applied filter to see the hierarchy of categories it falls into.

![split](/images/categorySearch.png)
_
Alphabetical view_
In the Filters tab of the article search area all categories are listed alphabetically. A filter can be applied by clicking its name. Selections are reflected in the list of applied filters on main search tab and are highlighted blue on the filters tab.
![split](/images/categoryFilter.png)

_
Tree view_

Knowledge categories are arranged in a hierarchy. The hierarchy tree of categories is available in the Filter Tree tab. Users can drill all the way down through categories from root group all the way to leaves. See child categories by clicking the chevron next to the category's name. Select a category by clicking it. The breadcrumb trail leading to selected categories appears above the tree. 
![split](/images/categoryTree.png)

### Knowledge Article List
![split](/images/knowledgeList.png)

Results of an article search are listed in order of relevance. Clicking a result will append its text to the response for the selected question. Once the text has been appended, users are free to modify it to suit the needs of a particular question. The text from more than one article can be appended to the response.

### Editing Articles

Clicking the pencil icon on a search result navigates to the edit article page. Saving the changes creates a new version of the article in Draft status. Once the draft is published, it will appear in search results.

### Creating Articles from Responses

When a response to a question has new, reusable content it can be used as the basis for a new article. In the Question Detail clicking 'Create Article' will navigate to the New Article page, pulling the current response text. Saving creates a new draft article from the response. Once the new article has been categorized and published, it will appear in search results.

### Approving

When the response to a question has been saved, that question moves into draft status. When the response is ready for final approval, users can click the dropdown menu next to the question summary and click “Approve Response”. This moves the question to Approved status, turns the indicator green, and moves the RFP Progress Bar.

### Maintains Last State

The status of the app is saved so that users can pick up right where they left off the last time they logged in.

## Export

### Export CSV

Once the questions associated with an RFP have been answered, the questions and answers can be exported to a csv file to be used in a mail merge or for any other purpose.

On an RFP detail page, click 'Generate CSV', and download the file to your local machine.

### Mail Merge

The csv generated in the above step can be used with word processing programs like Word to mail merge into customized documents.

### Export Docx

If your company uses the same template to answer most RFPs, the 'Generate Docx' button on the RFP detail page is an easy alternative to mail merge.

In order to use this feature, upload a Word docx named 'RFP_Output_Template ' to static resources using the templating format described below.

### Templating

Advanced formatting for templating[can be found here](https://docxtemplater.readthedocs.io/en/latest/tag_types.html). For simply listing formatted questions and answers in a document, the following lines can be used:


> {#responses}
{question}
{#hasCompliance}Compliance: {compliance}
{/hasCompliance} 
{#hasResponse}{response}{/hasResponse}
{/responses}



Wherever these lines are inserted in your template docx, your all questions and answers will appear in the output document. Just format these lines in the way you'd like your actual questions and answers to appear (bold, 16pt, etc.).

For advanced templating, the following is the shape of the objects in the array passed to the templater:

```
{
  question: String,
  response: String,
  compliance: String,
  hasResponse: Boolean,   
  hasCompliance: Boolean
}
```

## 

