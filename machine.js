const puppeteer = require("puppeteer");
const formdata = require("form-data");
const axios = require('axios');
const fs = require("fs");

const bs = require("./broswer")
const devMode = process.argv.indexOf("--dev-mode") != -1

async function getAnalysis() {
    var cookie = process.env.NETEASEMUSIC_COOKIE
    if (cookie == undefined) throw new Error()
    var response = await new axios.Axios({
        headers: {
            Cookie: cookie
        }
    }).get("https://music.163.com/prime/m/viptimemachine")
    var reg = new RegExp("window.__INITIAL_DATA__ = ({.+})</script>").exec(response.data)
    if (reg == null) {
        throw new Error()
    } else {
        var data = reg[0]
    }
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
    var launchOptions = devMode ?
        {
            executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
            defaultViewport: {
                width: 500,
                height: 2500
            },
            headless: false,
            dumpio: true
        } : {
            defaultViewport: {
                width: 500,
                height: 2500
            },
            dumpio: true
        };
    const browser = await puppeteer.launch(launchOptions);
    var baseHtml = fs.readFileSync("sources/base.html", "utf-8");
    const page = await browser.newPage();
    page.setDefaultTimeout(300000);
    //await page.goto("https://music.163.com/prime/m/viptimemachine");
    await page.setContent(baseHtml);
    console.log(analysis)
    await bs.evaluate(analysis, page);
    var size = await page.evaluate(() => {
        return document.getElementsByClassName("vtw-wrapper page-bg")[0]["offsetHeight"]
    })
    console.log(size)

    var startDate = new Date(analysis.weekStartTime)
    var path = "wyy_report_" +
        startDate.getUTCFullYear() + "_" + (startDate.getUTCMonth() + 1) + "_" + (startDate.getUTCDate() + 1) +
        ".png"
    await page.screenshot(
        {
            path: path,
            clip: {
                x: 0, y: 0,
                width: 500, height: size + 30
            }
        })
    if (!devMode) {
        await browser.close()
        var imageUrl = await uploadImage(path)
        await pushWechat(imageUrl, analysis)
    }
};


main.call(null)
