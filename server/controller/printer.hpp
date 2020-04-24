#pragma once
#include "../xmart.hpp"
#include "../xfinal/xfinal/client.hpp"
using namespace xmart;
using namespace xfinal;
#include "../model/database.hpp"
#include "../driver/eprintdriver.hpp"
class Printer {
public:
	void login(request& req,response& res) {
		auto json_str = req.body();
		try {
			auto json_obj = json::parse(view2str(json_str));
			auto userName = json_obj["userName"].get<std::string>();
			auto passWord = json_obj["passWord"].get<std::string>();
			auto token = MD5(userName + passWord).toStr();
			dao_t<mysql> dao;
			auto fr  = dao.query<user_tb>("where open_id='" + token + "'");
			json root;
			if (!fr.second.empty()) {
				root["state"] = "success";
				root["message"] = token;
			}
			else {
				root["state"] = "fails";
				root["message"] = "账户没有权限";
			}
			res.write_json(root);
		}
		catch (...) {
			json error;
			error["state"] = "fails";
			error["message"] = "参数解析错误";
			res.write_json(error);
		}
	}

	void check(request& req, response& res) {
		auto json_str = req.body();
		try {
			auto json_object = json::parse(view2str(json_str));
			auto openid = json_object["openid"].get<std::string>();
			dao_t<mysql> dao;
			json root;
			if (dao.is_open()) {
				auto r = dao.query<user_tb>("where open_id='" + openid + "'");
				if (!r.second.empty()) {
					root["state"] = "success";
				}
				else {
					root["state"] = "fails";
					root["message"] = "账户异常";
				}
			}
			else {
				root["state"] = "false";
				root["message"] = "database does not open";
			}
			res.write_json(root);
		}
		catch (...) {
			json root;
			root["state"] = "fails";
			root["message"] = "参数解析错误";
			res.write_json(root);
		}
	}

	void upload(request& req, response& res) {
		auto&& file = req.file("file");
		auto filename = req.query("original_name");
		auto openid = req.query("openid");
		json root;
		if (file.is_exsit()) {
			email_sender sender;
			email_msg msg;
			msg.attachment_ = file.path();
			msg.content_ = "";
			msg.file_name_ = view2str(filename);
			msg.content_type_ = "text/plain";
			msg.host_ = "smtp.qq.com";
			msg.port_ = "25";
			msg.reciper_ = smtp_reciper_;
			msg.subject_ = "eprint" + std::to_string(std::time(nullptr));
			msg.user_name_ = smtp_user_;
			msg.user_pass_ = smtp_pass_;
			try {
				dao_t<mysql> dao;
				auto fr = dao.query<user_tb>("where open_id='" + view2str(openid) + "'");
				if (!fr.second.empty()) {
					auto&& info = fr.second[0];
					if (info.can_use.value() == 1) {
						sender.send(msg);
						root["state"] = "success";
					}
					else {
						root["state"] = "fails";
						root["message"] = "没有使用权限";
					}
				}
				else {
					root["state"] = "fails";
					root["message"] = "没有使用权限";
				}
			}
			catch (...) {
				root["state"] = "fails";
			}
		}
		else {
			root["state"] = "fails";
			root["message"] = "file does not exist";
		}
		res.write_json(root);
	}
	public:
		static std::string smtp_pass_;
		static std::string smtp_user_;
		static std::string smtp_reciper_;
};