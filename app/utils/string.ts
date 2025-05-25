// Generate initials for the avatar
export const getInitials = (username: string) => {
  if (!username) return 'U';
  return username.substring(0, 2).toUpperCase();
};
