export enum Permissions {
 
  // Quyền quản lý người dùng
  VIEW_LIST_USERS = 'view_list_users', // Quyền xem danh sách người dùng
  VIEW_USER = 'view_user', // Quyền xem thông tin người dùng
  UPDATE_USER = 'update_user', // Quyền cập nhật thông tin người dùng
  UPDATE_PROFILE = 'update_profile', // Quyền cập nhật thông tin hồ sơ
  UPDATE_OTHER_USER_IMAGE = 'update_other_user_image', // Quyền cập nhật hình ảnh của người dùng khác
  DELETE_USER = 'delete_user', // Quyền xóa người dùng
  CHANGE_USER_PASSWORD = 'change_user_password', // Quyền thay đổi mật khẩu của người dùng
  ASSIGN_ADMIN_ROLE = 'assign_admin_role', // Quyền chỉ định quyền admin
  REMOVE_ADMIN_ROLE = 'remove_admin_role', // Quyền tước quyền admin

  // Quyền quản lý nhóm
  CREATE_GROUP = 'create_group', // Quyền tạo nhóm
  VIEW_GROUP = 'view_group', // Quyền xem thông tin nhóm
  UPDATE_GROUP = 'update_group', // Quyền cập nhật nhóm
  DELETE_GROUP = 'delete_group', // Quyền xóa nhóm
  ADD_MEMBER_TO_GROUP = 'add_member_to_group', // Quyền thêm thành viên vào nhóm
  REMOVE_MEMBER_FROM_GROUP = 'remove_member_from_group', // Quyền xóa thành viên khỏi nhóm
  ADD_PERMISSION_TO_GROUP = 'add_permission_to_group', // Quyền thêm quyền cho nhóm
  REMOVE_PERMISSION_FROM_GROUP = 'remove_permission_from_group', // Quyền xóa quyền khỏi nhóm

  // Quyền đăng ký
  REGISTER = 'register', // Quyền đăng ký
}
