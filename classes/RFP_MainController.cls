public with sharing class RFP_MainController {
@AuraEnabled
public static List<proposalforce__RFP__c> getRFPs() {
	try{
		RFP_MainController.checkAccess('proposalforce__rfp__c', new string[] {
				'name', 'proposalforce__Compliance_Responses__c', 'proposalforce__Completion_Percentage__c', 'CreatedDate', 'id'
			}, 'read');

		return [SELECT name,
		        proposalforce__Compliance_Responses__c,
		        proposalforce__Completion_Percentage__c,
		        CreatedDate,
		        id FROM proposalforce__rfp__c order by proposalforce__Completion_Percentage__c desc limit 1000];

	}
	catch(exception e) {
		throw new AuraHandledException(e.getMessage());
	}
}

@AuraEnabled
public static string getNamespacePrefix() {
	try{

		RFP_MainController.checkAccess('organization', new string[] {
				'namespacePrefix'
			}, 'read');

		string namespacePrefix = [select namespacePrefix from organization limit 1].namespacePrefix;
		namespacePrefix = namespacePrefix != null && namespacePrefix.length() > 0 ?  namespacePrefix +  '__' : '';
		return namespacePrefix;

	}
	catch(exception e) {
		throw new AuraHandledException(e.getMessage());
	}
}

@AuraEnabled
public static string getKnowledgeObjectName() {
	try{
		string knowledgeObjectName = [select proposalforce__Knowledge_Object_Name__c from proposalforce__Proposalforce_Info__mdt limit 1].proposalforce__Knowledge_Object_Name__c;
		return knowledgeObjectName;
	}
	catch(exception e) {
		throw new AuraHandledException(e.getMessage());
	}
}

@AuraEnabled
public static string getCurrentUserId() {
	try{
		return UserInfo.getUserId();
	}
	catch(exception e) {
		throw new AuraHandledException(e.getMessage());
	}
}



@AuraEnabled
public static List<proposalforce__rfp_Question__c> getQuestions(string selectedRfpId) {
	try{
		proposalforce.RFP_MainController.checkAccess('proposalforce__RFP_Question__c', new string[] {
				'name',
				'id',
				'proposalforce__Assignee__c',
				'proposalforce__RFP_Response__c',
				'proposalforce__RFP_Question_Text__c',
				'proposalforce__status__c',
				'proposalforce__Compliance_Response__c',
				'proposalforce__RFP__c'
			}, 'read');

		RFP_MainController.checkAccess('proposalforce__RFP_Response__c', new string[] {
				'Name',
				'proposalforce__Response_Text__c'
			}, 'read');

		RFP_MainController.checkAccess('proposalforce__RFP__c', new string[] {
				'Name'
			}, 'read');

		return [SELECT name,
		        id,
		        proposalforce__RFP_Response__c,
		        proposalforce__Assignee__c,
		        proposalforce__RFP_Question_Text__c,
		        proposalforce__status__c,
		        proposalforce__Compliance_Response__c,
		        proposalforce__RFP__c,
		        proposalforce__RFP__r.Name,
		        proposalforce__RFP_Response__r.Name,
		        proposalforce__RFP_Response__r.proposalforce__Response_Text__c FROM proposalforce__RFP_Question__c WHERE proposalforce__rfp__c = : String.escapeSingleQuotes(selectedRfpId) order by name];
	}
	catch(exception e) {
		throw new AuraHandledException(e.getMessage());
	}
}



/* Knowledge Search*/

/*
   Making a fully DYNAMIC SOQL under @AuraEnabled is not advised.
   If necessary please take the following actions:

   Escaping using string.escapeSingleQuote parameters "Fields" and "sObject" is insufficient, if for example Fields= "Field1, Field2, Field3..." as an input,
   escaping single quote will do nothing and the query will be executed un-sanitized on those fields, the same applied to "sObject", moreover @AuraEnabled
   functions can be called directly the same as web callouts so your function is basically a "Proxy" to run general SOQL queries, added the fact the Apex
   classes run in system mode this function could be used to access any data at any time.
   We recommend not creating a too "generalized" function for SOQL queries but if your solution requires there are several ways to mitigate, I will describe 
   two options:

   1. Allow only fixed parameters to be inserted as an input, for fields split the input string, compare to each allowed fields and make the correct FLS checks,
    for sObject
   name compare the whole name to the allowed fixed value and check CRUD isAccessible/isUpdateable/etc. ALL checks and sanitization must be on SERVER side.

   2. Sanitize input field according to injection location and perform the correct CRUD/FLS checks: for fields input you should try splitting the input 
   (normally ',' character)
   and check for FLS accessibility, for sObject name allow only alphanum+underscore and check CRUD isAccessible/isUpdateable/etc. once again all checks and
    sanitization must be
   server side controlled.


 */

@AuraEnabled
public static List<sobject> getKnowledgeArticles(string queryString, string categoryNames) {
	try{
		string knowledgeObjectName = 
    [select proposalforce__Knowledge_Object_Name__c from proposalforce__Proposalforce_Info__mdt limit 1].proposalforce__Knowledge_Object_Name__c;
		
    string namespacePrefix = getNamespacePrefix();
		RFP_MainController.checkAccess(namespacePrefix + knowledgeObjectName, new string[] {
				'id', 'title', 'summary', 'UrlName', 'KnowledgeArticleId', namespacePrefix +'answer__c'
			}, 'read');

		return doKnowledgeQuery(queryString, categoryNames, namespacePrefix);

	}
	catch(exception e) {
		throw new AuraHandledException(e.getMessage());
	}
}

private static List<sobject> doKnowledgeQuery(String queryRaw, string categoryNames, string namespacePrefix) {
	String[] nonStopWords = removeStopWords(String.escapeSingleQuotes(queryRaw));

	//handle case where entire query minus stop words is < 3 characters; search with stop words included
	nonStopWords = String.join(nonStopWords, ' ').length() >= 3 ? nonStopWords : String.escapeSingleQuotes(queryRaw).split(' ');

	string searchQuery = buildKnowledgeQueryString(nonStopWords, String.escapeSingleQuotes(categoryNames), namespacePrefix);
	list<sobject[]> results = Search.query(searchQuery);
	return results[0];
}

//query with AND categories
private static string buildKnowledgeQueryString(String[] stemmedNonStopWords, string categoryNames, string namespacePrefix) {
	string terms = '';
	for(Integer i = 0; i < stemmedNonStopWords.size(); i++) {
		string w = stemmedNonStopWords[i];
		if(i < stemmedNonStopWords.size() - 1) {
			terms +=  w + '* or ';
		}else{
			terms += w + '* ';
		}
	}

	string knowledgeObjectName = [select proposalforce__Knowledge_Object_Name__c from proposalforce__Proposalforce_Info__mdt limit 1].proposalforce__Knowledge_Object_Name__c;
	string searchQuery = 'find \'' + terms + '\' returning ' + namespacePrefix + knowledgeObjectName + '(id, title, UrlName, KnowledgeArticleId,' + namespacePrefix + 'answer__c limit 25)';
  searchQuery = categoryNames.length() > 0 ? searchQuery + ' WITH DATA CATEGORY ' + categoryNames : searchQuery;
	return searchQuery;
}

//remove stopwords
private static list<string> removeStopWords(String queryString) {
	map<string, boolean> stopWordsMap = proposalforce.RFPStopWords.getStopWords();
	String[] queryWords = queryString.split(' ');
	String[] nonStopWords = new String[] {};
	for(string w : queryWords) {
		if(!stopWordsMap.containsKey(w.toLowerCase())) {

			nonStopWords.add(w);
		}
	}

	return nonStopWords;
}




/*End Knowledge Search*/




public with sharing class DataCategoriesFactory {
public getDataCategoriesInterface getDataCategoriesInstance() {
	string dataCategoryClassName = [select proposalforce__className__c from proposalforce__Proposalforce_Info__mdt limit 1].proposalforce__className__c;
	getDataCategoriesInterface getDataCategoryInstance = (getDataCategoriesInterface) Type.forName(dataCategoryClassName).newInstance();
	return getDataCategoryInstance;
}
}


@AuraEnabled
public static string getKnowledgeCategories() {
	try{
		string namespacePrefix = getNamespacePrefix();

		RFP_MainController.checkAccess(namespacePrefix + 'Knowledge__DataCategorySelection', new string[] {
				'DataCategoryGroupName', 'DataCategoryName'
			}, 'read');

	}
	catch(exception e) {
		throw new AuraHandledException(e.getMessage());
	}
	try{
		DataCategoriesFactory factory = new DataCategoriesFactory();
		getDataCategoriesInterface dataCategoriesInstance = factory.getDataCategoriesInstance();
		return dataCategoriesInstance.getKnowledgeCategories();

	}
	catch(exception e) {
		system.debug('The apex class proposalforce_getDataCategories has not been implemented.');
		return '[]';
	}
}


@AuraEnabled
public static proposalforce__rfp_Question__c[] updateQuestion(proposalforce__rfp_Question__c question, string title, string answer) {

	try{
		RFP_MainController.checkAccess('proposalforce__rfp_Question__c', question, 'update');
		proposalforce__rfp_Response__c newResponse = new proposalforce__rfp_Response__c();
		newResponse.proposalforce__Response_Text__c = answer;
		RFP_MainController.checkAccess('proposalforce__rfp_Response__c', newResponse, 'create');
		insert newResponse;
		question.proposalforce__rfp_Response__c = newResponse.Id;
		question.proposalforce__Status__c = 'Draft';
		update question;
		return RFP_MainController.getQuestions(question.proposalforce__RFP__c);
	}
	catch(exception e) {
		throw new AuraHandledException(e.getMessage());
	}

}

@AuraEnabled
public static proposalforce__rfp_Question__c[] updateQuestionStatus(proposalforce__rfp_Question__c question, String newStatus) {
	try{

		RFP_MainController.checkAccess('proposalforce__rfp_Question__c', question, 'update');


		question.proposalforce__Status__c = newStatus;
		update question;
		return RFP_MainController.getQuestions(question.proposalforce__RFP__c);

	}
	catch(exception e) {
		throw new AuraHandledException(e.getMessage());
	}
}


@AuraEnabled
public static String createNewArticleVersion(Id articleId, Id articleVersionId) {
	try{

		//Dynamic soql to interact with client namespaced knowledge records
		Schema.SObjectType knowledgeVersionObjectType = articleVersionId.getSObjectType();
		String knowledgeVersionObjectTypeName = knowledgeVersionObjectType.getDescribe().getName();
		string queryString = 'select id, title, knowledgearticleId from ' + knowledgeVersionObjectTypeName +' where publishstatus = \'draft\' and KnowledgeArticleId = \'' +  String.escapeSingleQuotes(articleId) + '\'';
		sobject[] draftArticles = Database.query(queryString);

		if(draftArticles.size() > 0) {
			return draftArticles[0].Id;
		}else{
			String id = KbManagement.PublishingService.editOnlineArticle(articleId, false);
			return id;
		}
	}
	catch(exception e) {
		throw new AuraHandledException(e.getMessage());
	}

}


@AuraEnabled
public static proposalforce__RFP__c setNewComplianceResponses(proposalforce__RFP__c rfp) {

	RFP_MainController.checkAccess('proposalforce__RFP__c', rfp, 'update');
	update rfp;
	return rfp;
}


@AuraEnabled
public static String generateCSV(String rfpId) {

	try{
		string newContentDocumentId;

		RFP_MainController.checkAccess('proposalforce__RFP_Question__c', new string[] {
				'proposalforce__RFP_Question_Text__c',
				'proposalforce__status__c',
				'proposalforce__Compliance_Response__c',
				'proposalforce__rfp__c'
			}, 'read');

		RFP_MainController.checkAccess('proposalforce__RFP_Response__c', new string[] {
				'proposalforce__Response_Text__c',
				'Name'
			}, 'read');


		RFP_Question__c[] questionsAndResponses = [SELECT name,
		                                           proposalforce__RFP_Question_Text__c,
		                                           proposalforce__status__c,
		                                           proposalforce__Compliance_Response__c,
		                                           proposalforce__RFP_Response__r.proposalforce__Response_Text__c,
		                                           proposalforce__rfp__r.Name FROM proposalforce__RFP_Question__c WHERE proposalforce__rfp__c = :rfpId order by name];
		string header = 'Question,Response,Compliance, Status\n';
		string resultCSV = header;

		for(proposalforce__RFP_Question__c qAndA : questionsAndResponses) {
			// string cleanedAnswer = qAndA.proposalforce__RFP_Response__r.proposalforce__Response_Text__c.replaceAll('<[^>]*>','');
			string newRow = '"' + qAndA.proposalforce__RFP_Question_Text__c + '"' + ',' +
			                '"' + qAndA.proposalforce__RFP_Response__r.proposalforce__Response_Text__c + '"' +
			                ',' +
			                '"' +  qAndA.proposalforce__Compliance_Response__c + '"' +
			                ',' +
			                '"' + qAndA.proposalforce__Status__c +  '"' + '\n';

			resultCSV += newRow;
		}

		blob resultCSVBlob = Blob.valueOf(resultCSV);



		ContentVersion csv = new ContentVersion();
		csv.VersionData = resultCSVBlob;
		csv.PathOnClient = 'file_' + Datetime.now().getTime() + '.csv';
		csv.Title =  questionsAndResponses[0].proposalforce__rfp__r.Name + ' Questions and Responses.csv';

		contentdocument[] matchingTitles = [select id, title from contentdocument where title = :csv.Title];
		if(matchingTitles.size() == 0) {



			RFP_MainController.checkAccess('ContentVersion', csv, 'create');
			insert csv;

			RFP_MainController.checkAccess('ContentVersion', new string[] {'ContentDocumentId'}, 'read');
			newContentDocumentId = [select ContentDocumentId from ContentVersion where id = :csv.Id].ContentDocumentId;

			ContentDocumentLink newCdl = new ContentDocumentLink();
			newCdl.LinkedEntityId = rfpId;
			newCdl.ContentDocumentId = newContentDocumentId;
			newCdl.ShareType = 'I';

			RFP_MainController.checkAccess('ContentDocumentLink', newCdl, 'create');
			insert newCdl;
		}else{
			newContentDocumentId = matchingTitles[0].Id;
			csv.ContentDocumentId = newContentDocumentId;

			RFP_MainController.checkAccess('ContentVersion', csv, 'create');
			insert csv;
		}
		return newContentDocumentId;
	}
	catch(exception e) {

		throw new AuraHandledException(e.getMessage());
	}
}

@AuraEnabled
public static String generateWordDoc(String doc, string rfpId, string rfpName) {

	try{
		RFP_MainController.checkAccess('ContentVersion', new string[] {'ContentDocumentId'}, 'read');

		string newContentDocumentId;

		blob docBlob = EncodingUtil.base64Decode(doc);
		ContentVersion newDoc = new ContentVersion();
		newDoc.VersionData = docBlob;
		newDoc.PathOnClient = 'file_' + Datetime.now().getTime() + '.docx';
		newDoc.Title =  rfpName + ' Questions and Responses.docx';



		contentdocument[] matchingTitles = [select id, title from contentdocument where title = :newDoc.Title];

		if(matchingTitles.size() == 0) {

			RFP_MainController.checkAccess('ContentVersion', newDoc, 'create');
			insert newDoc;

			newContentDocumentId = [select ContentDocumentId from ContentVersion where id = :newDoc.Id].ContentDocumentId;

			ContentDocumentLink newCdl = new ContentDocumentLink();
			newCdl.LinkedEntityId = rfpId;
			newCdl.ContentDocumentId = newContentDocumentId;
			newCdl.ShareType = 'I';


			RFP_MainController.checkAccess('ContentDocumentLink', newCdl, 'create');
			insert newCdl;
		}else{
			newContentDocumentId = matchingTitles[0].Id;
			newDoc.ContentDocumentId = newContentDocumentId;

			RFP_MainController.checkAccess('ContentVersion', newDoc, 'create');
			insert newDoc;
		}

		return newContentDocumentId;
	}
	catch(exception e) {
		throw new AuraHandledException(e.getMessage());
	}
}

@TestVisible
private static void checkAccess(string sobjectName, String[] fields, string accessType){

	SObjectType sobj = Schema.getGlobalDescribe().get(sobjectName);
	if(sobj == null) {
		AuraHandledException e = new AuraHandledException('Access to one or more necessary objects is restricted for the current user: ' + sobjectName);
		e.setMessage('Access to one or more necessary objects is restricted for the current user: ' + sobjectName);
		throw e;
	}

	Map<String,Schema.SObjectField> sobjectfields = sobj.getDescribe().fields.getMap();
	String[] systemFields = new String[] {
		'Id',
		'IsDeleted',
		'CreatedBy',
		'CreatedById',
		'CreatedDate',
		'LastModifiedBy',
		'LastModifiedById',
		'LastModifiedDate',
		'SystemModstamp'
	};



	if(accessType == 'create') {
		for (String field : fields) {
			// Check if the user has access to field
			if(systemFields.indexOf(field) > -1 || sobjectfields.get(field).getDescribe().isCalculated() || sobjectfields.get(field).getDescribe().isAutoNumber()) continue;
			if (!sobjectfields.get(field).getDescribe().isCreateable()) {
				// Pass error to client
				// Due to a quirk with AuraHandledException, the message is only passed to the client when the message is set in both ways
				// as it is below.
				AuraHandledException e = new AuraHandledException('Access to one or more necessary fields is restricted for the current user: ' + field);
				e.setMessage('Access to one or more necessary fields is restricted for the current user: ' + field);
				throw e;
			}
		}
	} else if(accessType == 'read') {
		for (String field : fields) {
			if (!sobjectfields.get(field).getDescribe().isAccessible()) {
				AuraHandledException e = new AuraHandledException('Access to one or more necessary fields is restricted for the current user: ' + field);
				e.setMessage('Access to one or more necessary fields is restricted for the current user: ' + field);
				throw e;

			}
		}
	} else if(accessType == 'update') {
		for (String field : fields) {
			if(systemFields.indexOf(field) > -1 || sobjectfields.get(field).getDescribe().isCalculated() || sobjectfields.get(field).getDescribe().isAutoNumber()) continue;
			if (!sobjectfields.get(field).getDescribe().isUpdateable()) {
				AuraHandledException e = new AuraHandledException('Access to one or more necessary fields is restricted for the current user: ' + field);
				e.setMessage('Access to one or more necessary fields is restricted for the current user: ' + field);
				throw e;
			}
		}
	} else if(accessType == 'delete') {
		if (!sobj.getDescribe().isDeletable()) {
			AuraHandledException e = new AuraHandledException('Access to one or more necessary objects is restricted for the current user.');
			e.setMessage('Access to one or more necessary objects is restricted for the current user.');
			throw e;
		}
	}

}

//for updates of sObjects passed from client
@TestVisible
private static void checkAccess(string sobjectName, sObject objectToCheck, string accessType){

	SObjectType sobj = Schema.getGlobalDescribe().get(sobjectName);
	if(sobj == null) {
		AuraHandledException e = new AuraHandledException('Access to one or more necessary objects is restricted for the current user: ' + sobjectName);
		e.setMessage('Access to one or more necessary objects is restricted for the current user: ' + sobjectName);
		throw e;
	}
	Map<String,Schema.SObjectField> sobjectfields = sobj.getDescribe().fields.getMap();

	Map<String, Object> fieldMap = objectToCheck.getPopulatedFieldsAsMap();
	Set<string> fields = fieldMap.keySet();
	string[] fieldList = new string[] {};
	for( string field : fields ) {
		if(field.indexOf('__r') > -1) field = field.replace('__r', '__c');
		fieldList.add(field);
	}
	RFP_MainController.checkAccess(sobjectName, fieldList, accessType);

}

}