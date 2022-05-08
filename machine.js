const puppeteer = require('puppeteer-core');
const fs = require("fs");
const analysis = getAnalysis()
function getAnalysis() {
    return{}}
(async () => {
    const browser = await puppeteer.launch({
        "executablePath": "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
        //,headless:false
    });
    var baseHtml = fs.readFileSync("sources/base.html", "utf-8");
    const page = await browser.newPage();
    await page.setContent(baseHtml);

    await page.evaluate(analysis => {
        function addElement(document, tagName, parent, className = "", text = "") {
            var element = document.createElement(tagName);
            if (className != "") element.setAttribute("class", className);
            if (text != "") element.textContent = text;
            parent.appendChild(element);
            return element;
        }
        function addContainer(document, className = "b-container b-cont-bg ") {
            var wrapper = document.getElementsByClassName("vtw-wrapper page-bg")[0]
            return addElement(document, "div", wrapper, className);
        }
        function drawSongDetail(document, song, parent) {
            var area = addElement(document, "div", parent, "f-flvc ")
            var figure = addElement(document, "figure", area, "img f-pr f-flex00")
            var image = addElement(document, "img", figure, "f-prafll ")
            image.setAttribute("src", song.coverUrl)
            image.setAttribute("heightratio", "1")
            var detail = addElement(document, "div", area, "f-flex11 content")
            var div = addElement(document, "div", detail, "f-flvc")
            addElement(document, "p", div, "f-fs14 name s-fc3 f-thide f-cor-f", song.songName)
            addElement(document, "p", detail, "f-fs12 artist s-fc2 f-thide f-cor-g", song.artistNames)
        }
        function loadListenCount(document,analysis){
            var songsc=analysis.data.listenSongs
            var count=analysis.data.listenWeekCount
            var time=analysis.data.listenWeekTime/60/60
            var trunctime=Math.trunc(time)
            var minutetime=Math.round((time-trunctime)*60)
            var base=addContainer(document,"his-block")
            var container=addElement(document,"div",base,"b-container b-cont-bg his-cont")
            var time=addElement(document,"div",container,"his-item")
            var timep=addElement(document,"p",time,"t f-cor-c")
            addElement(document,"span",timep,"f-cor-b",trunctime)
            timep.append(" 小时 ")
            addElement(document,"span",timep,"f-cor-b",minutetime)
            timep.append(" 分")
            addElement(document,"div",container,"his-gap")
            var countd=addElement(document,"div",container,"his-item")
            var countp=addElement(document,"p",countd,"t f-cor-c")
            addElement(document,"span",countp,"f-cor-b",count)
            countp.append("次")
            var counts=addElement(document,"p",countd,"s f-cor-c")
            counts.append("本周已听")
            addElement(document,"span",counts,"f-cor-d",songsc+"首歌")
        }
        function loadKeyword(document, analysis) {
            var keyword = analysis.data.keyword
            var subTitle = analysis.data.subTitle
            var container = addContainer(document, "b-container b-cont-bg kw-wrap");
            addElement(document, "p", container, "f-cor-c", "关键词")
            addElement(document, "p", container, "rp-key-word f-cor-b", keyword)
            var sp = addElement(document, "p", container, "rp-s-d f-cor-b")
            var subTitleArray = subTitle.split('##1');
            for (let index = 0; index < subTitleArray.length; index++) {
                const element = subTitleArray[index];
                if (index % 2) addElement(document, "span", sp, "f-cor-d f-fw1", element)
                else sp.append(element)
            }
        }
        function loadStartEnd(document, analysis) {
            function drawLi(ul, song, date, isEnd) {
                function fixTime(time) {
                    if (time < 10) return "0" + time
                    else return time
                }
                var li = addElement(document, "li", ul, "song-item has-tit ")
                if (isEnd) {
                    var text = "，音乐一直陪你到"
                    var time = "深夜"
                } else {
                    var text = "，你就开始听歌了"
                    var time = "清晨"
                }
                var detail = addElement(document, "div", li, "f-fs14 type s-fc1 f-cor-b")
                detail.append(date.getMonth()+1 + "月" + date.getDate() + "日" + text)
                addElement(document, "span", detail, "f-cor-d", time + fixTime(date.getHours()) + ":" + fixTime(date.getMinutes()))
                drawSongDetail(document, song, li)
            }
            var startSong = analysis.data.startSong
            var startDate = new Date(analysis.data.startTime)
            var endSong = analysis.data.endSong
            var endDate = new Date(analysis.data.endTime)
            var container = addContainer(document)
            var section = addElement(document, "section", container)
            addElement(document, "h3", section, "f-fs16 f-fw1 s-fcFFF f-cor-b", "最早最晚")
            var ul = addElement(document, "ul", section, "u-song-list ")
            drawLi(ul, startSong, startDate, false)
            drawLi(ul, endSong, endDate, true)
        }
        function main() {
            loadListenCount(document,analysis)
            loadKeyword(document, analysis)
            loadStartEnd(document, analysis)
        }
        main()
    }, analysis)
    await page.screenshot(
        { 
            path: "D:/Program Source/NeteaseMusicTimeMachine/a.png", 
            fullPage: true })
    await browser.close()
})();