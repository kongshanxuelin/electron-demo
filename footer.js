document.writeln("<span>all right reverse &copy; sumscope.com</span><span class='theme-change' id='changeTheme'>切换风格</span><span class='theme-change' id='toolDev'>开发工具</span>");

chagneTheme = document.getElementById('changeTheme')
if(changeTheme){
    changeTheme.addEventListener('click',() => {   
        window.nativeAPI.toggleDarMode()
    })
}

toolDev = document.getElementById('toolDev')
if(toolDev){
    toolDev.addEventListener('click',() => {   
        window.nativeAPI.showDevTool()
    })
}
