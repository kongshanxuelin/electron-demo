const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('nativeAPI', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  resize:(w,h) => ipcRenderer.send('resize',w,h),
  showNotify:(msg,title) => ipcRenderer.send('showNotify',msg,title),
  gotoPage:(url) => ipcRenderer.send('gotoPage',url),
  showDevTool:() => ipcRenderer.send('showDevTool'),
  mac:ipcRenderer.sendSync('getMac'),
  toggleDarMode: () => ipcRenderer.send('toggleDarMode'),
  http_get:(url) => {
    return (async () => {
      let result = await ipcRenderer.invoke("http_get",url)
      return result;
    })();
  },
  http_post:(url,data) => {
    return (async () => {
      let result = await ipcRenderer.invoke("http_post",url,data)
      return result;
    })();
  },
  call:(methodName,param) => {
    if(methodName === "mac"){
      return ipcRenderer.sendSync('getMac');
    }else if(methodName === "post"){
      return (async () => {
        let result = await ipcRenderer.invoke("http_post",param.url,param.param)
        return result;
      })();
    }else if(methodName === "upload"){
      return (async () => {
        let result = await ipcRenderer.invoke("http_upload",param.url,param.param,param.fileType)
        return result;
      })();
    }else if(methodName === "download"){
      ipcRenderer.send("http_download",{url:param.url,name:param.name})
      ipcRenderer.on('download-progress' + param.url, (evt, percent) => {
        console.log('文件下载进度===',evt, percent)
      })
    }else if(methodName === "get"){
      return (async () => {
        let result = await ipcRenderer.invoke("http_get",param.url)
        return result;
      })();
    }else{
      return "not support method name:" + methodName;
    }
  },
})