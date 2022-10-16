import { core } from "oicq"

async function ArkSign(json){
	return new Promise((resolve, reject) => {
		let result = {code: -1};
		let json_data = null;
		try{
			json_data = JSON.parse(json);
		}catch(err){}
		
		if(!json_data){
			result.code = -1;
			result.msg = '签名失败，不是有效的json！';
			resolve(result);
			return;
		}
		delete json_data['extra'];
		
		let appid = 100951776, style = 10, appname = 'tv.danmaku.bili', appsign = '7194d531cbe7960a22007b9f6bdaa38b';
		let send_type = 0, recv_uin = Bot.uin, recv_guild_id = 0;
		
		let time = new Date().getTime();
		let msg_seq = parseInt(`${time}${random(100,999)}`);
		
		result.msg_seq = msg_seq;
		
		let body = {
			1: appid,
			2: 1,
			3: style,
			5: {
				1: 1,
				2: "0.0.0",
				3: appname,
				4: appsign,
			},
			7: {
				15: msg_seq
			},
			10: send_type,
			11: recv_uin,
			18: {
				1: 1109937557,
				2: {
					14: 'pages',
				},
				3: 'url',
				4: 'text',
				5: 'text',
				6: 'text',
				10: JSON.stringify(json_data),
			},
			19: recv_guild_id
		};
		
		let json_handle = function(e){
			if(Bot.uin == e.user_id && e?.message[0]?.type == 'json'){
				let json_str = e.message[0].data;
				let json = null;
				let extra = null;
				try{
					json = JSON.parse(json_str);
					extra = typeof(json.extra) == 'object' ? json.extra : JSON.parse(json.extra);
				}catch(err){}
				
				if(extra && extra.msg_seq == msg_seq){
					Bot.off('message.private',json_handle);
					clearTimeout(timer);
					clearTimeout(timer1);
					delete json['extra'];
					result.code = 1;
					result.msg = '签名成功！';
					result.data = json;
					resolve(result);
					return true;
				}
			}
			return false;
		}
		
		let timer = setTimeout(async function(){
			let ChatHistory = await Bot.pickFriend(Bot.uin).getChatHistory(0,20);
			ChatHistory.reverse();
			for(let msg of ChatHistory){
				if(json_handle(msg)){
					return;
				}
			}
			
			Bot.off('message.private',json_handle);
			result.code = -1;
			result.msg = '签名失败，请稍后再试！';
			resolve(result);
		},3000);
		
		
		let timer1 = setTimeout(async function(){
			let ChatHistory = await Bot.pickFriend(Bot.uin).getChatHistory(0,20);
			ChatHistory.reverse();
			for(let msg of ChatHistory){
				if(json_handle(msg)){
					return;
				}
			}
		},1000);
		
		Bot.on('message.private',json_handle);
		result.result = Bot.sendOidb("OidbSvc.0xb77_9", core.pb.encode(body));
	});
}

async function ArkSend(json, e, to_uin = null){
	let result = {code: -1};
	let json_data = null;
	try{
		json_data = JSON.parse(json);
	}catch(err){}
		
	if(!json_data){
		result.code = -1;
		result.msg = '分享失败，不是有效的json！';
		return result;
	}
	delete json_data['extra'];
	
	
	let recv_uin = 0;
	let send_type = 0;
	let recv_guild_id = 0;
	
	if(e.isGroup && to_uin == null){//群聊
		recv_uin = e.group.gid;
		send_type = 1;
	}else if(e.guild_id){//频道
		recv_uin = Number(e.channel_id);
		recv_guild_id = BigInt(e.guild_id);
		send_type = 3;
	}else if(to_uin == null){//私聊
		recv_uin = e.friend.uid;
		send_type = 0;
	}else{//指定号码私聊
		recv_uin = to_uin;
		send_type = 0;
	}
	
		
	let appid = 100951776, style = 10, appname = 'tv.danmaku.bili', appsign = '7194d531cbe7960a22007b9f6bdaa38b';
	
	let time = new Date().getTime();
	let msg_seq = parseInt(`${time}${random(100,999)}`);
		
	result.msg_seq = msg_seq;
	
	let body = {
		1: appid,
		2: 1,
		3: style,
		5: {
			1: 1,
			2: "0.0.0",
			3: appname,
			4: appsign,
		},
		7: {
			15: msg_seq
		},
		10: send_type,
		11: recv_uin,
		18: {
			1: 1109937557,
			2: {
				14: 'pages',
			},
			3: 'url',
			4: 'text',
			5: 'text',
			6: 'text',
			10: JSON.stringify(json_data),
		},
		19: recv_guild_id
	};
	
	let payload = await Bot.sendOidb("OidbSvc.0xb77_9", core.pb.encode(body));
	result.data = core.pb.decode(payload);
	
	result.data = core.pb.decode(result.data);
	if(result.data[0] == 0){
		result.msg = '分享成功！';
		result.code = 1;
	}else{
		result.msg = result[3];
	}
	return result;
}

export default {
	ArkSign,
	ArkSend
}

function random(min,max){
	const range  = max - min;
	const random = Math.random();
	const result = min + Math.round(random * range);
	return result;
}