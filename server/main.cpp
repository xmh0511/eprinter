#include "xmart.hpp"
using namespace xmart;
#include "./controller/printer.hpp"

struct AccessControl {
	bool before(request& req, response& res) {
		using namespace nonstd::string_view_literals;
		if (req.method() == "OPTIONS"_sv) {
			res.add_header("Access-Control-Allow-Methods", "POST");
			res.add_header("Access-Control-Allow-Headers", "*");
		}
		else {
			res.add_header("Access-Control-Allow-Origin", "*");
		}
		return true;
	}
	bool after(request& req, response& res) {
		return true;
	}
};
std::string Printer::smtp_pass_;
std::string Printer::smtp_user_;
std::string Printer::smtp_reciper_;
int main() {
	bool r = false;
	http_server& server = init_xmart("./config.json", r);
	if (!r) {
		std::cout << "config has some error" << std::endl;
		return 0;
	}

	try {
		std::ifstream reader("./printer.json");
		std::stringstream ss;
		if (reader.is_open()) {
			ss << reader.rdbuf();
			auto root = json::parse(ss.str());
			Printer::smtp_pass_ = root["pass"].get<std::string>();
			Printer::smtp_user_ = root["user"].get<std::string>();
			Printer::smtp_reciper_ = root["reciper"].get<std::string>();
			server.on_error([](std::string const& ec) {
				std::cout << ec << std::endl;
			});

			server.router<POST,OPTIONS>("/login", &Printer::login, nullptr, AccessControl{});
			server.router<POST, OPTIONS>("/upload", &Printer::upload, nullptr, AccessControl{});
			server.router<POST, OPTIONS>("/check", &Printer::check, nullptr, AccessControl{});
			server.router<GET>("/printer/*", [](request& req, response& res) {
				res.write_view("./www/index.html", true);
			});

			server.router<GET>("/css/*", [](request& req, response& res) {
				auto path = "./static" + view2str(req.raw_url());
				res.write_file(path, true);
			});

			server.router<GET>("/chunk/*", [](request& req, response& res) {
				auto path = "./static" + view2str(req.raw_url());
				res.write_file(path, true);
			});
			server.run();
		}
	}
	catch (...) {

	}
}