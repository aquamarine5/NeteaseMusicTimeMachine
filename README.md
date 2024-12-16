# NeteaseMusicTimeMachine

> [!IMPORTANT]
> 由于网易云更改了相应API逻辑，对应免费获取每周分析报告的功能已不再可用。
> 故`NeteaseMusicTimeMachine`暂时处于不可用状态，请期待后续更新。

[![Commit Activity](https://img.shields.io/github/commit-activity/m/aquamarine5/NeteaseMusicTimeMachine)]
[![Last commit](https://img.shields.io/github/last-commit/aquamarine5/NeteaseMusicTimeMachine)]

![1653202468_1_.jpg](https://s2.loli.net/2022/05/22/6uXZUTajChSw42s.png)

## 部署教程 👀

### 1. 点击右上角的 Fork 按钮

- 等待刷新并自动跳转至新页面

### 2. 前往[smms.app](https://smms.app/)注册账号并获取Api Key

- 前往[注册页](https://smms.app/register)注册账号
- 注册后登陆，然后前往[Dashboard的API Token](https://smms.app/home/apitoken)页复制key

### 3. 前往[网易云音乐](https://music.163.com/)获取Cookie

- 前往 [网易云音乐](https://music.163.com/) 登陆账号
- 按`F12`，打开`开发者工具`，找到`Network`并点击
- 按`F5`刷新页面，按下图复制`Cookie`

![cookie](https://i.loli.net/2020/10/28/TMKC6lsnk4w5A8i.png)

### 4. 前往[Server酱](https://sct.ftqq.com/)设置微信推送服务

- 扫码登录[Server酱](https://sct.ftqq.com/)
- 前往 [此页面](https://sct.ftqq.com/sendkey) ，点击复制以复制push key

### 5. 设置仓库的Secrets

- 回到自己Fork的Github页面，依次点击`Settings`->`Secrets`->`Actions`->`New repository secret`
- 按照以下表格设置Secrets

| 类型       | Secrets的名称       |
| ----- | ----- |
| 网易云音乐 | NETEASEMUSIC_COOKIE |
| sm.ms图床 | SMMS_TOKEN |
| Server酱推送 | WX_SERVER_TOKEN |

![1649507038_1_.png](https://s2.loli.net/2022/04/09/EYVaXvuBFx9gH1J.png)

### 6.再次点击上方的Action

- 点击绿色按钮  ***I understand my workflows, go ahead and enable them***
![1649506736.png](https://s2.loli.net/2022/04/09/ZapToF4lhjEIKxu.png)  
- 点击左侧的 PushTimeMachineAnalysis
- 在 *This workflow has a workflow_dispatch event trigger.* 右侧点击**Run workflow**，branch默认为`main`即可
![image.png](https://s2.loli.net/2022/04/09/PvIwmryp7YQZsn1.png)

> 图片中的GenshinBirthdayScheduleTasks仅做示意，此Action为作者的一个项目，可以在[这里](https://github.com/aquamarine5/GenshinBirthdayReceiver)查看。

- 至此 部署完毕。如果部署正确，您的微信会收到一条推送消息。

![Alt](https://repobeats.axiom.co/api/embed/80a66b80fa4d43fd5823074932c149e6f547e248.svg "Repobeats analytics image")
