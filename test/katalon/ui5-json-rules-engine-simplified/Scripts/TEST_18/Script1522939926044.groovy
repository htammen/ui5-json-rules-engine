import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import com.kms.katalon.core.checkpoint.Checkpoint as Checkpoint
import com.kms.katalon.core.checkpoint.CheckpointFactory as CheckpointFactory
import com.kms.katalon.core.mobile.keyword.MobileBuiltInKeywords as MobileBuiltInKeywords
import com.kms.katalon.core.mobile.keyword.MobileBuiltInKeywords as Mobile
import com.kms.katalon.core.model.FailureHandling as FailureHandling
import com.kms.katalon.core.testcase.TestCase as TestCase
import com.kms.katalon.core.testcase.TestCaseFactory as TestCaseFactory
import com.kms.katalon.core.testdata.TestData as TestData
import com.kms.katalon.core.testdata.TestDataFactory as TestDataFactory
import com.kms.katalon.core.testobject.ObjectRepository as ObjectRepository
import com.kms.katalon.core.testobject.TestObject as TestObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WSBuiltInKeywords
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUiBuiltInKeywords
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import internal.GlobalVariable as GlobalVariable
import org.openqa.selenium.Keys as Keys

WebUI.openBrowser('https://ui5-json-rules-engine-simplified.glitch.me/')

WebUI.waitForPageLoad(5)

WebUI.delay(1)

WebUI.setText(findTestObject('Test_16/Page_json-rules-engine-simplified/input___xmlview1--__input1-inn'), '18')

WebUI.clickOffset(findTestObject('Test_16/Page_json-rules-engine-simplified/div_SWE'), 2, 2)

WebUI.verifyElementText(findTestObject('Test_16/Page_json-rules-engine-simplified/span_Cheers_SWE'), 'Cheers')

WebUI.clickOffset(findTestObject('Test_16/Page_json-rules-engine-simplified/div_GER'), 2, 2)

WebUI.verifyElementText(findTestObject('Test_16/Page_json-rules-engine-simplified/span_Cheers_GER'), 'Cheers', FailureHandling.STOP_ON_FAILURE)

WebUI.clickOffset(findTestObject('Test_16/Page_json-rules-engine-simplified/div_US'), 2, 2)

WebUI.verifyElementText(findTestObject('Test_16/Page_json-rules-engine-simplified/span_Hey are you insane You ha'), 'Hey, are you insane? You have to be at least 21 years old.')

WebUI.closeBrowser()

