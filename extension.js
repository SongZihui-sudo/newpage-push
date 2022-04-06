// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const {exec, execFileSync,execSync} = require('child_process');
const path = require('path');

/**
 * @param {vscode.ExtensionContext} context
 */
var userlist = {
  "users":[]
}
function activate(context){
  var local_url =path.join(context.extensionPath);
  try {
    if (!fs.existsSync('./web')) {
      fs.mkdirSync('./web');
    }
  } catch (err) {
    console.error(err);
  }
  // 初始化
  let init = vscode.commands.registerCommand('newpage-push.init', function (){
    vscode.window.showInputBox({ // 这个对象中所有参数都是可选参数
      password:false, // 输入内容是否是密码
      ignoreFocusOut:true, // 默认false，设置为true时鼠标点击别的地方输入框不会消失
      placeHolder:'用户名,区分大小写', // 在输入框内的提示信息
      prompt:'', // 在输入框下方的提示信息
    }).then(function(usename){
      // 判用户是否已经存在
    var bit = 0;
    var config;
    try {
      const data = fs.readFileSync(path.join(local_url,"userlist.json"), 'utf8');
      // parse JSON string to JSON object
      config = JSON.parse(data);
      userlist.users = config.users;
      for(var i = 0; i < config.users.length; i++) {
        if(config.users[i]==usename){
          bit==1;
          vscode.window.showInformationMessage('用户名已存在！');
          return 1;
        }
        else{
          bit = 0;
        }
      }
    } catch (err) {
      console.log(`Error reading json file from disk: ${err}`);
      bit = 0;
    }
    //添加新用户
    if(!bit){
      try{
        vscode.window.showInputBox({ // 这个对象中所有参数都是可选参数
          password:false, // 输入内容是否是密码
          ignoreFocusOut:true, // 默认false，设置为true时鼠标点击别的地方输入框不会消失
          placeHolder:'仓库地址', // 在输入框内的提示信息
          prompt:'', // 在输入框下方的提示信息
        })
        .then(function(msg){
          exec('git clone '+msg,{ cwd:'./web' }, (err, stdout, stderr) => {
            if(err) {
              console.log(err);
              return -1;
            }
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
          });
        });
        userlist.users.push(usename);
        //更新用户列表
        var res = JSON.stringify(userlist);
        console.log(res);
        fs.writeFileSync(path.join(local_url,"userlist.json"), res);
        //文件写入成功。      
        // 自动生成一个默认的批处理文件
        var cmd0 = "@echo "+"pushing\n";
        var cmd1 = "cd "+path.join('./web',usename+".Github.io")+'\n';
        var cmd2 = "git add .\n";
        var cmd3 = "git commit -m " +'"'+usename +"pushed by pushpage\"\n";
        var cmd4 = "git push\n";
        var cmd = cmd0 + cmd1 + cmd2 +cmd3 +cmd4;
        fs.writeFileSync("./web/"+usename+'.Github.io'+".bat", cmd)
        //文件写入成功。
      } catch (err) {
          console.error(err)
        }          
      }
  });
    vscode.window.showInformationMessage('Init for you site!');
  });
  // 推送
  let push = vscode.commands.registerCommand('newpage-push.push', function () {
    const currentlyOpenTabfilePath = vscode.window.activeTextEditor.document.fileName;
    console.log(currentlyOpenTabfilePath);
    vscode.window.showInputBox({ // 这个对象中所有参数都是可选参数
      password:false, // 输入内容是否是密码
      ignoreFocusOut:true, // 默认false，设置为true时鼠标点击别的地方输入框不会消失
      placeHolder:'username.Github.io', // 在输入框内的提示信息
      prompt:'', // 在输入框下方的提示信息
    }).then(function(msg){
      try{
        console.log(path.join('./web',msg));
        execSync('copy '+currentlyOpenTabfilePath+' '+path.join('./web',msg));
        var bat = path.join('./web',msg+'.bat');
        execFileSync(bat);
        vscode.window.showInformationMessage('This file has pushed to you site!');
      }
      catch(error){
        console.error("%s",error);
      }
	  });
  });
  let pull = vscode.commands.registerCommand('newpage-push.pull', function (){
    vscode.window.showInputBox({ // 这个对象中所有参数都是可选参数
      password:false, // 输入内容是否是密码
      ignoreFocusOut:true, // 默认false，设置为true时鼠标点击别的地方输入框不会消失
      placeHolder:'username.Github.io', // 在输入框内的提示信息
      prompt:'', // 在输入框下方的提示信息
    }).then(function(msg){
      try{
        exec('git pull',{cwd:path.join('./web',msg)});
      }
      catch(error){
        console.error(error);
      }
      vscode.window.showInformationMessage('Refresh you site!');
    });
  });
  context.subscriptions.push(push);
  context.subscriptions.push(init);
  context.subscriptions.push(pull);
}

function deactivate(){}

module.exports = {
	activate,
	deactivate
}
