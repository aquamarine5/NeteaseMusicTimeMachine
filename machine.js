const puppeteer = require("puppeteer");
const formdata = require("form-data")
const echarts = require("echarts");
const axios = require('axios');
const fs = require("fs");
async function getAnalysis() {
    var cookie = process.env.NETEASEMUSIC_COOKIE
    var response = await new axios.Axios({
        headers: {
            Cookie: cookie
        }
    }).get("https://music.163.com/prime/m/viptimemachine")
    var data = new RegExp("window.__INITIAL_DATA__ = ({.+})</script>").exec(response.data)[0]
    data = data.replace("window.__INITIAL_DATA__ = ", "").replace("</script>", "")
    return JSON.parse(data).reportFlowData.detail[0]
}
async function uploadImage(imagePath) {
    var smmsToken = process.env.SMMS_TOKEN
    var form = new formdata()

    form.append("smfile", fs.createReadStream(imagePath))
    var request = new axios.Axios({
        headers: form.getHeaders(
            {
                "Authorization": smmsToken
            }),
    })
    var response = await request.post("https://sm.ms/api/v2/upload", form);
    console.log(JSON.parse(response.data).data.url)
    return JSON.parse(response.data).data.url
}
async function pushWechat(imageUrl, analysis) {
    var serverToken = process.env.WX_SERVER_TOKEN
    if (serverToken == undefined) return
    var startDate = new Date(analysis.weekStartTime)
    var endDate = new Date(analysis.weekEndTime)
    var response = await new axios.Axios({}).get(
        encodeURI(
            "https://sctapi.ftqq.com/" + serverToken + ".send?title=" +
            "网易云音乐" + (startDate.getMonth() + 1) + "." + startDate.getDate() + "-" +
            (endDate.getMonth() + 1) + "." + (endDate.getDate() + 1) + "黑胶时光机分析图片" +
            "&desp=" + "![](" + imageUrl + ")")
    )
    console.log(response.data)
}
async function main() {
    const analysis = await getAnalysis()
    const browser = await puppeteer.launch({
        //executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        defaultViewport: {
            width: 450,
            height: 2000
        }
        //, headless: false
        , dumpio: true
    });
    var baseHtml = fs.readFileSync("sources/base.html", "utf-8");
    const page = await browser.newPage();
    await page.setContent(baseHtml);
    console.log(analysis)
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
            if (song.tag != null) addElement(document, "span", div, "name-label f-cor-d f-flex00", song.tag)
            addElement(document, "p", detail, "f-fs12 artist s-fc2 f-thide f-cor-g", song.artistNames)
        }
        function loadListenCount(document, analysis) {
            var songsc = analysis.data.listenSongs
            if (songsc == undefined) return
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
            if (minutetime >= 1) {
                addElement(document, "span", timep, "f-cor-b", minutetime)
                timep.append(" 分")
            }
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
            if (analysis.data.details == undefined) {
                container.remove()
                return
            }
            analysis.data.details.forEach(element => {
                hours.push(Math.trunc(element.duration / 60 / 60))
                var date = new Date(element.day)
                dates.push(date.getMonth() + 1 + "." + date.getDate())
            })
            var mine = Math.min(...hours)
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
                    } else c++, l.push(element)
                })
                if (c != 0) j.push(l); i.push(c)
                var ii = Math.max(...i)
                var d = j[i.findIndex(e => e == ii)]
                var length = d.length
                var gridp = Math.min(...d)
            }
            else {
                var length = 7
                var gridp = mine
            }
            addElement(document, "p", container, "rpt-main-tit f-cor-b", "连续" + length + "天听歌超过" + gridp + "小时")
            var panel = addElement(document, "div", container, "bc-r-cont")
            var chart = echarts.init(panel)
            chart.setOption({
                animation: false,
                grid: {
                    top: 30,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    width: 'auto',
                    containLabel: true
                },
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
                            color: "rgba(0,0,0,0.05)",
                            type: "solid"
                        }
                    },
                    axisLabel: {
                        color: "rgba(0.0,0.0,0.0,0.4)",
                        fontSize: 10,
                        interval: 0
                    }
                },
                yAxis: {
                    type: 'value',
                    name: "(小时)",
                    align: "left",
                    padding: [0, 0, 0, -5],
                    axisLine: {
                        enabled: false
                    },
                    nameTextStyle: {
                        color: "rgba(0,0,0,0.4)",
                        fontSize: 10
                    },
                    splitLine: {
                        lineStyle: {
                            color: ["rgba(0,0,0,0.08)"],
                            type: "dashed",
                            width: 0.5
                        }
                    }
                },
                series: [
                    {
                        data: hours,
                        type: 'bar',
                        barWidth: 8,
                        label: {
                            show: true,
                            position: "top",
                            color: "rgb(99,178,245)",
                            fontSize: 10
                        },
                        markLine: {
                            data: [{
                                name: 'yAxis参考线',
                                yAxis: gridp
                            }
                            ],
                            label: { show: false },
                            silent: true,
                            symbol: "none",
                            lineStyle: { color: "rgba(99,178,245,0.3)" }
                        },
                        itemStyle: {
                            barBorderRadius: [5, 5, 0, 0],
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
        }
        function loadEmotion(document, analysis) {
            var wstime = analysis.weekStartTime
            if (wstime == undefined) return
            var tdata = []
            for (let index = 0; index < 7; index++) {
                var date = new Date(wstime + 86400000 * index)
                if (index == 0 || index == 6) {
                    tdata.push({
                        value: date.getMonth() + 1 + "." + date.getDate(),
                        textStyle: {
                            align: index == 0 ? "left" : "right"
                        }
                    })
                }
                else {
                    tdata.push(date.getMonth() + 1 + "." + date.getDate())
                }
            }
            var buffer = []
            var sdata = []
            const colorList = [
                ["#6353F0", "#4CA5F4", "#4493F6", "rgba(68, 147, 246, 0)"],
                ["#41D395", "#B3F474", "#40E58D", "rgba(64, 229, 141, 0)"],
                ["#FF5C29", "#FF78C2", "#FF5D64", "rgba(255, 120, 194, 0)"],
                ["#FF6F2D", "#FFD02D", "#FF8B45", "rgba(255, 139, 69, 0)"]
            ]
            var index = 0
            analysis.data.musicEmotion.emotions.forEach(element => {
                buffer = []
                element.detail.forEach(celement => {
                    buffer.push(Math.trunc(parseFloat(celement.percent) * 100))
                })
                sdata.push({
                    type: "line",
                    smooth: true,
                    symbol: "none",
                    lineStyle: {
                        color: {
                            type: "linear",
                            x: 0,
                            y: 0,
                            x2: 1,
                            y2: 0,
                            colorStops: [
                                {
                                    offset: 0,
                                    color: colorList[index][0]
                                },
                                {
                                    offset: 1,
                                    color: colorList[index][1]
                                }
                            ]
                        },
                        width: 2
                    },
                    areaStyle: {
                        color: {
                            type: "linear",
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                {
                                    offset: 0,
                                    color: colorList[index][2]
                                },
                                {
                                    offset: 1,
                                    color: colorList[index][3]
                                }
                            ]
                        }
                    },
                    "data": buffer
                })
                index++;
            })
            var container = addContainer(document)
            addElement(document, "p", container, "f-fs16 f-fw1 b-cont-tit f-cor-b", "音乐情绪")
            var detail = addElement(document, "p", container, "f-cor-b f-fs14")
            detail.append("你本周的音乐情绪是")
            addElement(document, "span", detail, "f-cor-d f-fw1", analysis.data.musicEmotion.subTitle[0])
            detail.append("与")
            addElement(document, "span", detail, "f-cor-d f-fw1", analysis.data.musicEmotion.subTitle[1])
            var legend = addElement(document, "div", container, "mood-legend")
            const label = ["快乐、兴奋", "浪漫、甜蜜",
                "思念、抒情", "伤感、孤独"]
            for (let index = 3; index >= 0; index--) {
                var item = addElement(document, "div", legend, "m-item f-cor-g")
                var line = addElement(document, "span", item, "m-i-line")
                line.setAttribute("style", "background-image:linear-gradient(90deg, " +
                    colorList[index][0] + " 0%, " + colorList[index][1] + " 100%)")
                addElement(document, "span", item, "", label[3 - index])

            }
            var chart = echarts.init(addElement(document, "div", container, "mood-chart"))
            chart.setOption({
                animation: false,
                grid: {
                    top: 30,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    width: 'auto',
                    containLabel: true
                },
                series: sdata,
                xAxis: {
                    show: true,
                    boundaryGap: false,
                    axisLabel: {
                        color: "rgba(0,0,0,0.4)",
                        fontSize: 10,
                        interval: 0
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            type: "solid",
                            color: "rgba(0,0,0, 0.05)"
                        }
                    },
                    axisTick: {
                        show: false
                    },
                    data: tdata
                },
                yAxis: {
                    name: "(占比%)",
                    type: "value",
                    show: true,
                    nameTextStyle: {
                        fontSize: 10,
                        color: "rgba(0,0,0,0.4)"
                    },
                    axisLabel: {
                        show: true,
                        color: "rgba(0,0,0,0.4)",
                        fontSize: 10
                    },
                    splitNumber: 5,
                    splitLine: {
                        lineStyle: {
                            color: [
                                "rgba(0,0,0,0.08)"
                            ],
                            type: "dashed",
                            width: 0.5
                        }
                    }
                }
            })
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
        function loadYear(document, analysis) {
            if (analysis.data.musicYear == undefined) return
            var year = analysis.data.musicYear
            var percents = year.yearPercents
            var singles = year.yearSingles
            var container = addContainer(document)
            addElement(document, "p", container, "f-fs16 f-fw1 b-cont-tit f-cor-b", "歌曲年代")
            var detail = addElement(document, "p", container, "f-cor-b f-fs14 b-cont-sub-tit")
            detail.append("有")
            addElement(document, "span", detail, "f-cor-d f-fw1", year.total + "首")
            detail.append(year.year + "s年代的歌曲，占听歌总量的")
            addElement(document, "span", detail, "f-cor-d f-fw1", Math.trunc(parseFloat(year.percent) * 100) + "%")
            var panel = addElement(document, "div", container, "era-r-main")
            var chart = echarts.init(addElement(document, "div", panel, "era-chart"))
            var datas = []
            var index = 0
            const colorList = [
                ["#70BCFA", "#ACDCFF"],
                ["#AE8BFF", "#D0BBFF"],
                ["#9DDF78", "#CCFFB0"],
                ["#8C9BFE", "#B3CBF5"],
                ["#59DEE2", "#A5FCFC"]
            ]
            percents.forEach(element => {
                datas.push({
                    name: element.startYear + "-" + element.endYear + "s",
                    value: Math.trunc(parseFloat(element.percent) * 100),
                    itemStyle: {
                        opacity: 0.8,
                        color: {
                            type: "linear",
                            x: 0, x2: 1, y: 0, y2: 1,
                            colorStops: [
                                {
                                    offset: 0,
                                    color: colorList[index][0]
                                },
                                {
                                    offset: 1,
                                    color: colorList[index][1]
                                }
                            ]
                        }
                    }
                })
                index++;
            })
            chart.setOption({
                animation: false,
                series: [
                    {
                        clockwise: true,
                        data: datas,
                        emphasis: {
                            scaleSize: 6
                        },
                        emptyCircleStyle: {
                            color: "#fff"
                        },
                        label: {
                            show: false
                        },
                        radius: [
                            '45%', '90%'
                        ],
                        right: 0,
                        silent: true,
                        startAngle: 75,
                        type: "pie"
                    }
                ]
            })
            var dislist = addElement(document, "div", panel, "era-dis-list")
            index = 0
            percents.forEach(element => {
                var item = addElement(document, "div", dislist, "era-dis-item")
                var cir = addElement(document, "div", item, "cir")
                cir.setAttribute("style", "background-image:linear-gradient(225deg, " +
                    colorList[index][1] + " 0%, " + colorList[index][0] + " 100%)")
                addElement(document, "p", item, "per f-fs12 f-cor-f", Math.trunc(parseFloat(element.percent) * 100) + "%")
                addElement(document, "p", item, "era f-fs10 f-cor-g", element.startYear + "-" + element.endYear + "s")
                index++;
            })
            addElement(document, "div", container, "s-y-gap-line")
            var ul = addElement(document, "ul", container, "u-song-list ")
            singles.forEach(element => {
                drawSongDetail(document, element, addElement(document, "li", ul, "song-item"))
            })
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
                    var text = "，"
                    var time = "清晨"
                }
                var detail = addElement(document, "div", li, "f-fs14 type s-fc1 f-cor-b")
                detail.append(date.getMonth() + 1 + "月" + date.getDate() + "日" + text)
                // getUTCHours()+8 -> UTC+8, see #8
                addElement(document, "span", detail, "f-cor-d", time + fixTime(date.getUTCHours() + 8) + ":" + fixTime(date.getMinutes()))
                if (!isEnd) detail.append("你就开始听歌了")
                drawSongDetail(document, song, li)
            }
            if (analysis.data.startSong == undefined) {
                return
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
            loadYear(document, analysis)
            loadEmotion(document, analysis)
        }
        main()
    }, analysis)
    var size = await page.evaluate(() => {
        return document.getElementsByClassName("vtw-wrapper page-bg")[0].offsetHeight
    })
    console.log(size)
    /* waiting issue #4
    await page.setViewport({
        width:450,
        height:size+30
    })
    */
    await page.screenshot(
        {
            path: "screenshot.png",
            fullPage: true
        })
    await browser.close()
    var imageUrl = await uploadImage("screenshot.png")
    await pushWechat(imageUrl, analysis)
};


main.call()
