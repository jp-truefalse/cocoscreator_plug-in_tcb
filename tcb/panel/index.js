var packageName = "tcb";
var fs = require('fire-fs');
var crypto = require("crypto");
var utils = Editor.require("packages://cocos-services/panel/utils/utils.js");
var cloudAssetsDir = "db://assets/cloud";
var jsSrcDir = `${__dirname}/resources/js`;
var cloudSrcDir = `${jsSrcDir}/cloud`;
var tcbSrcDir = `${jsSrcDir}/tcbjs`;
var tcbDTSPath = `${jsSrcDir}/tcb.d.ts`;
var projectPath = Editor.Project ? Editor.Project.path : Editor.projectInfo.path;
Editor.Panel.extend({
  style: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.css', 'utf8')) + "",
  template: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.html', 'utf8')) + "",

  $: {

  },

  ready() {
    window.plugin = new window.Vue({
      el: this.shadowRoot,
      created() {
        this.initConfigData();
      },
      init() {
      },
      data: {
        platform: null,
        env_id: null,
        appSign: null,
        appAccessKeyId: null,
        appAccessKey: null,
      },
      methods: {

        getInfoByMatch(path, match) {
          let content = fs.readFileSync(path, 'utf8');
          let value = content.match(match).splice(',')[1];
          return value;
        },

        initConfigData() {
          var path = `${projectPath}/assets/cloud/cloudConfig.js`;
          if (!fs.existsSync(path)) {
            utils.printToCreatorConsole("log", "配置文件不存在！");
            return;
          }
          var platform = this.getInfoByMatch(path, /platform:[ ]*"([^\"|\']*)\"/);
          this.platform = platform;
          var env_id = this.getInfoByMatch(path, /env:[ ]*"([^\"|\']*)\"/);
          this.env_id = env_id;
          var appSign = this.getInfoByMatch(path, /appSign:[ ]*"([^\"|\']*)\"/);
          this.appSign = appSign;
          var appAccessKeyId = this.getInfoByMatch(path, /appAccessKeyId:[ ]*"([^\"|\']*)\"/);
          this.appAccessKeyId = appAccessKeyId;
          var appAccessKey = this.getInfoByMatch(path, /appAccessKey:[ ]*"([^\"|\']*)\"/);
          this.appAccessKey = appAccessKey;
        },

        replaceConfigInfo(path, match, code) {
          if (fs.existsSync(path)) {
            let content = fs.readFileSync(path, "utf8");
            content = content.replace(match, code);
            fs.writeFileSync(path, content);
          }
          else {
            utils.printToCreatorConsole("log", "配置文件不存在！");
          }
        },

        export_tcb() {
          try {
            Editor.Ipc.sendToMain("cloud-function:open");
            // 拷贝项目资源文件
            var cloudDir = `${projectPath}/assets/cloud`;
            var tcbDir = `${cloudDir}/tcbjs`;
            if (fs.existsSync(cloudDir)) utils.removeDir(cloudDir);
            utils.copyDir(cloudSrcDir, cloudDir);
            if (fs.existsSync(tcbDir)) utils.removeDir(tcbDir);
            utils.copyDir(tcbSrcDir, tcbDir);
            Editor.assetdb.refresh(cloudAssetsDir);
            // 拷贝类型定义文件
            var destDTSFile = `${projectPath}/tcb.d.ts`;
            if (fs.existsSync(destDTSFile)) fs.unlinkSync(destDTSFile);
            utils.copyFile(tcbDTSPath, destDTSFile);
            this.initConfigData();
          } catch (e) { }
          utils.printToCreatorConsole("log", "TCB service js sdk installation is complete!");
        },
        unload_tcb() {
          try {
            var cloudDir = `${projectPath}/assets/cloud`;
            if (fs.existsSync(cloudDir)) {
              Editor.assetdb.delete([cloudAssetsDir]);
            }
            if (fs.existsSync(projectPath + '/tcb.d.ts')) fs.unlinkSync(projectPath + '/tcb.d.ts');
            this.platform = null;
            this.env_id = null;
            this.appSign = null;
            this.appAccessKeyId = null;
            this.appAccessKey = null;
          } catch (e) {
          }
          utils.printToCreatorConsole("log", "TCB service js sdk uninstallation is complete!");
        },

        updateConfigInfo() {
          if (!this.platform || !this.env_id || !this.appSign || !this.appAccessKeyId || !this.appAccessKey) {
            utils.printToCreatorConsole("log", "请输入正确的配置信息！");
            return;
          }
          var path = `${projectPath}/assets/cloud/cloudConfig.js`;
          this.replaceConfigInfo(path, /platform:[ ]*"([^\"|\']*)\"/, `platform:"${this.platform}"`);
          this.replaceConfigInfo(path, /env:[ ]*"([^\"|\']*)\"/, `env:"${this.env_id}"`);
          this.replaceConfigInfo(path, /appSign:[ ]*"([^\"|\']*)\"/, `appSign:"${this.appSign}"`);
          this.replaceConfigInfo(path, /appAccessKeyId:[ ]*"([^\"|\']*)\"/, `appAccessKeyId:"${this.appAccessKeyId}"`);
          this.replaceConfigInfo(path, /appAccessKey:[ ]*"([^\"|\']*)\"/, `appAccessKey:"${this.appAccessKey}"`);
          utils.printToCreatorConsole("log", "云开发配置信息更新成功!");
        }
      },
    });
  },
});