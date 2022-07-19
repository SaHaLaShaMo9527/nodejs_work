'use strict'
const fs = require('fs');
var request = require('request-promise');
let count = 0;
let num = 0;
let onlineCount = 0;
let successCount = 0;
let devices = [];

async function httpRequestProcwithIMEI(imei) {
    let options= {
        url: 'http://api.xiaoantech.com/ebike/v1/deviceInfo?agentId=1&imei='+imei,
        method: "GET",
        json: true,
        headers: {}
    }
    //console.log(imei);
    options.headers['Content-Type'] = 'apllication/json';
    options.headers['xc-access-token'] = 'D23E73CDEB885B7774E4878B310F0CBB';
    let response = await request(options);
    
    if (response && response.data  && response.data.isOnline && response.data.version) {//如果在线
        console.log(imei, (response.data.version & 0xFF0000) >> 16, (response.data.version & 0xFF00) >> 8, (response.data.version & 0xFF));

        if((response.data.version & 0xFF) == 255)
        {
            return {code: 0};
        }
        else if((response.data.version & 0xFF) == 3) { //32.0.0 ~ 32.255.255
        {
            let option = {
                url: 'http://api.xiaoantech.com/v1/device',
                method: 'POST',
                json: true,
                body: {
                    imei: imei,
                    cmd: {
                        c: 35,
                        param:{
                            "url": "http://xc-res.oss-cn-shenzhen.aliyuncs.com/firmware/mx5f_cxb/app_30.255.4_54007.bin",
                            "crc": 54007
                        }
                    }
                }
            }
            request(option); //执行升级
        }
        
    }
    return {code: 1};
}
else
{
    onlineCount++;
    console.log(imei,'device offline',onlineCount);
}
}
async function procAll(){
    let imeiListFile = "ffimei.txt";
    let imeiStr = fs.readFileSync(imeiListFile , 'utf8');
    let imeiAry = imeiStr.split('\r\n');
    
    for(count = 0; count < imeiAry.length; count++){
        if(imeiAry[count].length >= 15){
            let imei = imeiAry[count].substring(0,15);
            if(devices && devices[imei] && devices[imei].isSuccess){
                console.log('imei ', imei);
                continue;
            }
            let rsp = await httpRequestProcwithIMEI(imei);
            if(rsp && rsp.code == 0){
                devices[imei] = {};
                devices[imei].isSuccess = true;
                successCount++;
                console.log(`${imeiAry[count].substring(0,15)} success.`,successCount);
            }
        }
    }
    onlineCount = 0;
    successCount = 0;
}

procAll();

setInterval(procAll, 60 * 1000);
