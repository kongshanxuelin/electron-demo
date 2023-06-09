const information = document.getElementById('info')
const btnChangeWnd = document.getElementById('btn_changewnd')
const btn_ajax = document.getElementById('btn_ajax')
const btn_mac = document.getElementById('btn_mac')
const btn_call = document.getElementById('btn_call')
const btn_upload = document.getElementById('btn_upload')
const btn_download = document.getElementById('btn_download')

if(information){
    information.innerText = `(v${window.nativeAPI.chrome()}), Node.js (v${window.nativeAPI.node()}),  Electron (v${window.nativeAPI.electron()})`
}

if(btnChangeWnd){
    btnChangeWnd.addEventListener('click',()=>{
        window.nativeAPI.resize(1000,800)
    })    
}

if(btn_ajax){
    btn_ajax.addEventListener('click',()=>{
        // window.nativeAPI.showNotify('测试撒旦发撒旦发','呵呵呵')
    
        window.nativeAPI.http_get('http://dss.nanhui.idbhost.com/prod/ss/data/sync/user/login?username=aaa&pass=aaa').then(data => {
            console.log('hello get:',data)
            alert('hello get:' + data)
        })
    
        window.nativeAPI.http_post('http://dss.nanhui.idbhost.com/prod/ss/data/sync/user/login',{
            username:'haha',
            pass:'aaa'
        }).then(data => {
            console.log('hello post:',data)
            alert('hello post:' + JSON.stringify(data))
        })
    })
}

if(btn_call){
    btn_call.addEventListener('click',()=>{

        var mac = window.nativeAPI.call('mac');
        alert(mac);

        window.nativeAPI.call('get',{url:'http://dss.nanhui.idbhost.com/prod/ss/data/sync/user/login?username=aaa&pass=aaa'}).then(data => {
            console.log('hello get:',data)
            alert('hello get:' + data)
        })

        // 普通表单post
        window.nativeAPI.call('post',{url:'http://dss.nanhui.idbhost.com/prod/ss/data/sync/user/login',param:{
            username:'haha',
            pass:'aaa'
        }}).then(data => {
            console.log('hello post:',data)
            alert('hello post:' + JSON.stringify(data))
        })

    })    
}

if(btn_mac){
    btn_mac.addEventListener('click',()=>{
        var mac = window.nativeAPI.mac
        alert(mac)
    })    
}


if(btn_upload){
    btn_upload.addEventListener('click',()=>{
        window.nativeAPI.call('upload',{
            url:'http://127.0.0.1:11777/testapi/upload',
            param:{
                aa:'aaaaa',
                bb:'bbbbbb'
            },
            fileType: ['img','sql']
        }).then(data => {
            console.log('upload ok:',data)
        })
       
    })  
}

if(btn_download){
    btn_download.addEventListener('click',()=>{
        window.nativeAPI.call('download',{url:'http://127.0.0.1:11777/testapi/download/%E5%8F%91%E7%A5%A8198.jpg',name:'测试.jpg'})
    })  
}


goPageHome = document.getElementById('goPageHome')
if(goPageHome){
    goPageHome.addEventListener('click',() => {   
        window.nativeAPI.gotoPage('./index.html')
    })
}
