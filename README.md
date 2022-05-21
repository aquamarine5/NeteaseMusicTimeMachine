# NeteaseMusicTimeMachine
## 部署教程 👀
### 1. 点击右上角的 Fork 按钮
- 等待刷新并自动跳转至新页面
### 2. 前往[sm.ms](https://sm.ms/)注册账号并获取Api Key
- 前往[注册页](https://sm.ms/register)注册账号
- 注册后登陆，然后前往[Dashboard的API Token](https://sm.ms/home/apitoken)页复制key

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
