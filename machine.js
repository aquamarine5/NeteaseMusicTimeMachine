const puppeteer = require("puppeteer-core");
const echarts = require("echarts");
const fs = require("fs");
const analysis = getAnalysis()
function getAnalysis() {
    return {}}
(async () => {
    const browser = await puppeteer.launch({
        "executablePath": "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        defaultViewport: {
            width: 500,
            height: 1500
        }
        , headless: false
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
        function loadListenCount(document, analysis) {
            var songsc = analysis.data.listenSongs
            var count = analysis.data.listenWeekCount
            var time = analysis.data.listenWeekTime / 60 / 60
            var trunctime = Math.trunc(time)
            var minutetime = Math.round((time - trunctime) * 60)
            var base = addContainer(document, "his-block")
            var container = addElement(document, "div", base, "b-container b-cont-bg his-cont")
            var time = addElement(document, "div", container, "his-item")
            var timep = addElement(document, "p", time, "t f-cor-c")
            addElement(document, "span", timep, "f-cor-b", trunctime)
            timep.append(" 小时 ")
            addElement(document, "span", timep, "f-cor-b", minutetime)
            timep.append(" 分")
            addElement(document, "div", container, "his-gap")
            var countd = addElement(document, "div", container, "his-item")
            var countp = addElement(document, "p", countd, "t f-cor-c")
            addElement(document, "span", countp, "f-cor-b", count)
            countp.append("次")
            var counts = addElement(document, "p", countd, "s f-cor-c")
            counts.append("本周已听")
            addElement(document, "span", counts, "f-cor-d", songsc + "首")
            counts.append("歌")
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
        function loadTime(document, analysis) {
            var container = addContainer(document, "b-container b-cont-bg vtw-rpt-main")
            var hours = []
            var dates = []
            analysis.data.details.forEach(element => {
                hours.push(Math.trunc(element.duration / 60 / 60))
                var date = new Date(element.day)
                dates.push(date.getMonth() + 1 + ":" + date.getDate())
            })
            var mine = Math.min(hours)
            if (mine == 0) {
                var i = []
                var l = []
                var j = []
                var c = 0
                hours.forEach(element => {
                    if (element == 0) {
                        i.push(c)
                        j.push(l)
                        c = 0
                        l = []
                    } else c++; l.push(element)
                })
                var ii = Math.max(i)
                var d = j[i.find(e => e == ii)]
                var length = d.length
                var gridp = Math.min(d)
            }
            else {
                var length = 7
                var gridp = mine
            }
            addElement(document, "p", container, "rpt-main-tit f-cor-b", "连续" + length + "天听歌超过" + gridp + "小时")
            var panel = addElement(document, "div", container, "bc-r-cont")
            var chart = echarts.init(panel)
            chart.setOption({
                xAxis: {
                    type: 'category',
                    data: dates,
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        lineStyle: {
                            type: 6
                        }
                    },
                    minorSplitLine: {
                        show: true
                    },
                    nameTextStyle: {
                        color: "#858f93"
                    },
                    axisLine: {
                        lineStyle: {
                            color: "#cadae0"
                        }
                    }
                },
                yAxis: {
                    type: 'value',
                    axisLine: {
                        enabled: false
                    }
                },
                series: [
                    {
                        data: hours,
                        type: 'bar',
                        barWidth: '20%',
                        label: {
                            show: true,
                            position: "top",
                            color: "rgb(99,178,245)"
                        },
                        itemStyle: {
                            barBorderRadius: 10,
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 0,
                                    color: 'rgba(99,178,245,1)'
                                },
                                {
                                    offset: 1,
                                    color: 'rgba(99,178,245,0)'
                                }
                            ])
                        }
                    }
                ]
            })
            window.onresize=chart.resize
            chart.resize()
        }
        function loadCommonStyle(document, analysis) {
            var container = addContainer(document)
            addElement(document, "p", container, "f-fs16 f-fw1 b-cont-tit f-cor-b", "常听曲风")
            var panel = addElement(document, "div", container, "o-st-list")
            var tpanel = addElement(document, "div", panel, "f-flex00")
            var bpanel = addElement(document, "div", panel, "o-st-bar-list f-flex11")
            var index = 0
            const colorList = [
                ["#FF8686", "rgba(255,197,197,0.00)"],
                ["#FFB166", "rgba(255,170,113,0.00)"],
                ["#FFABCA", "rgba(255,171,202,0.00)"],
                ["#FFDE8B", "rgba(255,222,139,0.00)"],
                ["#B49BEE", "rgba(180,139,255,0.00)"]
            ]
            analysis.data.listenCommonStyle.styleDetailList.forEach(element => {
                addElement(document, "p", tpanel, "f-cor-f f-fs12 o-st-name-item", element.styleName)
                var bar = addElement(document, "div", addElement(document, "div", bpanel, "o-st-i-bar"), "bar")
                bar.setAttribute("style",
                    "background-image:linear-gradient(-90deg, " +
                    colorList[index][0] + " 0%, " + colorList[index][1] +
                    " 100%);width:" + (Math.round(element.percent * 100) + 3.5) + "%")
                addElement(document, "span", bar, "f-fw1 f-fs10", Math.round(element.percent * 100) + "%")
                index++;
            });
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
                detail.append(date.getMonth() + 1 + "月" + date.getDate() + "日" + text)
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
            loadListenCount(document, analysis)
            loadKeyword(document, analysis)
            loadTime(document, analysis)
            loadStartEnd(document, analysis)
            loadCommonStyle(document, analysis)
        }
        main()
    }, analysis)
    await page.screenshot(
        {
            path: "D:/Program Source/NeteaseMusicTimeMachine/a.png",
            fullPage: true
        })
    //await browser.close()
})();