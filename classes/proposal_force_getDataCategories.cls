global with sharing class proposal_force_getDataCategories implements proposalforce.getDataCategoriesInterface{
	@AuraEnabled
	global static string getKnowledgeCategories() {
		try{

			 List<DescribeDataCategoryGroupResult> describeCategoryResult = Schema.describeDataCategoryGroups(new string[] {'KnowledgeArticleVersion'});

			 List<DataCategoryGroupSobjectTypePair> pairs = new List<DataCategoryGroupSobjectTypePair>();
			 for(DescribeDataCategoryGroupResult singleResult :
			 describeCategoryResult) {
			     DataCategoryGroupSobjectTypePair p =
				     new DataCategoryGroupSobjectTypePair();
			     p.setSobject(singleResult.getSobject());
			     p.setDataCategoryGroupName(singleResult.getName());
			     pairs.add(p);
			 }


			 //describeDataCategoryGroupStructures()
			 List<DescribeDataCategoryGroupStructureResult> describeCategoryStructureResult =
			     Schema.describeDataCategoryGroupStructures(pairs, false);

			 for(DescribeDataCategoryGroupStructureResult singleResult : describeCategoryStructureResult) {


			     //Get the top level categories
			     DataCategory [] toplevelCategories =
				     singleResult.getTopCategories();

			     //Recursively get all the categories
			     List<DataCategory> allCategories =
				     getAllCategories(toplevelCategories);

			 }
			 return JSON.serialize(describeCategoryStructureResult);


		}
		catch(exception e) {
			throw new AuraHandledException(e.getMessage());

		}
	}


	private static DataCategory[] getAllCategories(DataCategory [] categories){
		if(categories.isEmpty()) {
			return new DataCategory[] {};
		} else {
			DataCategory [] categoriesClone = categories.clone();
			DataCategory category = categoriesClone[0];
			DataCategory[] allCategories = new DataCategory[] {category};
			categoriesClone.remove(0);
			categoriesClone.addAll(category.getChildCategories());
			allCategories.addAll(getAllCategories(categoriesClone));
			return allCategories;
		}
	}
}