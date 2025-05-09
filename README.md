# sample-fix-spira-test-step-images-after-import
This sample shows how you can use Rapise to call the SpiraTest API to fix a set of test cases that had test steps
with embedded images that need to be adjusted after importing from another test management tool.

In this example, the import from the other tool had attached the images to the SpiraTest test steps, but left the embedded URLs pointing to the URL in the old tool:

`/Common/api/ui/projects/11889/TestSteps/5207445/files/82055/image-2024-06-06-12-46-20-978.png`

needs to become:

` /218/Attachment/54488.aspx`
