export default function hasPermissionNode(value) {
  const permissions = JSON.parse(localStorage.getItem('permissionsList'))
  return permissions.indexOf(value) > -1
}
