
const { downloadFile }  = require('./ElectronDownloadFile')
const { uploadFile }  = require('./ElectronUploadfile')
const { app, Tray, Menu, nativeImage, BrowserWindow,BrowserView, ipcMain,Notification,net,nativeTheme } = require('electron')

let tray
var WIN
var WIN_DSS

function userInfo(key,defaultValue){
  var path = require('path')
  const dataPath = path.join(app.getAppPath(), 'config.json')
  const fs = require('fs');
  if(fs.existsSync(dataPath)){
    const content = fs.readFileSync(dataPath, { encoding: "utf-8" });
    var jsonData = JSON.parse(content)
    if(jsonData[key]){
      return jsonData[key]
    }
}
  return defaultValue
}

function userInfoSet(key,value){
  var path = require('path')
  const dataPath = path.join(app.getAppPath(), 'config.json')
  const fs = require('fs');
  if(!fs.existsSync(dataPath)){
    fs.writeFileSync(dataPath,"{}")
  }
  const content = fs.readFileSync(dataPath, { encoding: "utf-8" });
  if(content){
    var jsonData = JSON.parse(content)
    jsonData[key] = value
    fs.writeFileSync(
      dataPath,
      JSON.stringify(jsonData),
      { encoding: "utf-8" }
    );
  }
}


nativeTheme.themeSource = userInfo('theme','dark')

async function showNotify(body,title){
  title = title || "系统消息"
  new Notification({
    title: title,
    body: body,
  }).show();
}

function getMac(){
  var os2 = require('os')
  console.log(os2)
  var mac = ''
  if(os2.networkInterfaces().WLAN){
      mac = os2.networkInterfaces().WLAN[0].mac
  }else{
      mac = os2.networkInterfaces()['以太网'][0].mac
  }
  return mac
}

function showDssPage(w,h){
  if(!WIN_DSS){
    var path = require('path')
    const view = new BrowserView({
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
    view.set
    
    WIN.setBrowserView(view)
    WIN_DSS = view
    WIN_DSS.setBounds({ x: 0, y: 40, width: w, height: h-40-40 })
    var url = userInfo('page_dss','https://www.baidu.com')
    WIN_DSS.webContents.loadURL(url)  
  }
  WIN_DSS.setBounds({ x: 0, y: 40, width: w, height: h-40-40 })
}

const createWindow = () => {
  var path = require('path')
  var _barOverlay =  {color: '#193d37',symbolColor: '#ffebc8',height: 40}
  if(nativeTheme.themeSource == 'light'){
    _barOverlay = { color: '#FFFFFF',symbolColor: '#000000',height: 40 }
  }
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    minHeight: 400,
    minWidth:400,
    // frame:false,
    titleBarStyle:'hidden',
    titleBarOverlay:true,
    titleBarOverlay:_barOverlay,
    webviewTag:false,
    // transparent:true,
    webPreferences: {
        // nodeIntegration: true,
        preload: path.join(__dirname, 'preload.js')
    }
  })
  WIN = win
  win.on('resize',(event,newBounds) => {
    const webContents = event.sender
    var isHome = ((WIN.getURL() + "").indexOf("index.html")>0)
    if(!isHome){
      return;
    }
    w = webContents.getBounds().width
    h = webContents.getBounds().height
    showDssPage(w,h)
  })
  // 处理文件下载
  downloadFile(win)
  uploadFile(win)
  //主题切换
  ipcMain.on('toggleDarMode', (event) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = 'light'
      userInfoSet('theme','light')
      win.setTitleBarOverlay({
        color: '#FFFFFF',symbolColor: '#000000',height: 40
      })
    } else {
      nativeTheme.themeSource = 'dark'
      userInfoSet('theme','dark')
      win.setTitleBarOverlay({
        color: '#193d37',symbolColor: '#ffebc8',height: 40
      })
    }
  })

  ipcMain.on('showNotify', (event,body,title) => {
    console.log('hel notify.')
    showNotify(body,title)
  })
  ipcMain.on('getMac', (event) => {
    event.returnValue = getMac()
  })
  ipcMain.handle('http_get', (event,myurl) => {
    return new Promise((resolve,reject) => {
      const request = net.request(myurl)
      request.on('response',(response) => {
        response.on('data', (chunk) => {
          console.log(`BODY: ${chunk}`)
          resolve(`${chunk}`) 
        })
        response.on('end', () => {
          console.log('No more data in response.')
        })
      })
      request.end()
    })
  })

  ipcMain.handle('http_post', async (event,myurl,data) => {
    var contentType = 'application/json';
    return new Promise((resolve,reject) => {
      const request = net.request({
          headers: {
              'Content-Type': contentType,
          },
          method: 'POST',
          url: myurl
      })
      request.write(JSON.stringify(data));
      request.on('response', response => {
          response.on('data', res => {
              let data = JSON.parse(res.toString())
              resolve(data)      
          })
          response.on('end', () => {})
      })
      request.end()
    });
  })

  ipcMain.on('resize', (event, width, height) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    win.setSize(width,height)
    win.center();
  })

  ipcMain.on('showDevTool',(event) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    win.webContents.openDevTools()
  })

  ipcMain.on('gotoPage', (event, url) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)

    var isHome = (url.indexOf("index.html")>=0)
    if(isHome){
      w = win.getBounds().width
      h = win.getBounds().height
      WIN_DSS.setBounds({ x: 0, y: 40, width: w, height: h-40-40 })
    }else{
      WIN_DSS.setBounds({ x: 0, y: 40, width: 0, height: 0 })
    }
    if(url.indexOf('import-data.html')>=0){
      url = userInfo('page_data_import',url)
    }
    if(url.indexOf('http://')<0 && url.indexOf('https://')<0){
      win.loadFile(url)
    }else{
      win.loadURL(url)
    }
  })

  win.loadFile('index.html')
  w = win.getBounds().width
  h = win.getBounds().height
  showDssPage(w,h)
}

app.whenReady().then(() => {
  
  const icon = nativeImage.createFromPath('images/logo.png')
  tray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Item1' ,click:async() => {
      const { shell } = require('electron')
      await shell.openExternal('https://wwww.sumslack.com')
    }},
    { type: 'separator' },
    { label: 'Item2',click: ()=>{
        
    }},
  ])
  tray.setContextMenu(contextMenu)
  tray.setToolTip('This is my application')
  tray.setTitle('This is my title')


  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})