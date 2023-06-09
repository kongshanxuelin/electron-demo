const { ipcMain, dialog } = require('electron')
const fs = require('fs')
const request = require('request')

const uploadFile = (win) => {
    // 解决M1芯片可能会报证书失效问题
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    // fileType是类型数组，具体类型见下方介绍
    ipcMain.handle('http_upload', async (event, uploadUrl,params,fileType) => {
            var filters = []
            if(typeof(filters) === "undefined"){
                filters = ['zip','sql']
            }else{
                let backData = false 
                // 筛选文件选择类型
                if (fileType && fileType.length > 0) {
                    fileType.forEach((item) => {
                        if (item === 'img') {
                            const obj = { name: '选择图片', extensions: ['png','jpg','jpeg'] }
                            filters.push(obj)
                        }
                        if (item === 'sql') {
                            const obj = { name: '选择文件', extensions: ['sql','zip'] }
                            filters.push(obj)
                        }
                    }
                )
            }
        }
        console.log(filters)
        // 这里使用异步弹窗方法，参数解析见下方
        const result = await dialog.showOpenDialog({ 
                properties: ['openFile', 'createDirectory', 'promptToCreate'], filters 
        })
        const uploadFolder = result.filePaths[0]
        if (uploadFolder) {
            // 设置上传接口地址
            var formData = {
                file: fs.createReadStream(uploadFolder),
                ...params
            }
            // 调用封装好的request上传方法
            const body = await fetchPost(uploadUrl, formData)
            backData = JSON.parse(body)
        }
        return backData
    })
}
/*
 multipart/form-data (上传文件)
*/
const fetchPost = (path, params) => {
    return new Promise((resolve, reject) => {
        request.post({
            url: path,
            method: 'POST',
            formData: params,
            headers: { 
                // 若有的话，可以设置 
            }
        }, (err, httpResponse, body) => {
            if (err) {
                reject(err)
            } else {
                resolve(body)
            }
        })
    })
} 

module.exports = {
    uploadFile
}