#pragma once
#pragma once
#include "../xmart.hpp"
using namespace xmart;
using namespace xfinal;

struct user_tb {
	mysql::Integer id;
	std::string username;
	std::string password;
	mysql::MysqlDateTime update_at;
	mysql::MysqlDateTime create_at;
	mysql::Integer can_use;
	std::string open_id;
};
REFLECTION(user_tb, id, username, password, update_at, create_at, can_use, open_id)