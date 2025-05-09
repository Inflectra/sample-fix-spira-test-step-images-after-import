//Use 'Record/Learn' button to begin test recording
var username = 'xxxxxxx';
var apiKey = '{XXXXXX-XXXXXXX-XXXXXXX-XXXXXXXXX}';

//This code will search and replace any test steps that have a QAComplete embedded image
/*

Example

/Common/api/ui/projects/11889/TestSteps/5207445/files/82055/image-2024-06-06-12-46-20-978.png

needs to become:

/218/Attachment/54488.aspx

*/

function Test(params)
{
	var projectId = 218;
	
	FixTestCases(projectId);
}

function FixTestCases(projectId)
{
	var baseUrl = 'https://mycompany.spiraservice.net';
	
	//Get all the test cases in this project
	SeS('TestCase_Retrieve1').SetUrl(SeS('TestCase_Retrieve1').GetUrl().replace("https://api.inflectra.com/Spira", baseUrl));
	SeS('TestCase_Retrieve1').SetCredential(username, apiKey)
	SeS('TestCase_Retrieve1').DoExecute( {"project_id": projectId, "starting_row": 1, "number_of_rows": 500 } );
	var testCases = SeS('TestCase_Retrieve1').GetResponseBodyObject();
	
	//Get a specific test case (for testing) - e.g. [TC:472755]
	//SeS('TestCase_RetrieveById').SetUrl(SeS('TestCase_RetrieveById').GetUrl().replace("https://api.inflectra.com/Spira", baseUrl));
	//SeS('TestCase_RetrieveById').SetCredential(username, apiKey)
	//SeS('TestCase_RetrieveById').DoExecute( {"project_id": projectId, "test_case_id": 472755 } );
	//var testCases = [SeS('TestCase_RetrieveById').GetResponseBodyObject()];
	
	for (var i = 0; i < testCases.length; i++)
	{
		var testCase = testCases[i];
		var testCaseId = testCase.TestCaseId;
		
		//Get the test steps for this test case
		SeS('TestStep_RetrieveSteps').SetUrl(SeS('TestStep_RetrieveSteps').GetUrl().replace("https://api.inflectra.com/Spira", baseUrl));
		SeS('TestStep_RetrieveSteps').SetCredential(username, apiKey)
		SeS('TestStep_RetrieveSteps').DoExecute( { "project_id": projectId, "test_case_id": testCaseId } );
		var testSteps = SeS('TestStep_RetrieveSteps').GetResponseBodyObject();
		
		//Loop through the test steps
		for (var j = 0; j < testSteps.length; j++)
		{
			var testStep = testSteps[j];
			var testStepId = testStep.TestStepId;
			
			var description = testStep.Description;
			var expectedResult = testStep.ExpectedResult;
						
			//Do the text search and replace
			var needToReplace = false;
			if (description && description.includes('/Common/api/ui/projects/'))
			{
				needToReplace = true;
			}
			if (expectedResult && expectedResult.includes('/Common/api/ui/projects/'))
			{
				needToReplace = true;
			}
			
			if (needToReplace)
			{
				//Get the associated attachments to this test step
				SeS('ArtifactDocument_RetrieveForArtifact2').SetUrl(SeS('ArtifactDocument_RetrieveForArtifact2').GetUrl().replace("https://api.inflectra.com/Spira", baseUrl));
				SeS('ArtifactDocument_RetrieveForArtifact2').SetCredential(username, apiKey)
				SeS('ArtifactDocument_RetrieveForArtifact2').DoExecute( { "project_id": projectId, "artifact_id": testStepId, "artifact_type_id": 7 } );
				var attachments = SeS('ArtifactDocument_RetrieveForArtifact2').GetResponseBodyObject();				
				
				//Do the replace of the text
				testStep.Description = ReplaceText(projectId, description, attachments);
				testStep.ExpectedResult = ReplaceText(projectId, expectedResult, attachments);
				
				//Update the test step
				SeS('TestStep_UpdateStep').SetUrl(SeS('TestStep_UpdateStep').GetUrl().replace("https://api.inflectra.com/Spira", baseUrl));
				SeS('TestStep_UpdateStep').SetCredential(username, apiKey)
				SeS('TestStep_UpdateStep').SetRequestBodyObject(testStep);
				SeS('TestStep_UpdateStep').DoExecute( { "project_id": projectId, "test_case_id": testCaseId } );
			}			
		}
	}
}

function ReplaceText (projectId, textField, attachments)
{
	//Loop through the attachments
	for (var k = 0; k < attachments.length; k++)
	{
		var attachment = attachments[k];
		var attachmentId = attachment.AttachmentId;
		var filename = attachment.FilenameOrUrl;
		
		//Try and replace
		var regex = new RegExp("\/Common\/api\/ui\/projects\/[0-9]+\/TestSteps\/[0-9]+\/files\/[0-9]+\/" + filename, "gi");
		textField = textField.replace(regex, '/'+ projectId + '/Attachment/' + attachmentId + '.aspx');
	}
	
	return textField;
}

