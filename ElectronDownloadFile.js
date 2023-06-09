const { ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const request = require('request')
let _win // 当前窗口实例
let isMac = process.platform === 'darwin' // 判断是否为macOS

function downloadFile (win) {
    // 解决M1芯片可能会报证书失效问题
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    _win = win// 创建监听事件，接收来自渲染进程的下载请求
    // file参数为一个对象{name: '文件名，例***.jpg', url: '文件远端路径'}
    ipcMain.on('http_download', (event, file) => {
        /*为解决文件名包含特殊字符引起无发下载 --- start */
        var reg = /\\|\/|\?|\?|\*|\"|\“|\”|\'|\‘|\’|\<|\>|\{|\}|\[|\]|\[|\]|\:|\:|\^|\$|\!|\~|\`|\|/g
        const fileNameSplitArr = file.name.split('/')
        fileNameSplitArr[fileNameSplitArr.length - 1] = fileNameSplitArr[fileNameSplitArr.length - 1].replace(reg, '')
        file.name = fileNameSplitArr.join('')
        /*为解决文件名包含特殊字符引起无发下载 --- end */
        // 这里设置了保存弹出框的默认名称（如下图1），设置openDirectory表示可以选择文件夹
        dialog.showSaveDialog(
            win, { 
                defaultPath: file.name, 
                properties: ['openDirectory'] 
            }).then(result => {
                // 承载文件源地址
                const fileURL = file.url
                // 这里获取用户通过弹框做选择的保存至本地的地址
                if (result.filePath.length !== 0) {
                    let localPath = result.filePath
                    if (!isMac) { // 处理windows系统反斜杠问题
                        const arr = localPath.split(path.sep)
                        localPath = arr.reduce((pre, cue) => {
                            return pre ? `${pre}//${cue}` : cue}, '')
                        }
                        // 最终处理好写入本地文件路径，去下载了
                        toDownloadFile(fileURL, localPath)
                    }
            }).catch(err => {
                    console.log(err)
            })
        }
    )
}

const toDownloadFile =  (file_url, targetPath) => {
    var received_bytes = 0 // 当前下载量
    var total_bytes = 0 // 文件总大小
    var req = request({method: 'GET',uri: file_url,strictSSL: false,rejectUnauthorized: false}) 
    // 下载中命名后加：.download，提示用户未下完
    var out = fs.createWriteStream(targetPath + '.download')
    req.pipe(out)
    req.on('response', (data) => {// 获取文件大小
        total_bytes = parseInt(data.headers['content-length'])})
        req.on('data', (chunk) => {
            // 更新下载进度
            received_bytes += chunk.length
            showProgress(received_bytes, total_bytes, file_url)
        })
        // 下载完成
        req.on('end', () => {
            const oldPath = targetPath + '.download'
            if (_win) { // 判断当前窗口实例存在
                // 异步改名，如果异常则e有值，抛出downloaded_rename_error，在Home.vue处理，
                fs.rename(oldPath, targetPath, (e) => {
                    if (!e) {
                        // eslint-disable-next-line camelcase_
                        _win.webContents.send('downloaded' + file_url, targetPath)
                    } else {
                        _win.webContents.send('downloaded_rename_error', e, targetPath)
                    }
                })
            }
        })
}

const showProgress =  (received, total, file_url) => {
    var percentage = (received * 100) / total
    if (_win) {
        // 更新下载进度给渲染进程， 这里注意加上file_url为了防止，多个文件同时下载，让渲染进程进行分辨的，只监听自己的下载进度
        _win.webContents.send('download-progress' + file_url, percentage)
    }
} 

module.exports = {
    downloadFile
}