import plugin from '../../../lib/plugins/plugin.js'
import lodash from 'lodash'
import {Config, Common} from '../components/index.js'


const cfgMap = {
  '点歌': 'system.music',
  '多选点歌': 'system.is_list',
  '天气': 'system.weather',
  '卡片多选点歌': 'system.is_cardlist',
  '默认音乐源': 'system.music_source',
};

const CfgReg = `^#?小飞(插件)?设置\\s*(${lodash.keys(cfgMap).join('|')})?\\s*(.*)$`;

export class xiaofei_setting extends plugin {
	constructor () {
		super({
			/** 功能名称 */
			name: '小飞插件_设置',
			/** 功能描述 */
			dsc: '',
			/** https://oicqjs.github.io/oicq/#events */
			event: 'message',
			/** 优先级，数字越小等级越高 */
			priority: 2000,
			rule: [
				{
					/** 命令正则匹配 */
					reg: CfgReg,
					/** 执行方法 */
					fnc: 'message',
					permission: 'master'
				}
			]
		});
	}
	
	async message(){
		return await setting(this.e);
	}
}


async function setting(e) {
  let reg = new RegExp(CfgReg).exec(e.msg);

  if (reg && reg[2]) {
    let val = reg[3] || '';
    let cfgKey = cfgMap[reg[2]];

	if(val.includes('开启') || val.includes('关闭')) val = !/关闭/.test(val);

	if(cfgKey == 'system.music_source'){
		let music_source = ['QQ','网易','酷我','酷狗'];
		if(!music_source.includes(val)){
			e.reply('不支持的音乐源！',true);
			return true;
		}
	}

    if (cfgKey) {
		setCfg(cfgKey, val);
    }
  }

  
  let cfg = {};
  for(let name in cfgMap){
	let key = cfgMap[name].split('.')[1];
	cfg[key] = getStatus(cfgMap[name]);
  }

  // 渲染图像
  return await Common.render('admin/index', {
    ...cfg
  }, { e, scale: 1});

}

function setCfg(rote, value, def = true) {
	let arr = rote?.split('.') || [];
	if(arr.length > 0){
		let type = arr[0], name = arr[1];
		let data = Config.getYaml('setting', type, def ? 'defSet' : 'config') || {};
		data[name] = value;
		Config.save('setting', type, def ? 'defSet' : 'config', data);
	}
}

const getStatus = function (rote, def = true) {
	let _class = 'cfg-status';
	let value = '';
	let arr = rote?.split('.') || [];
	if(arr.length > 0){
		let type = arr[0], name = arr[1];
		let data = Config.getYaml('setting', type, def ? 'defSet' : 'config') || {};
		if (data[name] == true || data[name] == false){
			_class = data[name] == false ? `${_class}  status-off` : _class;
			value = data[name] == true ? '已开启' : '已关闭';
		}else{
			value = data[name];
		}
	}
	if(rote == 'system.music_source' && !value) value = 'QQ';
	return `<div class="${_class}">${value}</div>`;
}