const puppeteer = require('puppeteer-core');
const fs=require("fs");
const analysis=getAnalysis()
function getAnalysis(){

}
function addElement(document,tagName,parent,className="",text=""){
    var element=document.createElement(tagName);
    if (className!="")element.setAttribute("class",className);
    if(text!="")element.textContent=text;
    parent.appendChild(element);
    return element;
}
function addContainer(document,className="b-container b-cont-bg "){
    var wrapper=document.getElementsByClassName("vtw-wrapper page-bg")[0]
    return addElement(document,"div",wrapper,className);
}
function loadKeyword(document,analysis,container){
    var keyword=analysis.data.keyword
    var subTitle=analysis.data.subTitle
    addElement(document,"p",container,"f-cor-c")
}
(async()=>{
    
    const browser=await puppeteer.launch({
        "executablePath":"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
    });
    var baseHtml=fs.readFileSync("sources/base.html","utf-8");
    const page=await browser.newPage();
    await page.setContent(baseHtml);
    await page.evaluate(()=>{
        addContainer(document)
    })
    await page.screenshot({path:"D:/a.png"})
    await browser.close()
})();