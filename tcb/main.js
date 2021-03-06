"use strict";
const fs = require("fire-fs");
const crypto = require("crypto");
const utils = Editor.require("packages://cocos-services/panel/utils/utils.js");

async function onBeforeBuildFinish(options, callback) {
  var platform_adapter_mapping = {
    'baidugame': {
      adapter: 'adapter-bd_game.js',
      src_path: 'src',
      appSign: await Editor.Profile.load('project://baidugame.json').get('appid'),
    },
    'android': {
      adapter: 'adapter-cocos_native.js',
      src_path: 'src',
      appSign: options.android.packageName,
    },
    'android-instant': {
      adapter: 'adapter-cocos_native.js',
      src_path: 'src',
      appSign: options['android-instant'].packageName,
    },
    'ios': {
      adapter: 'adapter-cocos_native.js',
      src_path: 'src',
      appSign: options.ios.packageName,
    },
    'mac': {
      adapter: 'adapter-cocos_native.js',
      src_path: 'src',
      appSign: options.mac.packageName,
    },
    'win32': {
      adapter: 'adapter-cocos_native.js',
      src_path: 'src',
      appSign: 'cocos_native',
    },
    'quickgame': {
      adapter: 'adapter-oppo_game.js',
      src_path: 'src',
      appSign: await Editor.Profile.load('project://oppo-runtime.json').get('package'),
    },
    'qgame': {
      adapter: 'adapter-vv_game.js',
      src_path: 'engine/src',
      appSign: await Editor.Profile.load('project://vivo-runtime.json').get('package'),
    },
    'wechatgame': {
      adapter: 'adapter-wx_game.js',
      src_path: 'src',
      appSign: await Editor.Profile.load('project://wechatgame.json').get('appid'),
    },
    'web-mobile': {
      adapter: 'adapter-cocos_native.js',
      src_path: 'src',
      appSign: 'cocos_web',

    },
    'web-desktop': {
      adapter: 'adapter-cocos_native.js',
      src_path: 'src',
      appSign: 'cocos_web',
    },
    'bytedance': {
      adapter: 'adapter-tt_mp.js',
      src_path: 'src',
      appSign: await Editor.Profile.load('project://bytedance.json').get('appid'),
    },
  };
  Editor.log(options.actualPlatform);
  var cur_mapping = platform_adapter_mapping[options.actualPlatform];
  if (typeof cur_mapping === 'undefined') {
    utils.printToCreatorConsole('warn', 'TCB Service only support iOS, Android, Android Instant, Mac, Windows, Web Mobile, Web Desktop, Baidu, Wechat, OPPO, vivo');
    callback();
    return;
  }
  // ?????? Adapter ??????
  var lastAdapter = `${options.dest}/src/assets/cloud/tcbjs/adapter.js`;
  Editor.log(lastAdapter,fs.existsSync(lastAdapter));
  if (fs.existsSync(lastAdapter)) fs.unlinkSync(lastAdapter);
  utils.copyFile(`${__dirname}/panel/resources/js/adapter/${cur_mapping.adapter}`, `${options.dest}/src/assets/cloud/tcbjs/adapter.js`);
  // ??????????????? wechat ???????????????????????????????????????
  const wechatConfigPath = `${options.dest}/project.config.json`;
  Editor.log("?????????????????????",wechatConfigPath);
  if (options.actualPlatform === 'wechatgame' && fs.existsSync(wechatConfigPath)) {
    Editor.log("?????????????????????????????????");
    var wechatConfig = utils.readJson(wechatConfigPath);
    wechatConfig.setting && (wechatConfig.setting.enhance = true);
    utils.saveJson(wechatConfigPath, wechatConfig);
  }
  utils.printToCreatorConsole("log", "TCB service sdk installation is complete!");
  callback();
}

module.exports = {
  load() {
    // ??? package ??????????????????????????????
    Editor.Builder.on("build-finished", onBeforeBuildFinish);
  },

  unload() {
    // ??? package ??????????????????????????????
    Editor.Builder.removeListener("build-finished", onBeforeBuildFinish);
  },

  messages: {
    'openPanel'() {
      Editor.Panel.open('tcb');
    },
  },

};
