export enum Permissions {
 
  // Permissions to manage users
  VIEW_LIST_USERS = 'view_list_users', 
  UPDATE_OTHER_USER_IMAGE = 'update_other_user_image',
  VIEW_OTHER_USER = 'view_other_user',
  UPDATE_OTHER_USER = 'update_other_user', 
  DELETE_OTHER_USER = 'delete_other_user', 
  CHANGE_OTHER_USER_PASSWORD = 'change_other_user_password',

  // Permissions to manage groups
  VIEW_LIST_GROUPS = 'view_list_groups', 
  CREATE_GROUP = 'create_group',
  VIEW_GROUP = 'view_group',
  UPDATE_GROUP = 'update_group',
  DELETE_GROUP = 'delete_group', 
  ADD_MEMBER_TO_GROUP = 'add_member_to_group', 
  REMOVE_MEMBER_FROM_GROUP = 'remove_member_from_group', 
  VIEW_LIST_PERMISSIONS = 'view_list_permissions',
  ADD_PERMISSION_TO_GROUP = 'add_permissions_to_group', 
  REMOVE_PERMISSION_FROM_GROUP = 'remove_permissions_from_group', 

  // Permissions to register
  REGISTER = 'register'
}
