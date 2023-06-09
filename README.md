### 概述

Electron样式工程，支持如下特性：

- 基于Electron最新版本，支持自定义标题栏/状态栏
- 网页里内嵌网页的实现
- 换肤，本地化配置
- 支持nodejs开发本地接口，如获取mac地址等
- 支持http post/get请求
- 支持文件上传，下载（带进度）

![](http://doc.sumslack.com/server/../Public/Uploads/2023-06-09/6482c49ba6a92.png)

![](http://doc.sumslack.com/server/../Public/Uploads/2023-06-09/6482c4afc770b.png)

### 打包

```
yarn add --dev @electron-forge/cli
npx electron-forge import
npm run make
```
