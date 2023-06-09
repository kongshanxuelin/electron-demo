goPageImportData = document.getElementById('goPageImportData')
if(goPageImportData){
    goPageImportData.addEventListener('click',() => {   
        window.nativeAPI.gotoPage('./import-data.html')
    })
}